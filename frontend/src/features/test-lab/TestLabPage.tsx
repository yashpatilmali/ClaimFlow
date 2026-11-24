import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FlaskConical,
  RotateCcw,
  Play,
  Download,
  FileText,
  FileCheck2,
  FileImage,
  ShieldAlert,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  SlidersHorizontal,
  Layers,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { StatusTag } from '../../components/ui/status-tag';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState, ErrorState } from '../../components/ui/empty-state';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import { useToast } from '../../components/ui/toast';
import { api } from '../../lib/api-client';
import { formatCurrency } from '../../lib/format';

type CategoryFilter = 'all' | 'demo' | 'stp' | 'review' | 'fraud' | 'subro';

export const TestLabPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [runningPacketId, setRunningPacketId] = useState<string | null>(null);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchResults, setBatchResults] = useState<
    Array<{
      id: string;
      name: string;
      expected: string;
      actual?: string;
      passed?: boolean;
      latency_ms?: number;
      status: 'pending' | 'running' | 'done' | 'failed';
    }>
  >([]);
  const [isBatchRunning, setIsBatchRunning] = useState(false);

  // Fetch test packets catalog
  const {
    data: packets = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['test-packets'],
    queryFn: () => api.getTestPackets(),
  });

  // Reset demo data mutation
  const resetMutation = useMutation({
    mutationFn: () => api.resetDemoData(),
    onSuccess: (res) => {
      showToast(res.message || 'Demo data successfully reset to clean state.', 'success');
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['hitl-queue'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to reset demo data.', 'error');
    },
  });

  // Filtered packets
  const filteredPackets = useMemo(() => {
    return packets.filter((p) => {
      if (categoryFilter === 'demo') return p.is_demo_scenario;
      if (categoryFilter === 'stp') return p.expected_status === 'APPROVED_STP';
      if (categoryFilter === 'review') return p.expected_status === 'PENDING_HITL';
      if (categoryFilter === 'fraud') return p.expected_fraud_score_band?.[0] >= 30;
      if (categoryFilter === 'subro') return p.expected_subrogation_likelihood === 'HIGH';
      return true;
    });
  }, [packets, categoryFilter]);

  // Run Direct action
  const handleRunDirect = async (packet: any) => {
    try {
      setRunningPacketId(packet.id);
      showToast(`Executing packet ${packet.id} (${packet.name})...`, 'info');

      // Submit claim directly via form data
      const formData = new FormData();
      formData.append('narrative', packet.full_narrative || packet.story);
      formData.append('policy_number', packet.policy_number);
      formData.append('policy_bound_date', packet.policy_bound_date);
      formData.append('claimant_name', packet.claimant_name);
      formData.append('loss_type', packet.loss_type);

      const submitRes = await api.submitClaim(formData);
      const claimId = submitRes.claim_id;

      // Run claim
      await api.runClaim(claimId);

      showToast(`Adjudication complete for ${claimId}.`, 'success');
      navigate(`/claims/${claimId}?view=run`);
    } catch (err: any) {
      showToast(err.message || `Failed to run packet ${packet.id}`, 'error');
    } finally {
      setRunningPacketId(null);
    }
  };

  // Launch Batch Runner
  const startBatchRun = async () => {
    setIsBatchRunning(true);
    const initial = packets.map((p) => ({
      id: p.id,
      name: p.name,
      expected: p.expected_status,
      status: 'pending' as const,
    }));
    setBatchResults(initial);

    for (let i = 0; i < packets.length; i++) {
      const p = packets[i];
      setBatchResults((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: 'running' } : item))
      );

      const start = performance.now();
      try {
        const formData = new FormData();
        formData.append('narrative', p.full_narrative || p.story);
        formData.append('policy_number', p.policy_number);
        formData.append('policy_bound_date', p.policy_bound_date);
        formData.append('claimant_name', p.claimant_name);
        formData.append('loss_type', p.loss_type);

        const sub = await api.submitClaim(formData);
        const runRes = await api.runClaim(sub.claim_id);
        const latency = Math.round(performance.now() - start);

        const actualStatus = runRes.status;
        const passed = actualStatus === p.expected_status;

        setBatchResults((prev) =>
          prev.map((item, idx) =>
            idx === i
              ? {
                  ...item,
                  status: 'done',
                  actual: actualStatus,
                  passed,
                  latency_ms: latency,
                }
              : item
          )
        );
      } catch (err) {
        setBatchResults((prev) =>
          prev.map((item, idx) =>
            idx === i
              ? {
                  ...item,
                  status: 'failed',
                  passed: false,
                  latency_ms: Math.round(performance.now() - start),
                }
              : item
          )
        );
      }
    }

    setIsBatchRunning(false);
    queryClient.invalidateQueries({ queryKey: ['claims'] });
    queryClient.invalidateQueries({ queryKey: ['hitl-queue'] });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink">Test Lab & Packet Catalog</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-paper text-ink font-payload border border-rule">
              {packets.length} Specimen Packets
            </span>
          </div>
          <p className="text-sm text-muted mt-1 prose-reading">
            Pre-generated test packets for STP auto-approval, policy exclusions, fraud detection, and subrogation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => resetMutation.mutate()}
            disabled={resetMutation.isPending}
            className="h-8 gap-1.5 text-xs font-medium"
            title="Clear claims and restore clean 4 demo cases"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${resetMutation.isPending ? 'animate-spin' : ''}`} />
            <span>Reset demo data</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setBatchModalOpen(true);
              startBatchRun();
            }}
            disabled={isBatchRunning || packets.length === 0}
            className="h-8 gap-1.5 text-xs font-semibold"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Run all packets</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 rounded-panel border border-rule bg-surface p-3">
        <span className="text-xs font-semibold text-muted flex items-center gap-1 mr-1">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Category:</span>
        </span>
        {[
          { id: 'all', label: `All (${packets.length})` },
          { id: 'demo', label: 'Sample cases (4)' },
          { id: 'stp', label: 'Auto-approved' },
          { id: 'review', label: 'Needs review' },
          { id: 'fraud', label: 'Fraud / SIU' },
          { id: 'subro', label: 'Other driver at fault' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoryFilter(tab.id as CategoryFilter)}
            className={`px-2.5 py-1 rounded-tag text-xs font-medium transition-colors ${
              categoryFilter === tab.id
                ? 'bg-ink text-surface'
                : 'bg-paper text-muted hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Packet Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to load test packets"
          message={error instanceof Error ? error.message : 'Network error'}
          onRetry={() => refetch()}
        />
      ) : filteredPackets.length === 0 ? (
        <EmptyState
          title="No packets found"
          description="No test packets match the selected category filter."
          actionLabel="Show all packets"
          onAction={() => setCategoryFilter('all')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPackets.map((packet) => {
            const isRunning = runningPacketId === packet.id;

            return (
              <div
                key={packet.id}
                className="rounded-panel border border-rule bg-surface p-4 flex flex-col justify-between hover:border-muted transition-colors space-y-4"
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-tag text-xs font-bold bg-paper text-ink border border-rule font-payload">
                        {packet.id}
                      </span>
                      {packet.is_demo_scenario && (
                        <span className="px-2 py-0.5 rounded-tag text-[10px] font-semibold bg-status-processing/10 text-status-processing">
                          Demo scenario
                        </span>
                      )}
                    </div>
                    <StatusTag status={packet.expected_status} size="sm" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-ink line-clamp-1">{packet.name}</h3>
                    <p className="text-xs text-muted mt-1 line-clamp-2 prose-reading">
                      {packet.story}
                    </p>
                  </div>
                </div>

                {/* Specimen Documents & Expected Outcome */}
                <div className="space-y-2 text-xs border-y border-rule/60 py-3">
                  <div className="flex items-center justify-between text-muted">
                    <span>Claimed:</span>
                    <span className="font-semibold text-ink font-payload">
                      {formatCurrency(packet.claimed_amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-muted">
                    <span>Expected net:</span>
                    <span className="font-semibold text-ink font-payload">
                      {formatCurrency(packet.expected_net_payout)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-muted">
                    <span>Documents:</span>
                    <div className="flex items-center gap-2 text-ink">
                      {packet.has_invoice_pdf && (
                        <span title="Specimen invoice PDF">
                          <FileText className="h-3.5 w-3.5" />
                        </span>
                      )}
                      {packet.has_police_report && (
                        <span title="Police report PDF">
                          <FileCheck2 className="h-3.5 w-3.5" />
                        </span>
                      )}
                      {packet.has_damage_photo && (
                        <span title="Damage photo">
                          <FileImage className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      window.open(`/api/test-kit/packets/${packet.id}/zip`, '_blank')
                    }
                    className="h-8 px-2 text-xs text-muted hover:text-ink"
                    title="Download specimen files (PDF, images, expected JSON)"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/claims/new?packet=${packet.id}`)}
                      className="h-8 text-xs font-medium"
                    >
                      <span>Load in wizard</span>
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleRunDirect(packet)}
                      disabled={isRunning}
                      className="h-8 text-xs font-semibold"
                    >
                      {isRunning ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Play className="h-3.5 w-3.5 fill-current" />
                      )}
                      <span>Run</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Batch Runner Modal */}
      <Dialog open={batchModalOpen} onOpenChange={setBatchModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Automated Batch Runner</DialogTitle>
            <DialogDescription>
              Executing all 19 synthetic test packets against the 6-agent LangGraph orchestrator.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto border border-rule rounded-panel bg-paper/50 divide-y divide-rule my-4">
            {batchResults.map((item) => (
              <div
                key={item.id}
                className="p-3 flex items-center justify-between gap-4 bg-surface text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-bold text-ink font-payload w-10 shrink-0">
                    {item.id}
                  </span>
                  <span className="truncate text-ink font-medium max-w-[220px]">
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-muted text-[11px]">Expected: {item.expected}</span>
                  {item.status === 'pending' && (
                    <span className="text-muted text-[11px]">Queued</span>
                  )}
                  {item.status === 'running' && (
                    <span className="inline-flex items-center gap-1 text-status-processing font-medium text-[11px]">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Running...</span>
                    </span>
                  )}
                  {item.status === 'done' && (
                    <span
                      className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                        item.passed ? 'text-status-approved' : 'text-status-denied'
                      }`}
                    >
                      {item.passed ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <span>Failed</span>
                      )}
                      <span>{item.passed ? 'Passed' : 'Mismatch'}</span>
                      {item.latency_ms && (
                        <span className="text-muted font-payload font-normal">
                          ({item.latency_ms}ms)
                        </span>
                      )}
                    </span>
                  )}
                  {item.status === 'failed' && (
                    <span className="text-status-denied font-semibold text-[11px]">Error</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
            <span className="text-xs text-muted">
              {isBatchRunning ? 'Execution in progress…' : 'Batch run complete.'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBatchModalOpen(false)}
              disabled={isBatchRunning}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
