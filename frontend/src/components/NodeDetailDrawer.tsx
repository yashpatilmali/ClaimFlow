import React from 'react';
import { X, Code2, ShieldAlert, BookOpen, Calculator, Send, CheckCircle2 } from 'lucide-react';

interface NodeDetailDrawerProps {
  selectedNodeId: string | null;
  agentOutputs: Record<string, any>;
  onClose: () => void;
}

export const NodeDetailDrawer: React.FC<NodeDetailDrawerProps> = ({
  selectedNodeId,
  agentOutputs,
  onClose
}) => {
  if (!selectedNodeId) return null;

  const getAgentData = () => {
    switch (selectedNodeId) {
      case 'intake_agent':
        return {
          title: '1. Intake Agent',
          description: 'Reads mechanic invoice and claimant narrative, masks sensitive private info (SSN, phone, email), and verifies invoice math.',
          data: agentOutputs['intake'] || { status: 'Awaiting execution' },
        };
      case 'policy_agent':
        return {
          title: '2. Policy Agent (RAG)',
          description: 'Checks policy terms to confirm if the damage is covered, verifies active dates, and cites exact policy sections.',
          data: agentOutputs['policy'] || { status: 'Awaiting execution' },
        };
      case 'fraud_agent':
        return {
          title: '3. Fraud Agent (ML)',
          description: 'Uses machine learning and business rules to evaluate suspicious factors (close bound date, mismatched parts) and computes a 0-100 score.',
          data: agentOutputs['fraud'] || { status: 'Awaiting execution' },
        };
      case 'subrogation_agent':
        return {
          title: '4. Subrogation Agent',
          description: 'Identifies if another driver or company caused the crash, and drafts a recovery letter to claim money back from their insurance.',
          data: agentOutputs['subrogation'] || { status: 'Awaiting execution' },
        };
      case 'estimator_agent':
        return {
          title: '5. Estimator Agent (Math)',
          description: 'Calculates the exact payout using strict Python math: Approved Total minus Deductible. The AI model never guesses numbers.',
          data: agentOutputs['estimator'] || { status: 'Awaiting execution' },
        };
      case 'adjudicator_agent':
        return {
          title: '6. Decision Agent',
          description: 'Determines whether to auto-approve straight through, or pause and send to a human adjuster for review.',
          data: agentOutputs['adjudication'] || { status: 'Awaiting execution' },
        };
      default:
        return {
          title: 'Agent Inspector',
          description: 'Select an agent box in the diagram to inspect its results.',
          data: {},
        };
    }
  };

  const info = getAgentData();

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-slate-950 border-l border-slate-800 shadow-2xl z-50 flex flex-col backdrop-blur-xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            {info.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{info.description}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Special Sections Based on Agent */}
        {selectedNodeId === 'policy_agent' && info.data.citations && (
          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Cited Policy Rules
            </h4>
            <div className="space-y-2">
              {info.data.citations.map((c: any, i: number) => (
                <div key={i} className="text-xs bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                  <div className="font-semibold text-slate-200 mb-1">{c.section_ref} (Page {c.page_num})</div>
                  <blockquote className="italic text-slate-400 border-l-2 border-emerald-500 pl-2">
                    "{c.quote}"
                  </blockquote>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedNodeId === 'fraud_agent' && info.data.risk_drivers && (
          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800">
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Detected Risk Factors
            </h4>
            <ul className="text-xs space-y-1.5 text-slate-300">
              {info.data.risk_drivers.map((d: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {selectedNodeId === 'estimator_agent' && info.data.formula_log && (
          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calculator className="w-4 h-4" /> Exact Deterministic Math Formula
            </h4>
            <p className="text-xs font-mono text-amber-300/90 bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              {info.data.formula_log}
            </p>
          </div>
        )}

        {selectedNodeId === 'adjudicator_agent' && info.data.guidewire_payload && (
          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Send className="w-4 h-4" /> Guidewire ClaimCenter Webhook Payload
            </h4>
            <pre className="text-[11px] font-mono text-purple-200/80 bg-slate-950 p-3 rounded-lg overflow-x-auto max-h-48 border border-slate-800/80">
              {JSON.stringify(info.data.guidewire_payload, null, 2)}
            </pre>
          </div>
        )}

        {/* Formatted JSON Output */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Detailed Data Inspector
          </h4>
          <pre className="text-[11px] font-mono bg-slate-950 p-4 rounded-xl border border-slate-800 text-cyan-300 overflow-x-auto leading-relaxed">
            {JSON.stringify(info.data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
