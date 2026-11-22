import json
import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel, Field

from app.db.database import get_db
from app.db.models import Claim, HITLDecision
from app.agents.graph import resume_claim, claim_graph_app

logger = logging.getLogger("claimflow.api.hitl")
router = APIRouter(prefix="/api/hitl", tags=["hitl"])


class AdjusterDecisionRequest(BaseModel):
    adjuster_id: str = "ADJ-10492"
    decision: str = Field(..., description="APPROVE, OVERRIDE_PAYOUT, DENY, or REFER_SIU")
    audit_note: str = Field(..., min_length=5, description="Mandatory audit justification")
    override_payout_amount: Optional[float] = None


@router.get("/queue")
async def get_hitl_queue(db: AsyncSession = Depends(get_db)):
    """
    Returns all claims currently in PENDING_HITL awaiting adjuster governance.
    Includes cited policy clauses, fraud drivers, subrogation badge, and payout calculation.
    """
    stmt = select(Claim).where(Claim.status == "PENDING_HITL").order_by(desc(Claim.created_at))
    res = await db.execute(stmt)
    claims = res.scalars().all()

    queue_items = []
    for c in claims:
        trace = json.loads(c.agent_trace_json or "{}")
        citations = json.loads(c.rag_citations_json or "[]")
        guidewire = json.loads(c.guidewire_payload_json or "{}")
        audit_items = json.loads(c.itemized_audit_json or "[]")
        
        # Check interrupts in checkpointer
        state_snap = claim_graph_app.get_state({"configurable": {"thread_id": c.thread_id}})
        interrupt_info = {}
        if state_snap.tasks and state_snap.tasks[0].interrupts:
            interrupt_info = state_snap.tasks[0].interrupts[0].value

        queue_items.append({
            "claim_number": c.claim_number,
            "policy_number": c.policy_number,
            "claimant_name": c.claimant_name_masked,
            "incident_date": c.incident_date,
            "loss_type": c.loss_type,
            "status": c.status,
            "claimed_amount": c.claimed_amount,
            "approved_amount": c.approved_amount,
            "disallowed_amount": c.disallowed_amount,
            "deductible": c.deductible,
            "calculated_net_payout": c.net_payout,
            "fraud_risk_score": c.fraud_risk_score,
            "subrogation_likelihood": c.subrogation_likelihood,
            "pause_reasons": interrupt_info.get("pause_reasons", trace.get("pause_reasons", [])),
            "citations": citations,
            "itemized_audit": audit_items,
            "guidewire_preview": guidewire,
            "agent_trace": trace,
            "thread_id": c.thread_id
        })

    return queue_items


@router.post("/{claim_number}/decision")
async def submit_hitl_decision(
    claim_number: str,
    req: AdjusterDecisionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Submits an adjuster decision (APPROVE, OVERRIDE_PAYOUT, DENY, REFER_SIU) with an audit note,
    resumes the LangGraph from its checkpointer, logs the action, and finalizes correspondence.
    """
    valid_decisions = ["APPROVE", "OVERRIDE_PAYOUT", "DENY", "REFER_SIU"]
    if req.decision not in valid_decisions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid decision. Must be one of: {', '.join(valid_decisions)}"
        )

    stmt = select(Claim).where(Claim.claim_number == claim_number)
    res = await db.execute(stmt)
    claim = res.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    if claim.status != "PENDING_HITL":
        raise HTTPException(status_code=400, detail=f"Claim is not in PENDING_HITL status (Current: {claim.status})")

    # Resume the LangGraph checkpoint
    decision_payload = {
        "adjuster_id": req.adjuster_id,
        "decision": req.decision,
        "audit_note": req.audit_note,
        "override_payout_amount": req.override_payout_amount
    }

    try:
        resumed_res = resume_claim(thread_id=claim.thread_id, hitl_decision=decision_payload)
    except Exception as e:
        logger.error(f"Error resuming claim {claim_number}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to resume workflow: {str(e)}")

    adj = resumed_res.get("adjudication", {})
    final_res = resumed_res.get("final_resolution", {})

    original_payout = claim.net_payout
    final_payout = float(final_res.get("final_payout", original_payout))

    # Update Claim in DB
    new_status = f"RESOLVED_{req.decision}"
    claim.status = new_status
    claim.net_payout = final_payout
    claim.guidewire_payload_json = json.dumps(adj.get("guidewire_payload", {}))

    # Log to hitl_decisions table
    hitl_log = HITLDecision(
        claim_id=claim.id,
        adjuster_id=req.adjuster_id,
        decision=req.decision,
        audit_note=req.audit_note,
        original_payout=original_payout,
        adjusted_payout=final_payout,
        settlement_letter_text=adj.get("settlement_letter", "")
    )
    db.add(hitl_log)
    await db.commit()
    await db.refresh(claim)

    return {
        "claim_number": claim.claim_number,
        "status": claim.status,
        "decision": req.decision,
        "original_payout": original_payout,
        "final_payout": final_payout,
        "audit_note": req.audit_note,
        "settlement_letter": adj.get("settlement_letter"),
        "guidewire_payload": adj.get("guidewire_payload")
    }
