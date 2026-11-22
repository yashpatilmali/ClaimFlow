export interface LineItem {
  description: string;
  category: string;
  claimed_cost: number;
  approved_cost?: number;
  disallowed_amount?: number;
  hours?: number;
  hourly_rate?: number;
  audit_note?: string;
}

export interface PolicyCitation {
  section_ref: string;
  page_num: number;
  quote: string;
}

export interface AgentOutputs {
  intake?: {
    incident_date: string;
    loss_type: string;
    vehicle_vin?: string;
    damaged_parts: string[];
    line_items: LineItem[];
    claimed_amount: number;
    third_party_involved: boolean;
    third_party_info?: any;
    math_reconciliation_valid: boolean;
    audit_notes: string;
  };
  policy?: {
    is_covered: boolean;
    coverage_type: string;
    coverage_limit: number;
    deductible: number;
    is_policy_active: boolean;
    citations: PolicyCitation[];
    coverage_decision_rationale: string;
  };
  fraud?: {
    fraud_risk_score: number;
    ml_model_probability: number;
    rule_flags: string[];
    risk_drivers: string[];
    recommendation: string;
  };
  subrogation?: {
    subrogation_likelihood: 'LOW' | 'MEDIUM' | 'HIGH';
    fault_score: number;
    identified_third_party?: any;
    estimated_recovery_amount: number;
    referral_brief: string;
  };
  estimator?: {
    claimed_total: number;
    approved_total: number;
    disallowed_total: number;
    coverage_limit: number;
    deductible: number;
    limit_applied: boolean;
    net_payout: number;
    itemized_audit: LineItem[];
    formula_log: string;
  };
  adjudication?: {
    status: string;
    routing_reason: string;
    settlement_letter: string;
    guidewire_payload: any;
    pause_reason?: string;
  };
}

export interface DemoScenario {
  scenario_id: string;
  name: string;
  tag: string;
  badge_color: 'emerald' | 'amber' | 'rose' | 'indigo';
  policy_number: string;
  claimant_name: string;
  vehicle_vin: string;
  incident_date: string;
  policy_bound_date: string;
  invoice_file: string;
  claimed_amount: number;
  deductible: number;
  narrative: string;
  expected_outcome: string;
  expected_payout: number;
  expected_reason: string;
}

export interface HITLQueueItem {
  claim_number: string;
  policy_number: string;
  claimant_name: string;
  incident_date: string;
  loss_type: string;
  status: string;
  claimed_amount: number;
  approved_amount: number;
  disallowed_amount: number;
  deductible: number;
  calculated_net_payout: number;
  fraud_risk_score: number;
  subrogation_likelihood: 'LOW' | 'MEDIUM' | 'HIGH';
  pause_reasons: string[];
  citations: PolicyCitation[];
  itemized_audit: LineItem[];
  guidewire_preview: any;
  agent_trace: any;
  thread_id: string;
}

export interface KPISummary {
  total_claims_processed: number;
  stp_rate_percentage: number;
  avg_triage_latency_seconds: number;
  fraud_leakage_prevented_dollars: number;
  subrogation_opportunities_dollars: number;
  subrogation_claims_count: number;
  pending_hitl_count: number;
}
