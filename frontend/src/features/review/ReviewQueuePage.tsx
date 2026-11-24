import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { StatusTag } from '../../components/ui/status-tag';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState, ErrorState } from '../../components/ui/empty-state';
import { api } from '../../lib/api-client';
import { formatCurrency, formatPercent } from '../../lib/format';

type PrioritySort = 'high-risk' | 'high-amount' | 'newest';
type ReasonFilter = 'all' | 'exclusion' | 'fraud' | 'payout' | 'subro';

export const ReviewQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const [prioritySort, setPrioritySort] = useState<PrioritySort>('high-risk');
  const [reasonFilter, setReasonFilter] = useState<ReasonFilter>('all');

  const {
    data: queue = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['hitl-queue'],
    queryFn: () => api.getHitlQueue(),
    refetchInterval: 5000,
  });

  const filteredQueue = useMemo(() => {
    let result = [...queue];

    // Filter by pause reason
    if (reasonFilter !== 'all') {
      result = result.filter((item) => {
        const reasons = (item.pause_reasons || []).map((r: string) => r.toLowerCase());
        const citations = item.citations || [];
        const isCovered = item.agent_trace?.policy?.is_covered;

        if (reasonFilter === 'exclusion') {
          return (
            isCovered === false ||
            reasons.some((r: string) => r.includes('exclusion') || r.includes('coverage'))
          );
        }
        if (reasonFilter === 'fraud') {
          return (
            (item.fraud_risk_score || 0) >= 30 ||
            reasons.some((r: string) => r.includes('fraud') || r.includes('red flag'))
          );
        }
        if (reasonFilter === 'payout') {
          return (
            (item.calculated_net_payout || item.approved_amount || 0) >= 2000 ||
            reasons.some((r: string) => r.includes('payout') || r.includes('threshold'))
          );
        }
        if (reasonFilter === 'subro') {
          return (
            item.subrogation_likelihood === 'HIGH' ||
            reasons.some((r: string) => r.includes('subrogation'))
          );
        }
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      if (prioritySort === 'high-risk') {
        return (b.fraud_risk_score || 0) - (a.fraud_risk_score || 0);
      }
      if (prioritySort === 'high-amount') {
        return (b.claimed_amount || 0) - (a.claimed_amount || 0);
      }
      return (b.incident_date || '').localeCompare(a.incident_date || '');
    });

    return result;
  }, [queue, prioritySort, reasonFilter]);

  const getPriorityLabel = (item: any) => {
    const fraud = item.fraud_risk_score || 0;
    const isCovered = item.agent_trace?.policy?.is_covered;
    if (fraud >= 50 || isCovered === false) {
      return {
        label: 'High',
        className: 'bg-status-denied/10 text-status-denied border-status-denied/30',
      };
    }
    return {
      label: 'Medium',
      className: 'bg-status-review/10 text-status-review border-status-review/30',
    };
  };

  const getFlags = (item: any) => {
    const flags: string[] = [];
    const fraud = item.fraud_risk_score || 0;
    const isCovered = item.agent_trace?.policy?.is_covered;
    const payout = item.calculated_net_payout || 0;
    const subro = item.subrogation_likelihood;

    if (isCovered === false) flags.push('Policy Exclusion');
    if (fraud >= 30) flags.push(`Fraud risk ${fraud.toFixed(0)}/100`);
    if (payout >= 2000) flags.push('Payout ≥ $2,000');
    if (subro === 'HIGH') flags.push('High subrogation');

    if (item.pause_reasons && item.pause_reasons.length > 0) {
      item.pause_reasons.forEach((r: string) => {
        if (!flags.some((f) => r.toLowerCase().includes(f.toLowerCase()))) {
          flags.push(r);
        }
      });
    }

    return flags.length > 0 ? flags : ['Adjuster Review Required'];
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink">Adjuster Review Queue</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-status-review/15 text-status-review font-payload">
              {queue.length}
            </span>
          </div>
          <p className="text-sm text-muted mt-1 prose-reading">
            Claims paused by governance rules awaiting human sign-off, override, or denial.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-8 gap-1.5 text-xs shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh queue</span>
        </Button>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-panel border border-rule bg-surface p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted flex items-center gap-1">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filter:</span>
          </span>
          {[
            { id: 'all', label: 'All reasons' },
            { id: 'exclusion', label: 'Policy exclusion' },
            { id: 'fraud', label: 'Fraud risk 30+' },
            { id: 'payout', label: 'Payout ≥ $2,000' },
            { id: 'subro', label: 'High subrogation' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setReasonFilter(tab.id as ReasonFilter)}
              className={`px-2.5 py-1 rounded-tag text-xs font-medium transition-colors ${
                reasonFilter === tab.id
                  ? 'bg-ink text-surface'
                  : 'bg-paper text-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Sort:</span>
          <select
            value={prioritySort}
            onChange={(e) => setPrioritySort(e.target.value as PrioritySort)}
            className="rounded-input border border-field text-xs bg-surface px-2.5 py-1 text-ink focus:outline-none focus:ring-1 focus:ring-status-processing"
          >
            <option value="high-risk">High risk first</option>
            <option value="high-amount">High amount first</option>
            <option value="newest">Newest loss date</option>
          </select>
        </div>
      </div>

      {/* Queue Table / List */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to load review queue"
          message={error instanceof Error ? error.message : 'Network error'}
          onRetry={() => refetch()}
        />
      ) : filteredQueue.length === 0 ? (
        <EmptyState
          title="No claims awaiting review"
          description={
            reasonFilter === 'all'
              ? 'All submitted claims have completed straight-through processing or have already been resolved.'
              : 'No claims match the selected pause criteria.'
          }
          actionLabel="View all claims"
          onAction={() => navigate('/claims')}
        />
      ) : (
        <div className="rounded-panel border border-rule bg-surface overflow-hidden divide-y divide-rule">
          {filteredQueue.map((item) => {
            const priority = getPriorityLabel(item);
            const flags = getFlags(item);

            return (
              <div
                key={item.claim_number}
                className="p-4 hover:bg-paper/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Priority, ID, Claimant, and Flags */}
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-tag text-[10px] font-bold border uppercase tracking-wider ${priority.className}`}
                    >
                      {priority.label} priority
                    </span>
                    <button
                      onClick={() => navigate(`/claims/${item.claim_number}`)}
                      className="text-sm font-bold text-ink font-payload hover:underline"
                    >
                      {item.claim_number}
                    </button>
                    <span className="text-xs text-muted">·</span>
                    <span className="text-xs text-muted">
                      {item.claimant_name || 'Insured'}
                    </span>
                    <span className="text-xs text-muted">·</span>
                    <span className="text-xs text-muted">Loss: {item.incident_date}</span>
                  </div>

                  {/* Pause Reason Flags */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {flags.map((flag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-tag text-[11px] font-medium bg-paper border border-rule text-ink"
                      >
                        <AlertCircle className="h-3 w-3 text-status-review shrink-0" />
                        <span>{flag}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Financials and Action Button */}
                <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-muted">Claimed</div>
                    <div className="text-sm font-semibold text-ink font-payload">
                      {formatCurrency(item.claimed_amount)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-muted">Calculated payout</div>
                    <div className="text-sm font-bold text-ink font-payload">
                      {formatCurrency(item.calculated_net_payout || 0)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-muted">Fraud score</div>
                    <div
                      className={`text-sm font-bold font-payload ${
                        (item.fraud_risk_score || 0) >= 30
                          ? 'text-status-denied'
                          : 'text-status-approved'
                      }`}
                    >
                      {(item.fraud_risk_score || 0).toFixed(0)}/100
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/claims/${item.claim_number}`)}
                    className="h-8 gap-1.5 text-xs font-semibold"
                  >
                    <span>Review claim</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
