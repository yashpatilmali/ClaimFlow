import { useState, useEffect, useRef } from 'react';

export type AgentRunStatus = 'waiting' | 'running' | 'completed' | 'paused' | 'error';

export interface AgentStepState {
  status: AgentRunStatus;
  latency_ms?: number;
  output?: any;
  message?: string;
}

export interface UseClaimSSEResult {
  agentStatus: Record<string, AgentStepState>;
  connectionStatus: 'connected' | 'connecting' | 'finished' | 'offline';
  finalSummary: {
    status?: string;
    is_paused?: boolean;
    net_payout?: number;
    message?: string;
  } | null;
  replay: () => void;
}

export function useClaimSSE(
  claimNumber: string,
  initialTrace: any,
  isFinishedInitial: boolean
): UseClaimSSEResult {
  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'connecting' | 'finished' | 'offline'
  >(isFinishedInitial ? 'finished' : 'connecting');

  const [agentStatus, setAgentStatus] = useState<Record<string, AgentStepState>>(() => {
    // If claim is already finished, populate from stored trace
    if (isFinishedInitial && initialTrace) {
      return {
        pii_redactor: { status: 'completed', latency_ms: 120, message: 'PII masked securely.' },
        intake_agent: { status: 'completed', latency_ms: 580, output: initialTrace.intake },
        policy_agent: { status: 'completed', latency_ms: 720, output: initialTrace.policy },
        fraud_agent: { status: 'completed', latency_ms: 740, output: initialTrace.fraud },
        subrogation_agent: { status: 'completed', latency_ms: 690, output: initialTrace.subrogation },
        estimator_agent: { status: 'completed', latency_ms: 480, output: initialTrace.estimator },
        adjudicator_agent: {
          status: initialTrace.is_paused ? 'paused' : 'completed',
          latency_ms: 380,
          output: initialTrace.adjudication,
        },
      };
    }

    return {
      pii_redactor: { status: 'waiting' },
      intake_agent: { status: 'waiting' },
      policy_agent: { status: 'waiting' },
      fraud_agent: { status: 'waiting' },
      subrogation_agent: { status: 'waiting' },
      estimator_agent: { status: 'waiting' },
      adjudicator_agent: { status: 'waiting' },
    };
  });

  const [finalSummary, setFinalSummary] = useState<any>(
    isFinishedInitial && initialTrace
      ? {
          status: initialTrace.is_paused ? 'PENDING_HITL' : initialTrace.adjudication?.status || 'APPROVED_STP',
          is_paused: initialTrace.is_paused,
          net_payout: initialTrace.estimator?.net_payout,
          message: initialTrace.is_paused
            ? 'This claim was paused for governance sign-off. Open it in the Review queue.'
            : 'Workflow completed: straight-through settlement approved.',
        }
      : null
  );

  const eventSourceRef = useRef<EventSource | null>(null);

  const startStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setConnectionStatus('connecting');
    const es = new EventSource(`/api/claims/${claimNumber}/stream`);
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnectionStatus('connected');
    };

    es.addEventListener('pii_redaction', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setAgentStatus((prev) => ({
        ...prev,
        pii_redactor: {
          status: data.status,
          message: data.message,
          latency_ms: data.status === 'completed' ? 120 : undefined,
        },
      }));
    });

    es.addEventListener('agent_step', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setAgentStatus((prev) => ({
        ...prev,
        [data.agent]: {
          status: data.status === 'running' ? 'running' : data.status,
          output: data.output,
          latency_ms: data.latency_ms,
          message: data.message,
        },
      }));
    });

    es.addEventListener('parallel_fan_out', () => {
      setAgentStatus((prev) => ({
        ...prev,
        policy_agent: { status: 'running', message: 'Verifying coverage & clauses…' },
        fraud_agent: { status: 'running', message: 'Scoring ML fraud probability…' },
        subrogation_agent: { status: 'running', message: 'Detecting 3rd-party fault cues…' },
      }));
    });

    es.addEventListener('workflow_finished', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setConnectionStatus('finished');
      setFinalSummary({
        status: data.status,
        is_paused: data.status === 'PENDING_HITL',
        net_payout: data.net_payout,
        message:
          data.status === 'PENDING_HITL'
            ? 'This claim was paused for governance sign-off. Open it in the Review queue.'
            : 'Workflow completed: straight-through settlement approved.',
      });
      es.close();
    });

    es.onerror = () => {
      setConnectionStatus('offline');
      es.close();
    };
  };

  useEffect(() => {
    // Only auto-stream if claim is not already finalized
    if (!isFinishedInitial && claimNumber) {
      startStream();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [claimNumber, isFinishedInitial]);

  const replay = () => {
    // Reset agent states to running animation
    setAgentStatus({
      pii_redactor: { status: 'completed', latency_ms: 120, message: 'PII masked securely.' },
      intake_agent: { status: 'running', latency_ms: 580 },
      policy_agent: { status: 'waiting' },
      fraud_agent: { status: 'waiting' },
      subrogation_agent: { status: 'waiting' },
      estimator_agent: { status: 'waiting' },
      adjudicator_agent: { status: 'waiting' },
    });

    setTimeout(() => {
      setAgentStatus((p) => ({
        ...p,
        intake_agent: { status: 'completed', latency_ms: 580, output: initialTrace?.intake },
        policy_agent: { status: 'running' },
        fraud_agent: { status: 'running' },
        subrogation_agent: { status: 'running' },
      }));
    }, 600);

    setTimeout(() => {
      setAgentStatus((p) => ({
        ...p,
        policy_agent: { status: 'completed', latency_ms: 720, output: initialTrace?.policy },
        fraud_agent: { status: 'completed', latency_ms: 740, output: initialTrace?.fraud },
        subrogation_agent: { status: 'completed', latency_ms: 690, output: initialTrace?.subrogation },
        estimator_agent: { status: 'running' },
      }));
    }, 1400);

    setTimeout(() => {
      setAgentStatus((p) => ({
        ...p,
        estimator_agent: { status: 'completed', latency_ms: 480, output: initialTrace?.estimator },
        adjudicator_agent: { status: 'running' },
      }));
    }, 2000);

    setTimeout(() => {
      setAgentStatus((p) => ({
        ...p,
        adjudicator_agent: {
          status: initialTrace?.is_paused ? 'paused' : 'completed',
          latency_ms: 380,
          output: initialTrace?.adjudication,
        },
      }));
      setConnectionStatus('finished');
    }, 2600);
  };

  return {
    agentStatus,
    connectionStatus,
    finalSummary,
    replay,
  };
}
