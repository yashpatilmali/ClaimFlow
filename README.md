<div align="center">

# ClaimFlow AI
### Autonomous Multi-Agent P&C Auto Claims Adjudication, Fraud & Subrogation Orchestrator
**Production-Grade Architecture for Property & Casualty Auto Insurance**

[![CI Status](https://github.com/claimflow/claimflow-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/claimflow/claimflow-ai/actions)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/)
[![LangGraph](https://img.shields.io/badge/Orchestrator-LangGraph_v0.2+-orange.svg)](https://github.com/langchain-ai/langgraph)
[![FastAPI](https://img.shields.io/badge/API-FastAPI_Async+SSE-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/Frontend-React_18+TypeScript+Vite-61DAFB.svg)](https://reactjs.org/)
[![Radix UI](https://img.shields.io/badge/Design_System-Radix_UI+Tailwind-18304F.svg)](https://www.radix-ui.com/)
[![Zero Paid Dependencies](https://img.shields.io/badge/Zero_Cost-100%25_Free_Tier_or_Offline-brightgreen.svg)]()

</div>

---

## 1. Executive Summary

**ClaimFlow AI** is an enterprise-grade multi-agent claims adjudication system designed to transform Property & Casualty (P&C) auto claims processing. 

Traditional carrier claims pipelines suffer from manual triage latency (averaging 3–5 days per claim), inconsistent fraud detection leakage, delayed subrogation identification, and floating-point errors in automated payout calculations.

**ClaimFlow AI** replaces legacy linear scripts with a **Stateful 6-Agent LangGraph Orchestrator**:
- **Straight-Through Processing (STP):** Clean, non-suspicious claims under $2,000 with active coverage and low fraud risk are auto-adjudicated in <600ms, automatically generating an electronic settlement notice and a synchronized **Guidewire ClaimCenter (CC) v1 API payload**.
- **Human-in-the-Loop (HITL) Governance:** High-dollar claims, fraud anomalies, third-party subrogation opportunities, or policy exclusions trigger durable LangGraph `interrupt()` checkpoints, pausing execution until a licensed claims adjuster reviews and signs off with mandatory audit notes.
- **Zero Hallucination Financial Math:** Pure deterministic Python math computes:
  $$\text{Net Payout} = \max\Big(0.0, \min(\text{Approved Cost}, \text{Coverage Limit}) - \text{Deductible}\Big)$$
  guaranteeing the LLM never executes financial payout arithmetic.
- **Adjuster Desk UX:** Designed around a claims adjuster's physical desk with an Ink & Paper palette, self-hosted IBM Plex typography, sticky case file navigation, and a bold ruling block with a complete governance rule checklist.

---

## 2. Multi-Agent Architecture Topology

```mermaid
graph TD
    Start([First Notice of Loss: Repair Invoice PDF + Narrative]) --> Redact[Local PII Redaction Gate<br/>Masks SSN, Phone, Email, Policy ID, VIN]
    Redact --> Intake[1. intake_agent: FNOL & IDP Extraction + Self-Check Loop]
    
    subgraph Parallel Analysis [Parallel Fan-Out Execution]
        Intake --> Policy[2. policy_agent: Hybrid Policy RAG Validator]
        Intake --> Fraud[3. fraud_agent: Hybrid ML Classifier + SQL Red-Flags]
        Intake --> Subro[4. subrogation_agent: Third-Party Recovery Spotter]
    end
    
    Policy --> Estimator[5. estimator_agent: Benchmark Line-Item Audit + Deterministic Math]
    Fraud --> Estimator
    Subro --> Estimator
    
    Estimator --> Adjudicator{6. adjudicator_agent: Governance & STP Routing Rules}
    
    Adjudicator -->|STP Criteria Met: Covered, Risk < 30, Payout < $2k, No High Subro| STP[Status: APPROVED_STP<br/>• Settlement Letter<br/>• Guidewire ClaimCenter Webhook]
    Adjudicator -->|Exceptions: Exclusion, Risk ≥ 30, Payout ≥ $2k, High Subro| HITL[LangGraph interrupt()<br/>Status: PENDING_HITL<br/>Saved in Durable Checkpointer]
    
    HITL --> HumanAction[Adjuster Workbench Action:<br/>APPROVE | OVERRIDE_PAYOUT | DENY | REFER_SIU<br/>+ Mandatory Audit Justification]
    HumanAction --> ResumeGraph[Resume LangGraph Checkpoint & Finalize Decision]
```

---

## 3. The 6 Specialized Agents

| # | Agent Name | Execution Mode | Responsibilities & Tools |
|:---:|:---|:---:|:---|
| **1** | **`intake_agent`** | Sequential Entry | Extracts loss date, loss type, damaged parts, mechanic line items, and stated totals using `pymupdf` (`fitz`). Runs a self-check loop reconciling line-item sums against invoice totals. |
| **2** | **`policy_agent`** | Parallel Fan-Out | Verifies active policy dates against loss date. Runs hybrid retrieval (keyword + section chunking) over policy PDFs to validate coverage and provide verbatim policy citations (`section_ref`, `page_num`, `quote`). |
| **3** | **`fraud_agent`** | Parallel Fan-Out | Combines tabular ML (Gradient Boosting trained on Kaggle P&C features) with deterministic red-flag rules (policy bound < 15 days, parts discrepancy, prompt injection triggers) to output a 0–100 `fraud_risk_score`. |
| **4** | **`subrogation_agent`** | Parallel Fan-Out | Scans police report and narrative for adverse liability cues (stationary vehicle at red light, commercial freight carriers, police citations). Estimates recovery potential and drafts referral brief. |
| **5** | **`estimator_agent`** | Fan-In (Consolidation) | Audits mechanic line items against automotive repair benchmarks (capping parts and hourly labor rates), then strictly executes **pure Python deterministic math** for financial payout calculation. |
| **6** | **`adjudicator_agent`** | Sequential Router | Evaluates compliance governance. If all STP criteria pass, generates settlement notice and Guidewire webhook. If exceptions trigger, invokes LangGraph `interrupt()`, persisting state until adjuster decision. |

---

## 4. Try in 60 Seconds

ClaimFlow AI runs locally out of the box with zero paid API keys (`MOCK_LLM=true` default with SQLite).

```bash
# 1. Clone repository
git clone https://github.com/claimflow/claimflow-ai.git
cd claimflow-ai

# 2. Automated cross-platform setup (installs deps & builds test kit)
python scripts/dev.py setup

# 3. Start dev servers (FastAPI port 8000 + Vite port 5173)
python scripts/dev.py start
```

Open `http://localhost:5173` to access the ClaimFlow AI Adjuster Workbench.

---

## 5. Ready-to-Use Specimen Test Kit (TC01–TC19)

The repository includes 19 pre-generated synthetic test packets in `test_kit/packets/`:

| Packet ID | Case Name | Key Trait | Expected Status | Net Payout | Specimen Documents |
|---|---|---|---|---|---|
| **TC01** | Clean Bumper Repair | Minor parking tap, low cost | `APPROVED_STP` | $850.00 | Invoice PDF |
| **TC02** | Street Racing Exclusion | Speed contest on public road | `PENDING_HITL` (Exclusion) | $0.00 | Police Report PDF |
| **TC03** | Inflated Roof Repair | Narrative vs invoice mismatch | `PENDING_HITL` (SIU) | $0.00 | Damage Photo PNG |
| **TC04** | Commercial Carrier Collision | Adverse commercial freight truck | `PENDING_HITL` (Subro) | $1,900.00 | Police Report PDF |
| **TC05** | Loss Less Than Deductible | Claim below $500 deductible | `APPROVED_STP` | $0.00 | Invoice PDF |
| **TC06** | Inception Proximity Fraud | Policy bound 4 days prior | `PENDING_HITL` (SIU) | $0.00 | Invoice PDF |
| **TC07** | Extreme Labor Padding | 32 hours labor on fender | `PENDING_HITL` (Fraud) | $1,240.00 | Invoice PDF |
| **TC08** | Commercial Fleet Subrogation | Delivery fleet rear-end | `PENDING_HITL` (Subro) | $3,150.00 | Police Report PDF |
| **TC09** | Glass Windshield Replacement | Clean comprehensive glass | `APPROVED_STP` | $350.00 | Invoice PDF |
| **TC10** | Headlight Housing Assembly | Low-cost lighting replacement | `APPROVED_STP` | $420.00 | Invoice PDF |
| **TC11** | High Dollar Collision Repair | Exceeds $2,000 threshold | `PENDING_HITL` (Payout) | $3,450.00 | Invoice PDF |
| **TC12** | Ridesharing Without Endorsement | Commercial ridesharing exclusion | `PENDING_HITL` (Exclusion) | $0.00 | Police Report PDF |
| **TC13** | Prompt Injection Defense | Quarantined adversarial payload | `PENDING_HITL` (SIU) | $0.00 | Narrative File |
| **TC14** | Admitted Intentional Damage | Exclusion clause 4.A | `PENDING_HITL` (Exclusion) | $0.00 | Police Report PDF |
| **TC15** | Side Mirror Dent | Low-cost parking brush | `APPROVED_STP` | $280.00 | Invoice PDF |
| **TC16** | Unwitnessed Hit-and-Run | Lacks police documentation | `PENDING_HITL` (Audit) | $1,100.00 | Damage Photo PNG |
| **TC17** | Multiple Parts Mismatch | Parts discrepancy red flags | `PENDING_HITL` (SIU) | $0.00 | Invoice PDF |
| **TC18** | Disputed Red Light Liability | Partial adverse fault | `PENDING_HITL` (Subro) | $1,800.00 | Police Report PDF |
| **TC19** | Total Loss Valuation Boundary | Repair cost exceeds vehicle ACV | `PENDING_HITL` (Total Loss) | $18,500.00 | Invoice PDF |

### Test Kit Utilities
- **Interactive UI Test Lab (`/test-lab`):** View catalog cards, load into wizard, run direct, and batch run all 19 cases.
- **Postman & HTTP Collection:** `test_kit/api/claimflow.postman_collection.json` and `test_kit/api/claimflow.http`.
- **Smoke Test Script:** `python scripts/dev.py smoke` (generates `test_kit/results/latest.md`).

---

## 6. Developer CLI Commands (`scripts/dev.py`)

| Command | Action |
|---|---|
| `python scripts/dev.py setup` | Installs Python & Node packages and generates specimen test kit |
| `python scripts/dev.py start` | Starts FastAPI (8000) and Vite (5173) concurrently |
| `python scripts/dev.py test` | Runs backend `pytest` suite (22 unit & integration tests) |
| `python scripts/dev.py evals` | Runs 15-case LangGraph golden evaluation suite |
| `python scripts/dev.py smoke` | Runs automated smoke test assertions |
| `python scripts/dev.py e2e` | Runs Playwright end-to-end and accessibility checks |
| `python scripts/dev.py reset` | Resets demo database to clean 4 demo cases |
| `python scripts/dev.py test-kit` | Regenerates all 19 specimen test packets |

---

## 7. Documentation & References

- [Enhancement & Migration Plan](docs/ENHANCEMENT_PLAN.md): Detailed 8-phase audit, wireframes, and verification checklist.
- [Design System Guide](docs/DESIGN_SYSTEM.md): Palette tokens, IBM Plex typography scale, and Ruling block specifications.
- [User Guide & Adjuster Walkthrough](docs/USER_GUIDE.md): Practical tutorial for straight-through adjudication and human-in-the-loop sign-off.
- [Evaluation Results](evals/eval_results.md): 15-case LangGraph benchmark report.

---

<div align="center">
Crafted for Modern Auto Insurance Claims Automation
</div>
