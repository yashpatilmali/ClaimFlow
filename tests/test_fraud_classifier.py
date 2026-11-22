import pytest
from app.ml.train_fraud_model import fraud_predictor


def test_clean_claim_low_fraud_score():
    claim_data = {
        "policy_bind_to_incident_days": 240,
        "months_as_customer": 24,
        "deductible": 500.0,
        "claimed_amount": 1350.0,
        "vehicle_claim_amount": 1350.0,
        "incident_hour": 14,
        "number_of_vehicles_involved": 1,
        "witnesses": 1,
        "police_report_available": True,
        "part_mismatch_flag": False,
        "high_labor_ratio_flag": False,
        "racing_exclusion_flag": False,
    }
    result = fraud_predictor.evaluate_claim(claim_data)
    assert result["fraud_risk_score"] < 30.0
    assert result["recommendation"] == "LOW_RISK"
    assert len(result["rule_flags"]) == 0


def test_suspicious_claim_high_fraud_score():
    # Scenario 3: Bound 4 days ago, parts mismatch
    claim_data = {
        "policy_bind_to_incident_days": 4,
        "months_as_customer": 1,
        "deductible": 500.0,
        "claimed_amount": 6800.0,
        "vehicle_claim_amount": 6800.0,
        "incident_hour": 2,
        "number_of_vehicles_involved": 1,
        "witnesses": 0,
        "police_report_available": False,
        "part_mismatch_flag": True,
        "high_labor_ratio_flag": True,
        "racing_exclusion_flag": False,
    }
    result = fraud_predictor.evaluate_claim(claim_data)
    assert result["fraud_risk_score"] >= 70.0
    assert result["recommendation"] == "REFER_SIU"
    assert any("POLICY_BOUND_RECENTLY" in f for f in result["rule_flags"])
    assert any("INVOICE_NARRATIVE_MISMATCH" in f for f in result["rule_flags"])
