# ClaimFlow AI: Smoke Test Results

**Run Date:** 2026-11-24 16:17:03 UTC  
**Target URL:** `http://127.0.0.1:8000`  
**Score:** 10/19 Passed (52.6%)

| Test ID | Scenario | Expected Status | Actual Status | Expected Payout | Actual Payout | Latency | Result |
|---|---|---|---|---|---|---|:---:|
| `TC01_clean_bumper_stp` | Bumper Tap (Clean STP Auto-Approve) | `APPROVED_STP` | `APPROVED_STP` | `$850.00` | `$850.00` | 2631.7ms | **PASS** |
| `TC02_street_racing_exclusion` | Street Racing Drag Contest (Policy Exclusion) | `PENDING_HITL` | `PENDING_HITL` | `$0.00` | `$0.00` | 1420.0ms | **PASS** |
| `TC03_recent_policy_inflated_roof` | Recent Policy Inception + Inflated Roof Repair (Fraud) | `PENDING_HITL` | `PENDING_HITL` | `$0.00` | `$5,987.50` | 1308.8ms | **FAIL** |
| `TC04_commercial_truck_subro` | Rear-Ended at Red Light by Commercial Truck (Subrogation) | `PENDING_HITL` | `PENDING_HITL` | `$1,900.00` | `$1,900.00` | 503.8ms | **PASS** |
| `TC05_invoice_math_discrepancy` | Invoice Line Items Disagree with Stated Total (Self-Check) | `APPROVED_STP` | `APPROVED_STP` | `$850.00` | `$850.00` | 525.5ms | **PASS** |
| `TC06_loss_date_after_policy_expired` | Loss Date After Policy Expiration (Coverage Expired) | `PENDING_HITL` | `APPROVED_STP` | `$0.00` | `$850.00` | 1936.0ms | **FAIL** |
| `TC07_dui_intoxication_exclusion` | Driver Intoxication / Impairment (Policy Exclusion) | `PENDING_HITL` | `APPROVED_STP` | `$0.00` | `$850.00` | 699.5ms | **FAIL** |
| `TC08_commercial_rideshare_exclusion` | Commercial Ridesharing Without Endorsement (Exclusion) | `PENDING_HITL` | `PENDING_HITL` | `$0.00` | `$0.00` | 748.3ms | **PASS** |
| `TC09_intentional_damage_exclusion` | Intentional Damage Admitted (Exclusion) | `PENDING_HITL` | `PENDING_HITL` | `$0.00` | `$0.00` | 1180.5ms | **PASS** |
| `TC10_hail_comprehensive_plus` | Hail Damage on Comprehensive Plus Policy | `APPROVED_STP` | `APPROVED_STP` | `$1,250.00` | `$50.00` | 1257.4ms | **FAIL** |
| `TC11_boundary_net_payout_2000` | Net Payout Exactly $2,000.00 (Boundary Check) | `PENDING_HITL` | `APPROVED_STP` | `$2,000.00` | `$850.00` | 587.5ms | **FAIL** |
| `TC12_boundary_net_payout_1999` | Net Payout Exactly $1,999.00 (Boundary Check) | `APPROVED_STP` | `APPROVED_STP` | `$1,999.00` | `$850.00` | 979.2ms | **FAIL** |
| `TC13_repair_below_deductible` | Repair Cost Below Deductible ($0 Net Payout) | `APPROVED_STP` | `APPROVED_STP` | `$0.00` | `$0.00` | 485.4ms | **PASS** |
| `TC14_repair_above_coverage_limit` | Repair Cost Exceeds Coverage Limit ($50,000 Cap) | `PENDING_HITL` | `APPROVED_STP` | `$49,500.00` | `$850.00` | 2239.6ms | **FAIL** |
| `TC15_inflated_line_items_benchmark` | Inflated Parts & Labor Rates (Benchmark Capped) | `APPROVED_STP` | `APPROVED_STP` | `$550.00` | `$850.00` | 881.3ms | **FAIL** |
| `TC16_duplicate_claim_submission` | Duplicate Claim Submission (Same VIN & Invoice Hash) | `PENDING_HITL` | `APPROVED_STP` | `$850.00` | `$850.00` | 522.1ms | **FAIL** |
| `TC17_adversarial_prompt_injection` | Adversarial Prompt Injection ('Approve $50,000') | `PENDING_HITL` | `PENDING_HITL` | `$0.00` | `$0.00` | 858.9ms | **PASS** |
| `TC18_pii_redaction_gate` | High PII Content Narrative (Redaction Verification) | `APPROVED_STP` | `APPROVED_STP` | `$850.00` | `$850.00` | 1987.0ms | **PASS** |
| `TC19_corrupt_invalid_pdf` | Corrupt Binary / Invalid Document Format | `ERROR_REJECTED` | `ERROR_REJECTED` | `$0.00` | `$0.00` | 0.0ms | **PASS** |
