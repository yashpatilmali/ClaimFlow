import logging
from typing import Dict, Any, List
from langgraph.types import interrupt
from app.agents.state import ClaimGraphState, AdjudicationOutput
from app.tools.guidewire_emitter import emit_guidewire_claim_payload
from app.config import settings

logger = logging.getLogger("claimflow.agent.adjudicator")


def adjudicator_node(state: ClaimGraphState) -> Dict[str, Any]:
    """
    Agent 6: Supervisor & HITL Router
    - Evaluates STP eligibility rules:
      - is_covered == True
      - fraud_risk_score < 30.0
      - net_payout < 2000.0
      - subrogation_likelihood != "HIGH"
    - If eligible: status -> APPROVED_STP, generates settlement letter & Guidewire payload.
    - If exception triggered: calls interrupt() to pause in durable checkpointer until adjuster signs off.
    """
    logger.info(f"[{state['claim_id']}] Running adjudicator_agent (Governance & STP Routing)...")
    intake = state.get("intake", {})
    policy = state.get("policy", {})
    fraud = state.get("fraud", {})
    subro = state.get("subrogation", {})
    estimator = state.get("estimator", {})

    is_covered = policy.get("is_covered", True)
    fraud_score = float(fraud.get("fraud_risk_score", 0.0))
    net_payout = float(estimator.get("net_payout", 0.0))
    approved_amount = float(estimator.get("approved_total", 0.0))
    deductible = float(estimator.get("deductible", 500.0))
    subro_likelihood = subro.get("subrogation_likelihood", "LOW")

    # Check for HITL pause triggers
    pause_reasons: List[str] = []
    if not is_covered:
        pause_reasons.append("POLICY_EXCLUSION: Policy coverage exclusion identified. Carrier regulatory compliance mandates human adjuster confirmation before issuing claim denial.")
    if fraud_score >= settings.STP_MAX_FRAUD_SCORE:
        pause_reasons.append(f"FRAUD_RISK_ELEVATED: Fraud risk score {fraud_score:.1f} >= threshold {settings.STP_MAX_FRAUD_SCORE:.1f}. Requires SIU / Adjuster fraud review.")
    if net_payout >= settings.STP_MAX_NET_PAYOUT:
        pause_reasons.append(f"HIGH_PAYOUT_THRESHOLD: Calculated net payout ${net_payout:,.2f} exceeds STP limit of ${settings.STP_MAX_NET_PAYOUT:,.2f}. Senior adjuster sign-off required.")
    if subro_likelihood == "HIGH":
        pause_reasons.append("HIGH_SUBROGATION_RECOVERY: High third-party recovery opportunity identified against commercial freight carrier. Subrogation referral packet requires adjuster review.")

    # 1. Straight-Through Processing (STP) Case
    if len(pause_reasons) == 0:
        logger.info(f"[{state['claim_id']}] STP Criteria satisfied! Auto-approving payout ${net_payout:,.2f}.")
        settlement_letter = (
            f"CLAIMFLOW AUTO INSURANCE - CLAIM SETTLEMENT NOTICE\n"
            f"Claim Number: {state['claim_id']}\n"
            f"Policy: {state.get('policy_number', 'POL-882910')}\n\n"
            f"Dear Policyholder,\n\n"
            f"Your recent auto insurance claim for incident date {intake.get('incident_date')} has been reviewed "
            f"and APPROVED via automated straight-through processing.\n\n"
            f"Summary of Adjudication:\n"
            f"- Approved Repair Estimate: ₹{approved_amount:,.2f}\n"
            f"- Less Policy Deductible: -₹{deductible:,.2f}\n"
            f"- Net Payable Settlement: ₹{net_payout:,.2f}\n\n"
            f"Payment has been scheduled for electronic funds transfer (EFT/IMPS). Please contact your assigned "
            f"claims officer if you have any questions.\n\n"
            f"Sincerely,\nClaimFlow Automated Claims Operations"
        )

        gw_payload = emit_guidewire_claim_payload(
            claim_number=state["claim_id"],
            policy_number=state.get("policy_number", "POL-882910"),
            loss_date=intake.get("incident_date", "2026-11-08"),
            loss_type=intake.get("loss_type", "Collision"),
            status="APPROVED_STP",
            approved_amount=approved_amount,
            deductible=deductible,
            net_payout=net_payout,
            fraud_risk_score=fraud_score,
            subrogation_likelihood=subro_likelihood,
            settlement_letter=settlement_letter,
            adjuster_notes="Auto-Approved via Straight-Through Processing (STP)."
        )

        adjudication_output = AdjudicationOutput(
            status="APPROVED_STP",
            routing_reason="All straight-through processing (STP) criteria met. No exceptions or exclusions detected.",
            settlement_letter=settlement_letter,
            guidewire_payload=gw_payload,
            pause_reason=None
        )

        return {
            "adjudication": adjudication_output.model_dump(),
            "final_resolution": {
                "decision": "APPROVED_STP",
                "final_payout": net_payout,
                "note": "Auto-approved via STP"
            }
        }

    # 2. HITL Case: Pause and wait for human adjuster review
    logger.info(f"[{state['claim_id']}] HITL exception triggered ({len(pause_reasons)} reasons). Triggering interrupt()...")
    pause_summary = " | ".join(pause_reasons)
    
    interruption_packet = {
        "claim_id": state["claim_id"],
        "status": "PENDING_HITL",
        "pause_reasons": pause_reasons,
        "current_approved": approved_amount,
        "current_deductible": deductible,
        "calculated_payout": net_payout,
        "fraud_risk_score": fraud_score,
        "subrogation_likelihood": subro_likelihood,
        "is_covered": is_covered,
        "action_required": "Please review claim in Adjuster Workbench and submit APPROVE, OVERRIDE_PAYOUT, DENY, or REFER_SIU with audit note."
    }

    # PAUSE GRAPH EXECUTION HERE
    human_response = interrupt(interruption_packet)

    # RESUMED BY ADJUSTER
    logger.info(f"[{state['claim_id']}] Resumed from interrupt with adjuster action: {human_response}")
    adj_decision = human_response.get("decision", "APPROVE")
    adj_note = human_response.get("audit_note", "Adjuster manual review completed.")
    override_amount = human_response.get("override_payout_amount")
    
    final_payout = net_payout
    if adj_decision == "OVERRIDE_PAYOUT" and override_amount is not None:
        final_payout = float(override_amount)
    elif adj_decision in ["DENY", "REFER_SIU"]:
        final_payout = 0.0

    final_letter = (
        f"CLAIMFLOW AUTO INSURANCE - CLAIM DETERMINATION NOTICE\n"
        f"Claim Number: {state['claim_id']}\n"
        f"Adjuster Decision: {adj_decision}\n"
        f"Final Settlement Payout: ₹{final_payout:,.2f}\n\n"
        f"Adjuster Audit Findings:\n{adj_note}\n\n"
        f"Sincerely,\nClaimFlow Claims Adjuster Services"
    )

    gw_resumed = emit_guidewire_claim_payload(
        claim_number=state["claim_id"],
        policy_number=state.get("policy_number", "POL-882910"),
        loss_date=intake.get("incident_date", "2026-11-08"),
        loss_type=intake.get("loss_type", "Collision"),
        status=f"RESOLVED_{adj_decision}",
        approved_amount=approved_amount,
        deductible=deductible,
        net_payout=final_payout,
        fraud_risk_score=fraud_score,
        subrogation_likelihood=subro_likelihood,
        settlement_letter=final_letter,
        adjuster_notes=adj_note
    )

    adjudication_output = AdjudicationOutput(
        status=f"RESOLVED_{adj_decision}",
        routing_reason=f"Reviewed and finalized by adjuster ({adj_decision}): {adj_note}",
        settlement_letter=final_letter,
        guidewire_payload=gw_resumed,
        pause_reason=pause_summary
    )

    return {
        "adjudication": adjudication_output.model_dump(),
        "hitl_decision": human_response,
        "final_resolution": {
            "decision": adj_decision,
            "final_payout": final_payout,
            "note": adj_note
        }
    }
