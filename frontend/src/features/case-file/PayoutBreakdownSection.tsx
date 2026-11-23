import React from 'react';
import { Calculator, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { formatCurrency } from '../../lib/format';

export interface PayoutBreakdownSectionProps {
  claimedAmount: number;
  approvedAmount: number;
  disallowedAmount: number;
  deductible: number;
  coverageLimit: number;
  netPayout: number;
  formulaLog?: string;
}

export const PayoutBreakdownSection: React.FC<PayoutBreakdownSectionProps> = ({
  claimedAmount,
  approvedAmount,
  disallowedAmount,
  deductible,
  coverageLimit,
  netPayout,
  formulaLog,
}) => {
  const cappedApproved = Math.min(approvedAmount, coverageLimit);
  const isCapped = approvedAmount > coverageLimit;

  return (
    <section id="payout-math" className="space-y-4 pt-4 border-t border-rule">
      <div className="flex items-center justify-between border-b border-rule pb-2">
        <h3 className="text-base font-bold text-ink flex items-center gap-2">
          <Calculator className="h-4 w-4 text-status-approved" />
          <span>5. Damage & Deterministic Payout Math</span>
        </h3>
        <span className="text-xs text-muted">Audited Math Engine</span>
      </div>

      <div className="rounded-panel border border-rule bg-surface p-5 space-y-5">
        {/* Step-by-Step Waterfall Calculation */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          {/* Step 1: Claimed */}
          <div className="p-3 rounded-input bg-paper border border-rule space-y-1">
            <span className="text-muted block text-[11px]">1. Total Claimed</span>
            <span className="text-base font-bold text-ink tnum block">
              {formatCurrency(claimedAmount)}
            </span>
            <span className="text-[11px] text-muted">Repair shop invoice</span>
          </div>

          {/* Step 2: Benchmark Disallowance */}
          <div className="p-3 rounded-input bg-paper border border-rule space-y-1">
            <span className="text-muted block text-[11px]">2. Disallowances</span>
            <span
              className={`text-base font-bold tnum block ${
                disallowedAmount > 0 ? 'text-status-denied' : 'text-muted'
              }`}
            >
              {disallowedAmount > 0 ? `-${formatCurrency(disallowedAmount)}` : '$0.00'}
            </span>
            <span className="text-[11px] text-muted">Benchmark caps</span>
          </div>

          {/* Step 3: Approved After Benchmark */}
          <div className="p-3 rounded-input bg-paper border border-rule space-y-1">
            <span className="text-muted block text-[11px]">3. Approved Cost</span>
            <span className="text-base font-bold text-ink tnum block">
              {formatCurrency(approvedAmount)}
            </span>
            <span className="text-[11px] text-muted">
              {isCapped ? `Capped at limit (${formatCurrency(coverageLimit)})` : 'Under policy limit'}
            </span>
          </div>

          {/* Step 4: Deductible Subtracted */}
          <div className="p-3 rounded-input bg-paper border border-rule space-y-1">
            <span className="text-muted block text-[11px]">4. Policy Deductible</span>
            <span className="text-base font-bold text-status-denied tnum block">
              -{formatCurrency(deductible)}
            </span>
            <span className="text-[11px] text-muted">Insured responsibility</span>
          </div>

          {/* Step 5: Net Payout */}
          <div className="p-3 rounded-input bg-status-approved-bg/40 border border-status-approved/30 space-y-1">
            <span className="text-status-approved font-semibold block text-[11px]">5. Net Settlement</span>
            <span className="text-lg font-extrabold text-ink tnum block">
              {formatCurrency(netPayout)}
            </span>
            <span className="text-[11px] text-status-approved font-medium">Payable to insured</span>
          </div>
        </div>

        {/* Deterministic Formula Log */}
        <div className="p-3 rounded-input bg-paper border border-rule text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-muted">
            <ShieldCheck className="h-4 w-4 text-status-approved" />
            <span className="font-semibold text-ink">Deterministic Mathematical Proof:</span>
          </div>
          <p className="font-payload text-xs text-ink/90 bg-surface p-2 rounded-input border border-rule/60 select-all">
            {formulaLog ||
              `max(0, min(${approvedAmount.toFixed(2)}, ${coverageLimit.toFixed(2)}) - ${deductible.toFixed(2)}) = $${netPayout.toFixed(2)}`}
          </p>
          <p className="text-[11px] text-muted italic">
            Note: All settlement arithmetic is computed deterministically in Python using IEEE 754-safe math. The LLM is strictly isolated from calculating financial figures.
          </p>
        </div>
      </div>
    </section>
  );
};
