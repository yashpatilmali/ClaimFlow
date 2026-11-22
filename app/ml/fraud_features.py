from typing import Dict, Any, List


FEATURE_NAMES = [
    "months_as_customer",
    "policy_bind_to_incident_days",
    "policy_deductible",
    "total_claim_amount",
    "vehicle_claim_amount",
    "incident_hour",
    "number_of_vehicles_involved",
    "witnesses",
    "police_report_available",
    "part_mismatch_flag",
    "high_labor_ratio_flag",
    "racing_exclusion_flag",
]


def extract_tabular_features(claim_data: Dict[str, Any]) -> List[float]:
    """
    Extracts a normalized numeric feature vector from claim data.
    """
    # Policy bind proximity in days
    bind_days = float(claim_data.get("policy_bind_to_incident_days", 180.0))
    months_as_customer = float(claim_data.get("months_as_customer", max(1.0, bind_days / 30.0)))
    deductible = float(claim_data.get("deductible", 500.0))
    total_claim = float(claim_data.get("claimed_amount", 1500.0))
    vehicle_claim = float(claim_data.get("vehicle_claim_amount", total_claim))
    incident_hour = float(claim_data.get("incident_hour", 14.0))
    num_vehicles = float(claim_data.get("number_of_vehicles_involved", 1.0))
    witnesses = float(claim_data.get("witnesses", 0.0))
    police_report = 1.0 if claim_data.get("police_report_available", True) else 0.0
    
    # Domain specific flags
    part_mismatch = 1.0 if claim_data.get("part_mismatch_flag", False) else 0.0
    high_labor = 1.0 if claim_data.get("high_labor_ratio_flag", False) else 0.0
    racing_flag = 1.0 if claim_data.get("racing_exclusion_flag", False) else 0.0

    return [
        months_as_customer,
        bind_days,
        deductible,
        total_claim,
        vehicle_claim,
        incident_hour,
        num_vehicles,
        witnesses,
        police_report,
        part_mismatch,
        high_labor,
        racing_flag,
    ]
