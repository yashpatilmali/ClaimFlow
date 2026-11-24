import React from 'react';
import {
  CheckCircle2,
  Clock,
  Loader2,
  AlertTriangle,
  XCircle,
  Shield,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { AgentStepState, AgentRunStatus } from '../../lib/sse-client';
import { formatDuration } from '../../lib/format';

interface TimelineViewProps {
  agentStatus: Record<string, AgentStepState>;
  onSelectAgent: (agentKey: string) => void;
  selectedAgent: string | null;
}

interface StepConfig {
  key: string;
  number?: string;
  title: string;
  subtitle: string;
  description: string;
}

const STEPS: StepConfig[] = [
  {
    key: 'pii_redactor',
    title: 'Privacy Protection Gate',
    subtitle: 'Data security',
    description: 'Masks phone numbers, emails, and personal IDs before analysis.',
  },
  {
    key: 'intake_agent',
    number: 'Step 1',
    title: 'Document & Bill Reading',
    subtitle: 'Extracts parts & labor',
    description: 'Reads workshop estimate, extracts line items, and checks bill total.',
  },
];

const PARALLEL_STEPS: StepConfig[] = [
  {
    key: 'policy_agent',
    number: 'Step 2',
    title: 'Policy Coverage Check',
    subtitle: 'Terms & exclusions',
    description: 'Checks accident date against active policy and verifies damage coverage.',
  },
  {
    key: 'fraud_agent',
    number: 'Step 3',
    title: 'Fraud Risk Meter',
    subtitle: 'Risk score 0-100',
    description: 'Checks for bill inflation, mismatch with story, or recent policy purchase.',
  },
  {
    key: 'subrogation_agent',
    number: 'Step 4',
    title: 'Other Driver Fault Check',
    subtitle: 'Third-party recovery',
    description: 'Checks police challan and accident story to spot at-fault commercial vehicles.',
  },
];

const POST_PARALLEL_STEPS: StepConfig[] = [
  {
    key: 'estimator_agent',
    number: 'Step 5',
    title: 'Payout Calculation',
    subtitle: 'In Indian Rupees (₹)',
    description: 'Caps parts/labor at standard rates and calculates net payout minus deductible.',
  },
  {
    key: 'adjudicator_agent',
    number: 'Step 6',
    title: 'Final Claim Decision',
    subtitle: 'Approval or review',
    description: 'Instant auto-approval for low-risk claims, or pauses for claims officer review.',
  },
];

function getStatusBadge(status?: AgentRunStatus) {
  switch (status) {
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-status-approved">
          <CheckCircle2 className="h-4 w-4" />
          <span>Completed</span>
        </span>
      );
    case 'running':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-status-processing">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Running</span>
        </span>
      );
    case 'paused':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-status-review">
          <AlertTriangle className="h-4 w-4" />
          <span>Awaiting review</span>
        </span>
      );
    case 'error':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-status-denied">
          <XCircle className="h-4 w-4" />
          <span>Failed</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted">
          <span className="h-2 w-2 rounded-full bg-rule" />
          <span>Waiting</span>
        </span>
      );
  }
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  agentStatus,
  onSelectAgent,
  selectedAgent,
}) => {
  const renderStepCard = (step: StepConfig, isCompact = false) => {
    const data = agentStatus[step.key] || { status: 'waiting' };
    const isSelected = selectedAgent === step.key;

    return (
      <div
        key={step.key}
        onClick={() => onSelectAgent(step.key)}
        className={`group relative flex flex-col justify-between rounded-card border p-4 cursor-pointer transition-all ${
          isSelected
            ? 'border-ink bg-surface shadow-sm ring-1 ring-ink'
            : 'border-rule bg-surface hover:border-muted'
        } ${data.status === 'running' ? 'border-status-processing bg-paper/50' : ''}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {step.number && (
                <span className="text-[11px] font-semibold text-muted tracking-tight">
                  {step.number}
                </span>
              )}
              <h4 className="text-sm font-semibold text-ink group-hover:text-status-processing transition-colors">
                {step.title}
              </h4>
            </div>
            <p className="text-xs text-muted leading-relaxed line-clamp-2">
              {data.message || step.description}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {getStatusBadge(data.status)}
            {data.latency_ms !== undefined && (
              <span className="text-[11px] font-payload text-muted">
                {formatDuration(data.latency_ms)}
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between pt-2 border-t border-rule/60 text-[11px] text-muted">
          <span className="italic">{step.subtitle}</span>
          <span className="inline-flex items-center gap-0.5 text-xs text-muted group-hover:text-ink">
            Inspect <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Step 1 & 2 */}
      <div className="space-y-3">
        {STEPS.map((step) => renderStepCard(step))}
      </div>

      {/* Parallel Checks Container */}
      <div className="rounded-panel border border-dashed border-rule bg-paper/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink">
            <Layers className="h-4 w-4 text-status-processing" />
            <span>3 Instant Checks (Running Together)</span>
          </div>
          <span className="text-[11px] text-muted">Policy, fraud, and fault checks run at the same time</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PARALLEL_STEPS.map((step) => renderStepCard(step, true))}
        </div>
      </div>

      {/* Steps 5 & 6 */}
      <div className="space-y-3">
        {POST_PARALLEL_STEPS.map((step) => renderStepCard(step))}
      </div>
    </div>
  );
};
