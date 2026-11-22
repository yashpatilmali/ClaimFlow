import logging
from typing import Dict, Any
from app.agents.state import ClaimGraphState, PolicyAgentOutput
from app.tools.rag_engine import policy_rag

logger = logging.getLogger("claimflow.agent.policy")


def policy_node(state: ClaimGraphState) -> Dict[str, Any]:
    """
    Agent 2: Policy Coverage Validator (Parallel RAG Node)
    - Verifies active policy dates against loss date.
    - Searches policy sections for exclusions (street racing, rideshare).
    - Extracts limits, deductibles, and verbatim citations.
    """
    logger.info(f"[{state['claim_id']}] Running policy_agent (RAG coverage validation)...")
    intake = state.get("intake", {})
    incident_date = intake.get("incident_date", "2026-11-08")
    loss_type = intake.get("loss_type", "Collision")
    narrative = state.get("redacted_narrative", "")
    policy_num = state.get("policy_number", "POL-882910")
    bound_date = state.get("policy_bound_date", "2026-01-01")

    # Run Hybrid RAG Coverage Verification
    rag_result = policy_rag.verify_coverage(
        policy_number=policy_num,
        incident_date_str=incident_date,
        loss_type=loss_type,
        narrative=narrative,
        policy_effective_date=bound_date or "2026-01-01",
        policy_expiration_date="2027-01-01"
    )

    policy_output = PolicyAgentOutput(
        is_covered=rag_result.get("is_covered", True),
        coverage_type=rag_result.get("coverage_type", loss_type),
        coverage_limit=rag_result.get("coverage_limit", 50000.0),
        deductible=rag_result.get("deductible", 500.0),
        is_policy_active=rag_result.get("is_policy_active", True),
        citations=rag_result.get("citations", []),
        coverage_decision_rationale=rag_result.get("coverage_decision_rationale", "")
    )

    return {
        "policy": policy_output.model_dump()
    }
