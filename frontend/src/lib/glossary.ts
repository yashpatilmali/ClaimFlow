/**
 * Plain-language glossary of P&C insurance and orchestration terminology.
 * Displayed in <Term> in-context tooltips and in the Help Drawer.
 */

export interface GlossaryTerm {
  term: string;
  shortDefinition: string;
  fullDefinition: string;
}

export const GLOSSARY: Record<string, GlossaryTerm> = {
  stp: {
    term: 'Straight-Through Processing (STP)',
    shortDefinition: 'Zero-touch automated claim approval without human adjuster intervention.',
    fullDefinition:
      'Straight-Through Processing occurs when a claim satisfies all automated criteria: active coverage, low fraud risk (score < 30), net payout under $2,000, and no high subrogation recovery opportunity. The settlement is approved and authorized automatically in seconds.',
  },
  hitl: {
    term: 'Human-in-the-Loop (HITL)',
    shortDefinition: 'Governance pause that routes a claim to an adjuster for sign-off.',
    fullDefinition:
      'When an automated rule triggers an exception (such as a policy exclusion, elevated fraud score, high dollar amount, or adverse subrogation), the LangGraph workflow safely pauses using durable checkpointing. The claim enters the Review Queue until an adjuster signs off or overrides the determination.',
  },
  fnol: {
    term: 'First Notice of Loss (FNOL)',
    shortDefinition: 'The initial report of an accident or loss submitted to the insurer.',
    fullDefinition:
      'The intake document package containing the policyholder’s incident narrative, date, loss type, and initial repair shop invoice or estimate.',
  },
  siu: {
    term: 'Special Investigation Unit (SIU)',
    shortDefinition: 'Specialized insurance team dedicated to investigating suspicious or fraudulent claims.',
    fullDefinition:
      'A dedicated team of fraud examiners. Claims with high ML fraud scores (> 60), recent policy binding (< 15 days), or parts-to-narrative discrepancies are routed to SIU for in-depth verification.',
  },
  subrogation: {
    term: 'Subrogation',
    shortDefinition: 'The insurer’s legal right to recover paid claims from an at-fault third party.',
    fullDefinition:
      'When another motorist or commercial carrier caused the accident, ClaimFlow flags the claim early and drafts a referral brief so the carrier can recover the repair settlement and the insured’s deductible from the adverse party’s insurance.',
  },
  deductible: {
    term: 'Deductible',
    shortDefinition: 'The out-of-pocket amount the policyholder pays before insurance coverage applies.',
    fullDefinition:
      'Specified in the policy declarations (e.g. $500.00). The deductible is subtracted from approved repair costs to determine the net settlement payout.',
  },
  coverage_limit: {
    term: 'Coverage Limit',
    shortDefinition: 'The maximum dollar amount the insurance policy will pay for a covered loss.',
    fullDefinition:
      'The ceiling on carrier liability (typically $50,000.00 for collision/comprehensive). Any approved repair amount exceeding this limit is capped before applying the deductible.',
  },
  policy_citation: {
    term: 'Policy Citation (RAG)',
    shortDefinition: 'Direct quote and section reference from the insurance contract.',
    fullDefinition:
      'ClaimFlow uses Retrieval-Augmented Generation (RAG) over indexed policy documents to ground every coverage or exclusion determination with the exact section number, page number, and verbatim clause text.',
  },
  fraud_risk_score: {
    term: 'Fraud Risk Score',
    shortDefinition: 'A 0–100 probability metric derived from machine learning and rule checks.',
    fullDefinition:
      'Combines a trained tabular machine learning classifier (0–29 low, 30–69 elevated, 70–100 high) with deterministic rule checks (loss-to-bind proximity, parts-to-narrative discrepancy, and duplicate hashes).',
  },
  deterministic_math: {
    term: 'Deterministic Payout Math',
    shortDefinition: 'Pure Python formula calculation ensuring zero floating-point LLM arithmetic.',
    fullDefinition:
      'The LLM is strictly prohibited from doing payout arithmetic. Instead, a deterministic Python tool applies: max(0.0, min(approved_total, coverage_limit) - deductible) alongside parts benchmarks.',
  },
};

export function getGlossaryTerm(key: string): GlossaryTerm | undefined {
  return GLOSSARY[key.toLowerCase()];
}
