import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ClaimSubmitModal } from './components/ClaimSubmitModal';
import { AgentFlowGraph } from './components/AgentFlowGraph';
import { NodeDetailDrawer } from './components/NodeDetailDrawer';
import { HITLQueueTable } from './components/HITLQueueTable';
import { KPIDashboard } from './components/KPIDashboard';
import { DemoScenario, HITLQueueItem } from './types/claim';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'submit' | 'graph' | 'hitl' | 'kpis'>('submit');
  const [scenarios, setScenarios] = useState<DemoScenario[]>([]);
  const [hitlQueue, setHitlQueue] = useState<HITLQueueItem[]>([]);
  const [kpiData, setKpiData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Agent Orchestrator State
  const [currentClaimNumber, setCurrentClaimNumber] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<Record<string, 'idle' | 'running' | 'completed' | 'paused' | 'error'>>({
    intake_agent: 'idle',
    policy_agent: 'idle',
    fraud_agent: 'idle',
    subrogation_agent: 'idle',
    estimator_agent: 'idle',
    adjudicator_agent: 'idle',
  });
  const [agentOutputs, setAgentOutputs] = useState<Record<string, any>>({});
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    fetchScenarios();
    fetchHITLQueue();
    fetchKPIs();
  }, []);

  const fetchScenarios = async () => {
    try {
      const res = await fetch('/api/scenarios');
      if (res.ok) {
        const data = await res.json();
        setScenarios(data);
      }
    } catch (e) {
      console.error('Error fetching scenarios:', e);
    }
  };

  const fetchHITLQueue = async () => {
    try {
      const res = await fetch('/api/hitl/queue');
      if (res.ok) {
        const data = await res.json();
        setHitlQueue(data);
      }
    } catch (e) {
      console.error('Error fetching HITL queue:', e);
    }
  };

  const fetchKPIs = async () => {
    try {
      const res = await fetch('/api/dashboard/kpis');
      if (res.ok) {
        const data = await res.json();
        setKpiData(data);
      }
    } catch (e) {
      console.error('Error fetching KPIs:', e);
    }
  };

  const resetAgentStatuses = () => {
    setAgentStatus({
      intake_agent: 'running',
      policy_agent: 'idle',
      fraud_agent: 'idle',
      subrogation_agent: 'idle',
      estimator_agent: 'idle',
      adjudicator_agent: 'idle',
    });
    setAgentOutputs({});
  };

  // 1-Click Scenario Execution with Live Streaming
  const handleExecuteScenario = async (scenarioId: string) => {
    setIsLoading(true);
    resetAgentStatuses();
    setActiveTab('graph');

    try {
      const res = await fetch(`/api/scenarios/${scenarioId}/execute`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to execute scenario');
      const data = await res.json();

      setCurrentClaimNumber(data.claim_number);

      // Simulate live visual sequencing matching backend state
      setTimeout(() => {
        setAgentStatus(prev => ({
          ...prev,
          intake_agent: 'completed',
          policy_agent: 'running',
          fraud_agent: 'running',
          subrogation_agent: 'running',
        }));
        setAgentOutputs(prev => ({ ...prev, intake: data.agent_outputs.intake }));
      }, 700);

      setTimeout(() => {
        setAgentStatus(prev => ({
          ...prev,
          policy_agent: 'completed',
          fraud_agent: 'completed',
          subrogation_agent: 'completed',
          estimator_agent: 'running',
        }));
        setAgentOutputs(prev => ({
          ...prev,
          policy: data.agent_outputs.policy,
          fraud: data.agent_outputs.fraud,
          subrogation: data.agent_outputs.subrogation,
        }));
      }, 1500);

      setTimeout(() => {
        setAgentStatus(prev => ({
          ...prev,
          estimator_agent: 'completed',
          adjudicator_agent: 'running',
        }));
        setAgentOutputs(prev => ({
          ...prev,
          estimator: data.agent_outputs.estimator,
        }));
      }, 2300);

      setTimeout(() => {
        const finalStatus = data.is_paused ? 'paused' : 'completed';
        setAgentStatus(prev => ({
          ...prev,
          adjudicator_agent: finalStatus,
        }));
        setAgentOutputs(prev => ({
          ...prev,
          adjudication: data.agent_outputs.adjudication,
        }));
        setIsLoading(false);
        fetchHITLQueue();
        fetchKPIs();
      }, 3100);

    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  // Custom Claim Submission
  const handleSubmitCustomClaim = async (
    narrative: string,
    policyNumber: string,
    boundDate: string,
    file: File | null
  ) => {
    setIsLoading(true);
    resetAgentStatuses();
    setActiveTab('graph');

    try {
      const formData = new FormData();
      formData.append('narrative', narrative);
      formData.append('policy_number', policyNumber);
      formData.append('policy_bound_date', boundDate);
      if (file) {
        formData.append('invoice_file', file);
      }

      const submitRes = await fetch('/api/claims/submit', {
        method: 'POST',
        body: formData,
      });
      if (!submitRes.ok) throw new Error('Submission failed');
      const submitData = await submitRes.json();
      const claimNo = submitData.claim_id;
      setCurrentClaimNumber(claimNo);

      // Connect to Server-Sent Events (SSE) Stream
      const eventSource = new EventSource(`/api/claims/${claimNo}/stream`);

      eventSource.addEventListener('agent_step', (e: any) => {
        const step = JSON.parse(e.data);
        const agentName = step.agent;
        const status = step.status;

        setAgentStatus(prev => ({ ...prev, [agentName]: status }));
        if (step.output) {
          const key = agentName.replace('_agent', '');
          setAgentOutputs(prev => ({ ...prev, [key]: step.output }));
        }
      });

      eventSource.addEventListener('parallel_fan_out', () => {
        setAgentStatus(prev => ({
          ...prev,
          intake_agent: 'completed',
          policy_agent: 'running',
          fraud_agent: 'running',
          subrogation_agent: 'running',
        }));
      });

      eventSource.addEventListener('workflow_finished', () => {
        eventSource.close();
        setIsLoading(false);
        fetchHITLQueue();
        fetchKPIs();
      });

      eventSource.onerror = () => {
        eventSource.close();
        setIsLoading(false);
      };
    } catch (e) {
      console.error('Custom claim error:', e);
      setIsLoading(false);
    }
  };

  // Adjuster Action Submission
  const handleSubmitDecision = async (
    claimNumber: string,
    decision: string,
    auditNote: string,
    overrideAmount?: number
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/hitl/${claimNumber}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          audit_note: auditNote,
          override_payout_amount: overrideAmount,
        }),
      });
      if (!res.ok) throw new Error('Decision submission failed');
      await fetchHITLQueue();
      await fetchKPIs();
      setIsLoading(false);
    } catch (e) {
      console.error('Decision error:', e);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingHITLCount={hitlQueue.length}
      />

      <main className="flex-1 p-6">
        {activeTab === 'submit' && (
          <ClaimSubmitModal
            scenarios={scenarios}
            onExecuteScenario={handleExecuteScenario}
            onSubmitCustomClaim={handleSubmitCustomClaim}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'graph' && (
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-white">
                  AI Agents Live Execution Flow
                </h2>
                <p className="text-xs text-slate-400">
                  {currentClaimNumber ? `Processing Claim: ${currentClaimNumber}` : 'Interactive 6-agent workflow. Click any agent box to inspect its outputs.'}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('submit')}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 self-start sm:self-auto"
              >
                ← Back to Test Lab
              </button>
            </div>

            <AgentFlowGraph
              agentStatus={agentStatus}
              agentOutputs={agentOutputs}
              onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
            />

            <NodeDetailDrawer
              selectedNodeId={selectedNodeId}
              agentOutputs={agentOutputs}
              onClose={() => setSelectedNodeId(null)}
            />
          </div>
        )}

        {activeTab === 'hitl' && (
          <HITLQueueTable
            queue={hitlQueue}
            onSubmitDecision={handleSubmitDecision}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'kpis' && (
          <KPIDashboard kpiData={kpiData} />
        )}
      </main>
    </div>
  );
};
export default App;
