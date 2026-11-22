from datetime import datetime
from typing import Dict, Any


def emit_guidewire_claim_payload(
    claim_number: str,
    policy_number: str,
    loss_date: str,
    loss_type: str,
    status: str,
    approved_amount: float,
    deductible: float,
    net_payout: float,
    fraud_risk_score: float,
    subrogation_likelihood: str,
    settlement_letter: str,
    adjuster_notes: str = ""
) -> Dict[str, Any]:
    """
    Constructs an enterprise-grade Guidewire ClaimCenter (CC) v1 API payload
    simulating automated STP straight-through dispatch or HITL status synchronization.
    """
    gw_status = "Approved" if status == "APPROVED_STP" else ("UnderInvestigation" if "SIU" in status else "PendingReview")

    payload = {
        "guidewireHeader": {
            "sourceSystem": "ClaimFlow-AI-Orchestrator",
            "messageId": f"GW-MSG-{claim_number}-{int(datetime.utcnow().timestamp())}",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "environment": "Production-Simulation",
            "targetEndpoint": "Guidewire ClaimCenter Cloud API v1 /claims"
        },
        "claimData": {
            "claimNumber": claim_number,
            "policyNumber": policy_number,
            "lossDate": loss_date,
            "lossType": f"Auto_{loss_type}",
            "adjudicationStatus": gw_status,
            "automatedSTP": status == "APPROVED_STP",
            "financials": {
                "currency": "USD",
                "grossApprovedAmount": approved_amount,
                "deductibleApplied": deductible,
                "netPayableAmount": net_payout,
                "disbursementMethod": "EFT_ACH_Automated" if status == "APPROVED_STP" else "HoldForAdjusterApproval"
            },
            "riskAndFraud": {
                "fraudRiskScore": fraud_risk_score,
                "siuReferralRecommended": fraud_risk_score >= 60.0,
                "fraudRiskTier": "LOW" if fraud_risk_score < 30 else ("MEDIUM" if fraud_risk_score < 60 else "HIGH_SIU")
            },
            "subrogation": {
                "subrogationIdentified": subrogation_likelihood == "HIGH",
                "recoveryLikelihood": subrogation_likelihood,
                "subrogationTrack": "CommercialCarrierDemand" if subrogation_likelihood == "HIGH" else "Standard"
            },
            "adjusterAuditTrail": {
                "orchestratorEngine": "LangGraph Stateful Multi-Agent Graph",
                "notes": adjuster_notes or "Processed via ValueMomentum ClaimFlow AI Orchestrator.",
                "settlementLetterSummary": settlement_letter[:200] + "..." if settlement_letter else "N/A"
            }
        }
    }
    return payload
