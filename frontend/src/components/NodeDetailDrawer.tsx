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
          title: 'Agent 1: Intake Agent (FNOL & IDP Reader)',
          description: 'Parses repair invoices & narratives with pre-execution PII redaction and self-check line-item math reconciliation.',
          data: agentOutputs['intake'] || { status: 'Awaiting execution' },
        };
      case 'policy_agent':
        return {
          title: 'Agent 2: Policy Coverage Validator (Parallel RAG)',
          description: 'Validates active coverage dates, searches policy clauses for exclusions (racing, rideshare), and returns verbatim citations.',
          data: agentOutputs['policy'] || { status: 'Awaiting execution' },
        };
      case 'fraud_agent':
        return {
          title: 'Agent 3: Fraud Agent (Hybrid ML + SQL Red-Flags)',
          description: 'Evaluates loss-to-binding proximity, narrative vs invoice discrepancy, and predicts a 0–100 risk score via Scikit-Learn/XGBoost.',
          data: agentOutputs['fraud'] || { status: 'Awaiting execution' },
        };
      case 'subrogation_agent':
        return {
          title: 'Agent 4: Subrogation Agent (Recovery Spotter)',
          description: 'Analyzes third-party liability cues (police citations, rear-end impacts) and drafts preliminary subrogation referral packets.',
          data: agentOutputs['subrogation'] || { status: 'Awaiting execution' },
        };
      case 'estimator_agent':
        return {
          title: 'Agent 5: Estimator Agent (Deterministic Payout Math)',
          description: 'Caps inflated part & labor rates against industry benchmarks and strictly executes pure Python math formula (zero LLM math).',
          data: agentOutputs['estimator'] || { status: 'Awaiting execution' },
        };
      case 'adjudicator_agent':
        return {
          title: 'Agent 6: Adjudicator Agent (Supervisor & HITL Router)',
          description: 'Applies STP threshold rules (<$2k, risk <30) or triggers LangGraph interrupt() to pause for adjuster sign-off in checkpointer.',
          data: agentOutputs['adjudication'] || { status: 'Awaiting execution' },
        };
      default:
        return {
          title: 'Agent Inspector',
          description: 'Select a node in the graph to view outputs.',
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
          <p className="text-xs text-slate-400 mt-1">{info.description}</p>
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
              <BookOpen className="w-4 h-4" /> Verbatim Policy Citations (RAG)
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
              <ShieldAlert className="w-4 h-4" /> Detected Risk Drivers & Rules
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
              <Calculator className="w-4 h-4" /> Pure Python Deterministic Math Audit
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
            Structured Pydantic Node Output
          </h4>
          <pre className="text-[11px] font-mono bg-slate-950 p-4 rounded-xl border border-slate-800 text-cyan-300 overflow-x-auto leading-relaxed">
            {JSON.stringify(info.data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
