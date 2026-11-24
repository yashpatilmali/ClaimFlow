# ClaimFlow AI User Guide

A step-by-step guide for insurance adjusters, claims supervisors, and evaluators to triage, review, and adjudicate property and casualty auto claims.

---

## 1. Quick Tour

ClaimFlow AI automates First Notice of Loss (FNOL) intake, coverage verification, fraud analysis, subrogation opportunity spotting, and payout estimation using 6 specialized LangGraph agents.

### App Navigation
- **Home (`/`):** Four instant 1-click demo claims and a 3-step workflow walkthrough.
- **New Claim (`/claims/new`):** 3-step wizard with document upload, narrative input, and a "Fill from a test packet" selector.
- **Claims Directory (`/claims`):** Filter, search, and sort all submitted claims across statuses.
- **Claim Detail (`/claims/:id`):** 
  - *Case File View:* Adjuster workbench with ruling block, 7 structured sections, and sticky decision panel.
  - *Agent Run View:* Step-by-step progress timeline, React Flow pipeline graph, and agent inspection drawer.
- **Review Queue (`/review`):** Prioritized list of claims paused by governance gates.
- **Operations Dashboard (`/dashboard`):** Real-time analytics, STP throughput, and financial loss prevention metrics.
- **Test Lab (`/test-lab`):** 19 specimen test packets (TC01–TC19) with 1-click execution and specimen file downloads.

---

## 2. Walkthrough: Triaging a Clean Claim (Straight-Through Processing)

1. Navigate to **Home** (`/`).
2. Under "Instant demo claims", click **Run this claim** on **Demo 1: Clean bumper repair**.
3. Watch the live agent execution stream:
   - *PII Redaction Gate:* Redacts claimant telephone numbers and email addresses.
   - *Agent 1 (Intake):* Parses invoice PDF line items and runs mathematical self-check.
   - *Parallel Fan-out (Agents 2, 3, 4):* Evaluates collision coverage clauses, calculates ML fraud score (0.7/100), and checks adverse liability.
   - *Agent 5 (Estimator):* Benchmarks part prices, subtracts $500 deductible, and calculates $850.00 net payout.
   - *Agent 6 (Adjudicator):* Evaluates governance rules; since all pass, issues auto-approval.
4. Click **Open Case file** to inspect the **Ruling Block**:
   - Status: `Auto-approved`
   - Net payout: `$850.00`
   - "Why" Checklist: All 4 governance gates show green checkmarks.
5. In Section 6 (Letters & Payloads), copy the generated Guidewire ClaimCenter JSON or preview the settlement notice.

---

## 3. Walkthrough: Human-in-the-Loop Adjuster Sign-Off

When a claim trips a governance threshold (e.g. policy exclusion, fraud risk $\ge 30$, or net payout $\ge \$2,000$), the orchestrator halts execution at a LangGraph checkpoint and routes the claim to the **Review queue**.

1. Go to **Review queue** (`/review`).
2. Identify a paused claim, e.g. **TC-03 (Inflated roof repair)** or **TC-02 (Street racing exclusion)**.
3. Click **Review claim** to open its **Case file**.
4. Observe the **Ruling block**:
   - Status: `Needs review`
   - The failing governance rule is flagged in red/amber with the reason (e.g., `Fraud Risk 72/100 (Threshold < 30)`).
5. In the sticky **Adjuster Decision Panel** on the right:
   - Select an action:
     - **Approve payout:** Authorizes settlement despite flagged condition.
     - **Override payout:** Modifies the dollar amount (shows live delta diff against initial recommendation).
     - **Deny claim:** Confirms exclusion under policy terms.
     - **Refer to SIU:** Escalates file to the Special Investigation Unit for fraud inquiry.
   - Select the governance reason code.
   - Enter a mandatory audit justification (minimum 20 characters).
6. Click **Confirm Decision**.
   - The LangGraph workflow resumes from its checkpointer.
   - The status is updated in the audit trail, and formal correspondence is generated.

---

## 4. Using the Specimen Test Kit

The repository ships with 19 synthetic test packets in `test_kit/packets/`:

- **TC01–TC04:** Core demo scenarios (Clean STP, Exclusion, Fraud, Subrogation).
- **TC05–TC10:** Loss under deductible, prior inception fraud, commercial fleet subrogation, glass repairs.
- **TC11–TC15:** High dollar threshold ($2,000+), unendorsed ridesharing, prompt injection resistance, intentional damage.
- **TC16–TC19:** Missing police report edge cases, partial liability, multi-part mismatch.

### Running Test Packets
- **In Web UI:** Open **Test lab** (`/test-lab`), locate any packet card, and click **Run** to execute directly, or click **Run all packets** to trigger the automated batch runner.
- **In New Claim Wizard:** On `/claims/new`, use the "Fill from a test packet" dropdown to auto-populate form fields and incident narratives.
- **Via CLI:** Run `python scripts/dev.py evals` or `python scripts/smoke_test.py`.
