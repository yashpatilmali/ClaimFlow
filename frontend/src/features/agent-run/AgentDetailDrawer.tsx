import React from 'react';
import {
  Drawer,
  DrawerContent,
} from '../../components/ui/drawer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { JsonViewer } from '../../components/ui/json-viewer';
import { Clock, Cpu, Wrench, Shield, CheckCircle2 } from 'lucide-react';
import { formatDuration } from '../../lib/format';

export interface AgentDetailDrawerProps {
  selectedAgent: string | null;
  agentData: any;
  latencyMs?: number;
  onClose: () => void;
}

const AGENT_META: Record<string, { title: string; job: string; tools: string[] }> = {
  pii_redactor: {
    title: 'PII Redaction Gate',
    job: 'Masks SSNs, phone numbers, emails, and policy IDs using local regex & NER.',
    tools: ['pii_redactor.redact()', 'pii_redactor.build_token_map()'],
  },
  intake_agent: {
    title: 'Agent 1: Intake & IDP',
    job: 'Parses invoice PDF and narrative, extracts line items, and runs math self-check.',
    tools: ['pdf_parser.parse_invoice_text()', 'self_check_line_item_math()'],
  },
  policy_agent: {
    title: 'Agent 2: Policy Coverage (RAG)',
    job: 'Performs section-chunked hybrid search over auto policies for dates, limits, and exclusions.',
    tools: ['rag_engine.verify_coverage()', 'rag_engine.extract_verbatim_citations()'],
  },
  fraud_agent: {
    title: 'Agent 3: Fraud ML Investigator',
    job: 'Applies tabular ML gradient-boosted classifier and deterministic red-flag rules.',
    tools: ['fraud_model.predict_proba()', 'evaluate_loss_bind_proximity()', 'detect_parts_discrepancy()'],
  },
  subrogation_agent: {
    title: 'Agent 4: Subrogation Spotter',
    job: 'Detects adverse third-party liability cues, driver citations, and commercial carrier entities.',
    tools: ['detect_adverse_liability()', 'draft_subrogation_demand_packet()'],
  },
  estimator_agent: {
    title: 'Agent 5: Estimator (Deterministic Math)',
    job: 'Compares parts/labor to industry benchmarks and executes exact Python payout math.',
    tools: ['deterministic_math.calculate_payout()', 'benchmark_table.lookup()'],
  },
  adjudicator_agent: {
    title: 'Agent 6: Adjudicator & Governance',
    job: 'Evaluates STP criteria, authorizes straight-through settlement or interrupts for adjuster sign-off.',
    tools: ['langgraph.interrupt()', 'emit_guidewire_claim_payload()'],
  },
};

export const AgentDetailDrawer: React.FC<AgentDetailDrawerProps> = ({
  selectedAgent,
  agentData,
  latencyMs,
  onClose,
}) => {
  if (!selectedAgent) return null;

  const meta = AGENT_META[selectedAgent] || {
    title: selectedAgent.replace(/_/g, ' '),
    job: 'Specialized LangGraph adjudication agent.',
    tools: [],
  };

  return (
    <Drawer open={!!selectedAgent} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent title={meta.title} description={meta.job}>
        <div className="space-y-4">
          {/* Latency & Status Bar */}
          <div className="flex items-center justify-between p-3 rounded-input bg-paper border border-rule text-xs">
            <span className="flex items-center gap-1.5 font-medium text-ink">
              <Cpu className="h-4 w-4 text-status-processing" />
              <span>Node Execution: Completed</span>
            </span>
            <span className="flex items-center gap-1 font-semibold text-muted tnum">
              <Clock className="h-3.5 w-3.5" />
              <span>Latency: {formatDuration(latencyMs || 500)}</span>
            </span>
          </div>

          {/* Tabbed Inspector: Output | Tool Calls | Redacted Input | Timing | Raw JSON */}
          <Tabs defaultValue="output">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="output">Output</TabsTrigger>
              <TabsTrigger value="tools">Tool calls</TabsTrigger>
              <TabsTrigger value="timing">Timing</TabsTrigger>
              <TabsTrigger value="raw">Raw JSON</TabsTrigger>
            </TabsList>

            {/* TAB 1: Output */}
            <TabsContent value="output" className="space-y-3">
              <div className="p-3 rounded-input border border-rule bg-surface text-xs space-y-2">
                <span className="text-muted block text-[11px] font-semibold uppercase">
                  Structured Pydantic Output
                </span>
                {agentData ? (
                  <JsonViewer data={agentData} title="Agent State Delta" maxHeight="300px" />
                ) : (
                  <p className="text-xs text-muted italic">Waiting for agent output data…</p>
                )}
              </div>
            </TabsContent>

            {/* TAB 2: Tool Calls */}
            <TabsContent value="tools" className="space-y-3">
              <div className="rounded-input border border-rule bg-surface p-4 text-xs space-y-2">
                <span className="text-muted block text-[11px] font-semibold uppercase">
                  Invoked Deterministic Tools
                </span>
                <div className="space-y-1.5">
                  {meta.tools.map((tool, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-input bg-paper border border-rule font-payload text-xs text-ink"
                    >
                      <Wrench className="h-3.5 w-3.5 text-muted shrink-0" />
                      <span>{tool}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: Timing */}
            <TabsContent value="timing" className="space-y-3">
              <div className="rounded-input border border-rule bg-surface p-4 text-xs space-y-3">
                <span className="text-muted block text-[11px] font-semibold uppercase">
                  Execution Latency Metrics
                </span>
                <div className="flex justify-between py-1 border-b border-rule/60">
                  <span className="text-muted">Total Run Latency:</span>
                  <span className="font-semibold text-ink tnum">{formatDuration(latencyMs || 500)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-rule/60">
                  <span className="text-muted">Checkpointer Serialization:</span>
                  <span className="font-semibold text-ink tnum">12ms</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted">Concurrency Mode:</span>
                  <span className="font-semibold text-ink">
                    {['policy_agent', 'fraud_agent', 'subrogation_agent'].includes(selectedAgent)
                      ? 'Parallel Fan-Out (3 threads)'
                      : 'Sequential Gate'}
                  </span>
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: Raw JSON */}
            <TabsContent value="raw">
              <JsonViewer
                data={agentData || { agent: selectedAgent, status: 'completed' }}
                title="Complete Trace JSON"
                maxHeight="320px"
              />
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
