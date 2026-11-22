import React, { useState } from 'react';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Send, 
  ShieldAlert, 
  RefreshCcw, 
  BookOpen, 
  DollarSign, 
  Edit3,
  Sparkles
} from 'lucide-react';
import { HITLQueueItem } from '../types/claim';

interface HITLQueueTableProps {
  queue: HITLQueueItem[];
  onSubmitDecision: (
    claimNumber: string,
    decision: string,
    auditNote: string,
    overrideAmount?: number
  ) => Promise<void>;
  isLoading: boolean;
}

export const HITLQueueTable: React.FC<HITLQueueTableProps> = ({
  queue,
  onSubmitDecision,
  isLoading
}) => {
  const [selectedClaim, setSelectedClaim] = useState<HITLQueueItem | null>(null);
  const [decision, setDecision] = useState<'APPROVE' | 'OVERRIDE_PAYOUT' | 'DENY' | 'REFER_SIU'>('APPROVE');
  const [auditNote, setAuditNote] = useState('');
  const [overrideAmount, setOverrideAmount] = useState<number | ''>('');

  const handleOpenModal = (claim: HITLQueueItem) => {
    setSelectedClaim(claim);
    // Suggest intelligent default decision based on pause reason
    if (claim.pause_reasons?.some(r => r.toLowerCase().includes('exclusion') || r.toLowerCase().includes('racing'))) {
      setDecision('DENY');
      setAuditNote('Confirmed policy exclusion under Section 3.B. Denial affirmed.');
    } else if (claim.fraud_risk_score >= 60) {
      setDecision('REFER_SIU');
      setAuditNote('Referred to Special Investigation Unit (SIU) due to high fraud probability and narrative mismatch.');
    } else {
      setDecision('APPROVE');
      setAuditNote('Reviewed claim details and approved settlement payout per policy terms.');
    }
    setOverrideAmount(claim.calculated_net_payout);
  };

  const handleApplyPresetNote = (type: string) => {
    switch (type) {
      case 'APPROVE':
        setAuditNote('Reviewed mechanic estimate and coverage terms. Approved settlement payout.');
        break;
      case 'DENY':
        setAuditNote('Confirmed policy exclusion under Section 3.B. Denial affirmed.');
        break;
      case 'REFER_SIU':
        setAuditNote('Referred to SIU due to high fraud probability score and line-item mismatch.');
        break;
      case 'OVERRIDE_PAYOUT':
        setAuditNote('Adjusted payout amount per senior adjuster damage inspection.');
        break;
    }
  };

  const handleConfirmDecision = async () => {
    if (!selectedClaim || !auditNote.trim()) return;
    await onSubmitDecision(
      selectedClaim.claim_number,
      decision,
      auditNote,
      decision === 'OVERRIDE_PAYOUT' && overrideAmount !== '' ? Number(overrideAmount) : undefined
    );
    setSelectedClaim(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            Human Review Queue (Adjuster Governance)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review claims paused by governance rules: policy exclusions, fraud score ≥ 30, payouts ≥ $2,000, or commercial subrogation.
          </p>
        </div>
        <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-lg self-start sm:self-auto">
          {queue.length} Claims Awaiting Action
        </div>
      </div>

      {/* Queue Table */}
      {queue.length === 0 ? (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">All Caught Up!</h3>
          <p className="text-xs text-slate-400 mt-1">
            No claims currently pending manual adjuster review. Claims eligible for STP were auto-adjudicated.
          </p>
          <p className="text-[11px] text-slate-500 mt-2">
            To test this queue, run <strong>Scenario 2 (Street Racing)</strong> or <strong>Scenario 3 (Inflated Claim)</strong> from the Test Lab tab!
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-x-auto shadow-xl">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Claim #</th>
                <th className="p-4">Policy</th>
                <th className="p-4">Incident Date</th>
                <th className="p-4">Claimed / Net</th>
                <th className="p-4">Fraud Score</th>
                <th className="p-4">Subrogation</th>
                <th className="p-4">Reason for Review</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {queue.map((item) => (
                <tr key={item.claim_number} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-mono font-bold text-cyan-400">{item.claim_number}</td>
                  <td className="p-4 font-mono text-slate-300">{item.policy_number}</td>
                  <td className="p-4 text-slate-300">{item.incident_date}</td>
                  <td className="p-4 font-mono">
                    <div className="text-slate-400 line-through">${item.claimed_amount?.toLocaleString()}</div>
                    <div className="text-emerald-400 font-bold">${item.calculated_net_payout?.toLocaleString()}</div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        item.fraud_risk_score >= 60
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : item.fraud_risk_score >= 30
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {item.fraud_risk_score}/100
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                        item.subrogation_likelihood === 'HIGH'
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.subrogation_likelihood}
                    </span>
                  </td>
                  <td className="p-4 max-w-xs truncate text-amber-300/90 text-[11px]" title={item.pause_reasons?.join(' | ')}>
                    {item.pause_reasons?.[0] || 'Manual governance rule triggered'}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs transition-colors shadow-md shadow-blue-600/20"
                    >
                      Review Claim
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Adjuster Decision Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-lg">Adjuster Governance Review</span>
                  <span className="font-mono text-xs text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                    {selectedClaim.claim_number}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Policy: {selectedClaim.policy_number} &nbsp;|&nbsp; Loss Date: {selectedClaim.incident_date}
                </p>
              </div>
              <button
                onClick={() => setSelectedClaim(null)}
                className="text-slate-400 hover:text-white transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              {/* Financial Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Claimed Total</span>
                  <div className="font-bold text-slate-200 mt-0.5">${selectedClaim.claimed_amount?.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Disallowed</span>
                  <div className="font-bold text-rose-400 mt-0.5">-${selectedClaim.disallowed_amount?.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Deductible</span>
                  <div className="font-bold text-slate-400 mt-0.5">-${selectedClaim.deductible?.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Net Payout</span>
                  <div className="font-bold text-emerald-400 mt-0.5 text-sm">${selectedClaim.calculated_net_payout?.toLocaleString()}</div>
                </div>
              </div>

              {/* Pause Reasons */}
              <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-3">
                <h4 className="font-bold text-amber-400 text-xs flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle className="w-4 h-4" /> Why this claim paused for human review:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {selectedClaim.pause_reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* Citations Preview if any */}
              {selectedClaim.citations && selectedClaim.citations.length > 0 && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <h4 className="font-bold text-emerald-400 text-xs flex items-center gap-1.5 mb-1.5">
                    <BookOpen className="w-4 h-4" /> Cited Policy Clauses
                  </h4>
                  {selectedClaim.citations.map((c, i) => (
                    <div key={i} className="text-slate-300 italic border-l-2 border-emerald-500 pl-2">
                      <strong className="not-italic text-slate-200">{c.section_ref}:</strong> "{c.quote}"
                    </div>
                  ))}
                </div>
              )}

              {/* Action Selector */}
              <div>
                <label className="block font-semibold text-slate-200 mb-2">Adjuster Action</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDecision('APPROVE');
                      handleApplyPresetNote('APPROVE');
                    }}
                    className={`py-2 px-3 rounded-lg font-semibold text-center transition-all ${
                      decision === 'APPROVE'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    APPROVE (${selectedClaim.calculated_net_payout?.toLocaleString()})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDecision('OVERRIDE_PAYOUT');
                      handleApplyPresetNote('OVERRIDE_PAYOUT');
                    }}
                    className={`py-2 px-3 rounded-lg font-semibold text-center transition-all ${
                      decision === 'OVERRIDE_PAYOUT'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    OVERRIDE PAYOUT
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDecision('DENY');
                      handleApplyPresetNote('DENY');
                    }}
                    className={`py-2 px-3 rounded-lg font-semibold text-center transition-all ${
                      decision === 'DENY'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    CONFIRM DENIAL
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDecision('REFER_SIU');
                      handleApplyPresetNote('REFER_SIU');
                    }}
                    className={`py-2 px-3 rounded-lg font-semibold text-center transition-all ${
                      decision === 'REFER_SIU'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    REFER TO SIU
                  </button>
                </div>
              </div>

              {/* Override Amount Input */}
              {decision === 'OVERRIDE_PAYOUT' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Override Settlement Payout ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={overrideAmount}
                    onChange={(e) => setOverrideAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="Enter revised dollar amount"
                  />
                </div>
              )}

              {/* Mandatory Audit Note */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-200">
                    Adjuster Justification Note (Required)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetNote(decision)}
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-fill Sample Note
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={auditNote}
                  onChange={(e) => setAuditNote(e.target.value)}
                  placeholder="Record formal adjudication rationale..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedClaim(null)}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoading || !auditNote.trim()}
                onClick={handleConfirmDecision}
                className="px-6 py-2 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-all disabled:opacity-50"
              >
                {isLoading ? "Resuming Graph..." : "Sign-Off & Resume Workflow"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
