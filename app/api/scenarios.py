import os
import json
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models import Claim
from app.agents.graph import execute_claim, claim_graph_app

router = APIRouter(prefix="/api/scenarios", tags=["scenarios"])
SCENARIOS_FILE = "sample_data/demo_scenarios.json"


@router.get("")
async def list_demo_scenarios():
    """Returns the 4 ready-to-run demo scenarios."""
    if not os.path.exists(SCENARIOS_FILE):
        raise HTTPException(status_code=404, detail="Demo scenarios file not found")
    with open(SCENARIOS_FILE, "r") as f:
        data = json.load(f)
    return data


@router.post("/{scenario_id}/execute")
async def execute_demo_scenario(scenario_id: str, db: AsyncSession = Depends(get_db)):
    """
    Executes a pre-configured demo scenario end-to-end,
    saving the claim to the database and returning full agent trace results.
    """
    if not os.path.exists(SCENARIOS_FILE):
        raise HTTPException(status_code=404, detail="Demo scenarios file not found")
    with open(SCENARIOS_FILE, "r") as f:
        scenarios = json.load(f)

    target_scenario = next((s for s in scenarios if s.get("scenario_id") == scenario_id), None)
    if not target_scenario:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found")

    claim_number = f"CLM-DEMO-{scenario_id.upper()}-{uuid.uuid4().hex[:4].upper()}"
    thread_id = f"thread-{claim_number}"

    # 1. Execute Multi-Agent Graph
    graph_res = execute_claim(
        claim_id=claim_number,
        thread_id=thread_id,
        raw_narrative=target_scenario.get("narrative", ""),
        policy_number=target_scenario.get("policy_number", "POL-882910"),
        policy_bound_date=target_scenario.get("policy_bound_date", "2026-01-01"),
        raw_pdf_path=target_scenario.get("invoice_file")
    )

    # 2. Check for HITL interrupt vs STP
    state_snap = claim_graph_app.get_state({"configurable": {"thread_id": thread_id}})
    is_paused = bool(state_snap.tasks and state_snap.tasks[0].interrupts)
    pause_reasons = []
    if is_paused:
        interrupt_val = state_snap.tasks[0].interrupts[0].value
        pause_reasons = interrupt_val.get("pause_reasons", [])
        final_status = "PENDING_HITL"
    else:
        final_status = graph_res.get("adjudication", {}).get("status", "APPROVED_STP")

    intake = graph_res.get("intake") or {}
    estimator = graph_res.get("estimator") or {}
    fraud = graph_res.get("fraud") or {}
    subro = graph_res.get("subrogation") or {}
    policy = graph_res.get("policy") or {}
    adjudication = graph_res.get("adjudication") or {}

    # 3. Save to Database
    new_claim = Claim(
        id=str(uuid.uuid4()),
        claim_number=claim_number,
        policy_number=target_scenario.get("policy_number", "POL-882910"),
        claimant_name_masked=target_scenario.get("claimant_name", "[CLAIMANT]"),
        vehicle_vin=target_scenario.get("vehicle_vin"),
        incident_date=target_scenario.get("incident_date", datetime.utcnow().strftime("%Y-%m-%d")),
        loss_type="Collision",
        claimed_amount=float(intake.get("claimed_amount", target_scenario.get("claimed_amount", 0.0))),
        approved_amount=float(estimator.get("approved_total", 0.0)),
        disallowed_amount=float(estimator.get("disallowed_total", 0.0)),
        deductible=float(estimator.get("deductible", 500.0)),
        net_payout=float(estimator.get("net_payout", 0.0)),
        fraud_risk_score=float(fraud.get("fraud_risk_score", 0.0)),
        subrogation_likelihood=subro.get("subrogation_likelihood", "LOW"),
        status=final_status,
        thread_id=thread_id,
        raw_pdf_path=target_scenario.get("invoice_file"),
        rag_citations_json=json.dumps(policy.get("citations", [])),
        guidewire_payload_json=json.dumps(adjudication.get("guidewire_payload", {})),
        itemized_audit_json=json.dumps(estimator.get("itemized_audit", [])),
        agent_trace_json=json.dumps({
            "scenario": target_scenario,
            "intake": intake,
            "policy": policy,
            "fraud": fraud,
            "subrogation": subro,
            "estimator": estimator,
            "adjudication": adjudication,
            "pause_reasons": pause_reasons,
            "is_paused": is_paused,
            "narrative": target_scenario.get("narrative")
        })
    )

    db.add(new_claim)
    await db.commit()
    await db.refresh(new_claim)

    return {
        "claim_number": claim_number,
        "scenario": target_scenario,
        "status": final_status,
        "is_paused": is_paused,
        "pause_reasons": pause_reasons,
        "financials": {
            "claimed_amount": new_claim.claimed_amount,
            "approved_amount": new_claim.approved_amount,
            "deductible": new_claim.deductible,
            "net_payout": new_claim.net_payout
        },
        "fraud_risk_score": new_claim.fraud_risk_score,
        "subrogation_likelihood": new_claim.subrogation_likelihood,
        "agent_outputs": {
            "intake": intake,
            "policy": policy,
            "fraud": fraud,
            "subrogation": subro,
            "estimator": estimator,
            "adjudication": adjudication
        }
    }
