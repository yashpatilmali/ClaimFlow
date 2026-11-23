import React, { useState } from 'react';
import { Scale, Copy, Check, Truck, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatCurrency } from '../../lib/format';
import { getSubrogationMeta } from '../../lib/status';

export interface SubrogationSectionProps {
  subroData: any;
}

export const SubrogationSection: React.FC<SubrogationSectionProps> = ({ subroData }) => {
  const [copied, setCopied] = useState(false);

  const likelihood = subroData?.subrogation_likelihood || 'LOW';
  const meta = getSubrogationMeta(likelihood);
  const brief = subroData?.subrogation_referral_brief || 'No subrogation referral recommended for this incident.';
  const partyData = subroData?.third_party_info || null;
  const estimatedRecovery = subroData?.estimated_recovery_amount || 0.0;

  const handleCopy = () => {
    navigator.clipboard.writeText(brief);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHigh = likelihood.toUpperCase() === 'HIGH';

  return (
    <section id="subrogation" className="space-y-4 pt-4 border-t border-rule">
      <div className="flex items-center justify-between border-b border-rule pb-2">
        <h3 className="text-base font-bold text-ink flex items-center gap-2">
          <Scale className="h-4 w-4 text-status-subro" />
          <span>4. Subrogation Recovery Spotter</span>
        </h3>
        <span className="text-xs text-muted">Third-Party Liability Cues</span>
      </div>

      <div className="rounded-panel border border-rule bg-surface p-5 space-y-4">
        {/* Recovery Likelihood Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rule pb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-1.5 rounded-panel ${
                isHigh ? 'bg-status-subro-bg text-status-subro' : 'bg-paper text-muted'
              }`}
            >
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-muted block">Recovery Opportunity</span>
              <span className="text-sm font-bold text-ink">
                {meta.label} ({likelihood})
              </span>
            </div>
          </div>

          {isHigh && (
            <div className="text-left sm:text-right text-xs">
              <span className="text-muted block">Estimated Recovery Potential</span>
              <span className="text-base font-extrabold text-status-subro tnum">
                {formatCurrency(estimatedRecovery)}
              </span>
            </div>
          )}
        </div>

        {/* Adverse Third-Party Details if identified */}
        {partyData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-input bg-paper border border-rule text-xs">
            <div>
              <span className="text-muted block">Adverse Entity:</span>
              <span className="font-semibold text-ink">{partyData.entity || partyData.party_name || '—'}</span>
            </div>
            <div>
              <span className="text-muted block">Adverse Carrier:</span>
              <span className="font-semibold text-ink">{partyData.carrier || partyData.insurance_carrier || '—'}</span>
            </div>
            <div>
              <span className="text-muted block">Driver / Operator:</span>
              <span className="font-semibold text-ink">{partyData.driver || partyData.driver_name || '—'}</span>
            </div>
            <div>
              <span className="text-muted block">Police Citation:</span>
              <span className="font-semibold text-status-denied">{partyData.citation || partyData.citation_issued || 'None'}</span>
            </div>
          </div>
        )}

        {/* Draft Referral Brief with Copy */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Preliminary Subrogation Referral Brief
            </span>
            <Button variant="ghost" size="sm" onClick={handleCopy} className="h-6 px-2 text-xs">
              {copied ? (
                <>
                  <Check className="h-3 w-3 mr-1 text-status-approved" />
                  <span className="text-status-approved">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  <span>Copy brief</span>
                </>
              )}
            </Button>
          </div>

          <div className="p-3 rounded-input bg-paper border border-rule text-xs font-document text-ink/90 italic leading-relaxed">
            "{brief}"
          </div>
        </div>
      </div>
    </section>
  );
};
