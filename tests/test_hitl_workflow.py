import pytest
import uuid
from app.agents.graph import execute_claim, resume_claim, claim_graph_app


def test_scenario_1_clean_stp_auto_approve():
    claim_id = f"CLM-TEST-{uuid.uuid4().hex[:6].upper()}"
    thread_id = f"thread-{claim_id}"
    narrative = "I backed into a low pole in the grocery parking lot at 5 mph. Front bumper dented."
    
    result = execute_claim(
        claim_id=claim_id,
        thread_id=thread_id,
        raw_narrative=narrative,
        policy_number="POL-882910",
        policy_bound_date="2026-01-01",
        raw_pdf_path="sample_data/invoices/scenario_1_clean_bumper.pdf"
    )

    adjudication = result.get("adjudication", {})
    assert adjudication.get("status") == "APPROVED_STP"
    assert result.get("estimator", {}).get("net_payout") == 850.00
    assert result.get("fraud", {}).get("fraud_risk_score") < 30.0
    assert result.get("subrogation", {}).get("subrogation_likelihood") == "LOW"
    assert "VALUEMOMENTUM INSURANCE - CLAIM SETTLEMENT NOTICE" in adjudication.get("settlement_letter", "")
    assert "guidewireHeader" in adjudication.get("guidewire_payload", {})


def test_scenario_2_policy_exclusion_pause_and_resume_deny():
    claim_id = f"CLM-EXCL-{uuid.uuid4().hex[:6].upper()}"
    thread_id = f"thread-{claim_id}"
    narrative = "I was participating in an impromptu street racing drag pull on Industrial Parkway when my vehicle struck a barrier wall."
    
    # 1. Execute initial run - this should trigger interrupt()
    state = claim_graph_app.get_state({"configurable": {"thread_id": thread_id}})
    result = execute_claim(
        claim_id=claim_id,
        thread_id=thread_id,
        raw_narrative=narrative,
        policy_number="POL-882910",
        policy_bound_date="2026-01-01",
        raw_pdf_path="sample_data/invoices/scenario_2_racing_engine.pdf"
    )

    # In LangGraph with interrupt(), the state snapshot contains the interrupted tasks
    state_after_interrupt = claim_graph_app.get_state({"configurable": {"thread_id": thread_id}})
    assert len(state_after_interrupt.tasks) > 0
    assert state_after_interrupt.tasks[0].interrupts is not None
    interruption = state_after_interrupt.tasks[0].interrupts[0].value
    assert interruption.get("status") == "PENDING_HITL"
    assert any("POLICY_EXCLUSION" in r for r in interruption.get("pause_reasons", []))

    # 2. Resume graph with Adjuster DENY decision
    resumed_result = resume_claim(
        thread_id=thread_id,
        hitl_decision={
            "adjuster_id": "ADJ-4902",
            "decision": "DENY",
            "audit_note": "Claim confirmed excluded under Section 3.B (Street Racing Exclusion). Claimant admitted participation in speed contest."
        }
    )

    final_adj = resumed_result.get("adjudication", {})
    assert final_adj.get("status") == "RESOLVED_DENY"
    assert resumed_result.get("final_resolution", {}).get("final_payout") == 0.0
    assert "CLAIM DETERMINATION NOTICE" in final_adj.get("settlement_letter", "")


def test_scenario_3_suspicious_fraud_pause():
    claim_id = f"CLM-FRAUD-{uuid.uuid4().hex[:6].upper()}"
    thread_id = f"thread-{claim_id}"
    narrative = "I clipped a mailbox at low speed, damaging the side mirror."
    
    execute_claim(
        claim_id=claim_id,
        thread_id=thread_id,
        raw_narrative=narrative,
        policy_number="POL-771920",
        policy_bound_date="2026-11-08",  # 4 days prior to incident (2026-11-12)
        raw_pdf_path="sample_data/invoices/scenario_3_inflated_roof.pdf"
    )

    state = claim_graph_app.get_state({"configurable": {"thread_id": thread_id}})
    assert len(state.tasks) > 0
    interruption = state.tasks[0].interrupts[0].value
    assert interruption.get("status") == "PENDING_HITL"
    assert interruption.get("fraud_risk_score") >= 70.0
    assert any("FRAUD_RISK_ELEVATED" in r for r in interruption.get("pause_reasons", []))


def test_scenario_4_subrogation_pause_and_resume_approve():
    claim_id = f"CLM-SUBRO-{uuid.uuid4().hex[:6].upper()}"
    thread_id = f"thread-{claim_id}"
    narrative = "Stopped at a red light. Struck from behind by an Apex Freight Logistics commercial truck. Police citation issued."
    
    execute_claim(
        claim_id=claim_id,
        thread_id=thread_id,
        raw_narrative=narrative,
        policy_number="POL-882910",
        policy_bound_date="2026-01-01",
        raw_pdf_path="sample_data/invoices/scenario_4_truck_rear_end.pdf"
    )

    state = claim_graph_app.get_state({"configurable": {"thread_id": thread_id}})
    assert len(state.tasks) > 0
    interruption = state.tasks[0].interrupts[0].value
    assert interruption.get("subrogation_likelihood") == "HIGH"

    # Resume with approval and subrogation recovery initiation
    resumed = resume_claim(
        thread_id=thread_id,
        hitl_decision={
            "adjuster_id": "ADJ-5511",
            "decision": "APPROVE",
            "audit_note": "Payout approved. Initiated subrogation file SUB-2026-881 against Great American Commercial for full recovery."
        }
    )
    assert resumed.get("adjudication", {}).get("status") == "RESOLVED_APPROVE"
    assert resumed.get("final_resolution", {}).get("final_payout") > 0.0
