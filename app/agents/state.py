from typing import TypedDict, List, Dict, Any, Optional
from pydantic import BaseModel, Field


class LineItemModel(BaseModel):
    description: str
    category: str = "parts"
    claimed_cost: float
    hours: Optional[float] = None
    hourly_rate: Optional[float] = None


class ThirdPartyInfo(BaseModel):
    party_name: Optional[str] = None
    driver_name: Optional[str] = None
    insurance_carrier: Optional[str] = None
    policy_number: Optional[str] = None
    citation_issued: Optional[str] = None


class IntakeAgentOutput(BaseModel):
    incident_date: str
    loss_type: str = "Collision"
    vehicle_vin: Optional[str] = None
    damaged_parts: List[str] = Field(default_factory=list)
    line_items: List[Dict[str, Any]] = Field(default_factory=list)
    claimed_amount: float = 0.0
    third_party_involved: bool = False
    third_party_info: Optional[Dict[str, Any]] = None
    math_reconciliation_valid: bool = True
    audit_notes: str = ""


class PolicyCitationModel(BaseModel):
    section_ref: str
    page_num: int
    quote: str


class PolicyAgentOutput(BaseModel):
    is_covered: bool
    coverage_type: str
    coverage_limit: float
    deductible: float
    is_policy_active: bool
    citations: List[Dict[str, Any]] = Field(default_factory=list)
    coverage_decision_rationale: str = ""


class FraudAgentOutput(BaseModel):
    fraud_risk_score: float  # 0 to 100
    ml_model_probability: float
    rule_flags: List[str] = Field(default_factory=list)
    risk_drivers: List[str] = Field(default_factory=list)
    recommendation: str = "LOW_RISK"  # LOW_RISK, MEDIUM_RISK_ADJUSTER_REVIEW, REFER_SIU


class SubroOutput(BaseModel):
    subrogation_likelihood: str = "LOW"  # LOW, MEDIUM, HIGH
    fault_score: float = 0.0
    identified_third_party: Optional[Dict[str, Any]] = None
    estimated_recovery_amount: float = 0.0
    referral_brief: str = ""


class EstimatorOutput(BaseModel):
    claimed_total: float
    approved_total: float
    disallowed_total: float
    coverage_limit: float
    deductible: float
    limit_applied: bool
    net_payout: float
    itemized_audit: List[Dict[str, Any]] = Field(default_factory=list)
    formula_log: str = ""


class AdjudicationOutput(BaseModel):
    status: str  # APPROVED_STP, PENDING_HITL, RESOLVED, DENIED, REFER_SIU
    routing_reason: str
    settlement_letter: str = ""
    guidewire_payload: Dict[str, Any] = Field(default_factory=dict)
    pause_reason: Optional[str] = None


class HITLDecisionInput(BaseModel):
    adjuster_id: str
    decision: str  # APPROVE, OVERRIDE_PAYOUT, DENY, REFER_SIU
    audit_note: str
    override_payout_amount: Optional[float] = None


class ClaimGraphState(TypedDict):
    claim_id: str
    thread_id: str
    raw_narrative: str
    redacted_narrative: str
    pii_token_map: Dict[str, str]
    raw_pdf_path: Optional[str]
    policy_number: str
    policy_bound_date: Optional[str]

    # Node Outputs
    intake: Optional[Dict[str, Any]]
    policy: Optional[Dict[str, Any]]
    fraud: Optional[Dict[str, Any]]
    subrogation: Optional[Dict[str, Any]]
    estimator: Optional[Dict[str, Any]]
    adjudication: Optional[Dict[str, Any]]

    # HITL Resume Field
    hitl_decision: Optional[Dict[str, Any]]
    final_resolution: Optional[Dict[str, Any]]
