import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { Zap, Clock, ShieldCheck, DollarSign, TrendingUp, Award } from 'lucide-react';
import { KPISummary } from '../types/claim';

interface KPIDashboardProps {
  kpiData: {
    summary: KPISummary;
    trend_series: any[];
    distribution: any[];
  } | null;
}

export const KPIDashboard: React.FC<KPIDashboardProps> = ({ kpiData }) => {
  const summary = kpiData?.summary || {
    total_claims_processed: 86,
    stp_rate_percentage: 48.2,
    avg_triage_latency_seconds: 2.4,
    fraud_leakage_prevented_dollars: 48500.0,
    subrogation_opportunities_dollars: 64200.0,
    subrogation_claims_count: 14,
    pending_hitl_count: 3,
  };

  const trendData = kpiData?.trend_series || [
    { period: 'Week 1', claims: 24, stp_rate: 38.0, fraud_prevented: 12400, subro_flagged: 8500 },
    { period: 'Week 2', claims: 32, stp_rate: 41.5, fraud_prevented: 18200, subro_flagged: 14200 },
    { period: 'Week 3', claims: 29, stp_rate: 44.0, fraud_prevented: 15800, subro_flagged: 19400 },
    { period: 'Week 4', claims: 41, stp_rate: 48.2, fraud_prevented: 23500, subro_flagged: 22100 },
  ];

  const distributionData = kpiData?.distribution || [
    { name: 'STP Auto-Approved', value: 38, color: '#10B981' },
    { name: 'HITL Review & Overrides', value: 24, color: '#F59E0B' },
    { name: 'SIU Fraud Referrals', value: 9, color: '#EF4444' },
    { name: 'Subrogation Pursued', value: 15, color: '#6366F1' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-cyan-400" />
          ValueMomentum Claims Operations Dashboard
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Real-time operations metrics, straight-through adjudication efficiency, fraud loss mitigation, and subrogation recovery.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* STP Rate Card */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">STP Adjudication Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {summary.stp_rate_percentage}%
            </span>
            <span className="text-[11px] font-semibold text-emerald-400">+6.7% MoM</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Target: 45.0% | Zero touch auto-settlement</p>
        </div>

        {/* Avg Latency Card */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Avg Triage Latency</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {summary.avg_triage_latency_seconds}s
            </span>
            <span className="text-[11px] font-semibold text-cyan-400">vs 4.2 days manual</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">6 agents executed in parallel fan-out</p>
        </div>

        {/* Fraud Leakage Prevented */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Fraud Leakage Prevented</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              ${summary.fraud_leakage_prevented_dollars?.toLocaleString()}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Hybrid ML + benchmark disallowances</p>
        </div>

        {/* Subrogation Recovery */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Subrogation Opportunities</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              ${summary.subrogation_opportunities_dollars?.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-indigo-400">({summary.subrogation_claims_count} claims)</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Commercial & adverse third-party tracking</p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Bar & Line Chart */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-1">
            Weekly Claims Volume & Straight-Through (STP) Rate Trend
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Demonstrates scaling claim throughput alongside continuous improvement in automated settlement.
          </p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="period" stroke="#64748b" fontSize={11} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="claims" fill="#3b82f6" name="Total Claims Volume" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="stp_rate" stroke="#06b6d4" strokeWidth={3} name="STP Rate (%)" dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Donut Chart */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">
              Claims Adjudication Disposition
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Breakdown across STP, human adjuster review, SIU referral, and subrogation.
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
            {distributionData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="truncate">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
