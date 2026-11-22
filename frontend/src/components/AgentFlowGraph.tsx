import React, { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  MarkerType,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Typography, Chip, Paper } from '@mui/material';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import CalculateIcon from '@mui/icons-material/Calculate';
import GavelIcon from '@mui/icons-material/Gavel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface AgentNodeProps {
  data: {
    label: string;
    role: string;
    status: 'idle' | 'running' | 'completed' | 'paused' | 'error';
    latencyMs?: number;
    metrics?: string;
    icon: any;
    accentColor: string;
    onClick: () => void;
  };
}

const statusConfig: Record<string, { label: string; color: string; borderColor: string; icon: any }> = {
  idle: { label: 'Waiting', color: '#64748B', borderColor: '#E2E8F0', icon: null },
  running: { label: 'Analyzing…', color: '#0284C7', borderColor: '#0284C7', icon: null },
  completed: { label: 'Done', color: '#059669', borderColor: '#10B981', icon: CheckCircleIcon },
  paused: { label: 'Needs Review', color: '#D97706', borderColor: '#F59E0B', icon: PauseCircleIcon },
  error: { label: 'Error', color: '#DC2626', borderColor: '#EF4444', icon: ErrorIcon },
};

const CustomAgentNode: React.FC<AgentNodeProps> = ({ data }) => {
  const Icon = data.icon;
  const sc = statusConfig[data.status] || statusConfig.idle;
  const isRunning = data.status === 'running';

  return (
    <Box
      onClick={data.onClick}
      sx={{
        bgcolor: '#FFFFFF',
        borderRadius: 2.5,
        p: 2,
        width: 260,
        border: `1.5px solid ${sc.borderColor}`,
        boxShadow: isRunning ? `0 0 20px rgba(2,132,199,0.25)` : (data.status === 'completed' ? `0 2px 10px rgba(5,150,105,0.15)` : '0 2px 8px rgba(0,0,0,0.05)'),
        cursor: 'pointer',
        transition: 'all 0.25s ease-in-out',
        animation: isRunning ? 'pulse 2s ease-in-out infinite' : undefined,
        '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.88 } },
        '&:hover': { borderColor: '#1D4ED8', boxShadow: '0 8px 24px rgba(29,78,216,0.12)' },
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#94A3B8', width: 8, height: 8 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: data.accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
          <Icon sx={{ fontSize: 18, color: '#fff' }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>{data.label}</Typography>
          <Typography sx={{ fontSize: '0.64rem', color: '#64748B', fontWeight: 500 }}>{data.role}</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid #F1F5F9' }}>
        <Chip
          icon={isRunning ? <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: sc.color, animation: 'pulse 1s ease-in-out infinite' }} /> : (sc.icon ? <Box component={sc.icon} sx={{ fontSize: '14px !important', color: `${sc.color} !important` }} /> : undefined)}
          label={sc.label}
          size="small"
          sx={{ height: 22, fontSize: '0.62rem', fontWeight: 700, bgcolor: `${sc.color}15`, color: sc.color, border: `1px solid ${sc.color}35` }}
        />
        {data.latencyMs && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <AccessTimeIcon sx={{ fontSize: 11, color: '#64748B' }} />
            <Typography sx={{ fontSize: '0.62rem', fontFamily: 'monospace', color: '#64748B', fontWeight: 600 }}>{data.latencyMs}ms</Typography>
          </Box>
        )}
      </Box>

      {data.metrics && (
        <Box sx={{ mt: 1, px: 1.2, py: 0.5, bgcolor: '#F8FAFC', borderRadius: 1.5, border: '1px solid #E2E8F0' }}>
          <Typography sx={{ fontSize: '0.62rem', fontFamily: 'monospace', color: '#0369A1', fontWeight: 600 }}>{data.metrics}</Typography>
        </Box>
      )}
      <Handle type="source" position={Position.Bottom} style={{ background: '#94A3B8', width: 8, height: 8 }} />
    </Box>
  );
};

interface AgentFlowGraphProps {
  agentStatus: Record<string, 'idle' | 'running' | 'completed' | 'paused' | 'error'>;
  agentOutputs: Record<string, any>;
  onSelectNode: (nodeId: string) => void;
}

export const AgentFlowGraph: React.FC<AgentFlowGraphProps> = ({ agentStatus, agentOutputs, onSelectNode }) => {
  const nodeTypes = useMemo(() => ({ customAgent: CustomAgentNode }), []);

  const nodes: Node[] = useMemo(() => [
    {
      id: 'intake', type: 'customAgent', position: { x: 380, y: 30 },
      data: {
        label: '1. Intake Agent', role: 'FNOL & Invoice Parser',
        status: agentStatus['intake_agent'] || 'idle',
        latencyMs: agentOutputs['intake'] ? 580 : undefined,
        metrics: agentOutputs['intake'] ? `Claimed: $${agentOutputs['intake'].claimed_amount?.toLocaleString()}` : undefined,
        icon: FindInPageIcon, accentColor: '#2563EB',
        onClick: () => onSelectNode('intake_agent'),
      },
    },
    {
      id: 'policy', type: 'customAgent', position: { x: 60, y: 200 },
      data: {
        label: '2. Policy Agent', role: 'RAG Coverage Validator',
        status: agentStatus['policy_agent'] || 'idle',
        latencyMs: agentOutputs['policy'] ? 720 : undefined,
        metrics: agentOutputs['policy'] ? (agentOutputs['policy'].is_covered ? 'Coverage: ACTIVE' : 'Coverage: EXCLUDED') : undefined,
        icon: VerifiedUserIcon, accentColor: '#059669',
        onClick: () => onSelectNode('policy_agent'),
      },
    },
    {
      id: 'fraud', type: 'customAgent', position: { x: 380, y: 200 },
      data: {
        label: '3. Fraud Agent', role: 'ML + Rules Classifier',
        status: agentStatus['fraud_agent'] || 'idle',
        latencyMs: agentOutputs['fraud'] ? 740 : undefined,
        metrics: agentOutputs['fraud'] ? `Risk: ${agentOutputs['fraud'].fraud_risk_score}/100` : undefined,
        icon: ReportProblemIcon, accentColor: '#DC2626',
        onClick: () => onSelectNode('fraud_agent'),
      },
    },
    {
      id: 'subrogation', type: 'customAgent', position: { x: 700, y: 200 },
      data: {
        label: '4. Subrogation Agent', role: 'Recovery Target Spotter',
        status: agentStatus['subrogation_agent'] || 'idle',
        latencyMs: agentOutputs['subrogation'] ? 690 : undefined,
        metrics: agentOutputs['subrogation'] ? `Recovery: ${agentOutputs['subrogation'].subrogation_likelihood}` : undefined,
        icon: SyncAltIcon, accentColor: '#4F46E5',
        onClick: () => onSelectNode('subrogation_agent'),
      },
    },
    {
      id: 'estimator', type: 'customAgent', position: { x: 380, y: 370 },
      data: {
        label: '5. Estimator Agent', role: 'Deterministic Payout Math',
        status: agentStatus['estimator_agent'] || 'idle',
        latencyMs: agentOutputs['estimator'] ? 480 : undefined,
        metrics: agentOutputs['estimator'] ? `Net Payout: $${agentOutputs['estimator'].net_payout?.toLocaleString()}` : undefined,
        icon: CalculateIcon, accentColor: '#D97706',
        onClick: () => onSelectNode('estimator_agent'),
      },
    },
    {
      id: 'adjudicator', type: 'customAgent', position: { x: 380, y: 540 },
      data: {
        label: '6. Decision Agent', role: 'Governance & HITL Router',
        status: agentStatus['adjudicator_agent'] || 'idle',
        latencyMs: agentOutputs['adjudication'] ? 380 : undefined,
        metrics: agentOutputs['adjudication'] ? `Status: ${agentOutputs['adjudication'].status}` : undefined,
        icon: GavelIcon, accentColor: '#7C3AED',
        onClick: () => onSelectNode('adjudicator_agent'),
      },
    },
  ], [agentStatus, agentOutputs, onSelectNode]);

  const edges: Edge[] = useMemo(() => {
    const pa = agentStatus['policy_agent'] === 'running' || agentStatus['fraud_agent'] === 'running' || agentStatus['subrogation_agent'] === 'running';
    return [
      { id: 'e1', source: 'intake', target: 'policy', animated: pa || agentStatus['intake_agent'] === 'completed', style: { stroke: '#38BDF8', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#38BDF8' } },
      { id: 'e2', source: 'intake', target: 'fraud', animated: pa || agentStatus['intake_agent'] === 'completed', style: { stroke: '#38BDF8', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#38BDF8' } },
      { id: 'e3', source: 'intake', target: 'subrogation', animated: pa || agentStatus['intake_agent'] === 'completed', style: { stroke: '#38BDF8', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#38BDF8' } },
      { id: 'e4', source: 'policy', target: 'estimator', animated: agentStatus['estimator_agent'] === 'running', style: { stroke: '#10B981', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10B981' } },
      { id: 'e5', source: 'fraud', target: 'estimator', animated: agentStatus['estimator_agent'] === 'running', style: { stroke: '#F43F5E', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#F43F5E' } },
      { id: 'e6', source: 'subrogation', target: 'estimator', animated: agentStatus['estimator_agent'] === 'running', style: { stroke: '#818CF8', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#818CF8' } },
      { id: 'e7', source: 'estimator', target: 'adjudicator', animated: agentStatus['adjudicator_agent'] === 'running', style: { stroke: '#A855F7', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#A855F7' } },
    ];
  }, [agentStatus]);

  return (
    <Paper sx={{ width: '100%', height: 680, overflow: 'hidden', position: 'relative', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
      {/* Legend */}
      <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 10, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.95)', border: '1px solid #E2E8F0', borderRadius: 2.5, px: 2, py: 1, backdropFilter: 'blur(8px)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#0F172A', mr: 0.5 }}>Execution Flow:</Typography>
        {[
          { label: 'Intake', color: '#0284C7' },
          { label: 'Parallel Checks', color: '#059669' },
          { label: 'Payout Math', color: '#D97706' },
          { label: 'Decision', color: '#7C3AED' },
        ].map((l, i) => (
          <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {i > 0 && <Typography sx={{ fontSize: '0.65rem', color: '#94A3B8' }}>→</Typography>}
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: l.color }} />
            <Typography sx={{ fontSize: '0.65rem', color: '#475569', fontWeight: 600 }}>{l.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Tip */}
      <Box sx={{ position: 'absolute', bottom: 16, left: 16, zIndex: 10, display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 0.5, bgcolor: 'rgba(255,255,255,0.92)', border: '1px solid #E2E8F0', borderRadius: 1.5, px: 1.5, py: 0.8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <Typography sx={{ fontSize: '0.65rem', color: '#64748B' }}>💡 Click any agent node to inspect its data, citations, or formulas.</Typography>
      </Box>

      <ReactFlow
        nodes={nodes} edges={edges} nodeTypes={nodeTypes}
        fitView fitViewOptions={{ padding: 0.18 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#CBD5E1" gap={20} size={1} />
        <Controls style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 8 }} />
      </ReactFlow>
    </Paper>
  );
};
