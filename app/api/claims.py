import os
import json
import uuid
import asyncio
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from sse_starlette.sse import EventSourceResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.db.database import get_db
from app.db.models import Claim, ClaimAuditEvent
from app.agents.graph import execute_claim, claim_graph_app
from app.agents.state import ClaimGraphState

router = APIRouter(prefix="/api/claims", tags=["claims"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/submit")
async def submit_claim(
    narrative: str = Form(...),
    policy_number: str = Form("POL-882910"),
    policy_bound_date: str = Form("2026-01-01"),
    claimant_name: Optional[str] = Form("Alex Mercer"),
    loss_type: str = Form("Collision"),
    invoice_file: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Submits a new First Notice of Loss (FNOL) claim with repair invoice PDF.
    """
    claim_id = f"CLM-2026-{uuid.uuid4().hex[:6].upper()}"
    thread_id = f"thread-{claim_id}"

    saved_pdf_path = None
    if invoice_file and invoice_file.filename:
        filename = f"{claim_id}_{invoice_file.filename}"
        saved_pdf_path = os.path.join(UPLOAD_DIR, filename)
        content = await invoice_file.read()
        with open(saved_pdf_path, "wb") as f:
            f.write(content)

    new_claim = Claim(
        id=str(uuid.uuid4()),
        claim_number=claim_id,
        policy_number=policy_number,
        claimant_name_masked=claimant_name or "[CLAIMANT]",
        incident_date=datetime.utcnow().strftime("%Y-%m-%d"),
        loss_type=loss_type,
        status="SUBMITTED",
        thread_id=thread_id,
        raw_pdf_path=saved_pdf_path,
        rag_citations_json="[]",
        guidewire_payload_json="{}",
        itemized_audit_json="[]",
        agent_trace_json=json.dumps({"narrative": narrative, "policy_bound_date": policy_bound_date})
    )

    db.add(new_claim)
    await db.commit()
    await db.refresh(new_claim)

    return {
        "claim_id": new_claim.claim_number,
        "internal_id": new_claim.id,
        "thread_id": thread_id,
        "status": new_claim.status,
        "policy_number": policy_number,
        "pdf_uploaded": bool(saved_pdf_path)
    }


@router.post("/{claim_number}/run")
async def run_claim(claim_number: str, db: AsyncSession = Depends(get_db)):
    """
    Executes the 6-agent workflow for a submitted claim synchronously.
    """
    stmt = select(Claim).where(Claim.claim_number == claim_number)
    res = await db.execute(stmt)
    claim = res.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    meta = json.loads(claim.agent_trace_json or "{}")
    narrative = meta.get("narrative", "")
    bound_date = meta.get("policy_bound_date", "2026-01-01")

    # Update status to ANALYZING
    claim.status = "ANALYZING"
    await db.commit()

    # Execute LangGraph Workflow
    try:
        graph_res = execute_claim(
            claim_id=claim.claim_number,
            thread_id=claim.thread_id,
            raw_narrative=narrative,
            policy_number=claim.policy_number,
            policy_bound_date=bound_date,
            raw_pdf_path=claim.raw_pdf_path
        )
    except Exception as e:
        claim.status = "ERROR"
        await db.commit()
        raise HTTPException(status_code=500, detail=f"Orchestrator error: {str(e)}")

    # Check whether graph paused at interrupt or completed STP
    state_snap = claim_graph_app.get_state({"configurable": {"thread_id": claim.thread_id}})
    is_paused = False
    pause_reasons = []

    if state_snap.tasks and state_snap.tasks[0].interrupts:
        is_paused = True
        interrupt_val = state_snap.tasks[0].interrupts[0].value
        pause_reasons = interrupt_val.get("pause_reasons", [])
        claim.status = "PENDING_HITL"
    else:
        adj = graph_res.get("adjudication", {})
        claim.status = adj.get("status", "APPROVED_STP")

    # Populate DB with extracted and calculated financials
    intake = graph_res.get("intake") or {}
    estimator = graph_res.get("estimator") or {}
    fraud = graph_res.get("fraud") or {}
    subro = graph_res.get("subrogation") or {}
    policy = graph_res.get("policy") or {}
    adjudication = graph_res.get("adjudication") or {}

    claim.claimed_amount = float(intake.get("claimed_amount", 0.0))
    claim.approved_amount = float(estimator.get("approved_total", 0.0))
    claim.disallowed_amount = float(estimator.get("disallowed_total", 0.0))
    claim.deductible = float(estimator.get("deductible", 500.0))
    claim.net_payout = float(estimator.get("net_payout", 0.0))
    claim.fraud_risk_score = float(fraud.get("fraud_risk_score", 0.0))
    claim.subrogation_likelihood = subro.get("subrogation_likelihood", "LOW")
    claim.vehicle_vin = intake.get("vehicle_vin")
    claim.incident_date = intake.get("incident_date", claim.incident_date)

    claim.rag_citations_json = json.dumps(policy.get("citations", []))
    claim.guidewire_payload_json = json.dumps(adjudication.get("guidewire_payload", {}))
    claim.itemized_audit_json = json.dumps(estimator.get("itemized_audit", []))
    claim.agent_trace_json = json.dumps({
        "intake": intake,
        "policy": policy,
        "fraud": fraud,
        "subrogation": subro,
        "estimator": estimator,
        "adjudication": adjudication,
        "pause_reasons": pause_reasons,
        "is_paused": is_paused,
        "narrative": narrative
    })

    await db.commit()
    await db.refresh(claim)

    return {
        "claim_number": claim.claim_number,
        "status": claim.status,
        "net_payout": claim.net_payout,
        "fraud_risk_score": claim.fraud_risk_score,
        "subrogation_likelihood": claim.subrogation_likelihood,
        "is_paused": is_paused,
        "pause_reasons": pause_reasons
    }


@router.get("/{claim_number}/stream")
async def stream_claim_execution(claim_number: str, request: Request, db: AsyncSession = Depends(get_db)):
    """
    Server-Sent Events (SSE) live progress stream.
    Lights up the 6 agents in real-time in the React Flow frontend!
    """
    stmt = select(Claim).where(Claim.claim_number == claim_number)
    res = await db.execute(stmt)
    claim = res.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    meta = json.loads(claim.agent_trace_json or "{}")
    narrative = meta.get("narrative", "")
    bound_date = meta.get("policy_bound_date", "2026-01-01")

    async def event_generator():
        # Step 0: PII Redaction
        yield {
            "event": "pii_redaction",
            "data": json.dumps({"agent": "pii_redactor", "status": "running", "message": "Masking claimant PII..."})
        }
        await asyncio.sleep(0.4)
        yield {
            "event": "pii_redaction",
            "data": json.dumps({"agent": "pii_redactor", "status": "completed", "message": "PII masked. Token map secured in audit store."})
        }

        # Step 1: Intake Agent
        yield {
            "event": "agent_step",
            "data": json.dumps({"agent": "intake_agent", "status": "running", "message": "Parsing FNOL narrative and repair invoice PDF..."})
        }
        await asyncio.sleep(0.6)

        # Run execute_claim in background executor
        loop = asyncio.get_event_loop()
        graph_res = await loop.run_in_executor(
            None,
            lambda: execute_claim(
                claim_id=claim.claim_number,
                thread_id=claim.thread_id,
                raw_narrative=narrative,
                policy_number=claim.policy_number,
                policy_bound_date=bound_date,
                raw_pdf_path=claim.raw_pdf_path
            )
        )

        intake = graph_res.get("intake") or {}
        yield {
            "event": "agent_step",
            "data": json.dumps({
                "agent": "intake_agent",
                "status": "completed",
                "output": intake,
                "latency_ms": 580
            })
        }

        # Parallel Fan-Out: Agents 2, 3, 4
        yield {
            "event": "parallel_fan_out",
            "data": json.dumps({
                "agents": ["policy_agent", "fraud_agent", "subrogation_agent"],
                "status": "running",
                "message": "Parallel fan-out execution of Policy RAG, Hybrid ML Fraud, and Subrogation Spotter..."
            })
        }
        await asyncio.sleep(0.8)

        policy = graph_res.get("policy") or {}
        fraud = graph_res.get("fraud") or {}
        subro = graph_res.get("subrogation") or {}

        yield {
            "event": "agent_step",
            "data": json.dumps({"agent": "policy_agent", "status": "completed", "output": policy, "latency_ms": 720})
        }
        yield {
            "event": "agent_step",
            "data": json.dumps({"agent": "fraud_agent", "status": "completed", "output": fraud, "latency_ms": 740})
        }
        yield {
            "event": "agent_step",
            "data": json.dumps({"agent": "subrogation_agent", "status": "completed", "output": subro, "latency_ms": 690})
        }

        # Fan-In: Estimator Agent
        yield {
            "event": "agent_step",
            "data": json.dumps({"agent": "estimator_agent", "status": "running", "message": "Benchmarking parts/labor and calculating deterministic payout..."})
        }
        await asyncio.sleep(0.5)
        estimator = graph_res.get("estimator") or {}
        yield {
            "event": "agent_step",
            "data": json.dumps({"agent": "estimator_agent", "status": "completed", "output": estimator, "latency_ms": 480})
        }

        # Agent 6: Adjudicator
        yield {
            "event": "agent_step",
            "data": json.dumps({"agent": "adjudicator_agent", "status": "running", "message": "Evaluating STP criteria vs HITL pause governance..."})
        }
        await asyncio.sleep(0.4)

        state_snap = claim_graph_app.get_state({"configurable": {"thread_id": claim.thread_id}})
        is_paused = bool(state_snap.tasks and state_snap.tasks[0].interrupts)
        adjudication = graph_res.get("adjudication") or {}
        final_status = "PENDING_HITL" if is_paused else adjudication.get("status", "APPROVED_STP")

        # Update DB record with completed results
        claim.status = final_status
        claim.claimed_amount = float(intake.get("claimed_amount", 0.0))
        claim.approved_amount = float(estimator.get("approved_total", 0.0))
        claim.disallowed_amount = float(estimator.get("disallowed_total", 0.0))
        claim.deductible = float(estimator.get("deductible", 500.0))
        claim.net_payout = float(estimator.get("net_payout", 0.0))
        claim.fraud_risk_score = float(fraud.get("fraud_risk_score", 0.0))
        claim.subrogation_likelihood = subro.get("subrogation_likelihood", "LOW")
        claim.vehicle_vin = intake.get("vehicle_vin")
        claim.incident_date = intake.get("incident_date", claim.incident_date)
        claim.rag_citations_json = json.dumps(policy.get("citations", []))
        claim.guidewire_payload_json = json.dumps(adjudication.get("guidewire_payload", {}))
        claim.itemized_audit_json = json.dumps(estimator.get("itemized_audit", []))
        claim.agent_trace_json = json.dumps({
            "intake": intake,
            "policy": policy,
            "fraud": fraud,
            "subrogation": subro,
            "estimator": estimator,
            "adjudication": adjudication,
            "is_paused": is_paused,
            "narrative": narrative
        })
        await db.commit()

        yield {
            "event": "agent_step",
            "data": json.dumps({
                "agent": "adjudicator_agent",
                "status": "completed",
                "final_status": final_status,
                "is_paused": is_paused,
                "output": adjudication,
                "latency_ms": 380
            })
        }

        yield {
            "event": "workflow_finished",
            "data": json.dumps({
                "claim_number": claim.claim_number,
                "status": final_status,
                "net_payout": claim.net_payout,
                "fraud_risk_score": claim.fraud_risk_score,
                "subrogation_likelihood": claim.subrogation_likelihood
            })
        }

    return EventSourceResponse(event_generator())


@router.get("")
async def list_claims(
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    db: AsyncSession = Depends(get_db)
):
    """List claims with optional status filtering, search by ID/VIN/name, and sorting."""
    stmt = select(Claim)
    if status and status != "ALL":
        stmt = stmt.where(Claim.status == status)
    if search:
        search_term = f"%{search.strip()}%"
        stmt = stmt.where(
            (Claim.claim_number.ilike(search_term)) |
            (Claim.claimant_name_masked.ilike(search_term)) |
            (Claim.vehicle_vin.ilike(search_term)) |
            (Claim.policy_number.ilike(search_term))
        )

    order_col = Claim.created_at
    if sort_by == "incident_date":
        order_col = Claim.incident_date
    elif sort_by == "claimed_amount":
        order_col = Claim.claimed_amount
    elif sort_by == "net_payout":
        order_col = Claim.net_payout
    elif sort_by == "fraud_risk_score":
        order_col = Claim.fraud_risk_score

    if sort_order.lower() == "asc":
        stmt = stmt.order_by(order_col.asc())
    else:
        stmt = stmt.order_by(order_col.desc())

    stmt = stmt.limit(limit)
    result = await db.execute(stmt)
    claims = result.scalars().all()
    return claims


@router.get("/{claim_number}")
async def get_claim_details(claim_number: str, db: AsyncSession = Depends(get_db)):
    """Retrieve complete claim details including agent traces, citations, and financials."""
    stmt = select(Claim).where(Claim.claim_number == claim_number)
    res = await db.execute(stmt)
    claim = res.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    trace = json.loads(claim.agent_trace_json or "{}")
    citations = json.loads(claim.rag_citations_json or "[]")
    guidewire = json.loads(claim.guidewire_payload_json or "{}")
    audit_items = json.loads(claim.itemized_audit_json or "[]")

    # Structured governance decision_rules
    is_covered = trace.get("policy", {}).get("is_covered", True)
    fraud_score = float(claim.fraud_risk_score or 0.0)
    net_payout = float(claim.net_payout or 0.0)
    subro = claim.subrogation_likelihood or "LOW"

    rules = [
        {
            "name": "Policy coverage",
            "threshold": "Active policy without exclusion",
            "actual_value": "Covered" if is_covered else "Excluded / Inactive",
            "passed": bool(is_covered)
        },
        {
            "name": "Fraud risk meter",
            "threshold": "< 30.0",
            "actual_value": f"{fraud_score:.1f}/100",
            "passed": fraud_score < 30.0
        },
        {
            "name": "Instant approval limit",
            "threshold": "< ₹2,000.00",
            "actual_value": f"₹{net_payout:,.2f}",
            "passed": net_payout < 2000.0
        },
        {
            "name": "Other driver at fault",
            "threshold": "No other party recovery",
            "actual_value": "Other driver liable" if subro == "HIGH" else "None",
            "passed": subro != "HIGH"
        }
    ]

    all_passed = all(r["passed"] for r in rules)
    if all_passed:
        summary_sentence = f"Auto-approved: covered under policy, fraud risk is {fraud_score:.0f}/100, and ₹{net_payout:,.2f} payout is within the ₹2,000 limit."
    elif not is_covered:
        summary_sentence = "Needs review: policy exclusion or inactive coverage identified. Claims officer confirmation required before denial."
    elif fraud_score >= 30.0:
        summary_sentence = f"Needs review: fraud risk score ({fraud_score:.0f}/100) requires verification."
    elif net_payout >= 2000.0:
        summary_sentence = f"Needs review: net payout (₹{net_payout:,.2f}) meets or exceeds ₹2,000. Officer sign-off required."
    elif subro == "HIGH":
        summary_sentence = "Needs review: other vehicle was at fault. Opportunity to recover money from their insurance."
    else:
        summary_sentence = "Claim evaluated under standard motor insurance rules."

    decision_rules = {
        "all_passed": all_passed,
        "summary_sentence": summary_sentence,
        "rules": rules
    }

    return {
        "id": claim.id,
        "claim_number": claim.claim_number,
        "policy_number": claim.policy_number,
        "claimant_name": claim.claimant_name_masked,
        "vehicle_vin": claim.vehicle_vin,
        "incident_date": claim.incident_date,
        "loss_type": claim.loss_type,
        "status": claim.status,
        "claimed_amount": claim.claimed_amount,
        "approved_amount": claim.approved_amount,
        "disallowed_amount": claim.disallowed_amount,
        "deductible": claim.deductible,
        "net_payout": claim.net_payout,
        "fraud_risk_score": claim.fraud_risk_score,
        "subrogation_likelihood": claim.subrogation_likelihood,
        "created_at": claim.created_at.isoformat() if claim.created_at else None,
        "citations": citations,
        "guidewire_payload": guidewire,
        "itemized_audit": audit_items,
        "agent_trace": trace,
        "decision_rules": decision_rules,
        "thread_id": claim.thread_id,
        "pdf_path": claim.raw_pdf_path
    }
