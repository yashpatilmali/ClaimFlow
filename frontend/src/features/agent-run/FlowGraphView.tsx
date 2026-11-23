import React, { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  MarkerType,
  Handle,
  Position,
  NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CheckCircle2, Loader2, AlertTriangle, XCircle } from 'lucide-react';
import { AgentStepState, AgentRunStatus } from '../../lib/sse-client';
import { formatDuration } from '../../lib/format';

interface FlowGraphViewProps {
  agentStatus: Record<string, AgentStepState>;
  onSelectAgent: (agentKey: string) => void;
  selectedAgent: string | null;
}

interface CustomNodeData {
  id: string;
  label: string;
  sublabel?: string;
  status?: AgentRunStatus;
  latency_ms?: number;
  isSelected?: boolean;
}

const CustomAgentNode: React.FC<NodeProps<CustomNodeData>> = ({ data }) => {
  const getStatusIcon = (status?: AgentRunStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-status-approved" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-status-processing animate-spin" />;
      case 'paused':
        return <AlertTriangle className="h-4 w-4 text-status-review" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-status-denied" />;
      default:
        return <span className="h-2 w-2 rounded-full bg-rule inline-block" />;
    }
  };

  return (
    <div
      className={`relative px-4 py-3 rounded-card bg-surface border text-left shadow-sm min-w-[190px] transition-all cursor-pointer ${
        data.isSelected
          ? 'border-ink ring-2 ring-ink ring-offset-1'
          : data.status === 'running'
          ? 'border-status-processing ring-2 ring-status-processing/30'
          : 'border-rule hover:border-muted'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted !w-2 !h-2" />
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[11px] font-semibold text-muted tracking-tight">
          {data.sublabel || 'Pipeline step'}
        </span>
        <div className="flex items-center gap-1.5">
          {getStatusIcon(data.status)}
          {data.latency_ms !== undefined && (
            <span className="text-[10px] font-payload text-muted">
              {formatDuration(data.latency_ms)}
            </span>
          )}
        </div>
      </div>
      <div className="text-xs font-semibold text-ink leading-tight">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-muted !w-2 !h-2" />
    </div>
  );
};

const TerminalNode: React.FC<NodeProps<{ label: string; isStart?: boolean }>> = ({ data }) => {
  return (
    <div className="px-3 py-1.5 rounded-full bg-paper border border-rule text-xs font-semibold text-muted text-center min-w-[110px]">
      <Handle
        type={data.isStart ? 'source' : 'target'}
        position={data.isStart ? Position.Bottom : Position.Top}
        className="!bg-muted !w-1.5 !h-1.5"
      />
      <span>{data.label}</span>
    </div>
  );
};

const nodeTypes = {
  agentNode: CustomAgentNode,
  terminalNode: TerminalNode,
};

export const FlowGraphView: React.FC<FlowGraphViewProps> = ({
  agentStatus,
  onSelectAgent,
  selectedAgent,
}) => {
  const nodes: Node[] = useMemo(() => {
    return [
      {
        id: 'start',
        type: 'terminalNode',
        position: { x: 340, y: 0 },
        data: { label: 'Claim Submitted', isStart: true },
      },
      {
        id: 'pii_redactor',
        type: 'agentNode',
        position: { x: 295, y: 70 },
        data: {
          id: 'pii_redactor',
          label: 'PII Redaction Gate',
          sublabel: 'Gate',
          status: agentStatus.pii_redactor?.status,
          latency_ms: agentStatus.pii_redactor?.latency_ms,
          isSelected: selectedAgent === 'pii_redactor',
        },
      },
      {
        id: 'intake_agent',
        type: 'agentNode',
        position: { x: 295, y: 170 },
        data: {
          id: 'intake_agent',
          label: 'Intake & IDP',
          sublabel: 'Agent 1',
          status: agentStatus.intake_agent?.status,
          latency_ms: agentStatus.intake_agent?.latency_ms,
          isSelected: selectedAgent === 'intake_agent',
        },
      },
      // Parallel checks
      {
        id: 'policy_agent',
        type: 'agentNode',
        position: { x: 60, y: 280 },
        data: {
          id: 'policy_agent',
          label: 'Policy Coverage RAG',
          sublabel: 'Agent 2 (Parallel)',
          status: agentStatus.policy_agent?.status,
          latency_ms: agentStatus.policy_agent?.latency_ms,
          isSelected: selectedAgent === 'policy_agent',
        },
      },
      {
        id: 'fraud_agent',
        type: 'agentNode',
        position: { x: 295, y: 280 },
        data: {
          id: 'fraud_agent',
          label: 'Fraud Anomaly ML',
          sublabel: 'Agent 3 (Parallel)',
          status: agentStatus.fraud_agent?.status,
          latency_ms: agentStatus.fraud_agent?.latency_ms,
          isSelected: selectedAgent === 'fraud_agent',
        },
      },
      {
        id: 'subrogation_agent',
        type: 'agentNode',
        position: { x: 530, y: 280 },
        data: {
          id: 'subrogation_agent',
          label: 'Subrogation Spotter',
          sublabel: 'Agent 4 (Parallel)',
          status: agentStatus.subrogation_agent?.status,
          latency_ms: agentStatus.subrogation_agent?.latency_ms,
          isSelected: selectedAgent === 'subrogation_agent',
        },
      },
      // Post parallel
      {
        id: 'estimator_agent',
        type: 'agentNode',
        position: { x: 295, y: 400 },
        data: {
          id: 'estimator_agent',
          label: 'Estimator (Math)',
          sublabel: 'Agent 5',
          status: agentStatus.estimator_agent?.status,
          latency_ms: agentStatus.estimator_agent?.latency_ms,
          isSelected: selectedAgent === 'estimator_agent',
        },
      },
      {
        id: 'adjudicator_agent',
        type: 'agentNode',
        position: { x: 295, y: 500 },
        data: {
          id: 'adjudicator_agent',
          label: 'Adjudicator & STP',
          sublabel: 'Agent 6',
          status: agentStatus.adjudicator_agent?.status,
          latency_ms: agentStatus.adjudicator_agent?.latency_ms,
          isSelected: selectedAgent === 'adjudicator_agent',
        },
      },
      {
        id: 'end',
        type: 'terminalNode',
        position: { x: 335, y: 605 },
        data: {
          label:
            agentStatus.adjudicator_agent?.status === 'paused'
              ? 'Human Review'
              : 'Claim Resolved',
        },
      },
    ];
  }, [agentStatus, selectedAgent]);

  const edges: Edge[] = useMemo(() => {
    const defaultEdgeOptions = {
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed, color: '#7D8A9C', width: 14, height: 14 },
      style: { stroke: '#7D8A9C', strokeWidth: 1.5 },
    };

    return [
      { id: 'e-start-pii', source: 'start', target: 'pii_redactor', ...defaultEdgeOptions },
      { id: 'e-pii-intake', source: 'pii_redactor', target: 'intake_agent', ...defaultEdgeOptions },
      { id: 'e-intake-policy', source: 'intake_agent', target: 'policy_agent', ...defaultEdgeOptions },
      { id: 'e-intake-fraud', source: 'intake_agent', target: 'fraud_agent', ...defaultEdgeOptions },
      { id: 'e-intake-subro', source: 'intake_agent', target: 'subrogation_agent', ...defaultEdgeOptions },
      { id: 'e-policy-est', source: 'policy_agent', target: 'estimator_agent', ...defaultEdgeOptions },
      { id: 'e-fraud-est', source: 'fraud_agent', target: 'estimator_agent', ...defaultEdgeOptions },
      { id: 'e-subro-est', source: 'subrogation_agent', target: 'estimator_agent', ...defaultEdgeOptions },
      { id: 'e-est-adj', source: 'estimator_agent', target: 'adjudicator_agent', ...defaultEdgeOptions },
      { id: 'e-adj-end', source: 'adjudicator_agent', target: 'end', ...defaultEdgeOptions },
    ];
  }, []);

  return (
    <div className="h-[680px] w-full rounded-panel border border-rule bg-paper relative overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        onNodeClick={(_, node) => {
          if (node.id !== 'start' && node.id !== 'end') {
            onSelectAgent(node.id);
          }
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#D5DBE3" gap={16} size={1} />
        <Controls showInteractive={false} className="!border-rule !bg-surface !shadow-sm" />
      </ReactFlow>
    </div>
  );
};
