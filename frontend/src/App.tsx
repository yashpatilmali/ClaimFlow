import React, { useState, useEffect } from 'react';
import { Box, Container } from '@mui/material';
import { Navbar } from './components/Navbar';
import { ClaimSubmitModal } from './components/ClaimSubmitModal';
import { AgentFlowGraph } from './components/AgentFlowGraph';
import { NodeDetailDrawer } from './components/NodeDetailDrawer';
import { HITLQueueTable } from './components/HITLQueueTable';
import { KPIDashboard } from './components/KPIDashboard';
import { DemoScenario, HITLQueueItem } from './types/claim';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [scenarios, setScenarios] = useState<DemoScenario[]>([]);
  const [hitlQueue, setHitlQueue] = useState<HITLQueueItem[]>([]);
  const [kpiData, setKpiData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    fetchScenarios();
    fetchHITLQueue();
    fetchKPIs();
  }, []);

  const fetchScenarios = async () => {
    try {
      const res = await fetch('/api/scenarios');
      if (res.ok) setScenarios(await res.json());
    } catch (e) { console.error('Error fetching scenarios:', e); }
  };

  const fetchHITLQueue = async () => {
    try {
      const res = await fetch('/api/hitl/queue');
      if (res.ok) setHitlQueue(await res.json());
    } catch (e) { console.error('Error fetching HITL queue:', e); }
  };

  const fetchKPIs = async () => {
    try {
      const res = await fetch('/api/dashboard/kpis');
      if (res.ok) setKpiData(await res.json());
    } catch (e) { console.error('Error fetching KPIs:', e); }
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

  const handleExecuteScenario = async (scenarioId: string) => {
    setIsLoading(true);
    resetAgentStatuses();
    setActiveTab(1);

    try {
      const res = await fetch(`/api/scenarios/${scenarioId}/execute`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to execute scenario');
      const data = await res.json();
      setCurrentClaimNumber(data.claim_number);

      setTimeout(() => {
        setAgentStatus(prev => ({ ...prev, intake_agent: 'completed', policy_agent: 'running', fraud_agent: 'running', subrogation_agent: 'running' }));
        setAgentOutputs(prev => ({ ...prev, intake: data.agent_outputs.intake }));
      }, 700);

      setTimeout(() => {
        setAgentStatus(prev => ({ ...prev, policy_agent: 'completed', fraud_agent: 'completed', subrogation_agent: 'completed', estimator_agent: 'running' }));
        setAgentOutputs(prev => ({ ...prev, policy: data.agent_outputs.policy, fraud: data.agent_outputs.fraud, subrogation: data.agent_outputs.subrogation }));
      }, 1500);

      setTimeout(() => {
        setAgentStatus(prev => ({ ...prev, estimator_agent: 'completed', adjudicator_agent: 'running' }));
        setAgentOutputs(prev => ({ ...prev, estimator: data.agent_outputs.estimator }));
      }, 2300);

      setTimeout(() => {
        const finalStatus = data.is_paused ? 'paused' : 'completed';
        setAgentStatus(prev => ({ ...prev, adjudicator_agent: finalStatus }));
        setAgentOutputs(prev => ({ ...prev, adjudication: data.agent_outputs.adjudication }));
        setIsLoading(false);
        fetchHITLQueue();
        fetchKPIs();
      }, 3100);

    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  const handleSubmitCustomClaim = async (narrative: string, policyNumber: string, boundDate: string, file: File | null) => {
    setIsLoading(true);
    resetAgentStatuses();
    setActiveTab(1);

    try {
      const formData = new FormData();
      formData.append('narrative', narrative);
      formData.append('policy_number', policyNumber);
      formData.append('policy_bound_date', boundDate);
      if (file) formData.append('invoice_file', file);

      const submitRes = await fetch('/api/claims/submit', { method: 'POST', body: formData });
      if (!submitRes.ok) throw new Error('Submission failed');
      const submitData = await submitRes.json();
      const claimNo = submitData.claim_id;
      setCurrentClaimNumber(claimNo);

      const eventSource = new EventSource(`/api/claims/${claimNo}/stream`);

      eventSource.addEventListener('agent_step', (e: any) => {
        const step = JSON.parse(e.data);
        setAgentStatus(prev => ({ ...prev, [step.agent]: step.status }));
        if (step.output) {
          const key = step.agent.replace('_agent', '');
          setAgentOutputs(prev => ({ ...prev, [key]: step.output }));
        }
      });

      eventSource.addEventListener('parallel_fan_out', () => {
        setAgentStatus(prev => ({ ...prev, intake_agent: 'completed', policy_agent: 'running', fraud_agent: 'running', subrogation_agent: 'running' }));
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

  const handleSubmitDecision = async (claimNumber: string, decision: string, auditNote: string, overrideAmount?: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/hitl/${claimNumber}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, audit_note: auditNote, override_payout_amount: overrideAmount }),
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} pendingHITLCount={hitlQueue.length} />

      <Box component="main" sx={{ px: { xs: 2, md: 3 } }}>
        {activeTab === 0 && (
          <ClaimSubmitModal
            scenarios={scenarios}
            onExecuteScenario={handleExecuteScenario}
            onSubmitCustomClaim={handleSubmitCustomClaim}
            isLoading={isLoading}
          />
        )}

        {activeTab === 1 && (
          <Box sx={{ maxWidth: 1280, mx: 'auto', py: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Box component="h2" sx={{ m: 0, fontSize: '1.15rem', fontWeight: 700, color: 'text.primary' }}>
                  Workflow
                </Box>
                <Box component="p" sx={{ m: 0, mt: 0.3, fontSize: '0.75rem', color: 'text.secondary' }}>
                  {currentClaimNumber ? `Claim: ${currentClaimNumber}` : 'Select an agent to inspect details.'}
                </Box>
              </Box>
            </Box>
            <AgentFlowGraph agentStatus={agentStatus} agentOutputs={agentOutputs} onSelectNode={(nodeId) => setSelectedNodeId(nodeId)} />
            <NodeDetailDrawer selectedNodeId={selectedNodeId} agentOutputs={agentOutputs} onClose={() => setSelectedNodeId(null)} />
          </Box>
        )}

        {activeTab === 2 && (
          <HITLQueueTable queue={hitlQueue} onSubmitDecision={handleSubmitDecision} isLoading={isLoading} />
        )}

        {activeTab === 3 && (
          <KPIDashboard kpiData={kpiData} />
        )}
      </Box>
    </Box>
  );
};

export default App;
