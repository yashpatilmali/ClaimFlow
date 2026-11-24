import React from 'react';
import { FileText, CheckCircle2, AlertCircle, Wrench } from 'lucide-react';
import { formatCurrency } from '../../lib/format';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table';

export interface WhatHappenedSectionProps {
  intakeData: any;
  itemizedAudit: any[];
  redactedNarrative: string;
}

export const WhatHappenedSection: React.FC<WhatHappenedSectionProps> = ({
  intakeData,
  itemizedAudit = [],
  redactedNarrative,
}) => {
  const lineItems = itemizedAudit.length > 0 ? itemizedAudit : intakeData?.line_items || [];
  const mathValid = intakeData?.math_reconciliation_valid ?? true;

  return (
    <section id="what-happened" className="space-y-4 pt-2">
      <div className="flex items-center justify-between border-b border-rule pb-2">
        <h3 className="text-base font-bold text-ink flex items-center gap-2">
          <FileText className="h-4 w-4 text-status-processing" />
          <span>1. What Happened (FNOL & Invoice Intake)</span>
        </h3>
        <span className="text-xs text-muted">First Notice of Loss</span>
      </div>

      {/* Narrative & PII Redaction */}
      <div className="rounded-panel border border-rule bg-surface p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">
            Claimant Incident Narrative
          </span>
          <span className="text-[11px] font-medium text-status-approved bg-status-approved-bg px-2 py-0.5 rounded-tag border border-status-approved/20">
            PII Redaction Gate Active
          </span>
        </div>

        <p className="font-document text-sm text-ink/90 leading-relaxed italic bg-paper/60 p-3 rounded-input border border-rule/60">
          "{redactedNarrative || intakeData?.notes || 'No narrative statement provided.'}"
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div>
            <span className="text-muted block">Incident Date:</span>
            <span className="font-semibold text-ink tnum">{intakeData?.incident_date || '—'}</span>
          </div>
          <div>
            <span className="text-muted block">Loss Type:</span>
            <span className="font-semibold text-ink">{intakeData?.loss_type || 'Collision'}</span>
          </div>
          <div>
            <span className="text-muted block">Vehicle VIN:</span>
            <span className="font-semibold text-ink font-payload">{intakeData?.vehicle_vin || '—'}</span>
          </div>
          <div>
            <span className="text-muted block">Third Party Involved:</span>
            <span className="font-semibold text-ink">
              {intakeData?.third_party_involved ? 'Yes (Adverse Party)' : 'No (Single Vehicle)'}
            </span>
          </div>
        </div>
      </div>

      {/* Invoice Line-Item Benchmark Breakdown */}
      <div className="rounded-panel border border-rule bg-surface overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-rule bg-paper/50">
          <div>
            <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">
              Repair Invoice Line Items vs Industry Benchmark
            </h4>
            <p className="text-[11px] text-muted mt-0.5">
              Capped to standard repair benchmarks. Disallowed amounts are deducted prior to deductible.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {mathValid ? (
              <span className="inline-flex items-center gap-1 text-status-approved font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Line items reconciled</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-status-review font-medium">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Sum discrepancy reconciled</span>
              </span>
            )}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Line Item Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Claimed (₹)</TableHead>
              <TableHead className="text-right">Approved Amount</TableHead>
              <TableHead className="text-right">Deducted (₹)</TableHead>
              <TableHead>Audit Finding</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.map((item: any, idx: number) => {
              const claimed = item.claimed_cost || 0;
              const approved = item.approved_cost !== undefined ? item.approved_cost : claimed;
              const disallowed = item.disallowed_amount || (claimed - approved);
              const isAdjusted = disallowed > 0;

              return (
                <TableRow key={idx} className={isAdjusted ? 'bg-status-review-bg/20' : ''}>
                  <TableCell className="font-medium text-xs text-ink">
                    {item.description}
                  </TableCell>
                  <TableCell className="text-xs text-muted capitalize">
                    {item.category || 'parts'}
                  </TableCell>
                  <TableCell className="text-xs text-right font-medium text-ink tnum">
                    {formatCurrency(claimed)}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold text-status-approved tnum">
                    {formatCurrency(approved)}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold tnum">
                    {disallowed > 0 ? (
                      <span className="text-status-denied">-{formatCurrency(disallowed)}</span>
                    ) : (
                      <span className="text-muted">₹0.00</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted">
                    {item.audit_note || 'Accepted within standard repair benchmark'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};
