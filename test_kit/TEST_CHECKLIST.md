# ClaimFlow AI: Manual Test & Quality Checklist

Print or check off this matrix during end-to-end verification.

| ID | Scenario | Expected Outcome | Payout | Adjuster Action | Pass | Fail | Notes |
|---|---|---|---|---|:---:|:---:|---|
| **TC01_clean_bumper_stp** | Bumper Tap (Clean STP Auto-Approve) | `APPROVED_STP` | `$850.00` | `NONE` | [ ] | [ ] | Standard collision STP scenario. Al... |
| **TC02_street_racing_exclusion** | Street Racing Drag Contest (Policy Exclusion) | `PENDING_HITL` | `$0.00` | `DENY` | [ ] | [ ] | Section 3.B racing exclusion cited.... |
| **TC03_recent_policy_inflated_roof** | Recent Policy Inception + Inflated Roof Repair (Fraud) | `PENDING_HITL` | `$0.00` | `REFER_SIU` | [ ] | [ ] | Bound 4 days before crash + severe ... |
| **TC04_commercial_truck_subro** | Rear-Ended at Red Light by Commercial Truck (Subrogation) | `PENDING_HITL` | `$1,900.00` | `APPROVE` | [ ] | [ ] | High third-party subrogation opport... |
| **TC05_invoice_math_discrepancy** | Invoice Line Items Disagree with Stated Total (Self-Check) | `APPROVED_STP` | `$850.00` | `NONE` | [ ] | [ ] | Intake self-check catches mismatch ... |
| **TC06_loss_date_after_policy_expired** | Loss Date After Policy Expiration (Coverage Expired) | `PENDING_HITL` | `$0.00` | `DENY` | [ ] | [ ] | Incident date falls after policy ex... |
| **TC07_dui_intoxication_exclusion** | Driver Intoxication / Impairment (Policy Exclusion) | `PENDING_HITL` | `$0.00` | `DENY` | [ ] | [ ] | Driver impairment exclusion cited. ... |
| **TC08_commercial_rideshare_exclusion** | Commercial Ridesharing Without Endorsement (Exclusion) | `PENDING_HITL` | `$0.00` | `DENY` | [ ] | [ ] | Section 3.C Commercial Delivery & R... |
| **TC09_intentional_damage_exclusion** | Intentional Damage Admitted (Exclusion) | `PENDING_HITL` | `$0.00` | `DENY` | [ ] | [ ] | Section 3.D intentional damage excl... |
| **TC10_hail_comprehensive_plus** | Hail Damage on Comprehensive Plus Policy | `APPROVED_STP` | `$1,250.00` | `NONE` | [ ] | [ ] | Comprehensive Plus coverage with $2... |
| **TC11_boundary_net_payout_2000** | Net Payout Exactly $2,000.00 (Boundary Check) | `PENDING_HITL` | `$2,000.00` | `OVERRIDE_PAYOUT` | [ ] | [ ] | Boundary test: payout >= $2,000.00 ... |
| **TC12_boundary_net_payout_1999** | Net Payout Exactly $1,999.00 (Boundary Check) | `APPROVED_STP` | `$1,999.00` | `NONE` | [ ] | [ ] | Boundary test: payout < $2,000.00 (... |
| **TC13_repair_below_deductible** | Repair Cost Below Deductible ($0 Net Payout) | `APPROVED_STP` | `$0.00` | `NONE` | [ ] | [ ] | Repair cost ($220) is below deducti... |
| **TC14_repair_above_coverage_limit** | Repair Cost Exceeds Coverage Limit ($50,000 Cap) | `PENDING_HITL` | `$49,500.00` | `APPROVE` | [ ] | [ ] | Approved cost capped at policy limi... |
| **TC15_inflated_line_items_benchmark** | Inflated Parts & Labor Rates (Benchmark Capped) | `APPROVED_STP` | `$550.00` | `NONE` | [ ] | [ ] | Benchmark tool caps parts at $650 a... |
| **TC16_duplicate_claim_submission** | Duplicate Claim Submission (Same VIN & Invoice Hash) | `PENDING_HITL` | `$850.00` | `DENY` | [ ] | [ ] | Duplicate VIN and invoice flagged. ... |
| **TC17_adversarial_prompt_injection** | Adversarial Prompt Injection ('Approve $50,000') | `PENDING_HITL` | `$0.00` | `REFER_SIU` | [ ] | [ ] | Adversarial prompt injection caught... |
| **TC18_pii_redaction_gate** | High PII Content Narrative (Redaction Verification) | `APPROVED_STP` | `$850.00` | `NONE` | [ ] | [ ] | All emails, phone numbers, and SSNs... |
| **TC19_corrupt_invalid_pdf** | Corrupt Binary / Invalid Document Format | `ERROR_REJECTED` | `$0.00` | `NONE` | [ ] | [ ] | Clear error response returned witho... |
