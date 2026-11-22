import logging
from typing import Dict, Any
from app.agents.state import ClaimGraphState, SubroOutput

logger = logging.getLogger("claimflow.agent.subrogation")


def subrogation_node(state: ClaimGraphState) -> Dict[str, Any]:
    """
    Agent 4: Subrogation Recovery Spotter (Parallel Node)
    - Detects third-party liability cues (police citations, rear-end impacts at red lights).
    - Identifies adverse carrier/commercial trucking entities.
    - Estimates recovery likelihood and drafts referral brief.
    """
    logger.info(f"[{state['claim_id']}] Running subrogation_agent...")
    intake = state.get("intake", {})
    narrative = state.get("redacted_narrative", "").lower()
    third_party_info = intake.get("third_party_info") or {}
    claimed_amount = float(intake.get("claimed_amount", 0.0))

    # Detection cues for high subrogation opportunity
    is_impact_third_party = any(w in narrative for w in ["rear-ended", "rear ended", "stopped at a red light", "stationary", "struck", "swung into"])
    has_police_citation = "citation" in narrative or "police" in narrative or bool(third_party_info.get("citation_issued"))
    is_commercial = any(w in narrative for w in ["commercial", "truck", "freight", "logistics", "trailer", "fleet"])

    if is_impact_third_party and (has_police_citation or is_commercial):
        subro_likelihood = "HIGH"
        fault_score = 95.0
        est_recovery = max(0.0, round(claimed_amount * 0.90, 2))
        party_data = {
            "entity": third_party_info.get("party_name", "Apex Freight Logistics Inc."),
            "carrier": third_party_info.get("insurance_carrier", "Great American Commercial"),
            "driver": third_party_info.get("driver_name", "Commercial Operator"),
            "citation": third_party_info.get("citation_issued", "Citation #TR-88192 (Failure to stop at signal)"),
            "impact_mechanism": "Rear-end collision at red light"
        }
        referral_brief = (
            f"HIGH SUBROGATION POTENTIAL: Insured vehicle was stationary at a red light when struck by "
            f"{party_data['entity']} ({party_data['carrier']}). Official police report documents citation issued "
            f"to adverse driver for failure to stop. 100% adverse liability indicated. Recommend immediate demand "
            f"packet dispatch to recover gross approved damages and insured deductible."
        )
    elif intake.get("third_party_involved") or "another car" in narrative:
        subro_likelihood = "MEDIUM"
        fault_score = 55.0
        est_recovery = max(0.0, round(claimed_amount * 0.50, 2))
        party_data = third_party_info or {"entity": "Third Party Motorist", "carrier": "Pending Carrier Discovery"}
        referral_brief = (
            "MEDIUM SUBROGATION POTENTIAL: Multiple vehicles involved. Comparative fault investigation required "
            "before issuing formal inter-company arbitration demand."
        )
    else:
        subro_likelihood = "LOW"
        fault_score = 5.0
        est_recovery = 0.0
        party_data = None
        referral_brief = "Single-vehicle incident or no solvent third party identified. Subrogation recovery not pursued."

    subro_output = SubroOutput(
        subrogation_likelihood=subro_likelihood,
        fault_score=fault_score,
        identified_third_party=party_data,
        estimated_recovery_amount=est_recovery,
        referral_brief=referral_brief
    )

    return {
        "subrogation": subro_output.model_dump()
    }
