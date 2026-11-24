import React from 'react';
import { CheckCircle2, AlertCircle, XCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../lib/format';
import { getStatusMeta } from '../../lib/status';

export interface RulingBlockProps {
  status: string;
  netPayout: number;
  decisionRules?: {
    all_passed: boolean;
    summary_sentence: string;
    rules: Array<{
      name: string;
      threshold: string;
      actual_value: string;
      passed: boolean;
    }>;
  };
}

export const RulingBlock: React.FC<RulingBlockProps> = ({ status, netPayout, decisionRules }) => {
  const meta = getStatusMeta(status);

  // Status banner styling & thick rule color
  const statusColors = {
    approved: 'border-status-approved text-status-approved',
    review: 'border-status-review text-status-review',
    denied: 'border-status-denied text-status-denied',
    siu: 'border-status-siu text-status-siu',
    processing: 'border-status-processing text-status-processing',
  };

  const borderTopColor = {
    approved: 'bg-status-approved',
    review: 'bg-status-review',
    denied: 'bg-status-denied',
    siu: 'bg-status-siu',
    processing: 'bg-status-processing',
  };

  const IconComponent = () => {
    switch (meta.icon) {
      case 'check-circle':
        return <CheckCircle2 className="h-6 w-6 shrink-0" />;
      case 'alert-circle':
        return <AlertCircle className="h-6 w-6 shrink-0" />;
      case 'x-circle':
        return <XCircle className="h-6 w-6 shrink-0" />;
      case 'shield-alert':
        return <ShieldAlert className="h-6 w-6 shrink-0" />;
      default:
        return <CheckCircle2 className="h-6 w-6 shrink-0" />;
    }
  };

  return (
    <div className="relative rounded-panel border border-rule bg-surface overflow-hidden shadow-sm">
      {/* 4px thick top ruling line in status color */}
      <div className={`h-1.5 w-full ${borderTopColor[meta.category]}`} />

      <div className="p-6">
        {/* Ruling Status & Big Tabular Net Payout */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-rule pb-5">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-panel ${statusColors[meta.category]} bg-paper`}>
              <IconComponent />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted tracking-wider block uppercase">
                Claim Decision
              </span>
              <h2 className="text-2xl font-bold text-ink tracking-tight">{meta.label}</h2>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-muted block">Final Payout</span>
            <span className="text-2xl font-extrabold text-ink font-sans tnum">
              {formatCurrency(netPayout)}
            </span>
          </div>
        </div>

        {/* The "Why" Governance Rules Checklist */}
        {decisionRules?.rules && (
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                Automatic Rule Checks
              </span>
              <span className="text-xs text-muted">Pass / Review</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {decisionRules.rules.map((rule, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-input border ${
                    rule.passed
                      ? 'border-status-approved/30 bg-status-approved-bg/30 text-ink'
                      : 'border-status-review/30 bg-status-review-bg/30 text-ink'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">{rule.name}</span>
                    {rule.passed ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-status-approved" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 text-status-review" />
                    )}
                  </div>
                  <div className="text-[11px] text-muted space-y-0.5">
                    <div>
                      <span>Rule: </span>
                      <span className="font-medium">{rule.threshold}</span>
                    </div>
                    <div>
                      <span>Result: </span>
                      <span className="font-semibold text-ink font-payload">
                        {rule.actual_value}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Plain Sentence Summary */}
        {decisionRules?.summary_sentence && (
          <div className="mt-4 pt-3 border-t border-rule/60 text-xs text-ink/90 font-medium">
            <span>Summary: </span>
            <span className="text-muted">{decisionRules.summary_sentence}</span>
          </div>
        )}
      </div>
    </div>
  );
};
