import React, { useState } from 'react';
import { Upload, Play, ShieldAlert, FileText, CheckCircle2, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { DemoScenario } from '../types/claim';

interface ClaimSubmitProps {
  scenarios: DemoScenario[];
  onExecuteScenario: (scenarioId: string) => Promise<void>;
  onSubmitCustomClaim: (narrative: string, policyNumber: string, boundDate: string, file: File | null) => Promise<void>;
  isLoading: boolean;
}

export const ClaimSubmitModal: React.FC<ClaimSubmitProps> = ({
  scenarios,
  onExecuteScenario,
  onSubmitCustomClaim,
  isLoading
}) => {
  const [narrative, setNarrative] = useState('');
  const [policyNumber, setPolicyNumber] = useState('POL-882910');
  const [boundDate, setBoundDate] = useState('2026-01-01');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!narrative.trim()) return;
    onSubmitCustomClaim(narrative, policyNumber, boundDate, selectedFile);
  };

  const getBadgeClass = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'amber':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'rose':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'indigo':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/60 to-slate-900 border border-slate-800 p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> ValueMomentum Enterprise P&C Orchestrator
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Autonomous Auto Claims Adjudication & Governance
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Submit a First Notice of Loss (FNOL) with a mechanic estimate or test one of the 4 ready-to-run demo scenarios below. 
            The 6-agent LangGraph pipeline validates coverage via Policy RAG, computes 0–100 hybrid ML fraud probability, 
            spots subrogation recovery targets, enforces pure deterministic payout math, and pauses in durable checkpointer state for Human-in-the-Loop approval.
          </p>
        </div>
      </div>

      {/* 4 One-Click Demo Scenarios */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-cyan-400" />
              1-Click Ready Demo Scenarios
            </h2>
            <p className="text-xs text-slate-400">Pre-seeded with real PDF policies, mechanic line items, and calibrated benchmarks.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarios.map((sc) => (
            <div
              key={sc.scenario_id}
              className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 hover:border-blue-500/50 transition-all shadow-lg flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getBadgeClass(sc.badge_color)}`}>
                    {sc.tag}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">${sc.claimed_amount.toLocaleString()}</span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {sc.name}
                </h3>
                <p className="mt-2 text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {sc.narrative}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <div><strong className="text-slate-300">Expected:</strong> {sc.expected_outcome}</div>
                  <div><strong className="text-slate-300">Policy:</strong> {sc.policy_number}</div>
                </div>
              </div>

              <button
                disabled={isLoading}
                onClick={() => onExecuteScenario(sc.scenario_id)}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
              >
                <span>Run Scenario</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Claim Submission Form */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
          <FileText className="w-5 h-5 text-blue-400" />
          Submit Custom FNOL Claim
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Input an incident narrative and upload a repair estimate. PII (SSN, phone, email, VIN) is masked locally before LLM processing.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Policy Number</label>
              <input
                type="text"
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                placeholder="POL-882910"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Policy Inception / Bound Date</label>
              <input
                type="date"
                value={boundDate}
                onChange={(e) => setBoundDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Claimant Incident Narrative
              </label>
              <span className="text-[11px] text-cyan-400 font-mono">
                🛡️ XML Prompt Injection Guard Enabled
              </span>
            </div>
            <textarea
              rows={4}
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              placeholder="Describe the vehicle collision or comprehensive incident details (e.g. location, impact mechanism, other vehicles, police citation)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Repair Facility Invoice PDF (Optional)
            </label>
            <div className="border border-dashed border-slate-700 bg-slate-950/60 rounded-xl p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept=".pdf,application/pdf"
                id="file-upload"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-7 h-7 text-slate-400 mb-2" />
                <span className="text-xs text-slate-300 font-medium">
                  {selectedFile ? selectedFile.name : "Click to upload mechanic estimate PDF"}
                </span>
                <span className="text-[11px] text-slate-500 mt-1">Accepts standard repair bills & estimate PDFs</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading || !narrative.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Orchestrating Agents...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Live Multi-Agent Adjudication</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
