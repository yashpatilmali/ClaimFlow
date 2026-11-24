# ClaimFlow AI

### Autonomous Multi-Agent Auto Claims Adjudication & Fraud Orchestrator

[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph-v0.2+-FF6F00?style=flat&logo=chainlink&logoColor=white)](https://github.com/langchain-ai/langgraph)
[![FastAPI](https://img.shields.io/badge/FastAPI-Async+SSE-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Overview

**ClaimFlow AI** is a production-grade multi-agent claims adjudication system designed for Property & Casualty (P&C) auto insurance. Traditional carrier claims pipelines suffer from manual triage delays (averaging 3-5 days per claim), inconsistent fraud detection, and calculation errors. 

ClaimFlow AI replaces linear processing with a **Stateful 6-Agent LangGraph Orchestrator**:

- **Instant Auto-Approval (STP):** Clean, low-risk claims under ₹2,000 with active coverage and low fraud risk are auto-adjudicated in <600ms with automated settlement notices and Guidewire ClaimCenter CC v1 webhook payloads.
- **Human-in-the-Loop (HITL) Governance:** High-value claims, fraud anomalies, third-party subrogation opportunities, or policy exclusions trigger durable LangGraph `interrupt()` checkpoints, pausing execution until a claims officer reviews and approves.
- **Zero Hallucination Financial Math:** Pure deterministic Python math computes:
  $$\text{Net Payout} = \max\Big(0.0, \min(\text{Approved Cost}, \text{Coverage Limit}) - \text{Deductible}\Big)$$
  guaranteeing LLMs never perform financial arithmetic.
- **Indian Financial Localization:** Full native support for Indian currency (`₹`), Indian numbering formats (`1,00,000`, lakhs, and crores), `DD/MM/YYYY` dates, and `IST` time stamps.

---

## Multi-Agent Architecture

```mermaid
flowchart TD
    Start([First Notice of Loss: Repair Invoice PDF + Narrative]) --> Redact[Local PII Redaction Gate<br/>Masks Phone, Email, Policy ID, VIN]
    Redact --> Intake[1. Intake Agent<br/>FNOL Extraction & Line-Item Audit]
    
    subgraph ParallelChecks [Parallel Analysis Layer]
        Intake --> Policy[2. Policy Agent<br/>Hybrid Policy RAG Validator]
        Intake --> Fraud[3. Fraud Agent<br/>Risk Classifier & Red-Flag Checks]
        Intake --> Subro[4. Subrogation Agent<br/>Third-Party Liability Spotter]
    end
    
    Policy --> Estimator[5. Estimator Agent<br/>Standard Cost Benchmark & Deterministic Math]
    Fraud --> Estimator
    Subro --> Estimator
    
    Estimator --> Adjudicator{6. Adjudicator Agent<br/>Governance & Routing Rules}
    
    Adjudicator -->|STP: Covered, Risk < 30, Payout < ₹2k| STP[Instant Auto-Approval<br/>• Settlement Notice<br/>• Guidewire Integration]
    Adjudicator -->|Exceptions: Risk ≥ 30, Payout ≥ ₹2k, Subro| HITL[LangGraph interrupt Checkpoint<br/>Status: Awaiting Claims Officer Review]
    
    HITL --> HumanAction[Claims Officer Action:<br/>Approve | Override Payout | Deny | Refer to SIU]
    HumanAction --> FinalDecision[Resume Graph Checkpoint & Finalize Claim]
```

---

## The 6 Specialized Agents

| # | Agent Name | Execution | Role & Capabilities |
|:---:|:---|:---:|:---|
| **1** | **`intake_agent`** | Sequential | Extracts loss date, vehicle details, damaged parts, and repair line items from PDFs/invoices. Runs a self-check loop reconciling sums against stated invoice totals. |
| **2** | **`policy_agent`** | Parallel | Verifies coverage dates and terms against policy documents. Conducts hybrid RAG search to provide verbatim policy citations (`section_ref`, `page_num`, `quote`). |
| **3** | **`fraud_agent`** | Parallel | Combines ML risk classification with deterministic rule checks (short policy inception, parts mismatch, adversarial prompt injection) to compute a 0-100 `fraud_risk_score`. |
| **4** | **`subrogation_agent`** | Parallel | Scans police reports and narratives for third-party liability cues (rear-end collisions, freight carriers, citations) to identify recovery opportunities. |
| **5** | **`estimator_agent`** | Consolidation | Benchmarks parts and labor rates against automotive repair standards, applying deterministic Python formulas for financial settlement calculations. |
| **6** | **`adjudicator_agent`** | Decision Router | Applies compliance governance rules. Automatically routes low-risk claims for instant payout or pauses state at durable checkpointers for human sign-off. |

---

## Key Features

- **Built-in MockLLM:** Runs 100% offline out-of-the-box with zero API keys required for development, testing, and CI/CD.
- **Gemini & Groq Support:** Seamlessly connect Google Gemini (`gemini-1.5-flash`) or Groq (`llama-3.3-70b-versatile`) by setting your API key in `.env`.
- **Claims Officer Workbench:** Clean, modern React dashboard with real-time SSE execution telemetry, timeline graph view, decision override sliders, and printable audit letters.
- **Robust Security:** Pre-execution PII redaction layer and prompt-injection quarantine defenses protect against adversarial manipulation.

---

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/yashpatilmali/ClaimFlow.git
cd ClaimFlow
```

### 2. Setup Environment
```bash
# Automated cross-platform setup (installs Python & Node dependencies)
python scripts/dev.py setup
```

### 3. Run Development Servers
```bash
# Starts FastAPI (port 8000) and Vite frontend (port 5173) concurrently
python scripts/dev.py start
```

Open [http://localhost:5173](http://localhost:5173) in your browser to access the ClaimFlow Workbench.

---

## Specimen Test Suite

ClaimFlow includes 19 pre-configured test packets covering real-world edge cases:

| Case | Scenario | Focus Area | Expected Outcome |
|:---|:---|:---|:---|
| **TC01** | Clean Bumper Repair | Minor parking bump, low cost | Instant Auto-Approval (`APPROVED_STP`) |
| **TC02** | Street Racing Exclusion | Speed contest on public road | Paused for Review (`PENDING_HITL` - Exclusion) |
| **TC03** | Inflated Roof Repair | Narrative vs. invoice mismatch | Paused for Review (`PENDING_HITL` - Fraud/SIU) |
| **TC04** | Commercial Freight Crash | Commercial truck liability | Paused for Review (`PENDING_HITL` - Recovery) |
| **TC05** | Claim Below Deductible | Repair cost under deductible | Instant Auto-Approval (`₹0.00` payout) |
| **TC11** | High Payout Repair | Exceeds ₹2,000 threshold | Paused for Review (`PENDING_HITL` - High Value) |
| **TC13** | Prompt Injection Attack | Adversarial override attempt | Quarantined (`PENDING_HITL` - Security Alert) |

Run automated test assertions anytime:
```bash
python scripts/dev.py test       # Run 22 backend pytest tests
python scripts/dev.py smoke      # Run end-to-end smoke test
```

---

## Tech Stack

- **Backend:** Python 3.11+, FastAPI, LangGraph, LangChain, Pydantic v2, SQLite / aiosqlite
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Radix UI, Lucide Icons
- **AI Models:** Google Gemini (`gemini-1.5-flash`), Groq (`llama-3.3-70b-versatile`), and deterministic `MockLLM`
- **Testing:** Pytest, Playwright, Python Unit & E2E Evals

---

## License

Distributed under the MIT License.
