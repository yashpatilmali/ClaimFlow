import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  PieChart,
  Pie,
  Cell,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  Zap,
  Clock,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  HelpCircle,
  FileCheck2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { ErrorState } from '../../components/ui/empty-state';
import { api } from '../../lib/api-client';
import { formatCurrency, formatPercent, formatLakhsCrores } from '../../lib/format';

export const DashboardPage: React.FC = () => {
  const {
    data: kpiData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: () => api.getKpis(),
    refetchInterval: 15000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-72" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !kpiData) {
    return (
      <ErrorState
        title="Failed to load operations metrics"
        message={error instanceof Error ? error.message : 'Network error loading analytics data.'}
        onRetry={() => refetch()}
      />
    );
  }

  const { summary, trend_series, distribution } = kpiData;

  // Custom tooltips with clean design tokens
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-input border border-rule bg-surface p-2.5 shadow-md text-xs">
          <p className="font-semibold text-ink mb-1.5">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
              <span className="text-muted flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full inline-block"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-semibold text-ink font-payload">
                {typeof entry.value === 'number' && entry.name.toLowerCase().includes('rate')
                  ? `${entry.value.toFixed(1)}%`
                  : typeof entry.value === 'number' && entry.name.toLowerCase().includes('prevented')
                  ? formatCurrency(entry.value)
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const lossTypePayouts = [
    { type: 'Collision', avg_payout: 1240, count: 48 },
    { type: 'Comprehensive', avg_payout: 850, count: 26 },
    { type: 'Property damage', avg_payout: 1890, count: 18 },
    { type: 'Glass damage', avg_payout: 320, count: 14 },
  ];

  const fraudDistribution = [
    { tier: 'Low risk (0-29)', count: 52, fill: '#1E7B4F' },
    { tier: 'Medium risk (30-59)', count: 24, fill: '#9A5B00' },
    { tier: 'High risk (60-100)', count: 10, fill: '#B42318' },
  ];

  const OUTCOME_COLORS: Record<string, string> = {
    'STP Auto-Approved': '#1E7B4F',
    'HITL Manual Review': '#9A5B00',
    'SIU Fraud Referrals': '#5B3FA0',
    'Subrogation Pursued': '#0E7C7B',
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule pb-4">
        <div>
          <h1 className="text-xl font-bold text-ink">Operations Dashboard</h1>
          <p className="text-sm text-muted mt-1 prose-reading">
            Adjudication performance, straight-through throughput, and loss prevention across active claims.
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
          <span>Refresh metrics</span>
        </Button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: STP Rate */}
        <div className="rounded-panel border border-rule bg-surface p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-status-approved" />
                <span>Auto-Approved Rate</span>
              </span>
              <span title="Claims approved automatically without human review">
                <HelpCircle className="h-3 w-3 text-muted/60" />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-ink font-payload">
              {summary.stp_rate_percentage?.toFixed(1)}%
            </div>
          </div>
          <p className="mt-3 text-[11px] text-muted border-t border-rule/60 pt-2">
            Target: 40.0% · Instant settlement
          </p>
        </div>

        {/* Card 2: Average Triage Latency */}
        <div className="rounded-panel border border-rule bg-surface p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-status-processing" />
                <span>Average Decision Time</span>
              </span>
              <span title="Total time to scan bills, run policy/fraud checks, and calculate payout">
                <HelpCircle className="h-3 w-3 text-muted/60" />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-ink font-payload">
              {summary.avg_triage_latency_seconds?.toFixed(1)}s
            </div>
          </div>
          <p className="mt-3 text-[11px] text-muted border-t border-rule/60 pt-2">
            Full 6-step automatic check
          </p>
        </div>

        {/* Card 3: Fraud Leakage Prevented */}
        <div className="rounded-panel border border-rule bg-surface p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-status-denied" />
                <span>Fraud Prevented</span>
              </span>
              <span title="Disallowed workshop markups plus suspicious claims caught">
                <HelpCircle className="h-3 w-3 text-muted/60" />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-ink font-payload">
              {formatLakhsCrores(summary.fraud_leakage_prevented_dollars || 0)}
            </div>
          </div>
          <p className="mt-3 text-[11px] text-muted border-t border-rule/60 pt-2">
            Parts cost capping & suspicious bill detection
          </p>
        </div>

        {/* Card 4: Subrogation Opportunities */}
        <div className="rounded-panel border border-rule bg-surface p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-status-subrogation" />
                <span>Other Driver Recovery</span>
              </span>
              <span title="Estimated money recovered from at-fault vehicle insurance">
                <HelpCircle className="h-3 w-3 text-muted/60" />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-ink font-payload">
              {formatLakhsCrores(summary.subrogation_opportunities_dollars || 0)}
            </div>
          </div>
          <p className="mt-3 text-[11px] text-muted border-t border-rule/60 pt-2">
            {summary.subrogation_claims_count || 0} commercial & at-fault driver cases
          </p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Volume Trend & STP Rate */}
        <div className="rounded-panel border border-rule bg-surface p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-ink">Claims Throughput & STP Trend</h3>
            <p className="text-xs text-muted mt-0.5">
              Weekly claim processing volume alongside straight-through approval percentage.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trend_series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#5B6B82' }} axisLine={{ stroke: '#D5DBE3' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#5B6B82' }} axisLine={{ stroke: '#D5DBE3' }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  unit="%"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#5B6B82' }}
                  axisLine={{ stroke: '#D5DBE3' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="claims" name="Total Claims" fill="#18304F" radius={[3, 3, 0, 0]} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="stp_rate"
                  name="STP Rate (%)"
                  stroke="#1E7B4F"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#1E7B4F' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Outcome Breakdown */}
        <div className="rounded-panel border border-rule bg-surface p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-ink">Adjudication Outcome Distribution</h3>
            <p className="text-xs text-muted mt-0.5">
              Final disposition breakdown across all processed claims.
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {distribution.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={OUTCOME_COLORS[entry.name] || '#18304F'}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Fraud Risk Distribution */}
        <div className="rounded-panel border border-rule bg-surface p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-ink">Fraud Risk Score Distribution</h3>
            <p className="text-xs text-muted mt-0.5">
              Claims segmented by ML anomaly score (0-29 Low, 30-59 Medium, 60+ High).
            </p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fraudDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="tier" tick={{ fontSize: 11, fill: '#5B6B82' }} axisLine={{ stroke: '#D5DBE3' }} />
                <YAxis tick={{ fontSize: 11, fill: '#5B6B82' }} axisLine={{ stroke: '#D5DBE3' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Claims count" radius={[3, 3, 0, 0]}>
                  {fraudDistribution.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Average Payout by Loss Type */}
        <div className="rounded-panel border border-rule bg-surface p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-ink">Average Net Settlement by Loss Type</h3>
            <p className="text-xs text-muted mt-0.5">
              Net settlement amounts after deductible and policy limit application.
            </p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lossTypePayouts} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="type" tick={{ fontSize: 11, fill: '#5B6B82' }} axisLine={{ stroke: '#D5DBE3' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#5B6B82' }}
                  tickFormatter={(val) => `$${val}`}
                  axisLine={{ stroke: '#D5DBE3' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avg_payout" name="Average net payout (₹)" fill="#2457C5" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
