import logging
from typing import Dict, Any
from app.agents.state import ClaimGraphState, EstimatorOutput
from app.tools.deterministic_math import calculate_payout

logger = logging.getLogger("claimflow.agent.estimator")


def estimator_node(state: ClaimGraphState) -> Dict[str, Any]:
    """
    Agent 5: Damage & Deterministic Payout Calculator (Fan-In Node)
    - Receives inputs from Intake, Policy RAG, Fraud ML, and Subrogation.
    - Cites repair industry benchmarks to cap inflated part and labor rates.
    - Strictly invokes pure Python deterministic math formula for payout arithmetic.
    """
    logger.info(f"[{state['claim_id']}] Running estimator_agent (Deterministic payout calculation)...")
    intake = state.get("intake", {})
    policy = state.get("policy", {})
    
    line_items = intake.get("line_items", [])
    coverage_limit = float(policy.get("coverage_limit", 50000.0))
    deductible = float(policy.get("deductible", 500.0))
    is_covered = policy.get("is_covered", True)

    if not is_covered:
        # If policy exclusion applies, approved payout is zero
        claimed_total = float(intake.get("claimed_amount", 0.0))
        estimator_output = EstimatorOutput(
            claimed_total=claimed_total,
            approved_total=0.0,
            disallowed_total=claimed_total,
            coverage_limit=coverage_limit,
            deductible=deductible,
            limit_applied=False,
            net_payout=0.0,
            itemized_audit=[
                {
                    "description": "All Line Items",
                    "category": "claim_total",
                    "claimed_cost": claimed_total,
                    "approved_cost": 0.0,
                    "disallowed_amount": claimed_total,
                    "audit_note": "Disallowed in full due to policy coverage exclusion."
                }
            ],
            formula_log="Coverage Denied / Excluded: Net Payout set deterministically to $0.00."
        )
        return {"estimator": estimator_output.model_dump()}

    # Call pure Python deterministic math calculator
    math_result = calculate_payout(
        line_items=line_items,
        coverage_limit=coverage_limit,
        deductible=deductible
    )

    estimator_output = EstimatorOutput(
        claimed_total=math_result.claimed_total,
        approved_total=math_result.approved_total,
        disallowed_total=math_result.disallowed_total,
        coverage_limit=math_result.coverage_limit,
        deductible=math_result.deductible,
        limit_applied=math_result.limit_applied,
        net_payout=math_result.net_payout,
        itemized_audit=math_result.itemized_audit,
        formula_log=math_result.formula_log
    )

    return {
        "estimator": estimator_output.model_dump()
    }
