import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Edit3,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import { formatCurrency } from '../../lib/format';
import { api } from '../../lib/api-client';
import { useToast } from '../../components/ui/toast';

export interface DecisionPanelProps {
  claimNumber: string;
  recommendedPayout: number;
  coverageLimit: number;
  pauseReasons: string[];
  onDecisionSubmitted: () => void;
}

export const DecisionPanel: React.FC<DecisionPanelProps> = ({
  claimNumber,
  recommendedPayout,
  coverageLimit,
  pauseReasons,
  onDecisionSubmitted,
}) => {
  const { showToast } = useToast();

  const [decision, setDecision] = useState<'APPROVE' | 'OVERRIDE_PAYOUT' | 'DENY' | 'REFER_SIU'>('APPROVE');
  const [overrideAmount, setOverrideAmount] = useState<number>(recommendedPayout);
  const [reasonCode, setReasonCode] = useState('POLICY_TERMS_CONFIRMED');
  const [auditNote, setAuditNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isOverride = decision === 'OVERRIDE_PAYOUT';
  const isDeny = decision === 'DENY';
  const isSiu = decision === 'REFER_SIU';

  const payoutDiff = overrideAmount - recommendedPayout;

  const handleActionSelect = (action: 'APPROVE' | 'OVERRIDE_PAYOUT' | 'DENY' | 'REFER_SIU') => {
    setDecision(action);
    if (action === 'APPROVE') {
      setReasonCode('TERMS_VERIFIED');
      setAuditNote('Reviewed mechanic invoice line items and policy coverage. Recommended settlement payout approved per policy terms.');
    } else if (action === 'DENY') {
      setReasonCode('POLICY_EXCLUSION_AFFIRMED');
      setAuditNote('Confirmed loss exclusion under Section 3 policy clauses. Coverage denial affirmed after independent adjuster review.');
    } else if (action === 'REFER_SIU') {
      setReasonCode('FRAUD_INDICATORS_SUBSTANTIATED');
      setAuditNote('Referred to Special Investigation Unit (SIU) due to elevated fraud risk indicators and discrepancy between narrative and repair invoice.');
    } else if (action === 'OVERRIDE_PAYOUT') {
      setReasonCode('BENCHMARK_REINSPECTION_ADJUSTED');
      setAuditNote('Adjusted settlement amount per senior adjuster physical re-inspection of damage.');
    }
  };

  const executeSubmission = async () => {
    if (auditNote.trim().length < 20) {
      showToast('Audit note must be at least 20 characters.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.submitHitlDecision(claimNumber, {
        decision,
        audit_note: auditNote.trim(),
        override_payout_amount: isOverride ? overrideAmount : undefined,
      });

      const actionWord =
        decision === 'APPROVE'
          ? `${formatCurrency(recommendedPayout)} payout approved`
          : decision === 'OVERRIDE_PAYOUT'
          ? `${formatCurrency(overrideAmount)} payout approved via override`
          : decision === 'DENY'
          ? 'Claim denied'
          : 'Claim referred to SIU';

      showToast(`Adjuster sign-off complete: ${actionWord}.`, 'success');
      setConfirmOpen(false);
      onDecisionSubmitted();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit adjuster decision', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmClick = () => {
    if (auditNote.trim().length < 20) {
      showToast('Audit note must be at least 20 characters before signing off.', 'error');
      return;
    }
    // High-consequence actions require confirmation modal
    if (isDeny || isSiu || (isOverride && Math.abs(payoutDiff) > 500)) {
      setConfirmOpen(true);
    } else {
      executeSubmission();
    }
  };

  return (
    <div className="rounded-panel border-2 border-status-review/40 bg-surface p-5 space-y-4 shadow-sm sticky top-20">
      {/* Panel Header */}
      <div className="border-b border-rule pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-status-review" />
          <h3 className="text-sm font-bold text-ink">Adjuster Governance Panel</h3>
        </div>
        <p className="text-xs text-muted mt-0.5">
          This claim is paused in durable checkpoint state awaiting human sign-off.
        </p>
      </div>

      {/* Why This Claim Was Paused */}
      {pauseReasons.length > 0 && (
        <div className="rounded-input bg-status-review-bg/50 border border-status-review/30 p-3 space-y-1">
          <span className="text-xs font-semibold text-status-review block">
            Governance Pause Triggers:
          </span>
          <ul className="text-xs text-ink/90 list-disc list-inside space-y-0.5">
            {pauseReasons.map((reason, idx) => (
              <li key={idx} className="leading-snug">{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-ink block">Adjuster Action</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleActionSelect('APPROVE')}
            className={`p-2.5 rounded-input text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
              decision === 'APPROVE'
                ? 'bg-status-approved text-surface border-status-approved shadow-sm'
                : 'bg-paper text-ink border-rule hover:bg-rule/40'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Approve {formatCurrency(recommendedPayout)}</span>
          </button>

          <button
            type="button"
            onClick={() => handleActionSelect('OVERRIDE_PAYOUT')}
            className={`p-2.5 rounded-input text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
              decision === 'OVERRIDE_PAYOUT'
                ? 'bg-ink text-surface border-ink shadow-sm'
                : 'bg-paper text-ink border-rule hover:bg-rule/40'
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Override payout</span>
          </button>

          <button
            type="button"
            onClick={() => handleActionSelect('DENY')}
            className={`p-2.5 rounded-input text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
              decision === 'DENY'
                ? 'bg-status-denied text-surface border-status-denied shadow-sm'
                : 'bg-paper text-ink border-rule hover:bg-rule/40'
            }`}
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>Deny claim</span>
          </button>

          <button
            type="button"
            onClick={() => handleActionSelect('REFER_SIU')}
            className={`p-2.5 rounded-input text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
              decision === 'REFER_SIU'
                ? 'bg-status-siu text-surface border-status-siu shadow-sm'
                : 'bg-paper text-ink border-rule hover:bg-rule/40'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Refer to SIU</span>
          </button>
        </div>
      </div>

      {/* Override Amount Field (If Override Selected) */}
      {isOverride && (
        <div className="p-3 rounded-input border border-field-border bg-paper/60 space-y-2">
          <Input
            label="Adjusted Net Settlement Amount ($)"
            type="number"
            min={0}
            max={coverageLimit}
            step="0.01"
            value={overrideAmount}
            onChange={(e) => setOverrideAmount(parseFloat(e.target.value) || 0)}
            helperText={`Original calculation: ${formatCurrency(recommendedPayout)}`}
            className="tnum"
          />
          <div className="flex justify-between text-xs pt-1">
            <span className="text-muted">Difference from recommendation:</span>
            <span
              className={`font-semibold tnum ${
                payoutDiff > 0
                  ? 'text-status-approved'
                  : payoutDiff < 0
                  ? 'text-status-denied'
                  : 'text-muted'
              }`}
            >
              {payoutDiff >= 0 ? `+${formatCurrency(payoutDiff)}` : `-${formatCurrency(Math.abs(payoutDiff))}`}
            </span>
          </div>
        </div>
      )}

      {/* Reason Code */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-ink block">Determination Reason Code</label>
        <select
          value={reasonCode}
          onChange={(e) => setReasonCode(e.target.value)}
          className="h-9 w-full rounded-input border border-field-border bg-surface px-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-status-processing"
        >
          {decision === 'APPROVE' && (
            <>
              <option value="TERMS_VERIFIED">Coverage terms & estimate verified</option>
              <option value="SUPERVISOR_AUTHORIZED">Supervisor discretionary approval</option>
            </>
          )}
          {decision === 'OVERRIDE_PAYOUT' && (
            <>
              <option value="BENCHMARK_REINSPECTION_ADJUSTED">Physical re-inspection adjustment</option>
              <option value="OEM_PARTS_APPROVED">OEM parts authorization</option>
            </>
          )}
          {decision === 'DENY' && (
            <>
              <option value="POLICY_EXCLUSION_AFFIRMED">Policy exclusion affirmed</option>
              <option value="INACTIVE_COVERAGE_DATE">Date outside active term</option>
            </>
          )}
          {decision === 'REFER_SIU' && (
            <>
              <option value="FRAUD_INDICATORS_SUBSTANTIATED">Elevated fraud score substantiated</option>
              <option value="PARTS_MISMATCH_SUSPICION">Heavy repair mismatch investigation</option>
            </>
          )}
        </select>
      </div>

      {/* Mandatory Audit Note */}
      <Textarea
        label="Adjudication Audit Justification (Mandatory)"
        value={auditNote}
        onChange={(e) => setAuditNote(e.target.value)}
        rows={3}
        maxLength={500}
        showCount
        placeholder="Enter mandatory factual rationale for audit record (minimum 20 characters)…"
      />

      {/* Action Submit Button */}
      <Button
        variant={isDeny ? 'danger' : 'primary'}
        size="md"
        className="w-full text-xs font-semibold"
        disabled={isSubmitting || auditNote.trim().length < 20}
        onClick={handleConfirmClick}
      >
        <span>
          {isSubmitting
            ? 'Resuming workflow…'
            : decision === 'APPROVE'
            ? `Authorize ${formatCurrency(recommendedPayout)} settlement`
            : decision === 'OVERRIDE_PAYOUT'
            ? `Authorize ${formatCurrency(overrideAmount)} override`
            : decision === 'DENY'
            ? 'Confirm denial determination'
            : 'Authorize referral to SIU'}
        </span>
      </Button>

      {/* High-Consequence Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-status-review" />
              <span>Confirm Adjuster Ruling</span>
            </DialogTitle>
            <DialogDescription>
              {isDeny
                ? `You are confirming a formal coverage denial for claim ${claimNumber}. A denial notice citing policy exclusions will be issued.`
                : isSiu
                ? `You are transferring claim ${claimNumber} to the Special Investigation Unit (SIU). Electronic payout will be frozen pending fraud examination.`
                : `You are overriding the automated payout recommendation by ${formatCurrency(Math.abs(payoutDiff))}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 rounded-input bg-paper border border-rule text-xs space-y-1 my-2">
            <div>
              <span className="text-muted">Claim Number: </span>
              <span className="font-semibold text-ink font-payload">{claimNumber}</span>
            </div>
            <div>
              <span className="text-muted">Recorded Rationale: </span>
              <p className="font-document text-ink italic mt-1 leading-snug">"{auditNote}"</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={isDeny ? 'danger' : 'primary'}
              size="sm"
              disabled={isSubmitting}
              onClick={executeSubmission}
            >
              <span>{isSubmitting ? 'Finalizing…' : 'Confirm & resume'}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
