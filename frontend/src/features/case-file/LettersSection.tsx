import React, { useState } from 'react';
import { Mail, Download, Code, Send } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { JsonViewer } from '../../components/ui/json-viewer';

export interface LettersSectionProps {
  claimNumber: string;
  settlementLetter: string;
  guidewirePayload: any;
  status: string;
}

export const LettersSection: React.FC<LettersSectionProps> = ({
  claimNumber,
  settlementLetter,
  guidewirePayload,
  status,
}) => {
  const [showPayload, setShowPayload] = useState(false);

  const handleDownloadLetter = () => {
    const blob = new Blob([settlementLetter], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${claimNumber}_determination_letter.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="letters" className="space-y-4 pt-4 border-t border-rule">
      <div className="flex items-center justify-between border-b border-rule pb-2">
        <h3 className="text-base font-bold text-ink flex items-center gap-2">
          <Mail className="h-4 w-4 text-status-processing" />
          <span>6. Correspondence & Core Handoff</span>
        </h3>
        <span className="text-xs text-muted">Customer Notice & Guidewire Event</span>
      </div>

      <div className="rounded-panel border border-rule bg-surface p-5 space-y-5">
        {/* Settlement / Determination Letter Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              {status.includes('DENY') ? 'Coverage Denial Notice' : 'Claim Settlement Determination Notice'}
            </span>
            <Button variant="outline" size="sm" onClick={handleDownloadLetter} className="h-6 px-2 text-xs">
              <Download className="h-3 w-3 mr-1" />
              <span>Download text</span>
            </Button>
          </div>

          <div className="p-5 rounded-input bg-paper border border-rule text-xs font-document text-ink leading-relaxed whitespace-pre-wrap select-all">
            {settlementLetter ||
              'Claim determination notice generated upon settlement authorization or adjuster resolution.'}
          </div>
        </div>

        {/* Simulated Guidewire ClaimCenter Webhook Payload */}
        <div className="space-y-2 pt-2 border-t border-rule/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                Simulated Core Handoff Payload
              </span>
              <span className="text-[10px] bg-paper border border-rule text-muted px-1.5 py-0.2 rounded-tag font-medium">
                Simulated Webhook
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPayload(!showPayload)}
              className="h-6 px-2 text-xs text-muted hover:text-ink"
            >
              <Code className="h-3 w-3 mr-1" />
              <span>{showPayload ? 'Hide JSON' : 'View Guidewire ClaimCenter payload'}</span>
            </Button>
          </div>

          {showPayload && (
            <JsonViewer
              data={guidewirePayload || { message: 'Guidewire event queued' }}
              title="Guidewire ClaimCenter REST Payload (Simulated)"
              maxHeight="240px"
            />
          )}
        </div>
      </div>
    </section>
  );
};
