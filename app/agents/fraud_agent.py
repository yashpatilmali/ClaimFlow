import logging
from datetime import datetime
from typing import Dict, Any
from app.agents.state import ClaimGraphState, FraudAgentOutput
from app.ml.train_fraud_model import fraud_predictor
from app.core.security import detect_adversarial_patterns

logger = logging.getLogger("claimflow.agent.fraud")


def fraud_node(state: ClaimGraphState) -> Dict[str, Any]:
    """
    Agent 3: Hybrid ML + Anomaly Investigator (Parallel Node)
    - Tabular ML model inference.
    - Deterministic SQL red-flag rules (loss-to-bind proximity, parts discrepancy).
    - Generates 0-100 fraud score and explicit risk drivers.
    """
    logger.info(f"[{state['claim_id']}] Running fraud_agent (Hybrid ML + rules)...")
    intake = state.get("intake", {})
    narrative = state.get("redacted_narrative", "").lower()
    claimed_amount = float(intake.get("claimed_amount", 1500.0))
    line_items = intake.get("line_items", [])
    
    # Calculate days from policy bound date to incident date
    bound_date_str = state.get("policy_bound_date", "2026-01-01")
    incident_date_str = intake.get("incident_date", "2026-11-08")
    bind_days = 200.0
    try:
        b_dt = datetime.strptime(bound_date_str, "%Y-%m-%d")
        i_dt = datetime.strptime(incident_date_str, "%Y-%m-%d")
        bind_days = max(1.0, float((i_dt - b_dt).days))
    except Exception:
        pass

    # Check for part mismatch: narrative mentions minor/mirror/scratch, but invoice has roof/frame/engine
    narrative_mentions_minor = any(w in narrative for w in ["mirror", "mailbox", "scratch", "small dent", "low-speed", "5 mph"])
    invoice_has_heavy_parts = any("roof" in item.get("description", "").lower() or "frame" in item.get("description", "").lower() for item in line_items)
    part_mismatch_flag = narrative_mentions_minor and invoice_has_heavy_parts

    # Racing flag
    racing_flag = any(w in narrative for w in ["racing", "drag", "speed contest", "drifting"])

    # Adversarial prompt injection detection
    raw_text = state.get("raw_narrative", "")
    injection_patterns = detect_adversarial_patterns(raw_text)
    is_injection_attempt = len(injection_patterns) > 0

    # High labor ratio
    total_labor = sum(item.get("claimed_cost", 0.0) for item in line_items if item.get("category") == "labor")
    high_labor_ratio = (total_labor / claimed_amount > 0.5) if claimed_amount > 0 else False

    claim_features = {
        "policy_bind_to_incident_days": bind_days,
        "months_as_customer": max(1.0, bind_days / 30.0),
        "deductible": 500.0,
        "claimed_amount": claimed_amount,
        "vehicle_claim_amount": claimed_amount,
        "incident_hour": 2 if bind_days < 15 else 14,
        "number_of_vehicles_involved": 1,
        "witnesses": 0 if bind_days < 15 else 1,
        "police_report_available": not (bind_days < 15 and part_mismatch_flag),
        "part_mismatch_flag": part_mismatch_flag,
        "high_labor_ratio_flag": high_labor_ratio,
        "racing_exclusion_flag": racing_flag,
    }

    eval_result = fraud_predictor.evaluate_claim(claim_features)

    risk_score = eval_result["fraud_risk_score"]
    rule_flags = list(eval_result["rule_flags"])
    risk_drivers = list(eval_result["risk_drivers"])
    recommendation = eval_result["recommendation"]

    if is_injection_attempt:
        risk_score = 95.0
        recommendation = "REFER_SIU"
        rule_flags.append(f"ADVERSARIAL_PROMPT_INJECTION: Detected attempt to manipulate claim rules ({len(injection_patterns)} triggers).")
        risk_drivers.append("Prompt injection attack patterns detected in narrative")

    fraud_output = FraudAgentOutput(
        fraud_risk_score=risk_score,
        ml_model_probability=eval_result["ml_model_probability"],
        rule_flags=rule_flags,
        risk_drivers=risk_drivers,
        recommendation=recommendation
    )

    return {
        "fraud": fraud_output.model_dump()
    }
