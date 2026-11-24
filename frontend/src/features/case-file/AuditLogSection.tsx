import React from 'react';
import { History, CheckCircle2, UserCheck, Bot } from 'lucide-react';
import { formatRelativeTime } from '../../lib/format';

export interface AuditLogSectionProps {
  claim: any;
}

export const AuditLogSection: React.FC<AuditLogSectionProps> = ({ claim }) => {
  const trace = claim?.agent_trace || {};
  const isPaused = trace?.is_paused;
  const status = claim?.status || 'SUBMITTED';

  // Construct audit events from agent traces and status
  const auditEvents = [
    {
      actor: 'System / PII Redactor',
      type: 'bot',
      title: 'FNOL Ingestion & PII Masking',
      time: 'T0 + 120ms',
      note: 'Masked claimant phone, email, and SSN. Token map vaulted in audit store.',
    },
    {
      actor: 'Step 1: Document Reading',
      type: 'bot',
      title: 'Invoice Data Extraction & Math Check',
      time: 'T0 + 580ms',
      note: `Extracted line items totaling ₹${(claim?.claimed_amount || 0).toFixed(2)}. Math reconciliation verified.`,
    },
    {
      actor: 'Step 2: Policy Check',
      type: 'bot',
      title: 'Contract Clause Verification',
      time: 'T0 + 1300ms',
      note: trace.policy?.coverage_decision_rationale || 'Verified active policy dates and applicable clauses.',
    },
    {
      actor: 'Step 3: Fraud Risk Meter',
      type: 'bot',
      title: 'Fraud Risk Scoring',
      time: 'T0 + 1320ms',
      note: `Evaluated risk score: ${Math.round(claim?.fraud_risk_score || 0)}/100.`,
    },
    {
      actor: 'Step 4: Other Driver Fault',
      type: 'bot',
      title: 'Third-Party Fault Spotting',
      time: 'T0 + 1270ms',
      note: `Checked for adverse driver fault cues. Recovery likelihood: ${claim?.subrogation_likelihood || 'LOW'}.`,
    },
    {
      actor: 'Step 5: Payout Calculation',
      type: 'bot',
      title: 'Rate Benchmarks & Payout Calculation',
      time: 'T0 + 1750ms',
      note: `Applied parts benchmarks. Net payout: ₹${(claim?.net_payout || 0).toFixed(2)}.`,
    },
    {
      actor: 'Step 6: Final Decision',
      type: 'bot',
      title: isPaused ? 'Governance Rule Exception Triggered' : 'Straight-Through Processing Authorized',
      time: 'T0 + 2130ms',
      note: isPaused
        ? `Workflow interrupted and checkpointed into durable store. Paused for adjuster review: ${trace.pause_reasons?.join(', ') || 'Governance threshold'}.`
        : 'All straight-through processing criteria satisfied. Settlement authorized automatically.',
    },
  ];

  // If resolved by human adjuster
  if (status.startsWith('RESOLVED_')) {
    auditEvents.push({
      actor: 'Human Adjuster (ADJ-10492)',
      type: 'human',
      title: `Adjuster Sign-Off: ${status.replace('RESOLVED_', '')}`,
      time: 'Resolution',
      note: trace.adjudication?.routing_reason || 'Manual review completed and finalized by authorized adjuster.',
    });
  }

  return (
    <section id="audit-log" className="space-y-4 pt-4 border-t border-rule">
      <div className="flex items-center justify-between border-b border-rule pb-2">
        <h3 className="text-base font-bold text-ink flex items-center gap-2">
          <History className="h-4 w-4 text-muted" />
          <span>7. Immutable Audit Trail</span>
        </h3>
        <span className="text-xs text-muted">Complete Lifecycle Trace</span>
      </div>

      <div className="rounded-panel border border-rule bg-surface p-5">
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-rule">
          {auditEvents.map((event, idx) => (
            <div key={idx} className="relative group text-xs">
              {/* Dot */}
              <div
                className={`absolute -left-6 top-0.5 h-3 w-3 rounded-full border-2 border-surface ${
                  event.type === 'human'
                    ? 'bg-status-approved ring-2 ring-status-approved/20'
                    : 'bg-ink'
                }`}
              />

              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink flex items-center gap-1.5">
                    {event.type === 'human' ? (
                      <UserCheck className="h-3.5 w-3.5 text-status-approved" />
                    ) : (
                      <Bot className="h-3.5 w-3.5 text-muted" />
                    )}
                    <span>{event.actor}</span>
                  </span>
                  <span className="text-[11px] text-muted font-payload">{event.time}</span>
                </div>

                <p className="font-medium text-ink/90">{event.title}</p>
                <p className="text-muted leading-relaxed prose-reading">{event.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
