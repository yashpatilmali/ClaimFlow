import React from 'react';
import { BookOpen, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { formatCurrency } from '../../lib/format';
import { Button } from '../../components/ui/button';

export interface PolicyCitation {
  section_ref: string;
  page_num: number;
  quote: string;
}

export interface CoverageSectionProps {
  policyData: any;
  citations: PolicyCitation[];
  policyNumber: string;
  lossDate: string;
}

export const CoverageSection: React.FC<CoverageSectionProps> = ({
  policyData,
  citations = [],
  policyNumber,
  lossDate,
}) => {
  const isCovered = policyData?.is_covered ?? true;
  const coverageType = policyData?.coverage_type || 'Collision';
  const deductible = policyData?.deductible ?? 500.0;
  const coverageLimit = policyData?.coverage_limit ?? 50000.0;

  const handleOpenPolicy = (pageNum: number = 1) => {
    window.open(`/sample_data/policies/standard_auto_policy.pdf#page=${pageNum}`, '_blank');
  };

  return (
    <section id="coverage" className="space-y-4 pt-4 border-t border-rule">
      <div className="flex items-center justify-between border-b border-rule pb-2">
        <h3 className="text-base font-bold text-ink flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-status-approved" />
          <span>2. Policy Coverage & Legal Citations (RAG)</span>
        </h3>
        <span className="text-xs text-muted">Contract Clause Analysis</span>
      </div>

      {/* Coverage Status Card */}
      <div className="rounded-panel border border-rule bg-surface p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rule pb-4">
          <div className="flex items-center gap-2.5">
            {isCovered ? (
              <div className="p-1.5 rounded-panel bg-status-approved-bg text-status-approved">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            ) : (
              <div className="p-1.5 rounded-panel bg-status-denied-bg text-status-denied">
                <XCircle className="h-5 w-5" />
              </div>
            )}
            <div>
              <span className="text-xs text-muted block">Coverage Determination</span>
              <span className="text-sm font-bold text-ink">
                {isCovered ? `${coverageType} Coverage Verified Active` : 'Loss Excluded Under Policy Terms'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-xs text-right">
            <div>
              <span className="text-muted block">Deductible</span>
              <span className="font-semibold text-ink tnum">{formatCurrency(deductible)}</span>
            </div>
            <div>
              <span className="text-muted block">Limit</span>
              <span className="font-semibold text-ink tnum">{formatCurrency(coverageLimit)}</span>
            </div>
            <div>
              <span className="text-muted block">Policy ID</span>
              <span className="font-semibold text-ink font-payload">{policyNumber}</span>
            </div>
          </div>
        </div>

        {/* Verbatim Policy Citations with Highlighter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Cited Contract Clauses
            </span>
            <span className="text-xs text-muted">Retrieval-Augmented Citations</span>
          </div>

          {citations.map((c, i) => (
            <div
              key={i}
              className="rounded-input border border-rule bg-paper/50 p-4 space-y-2 hover:border-field-border transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-status-approved" />
                  <span>{c.section_ref}</span>
                  <span className="text-muted font-normal">· Page {c.page_num}</span>
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenPolicy(c.page_num)}
                  className="h-6 px-2 text-xs text-muted hover:text-ink"
                >
                  <span>Open PDF at page {c.page_num}</span>
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>

              {/* The Highlighter: #FFE58A behind verbatim quote */}
              <div className="p-2.5 rounded-input bg-highlighter/30 border border-highlighter/60">
                <p className="font-document text-xs text-ink leading-relaxed italic">
                  "{c.quote}"
                </p>
              </div>
            </div>
          ))}

          {citations.length === 0 && (
            <p className="text-xs text-muted italic">No specific exclusion or clause citations identified.</p>
          )}
        </div>
      </div>
    </section>
  );
};
