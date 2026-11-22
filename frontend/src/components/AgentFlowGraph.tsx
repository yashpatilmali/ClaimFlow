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
import { 
  FileSearch, 
  ShieldCheck, 
  AlertOctagon, 
  RefreshCcw, 
  Calculator, 
  Scale, 
  CheckCircle2, 
  Clock, 
  PauseCircle, 
  AlertTriangle 
} from 'lucide-react';

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

const CustomAgentNode: React.FC<AgentNodeProps> = ({ data }) => {
  const Icon = data.icon;

  const getBorderColor = () => {
    switch (data.status) {
      case 'running':
        return 'border-cyan-400 shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-500/20 animate-pulse';
      case 'completed':
        return 'border-emerald-500 shadow-md shadow-emerald-500/20';
      case 'paused':
        return 'border-amber-500 shadow-md shadow-amber-500/20 animate-pulse';
      case 'error':
        return 'border-rose-500 shadow-md shadow-rose-500/20';
      default:
        return 'border-slate-800 hover:border-slate-700';
    }
  };

  const getStatusBadge = () => {
    switch (data.status) {
      case 'running':
        return (
          <span className="flex items-center gap-1 text-[10px] text-cyan-400 font-semibold bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            Analyzing...
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Complete
          </span>
        );
      case 'paused':
        return (
          <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800">
            <PauseCircle className="w-3 h-3 text-amber-400" />
            HITL Interrupted
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1 text-[10px] text-rose-400 font-semibold bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-800">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            Error
          </span>
        );
      default:
        return (
          <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
            Idle
          </span>
        );
    }
  };

  return (
    <div
      onClick={data.onClick}
      className={`bg-slate-950/95 backdrop-blur-md rounded-xl p-4 w-64 border transition-all cursor-pointer ${getBorderColor()}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-500 !w-2.5 !h-2.5" />
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${data.accentColor}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide">{data.label}</h4>
            <p className="text-[10px] text-slate-400 font-medium">{data.role}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
        {getStatusBadge()}
        {data.latencyMs ? (
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {data.latencyMs}ms
          </span>
        ) : null}
      </div>

      {data.metrics && (
        <div className="mt-2 text-[10px] text-cyan-300/80 font-mono bg-slate-900/90 rounded px-2 py-1 border border-slate-800/60 truncate">
          {data.metrics}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-slate-500 !w-2.5 !h-2.5" />
    </div>
  );
};

interface AgentFlowGraphProps {
  agentStatus: Record<string, 'idle' | 'running' | 'completed' | 'paused' | 'error'>;
  agentOutputs: Record<string, any>;
  onSelectNode: (nodeId: string) => void;
}

export const AgentFlowGraph: React.FC<AgentFlowGraphProps> = ({
  agentStatus,
  agentOutputs,
  onSelectNode
}) => {
  const nodeTypes = useMemo(() => ({ customAgent: CustomAgentNode }), []);

  const nodes: Node[] = useMemo(() => {
    return [
      {
        id: 'intake',
        type: 'customAgent',
        position: { x: 380, y: 30 },
        data: {
          label: '1. Intake Agent',
          role: 'FNOL & IDP Invoice Reader',
          status: agentStatus['intake_agent'] || 'idle',
          latencyMs: agentOutputs['intake'] ? 580 : undefined,
          metrics: agentOutputs['intake'] ? `Claimed: $${agentOutputs['intake'].claimed_amount?.toLocaleString()}` : undefined,
          icon: FileSearch,
          accentColor: 'bg-blue-600',
          onClick: () => onSelectNode('intake_agent'),
        },
      },
      // Parallel Fan-Out: Agents 2, 3, 4
      {
        id: 'policy',
        type: 'customAgent',
        position: { x: 60, y: 190 },
        data: {
          label: '2. Policy Agent',
          role: 'Hybrid RAG Coverage Validator',
          status: agentStatus['policy_agent'] || 'idle',
          latencyMs: agentOutputs['policy'] ? 720 : undefined,
          metrics: agentOutputs['policy'] ? (agentOutputs['policy'].is_covered ? 'Covered: Active' : 'Excluded: Section 3') : undefined,
          icon: ShieldCheck,
          accentColor: 'bg-emerald-600',
          onClick: () => onSelectNode('policy_agent'),
        },
      },
      {
        id: 'fraud',
        type: 'customAgent',
        position: { x: 380, y: 190 },
        data: {
          label: '3. Fraud Agent',
          role: 'Hybrid ML & SQL Red-Flags',
          status: agentStatus['fraud_agent'] || 'idle',
          latencyMs: agentOutputs['fraud'] ? 740 : undefined,
          metrics: agentOutputs['fraud'] ? `Risk Score: ${agentOutputs['fraud'].fraud_risk_score}/100` : undefined,
          icon: AlertOctagon,
          accentColor: 'bg-rose-600',
          onClick: () => onSelectNode('fraud_agent'),
        },
      },
      {
        id: 'subrogation',
        type: 'customAgent',
        position: { x: 700, y: 190 },
        data: {
          label: '4. Subrogation Agent',
          role: 'Recovery Target Spotter',
          status: agentStatus['subrogation_agent'] || 'idle',
          latencyMs: agentOutputs['subrogation'] ? 690 : undefined,
          metrics: agentOutputs['subrogation'] ? `Subro Likelihood: ${agentOutputs['subrogation'].subrogation_likelihood}` : undefined,
          icon: RefreshCcw,
          accentColor: 'bg-indigo-600',
          onClick: () => onSelectNode('subrogation_agent'),
        },
      },
      // Fan-In: Agent 5
      {
        id: 'estimator',
        type: 'customAgent',
        position: { x: 380, y: 350 },
        data: {
          label: '5. Estimator Agent',
          role: 'Deterministic Math & Benchmarks',
          status: agentStatus['estimator_agent'] || 'idle',
          latencyMs: agentOutputs['estimator'] ? 480 : undefined,
          metrics: agentOutputs['estimator'] ? `Net Payout: $${agentOutputs['estimator'].net_payout?.toLocaleString()}` : undefined,
          icon: Calculator,
          accentColor: 'bg-amber-600',
          onClick: () => onSelectNode('estimator_agent'),
        },
      },
      // Agent 6
      {
        id: 'adjudicator',
        type: 'customAgent',
        position: { x: 380, y: 510 },
        data: {
          label: '6. Adjudicator Agent',
          role: 'Governance & HITL Router',
          status: agentStatus['adjudicator_agent'] || 'idle',
          latencyMs: agentOutputs['adjudication'] ? 380 : undefined,
          metrics: agentOutputs['adjudication'] ? `Status: ${agentOutputs['adjudication'].status}` : undefined,
          icon: Scale,
          accentColor: 'bg-purple-600',
          onClick: () => onSelectNode('adjudicator_agent'),
        },
      },
    ];
  }, [agentStatus, agentOutputs, onSelectNode]);

  const edges: Edge[] = useMemo(() => {
    const isParallelActive = agentStatus['policy_agent'] === 'running' || agentStatus['fraud_agent'] === 'running' || agentStatus['subrogation_agent'] === 'running';

    return [
      // Fan-Out Edges
      {
        id: 'e-intake-policy',
        source: 'intake',
        target: 'policy',
        animated: isParallelActive || agentStatus['intake_agent'] === 'completed',
        style: { stroke: '#38BDF8', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#38BDF8' },
      },
      {
        id: 'e-intake-fraud',
        source: 'intake',
        target: 'fraud',
        animated: isParallelActive || agentStatus['intake_agent'] === 'completed',
        style: { stroke: '#38BDF8', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#38BDF8' },
      },
      {
        id: 'e-intake-subro',
        source: 'intake',
        target: 'subrogation',
        animated: isParallelActive || agentStatus['intake_agent'] === 'completed',
        style: { stroke: '#38BDF8', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#38BDF8' },
      },
      // Fan-In Edges
      {
        id: 'e-policy-estimator',
        source: 'policy',
        target: 'estimator',
        animated: agentStatus['estimator_agent'] === 'running',
        style: { stroke: '#10B981', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#10B981' },
      },
      {
        id: 'e-fraud-estimator',
        source: 'fraud',
        target: 'estimator',
        animated: agentStatus['estimator_agent'] === 'running',
        style: { stroke: '#F43F5E', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#F43F5E' },
      },
      {
        id: 'e-subro-estimator',
        source: 'subrogation',
        target: 'estimator',
        animated: agentStatus['estimator_agent'] === 'running',
        style: { stroke: '#818CF8', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#818CF8' },
      },
      // Estimator -> Adjudicator
      {
        id: 'e-estimator-adjudicator',
        source: 'estimator',
        target: 'adjudicator',
        animated: agentStatus['adjudicator_agent'] === 'running',
        style: { stroke: '#A855F7', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#A855F7' },
      },
    ];
  }, [agentStatus]);

  return (
    <div className="w-full h-[680px] bg-slate-950/90 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl backdrop-blur-md">
        <span className="text-xs font-semibold text-slate-300">Live Agent Pipeline:</span>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Parallel Fan-Out</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Deterministic Fan-In</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400" /> HITL Router</span>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1e293b" gap={20} size={1} />
        <Controls className="!bg-slate-900 !border-slate-800 !text-slate-300 fill-slate-300" />
      </ReactFlow>
    </div>
  );
};
