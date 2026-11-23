import React, { useState } from 'react';
import {
  ListFilter,
  Network,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Wifi,
  WifiOff,
  Loader2,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { TimelineView } from './TimelineView';
import { FlowGraphView } from './FlowGraphView';
import { AgentDetailDrawer } from './AgentDetailDrawer';
import { useClaimSSE } from '../../lib/sse-client';
import { formatCurrency } from '../../lib/format';

interface AgentRunViewProps {
  claim: any;
  onSwitchToCaseFile: () => void;
}

export const AgentRunView: React.FC<AgentRunViewProps> = ({ claim, onSwitchToCaseFile }) => {
  const [viewMode, setViewMode] = useState<'timeline' | 'graph'>('timeline');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const isAlreadyFinished =
    claim.status === 'APPROVED_STP' ||
    claim.status === 'DENIED' ||
    claim.status === 'PENDING_HITL' ||
    claim.status === 'SIU_INVESTIGATION';

  const { agentStatus, connectionStatus, finalSummary, replay } = useClaimSSE(
    claim.claim_number,
    claim.agent_execution_trace,
    isAlreadyFinished
  );

  const getAgentPayload = (key: string | null) => {
    if (!key) return null;
    return agentStatus[key]?.output || claim.agent_execution_trace?.[key.replace('_agent', '')] || null;
  };

  const getAgentLatency = (key: string | null) => {
    if (!key) return undefined;
    return agentStatus[key]?.latency_ms;
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-panel border border-rule bg-surface p-4">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted">View:</span>
          <div className="inline-flex rounded-input border border-rule bg-paper p-0.5">
            <button
              onClick={() => setViewMode('timeline')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-input text-xs font-semibold transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-surface text-ink shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <ListFilter className="h-3.5 w-3.5" />
              <span>Steps timeline</span>
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-input text-xs font-semibold transition-colors ${
                viewMode === 'graph'
                  ? 'bg-surface text-ink shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <Network className="h-3.5 w-3.5" />
              <span>Flow graph</span>
            </button>
          </div>
        </div>

        {/* Telemetry Status and Replay Action */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            {connectionStatus === 'connected' && (
              <span className="inline-flex items-center gap-1 text-status-approved font-medium">
                <Wifi className="h-3.5 w-3.5" />
                <span>Live stream connected</span>
              </span>
            )}
            {connectionStatus === 'connecting' && (
              <span className="inline-flex items-center gap-1 text-status-processing font-medium">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Connecting telemetry…</span>
              </span>
            )}
            {connectionStatus === 'finished' && (
              <span className="inline-flex items-center gap-1 text-muted font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-status-approved" />
                <span>Execution complete</span>
              </span>
            )}
            {connectionStatus === 'offline' && (
              <span className="inline-flex items-center gap-1 text-muted font-medium">
                <WifiOff className="h-3.5 w-3.5" />
                <span>Replaying cached state</span>
              </span>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={replay}
            className="h-8 gap-1.5 text-xs font-medium"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Replay run</span>
          </Button>
        </div>
      </div>

      {/* Completion / Governance Banner */}
      {finalSummary && (
        <div
          className={`rounded-panel border p-4 transition-all ${
            finalSummary.is_paused
              ? 'border-status-review/40 bg-status-review/10 text-ink'
              : 'border-status-approved/40 bg-status-approved/10 text-ink'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              {finalSummary.is_paused ? (
                <AlertTriangle className="h-5 w-5 text-status-review shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-status-approved shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="text-sm font-semibold text-ink">
                  {finalSummary.is_paused
                    ? 'Adjudication rule pause: human adjuster review required'
                    : 'Straight-through adjudication completed'}
                </h4>
                <p className="text-xs text-muted mt-0.5 leading-relaxed">
                  {finalSummary.message}
                  {finalSummary.net_payout !== undefined && (
                    <span className="ml-1.5 font-semibold text-ink">
                      Net authorized payout: {formatCurrency(finalSummary.net_payout)}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <Button
              variant={finalSummary.is_paused ? 'primary' : 'outline'}
              size="sm"
              onClick={onSwitchToCaseFile}
              className="h-8 gap-1 text-xs shrink-0"
            >
              <span>Open Case file</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Main View Display */}
      {viewMode === 'timeline' ? (
        <TimelineView
          agentStatus={agentStatus}
          onSelectAgent={setSelectedAgent}
          selectedAgent={selectedAgent}
        />
      ) : (
        <FlowGraphView
          agentStatus={agentStatus}
          onSelectAgent={setSelectedAgent}
          selectedAgent={selectedAgent}
        />
      )}

      {/* Agent Detail Inspection Drawer */}
      <AgentDetailDrawer
        selectedAgent={selectedAgent}
        agentData={getAgentPayload(selectedAgent)}
        latencyMs={getAgentLatency(selectedAgent)}
        onClose={() => setSelectedAgent(null)}
      />
    </div>
  );
};
