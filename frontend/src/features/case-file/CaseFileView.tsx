import React from 'react';
import { RulingBlock } from './RulingBlock';
import { WhatHappenedSection } from './WhatHappenedSection';
import { CoverageSection } from './CoverageSection';
import { FraudRiskSection } from './FraudRiskSection';
import { SubrogationSection } from './SubrogationSection';
import { PayoutBreakdownSection } from './PayoutBreakdownSection';
import { LettersSection } from './LettersSection';
import { AuditLogSection } from './AuditLogSection';
import { DecisionPanel } from './DecisionPanel';

export interface CaseFileViewProps {
  claim: any;
  onRefresh: () => void;
}

export const CaseFileView: React.FC<CaseFileViewProps> = ({ claim, onRefresh }) => {
  const trace = claim?.agent_trace || {};
  const isAwaitingReview = claim?.status === 'PENDING_HITL';

  const navItems = [
    { id: 'what-happened', label: '1. What happened' },
    { id: 'coverage', label: '2. Coverage & RAG' },
    { id: 'fraud-risk', label: '3. Fraud risk' },
    { id: 'subrogation', label: '4. Subrogation' },
    { id: 'payout-math', label: '5. Payout math' },
    { id: 'letters', label: '6. Letters & handoff' },
    { id: 'audit-log', label: '7. Audit log' },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Ruling Block: The One Bold Element */}
      <RulingBlock
        status={claim.status}
        netPayout={claim.net_payout}
        decisionRules={claim.decision_rules}
      />

      {/* Main 3-Column Grid: Sticky Nav | Scrolling Sections | Sticky Decision Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sticky Section Navigation (2 Cols) */}
        <nav
          aria-label="Case file section navigation"
          className="hidden lg:block lg:col-span-2 sticky top-20 rounded-panel border border-rule bg-surface p-3 space-y-1 text-xs select-none"
        >
          <span className="text-[11px] font-semibold text-muted px-2 py-1 block uppercase tracking-wider">
            Sections
          </span>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="w-full text-left px-2.5 py-1.5 rounded-input text-muted hover:text-ink hover:bg-paper transition-colors block truncate"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Center Scrolling Sections (7 or 10 Cols depending on whether review panel is present) */}
        <div className={`space-y-8 ${isAwaitingReview ? 'lg:col-span-6' : 'lg:col-span-10'}`}>
          <WhatHappenedSection
            intakeData={trace.intake}
            itemizedAudit={claim.itemized_audit}
            redactedNarrative={trace.narrative || trace.redacted_narrative}
          />

          <CoverageSection
            policyData={trace.policy}
            citations={claim.citations || []}
            policyNumber={claim.policy_number}
            lossDate={claim.incident_date}
          />

          <FraudRiskSection fraudData={trace.fraud} />

          <SubrogationSection subroData={trace.subrogation} />

          <PayoutBreakdownSection
            claimedAmount={claim.claimed_amount}
            approvedAmount={claim.approved_amount}
            disallowedAmount={claim.disallowed_amount}
            deductible={claim.deductible}
            coverageLimit={trace.policy?.coverage_limit || 50000.0}
            netPayout={claim.net_payout}
            formulaLog={trace.estimator?.formula_log}
          />

          <LettersSection
            claimNumber={claim.claim_number}
            settlementLetter={trace.adjudication?.settlement_letter}
            guidewirePayload={claim.guidewire_payload}
            status={claim.status}
          />

          <AuditLogSection claim={claim} />
        </div>

        {/* Right Column: Sticky Decision Panel when in PENDING_HITL (4 Cols) */}
        {isAwaitingReview && (
          <div className="lg:col-span-4">
            <DecisionPanel
              claimNumber={claim.claim_number}
              recommendedPayout={claim.net_payout}
              coverageLimit={trace.policy?.coverage_limit || 50000.0}
              pauseReasons={trace.pause_reasons || []}
              onDecisionSubmitted={onRefresh}
            />
          </div>
        )}
      </div>
    </div>
  );
};
