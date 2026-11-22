import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
} from '@mui/material';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BoltIcon from '@mui/icons-material/Bolt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ShieldIcon from '@mui/icons-material/Shield';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { KPISummary } from '../types/claim';

interface KPIDashboardProps {
  kpiData: {
    summary: KPISummary;
    trend_series: any[];
    distribution: any[];
  } | null;
}

const KPI_CARDS = [
  { key: 'stp_rate_percentage', label: 'STP Rate', suffix: '%', delta: '+6.7% MoM', deltaColor: '#10B981', sub: 'Auto-settled claims', icon: BoltIcon, iconColor: '#10B981', iconBg: 'rgba(16,185,129,0.1)' },
  { key: 'avg_triage_latency_seconds', label: 'Avg Triage Time', suffix: 's', delta: 'vs 4.2d manual', deltaColor: '#06B6D4', sub: 'Multi-agent processing', icon: AccessTimeIcon, iconColor: '#3B82F6', iconBg: 'rgba(59,130,246,0.1)' },
  { key: 'fraud_leakage_prevented_dollars', label: 'Fraud Prevented', prefix: '$', delta: null, deltaColor: '', sub: 'High-risk claim savings', icon: ShieldIcon, iconColor: '#EF4444', iconBg: 'rgba(239,68,68,0.1)' },
  { key: 'subrogation_opportunities_dollars', label: 'Subrogation Value', prefix: '$', delta: null, deltaColor: '', sub: 'Third-party recovery', icon: AccountBalanceIcon, iconColor: '#6366F1', iconBg: 'rgba(99,102,241,0.1)' },
];

export const KPIDashboard: React.FC<KPIDashboardProps> = ({ kpiData }) => {
  const summary: any = kpiData?.summary || {
    total_claims_processed: 86, stp_rate_percentage: 48.2, avg_triage_latency_seconds: 2.4,
    fraud_leakage_prevented_dollars: 48500, subrogation_opportunities_dollars: 64200,
    subrogation_claims_count: 14, pending_hitl_count: 3,
  };

  const trendData = kpiData?.trend_series || [
    { period: 'Week 1', claims: 24, stp_rate: 38.0 },
    { period: 'Week 2', claims: 32, stp_rate: 41.5 },
    { period: 'Week 3', claims: 29, stp_rate: 44.0 },
    { period: 'Week 4', claims: 41, stp_rate: 48.2 },
  ];

  const distData = kpiData?.distribution || [
    { name: 'STP Auto-Approved', value: 38, color: '#10B981' },
    { name: 'HITL Review', value: 24, color: '#F59E0B' },
    { name: 'SIU Fraud', value: 9, color: '#EF4444' },
    { name: 'Subrogation', value: 15, color: '#6366F1' },
  ];

  const tooltipStyle = { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '11px', color: '#0F172A', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' };

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', py: 3 }}>
      {/* Title */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon sx={{ color: 'primary.main' }} />
          Analytics
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
          Real-time settlement rates, triage speed, and financial impact.
        </Typography>
      </Box>

      {/* 4 KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {KPI_CARDS.map((card) => {
          const Icon = card.icon;
          let val = summary[card.key];
          if (card.prefix) val = `${card.prefix}${val?.toLocaleString()}`;
          else if (card.suffix) val = `${val}${card.suffix}`;

          return (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={card.key}>
              <Paper sx={{ p: 2.5, position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s', '&:hover': { borderColor: '#93C5FD' } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="overline" sx={{ color: 'text.secondary' }}>{card.label}</Typography>
                  <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon sx={{ fontSize: 18, color: card.iconColor }} />
                  </Box>
                </Box>
                <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography sx={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>{val}</Typography>
                  {card.delta && (
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: card.deltaColor }}>{card.delta}</Typography>
                  )}
                  {card.key === 'subrogation_opportunities_dollars' && (
                    <Chip label={`${summary.subrogation_claims_count} claims`} size="small" variant="outlined" color="info" sx={{ fontSize: '0.6rem', height: 20, ml: 0.5 }} />
                  )}
                </Box>
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>{card.sub}</Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={3}>
        {/* Trend Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 0.5, fontSize: '0.9rem', color: '#0F172A' }}>
              Claims Volume & STP Trend
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mb: 3 }}>
              Weekly volume and auto-settlement percentage.
            </Typography>
            <Box sx={{ height: 300, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="period" stroke="#64748B" fontSize={11} />
                  <YAxis yAxisId="left" stroke="#64748B" fontSize={11} />
                  <YAxis yAxisId="right" orientation="right" stroke="#0284C7" fontSize={11} domain={[0, 100]} />
                  <ReTooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar yAxisId="left" dataKey="claims" fill="#2563EB" name="Claims Volume" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="stp_rate" stroke="#0284C7" strokeWidth={3} name="STP Rate (%)" dot={{ r: 4, fill: '#0284C7' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Pie Chart */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 0.5, fontSize: '0.9rem', color: '#0F172A' }}>Adjudication Disposition</Typography>
              <Typography variant="caption" sx={{ display: 'block', mb: 2 }}>
                Breakdown by outcome channel.
              </Typography>
              <Box sx={{ height: 220, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                      {distData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ReTooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Box>
            <Grid container spacing={1} sx={{ pt: 2, borderTop: '1px solid #F1F5F9' }}>
              {distData.map((d: any, i: number) => (
                <Grid size={6} key={i}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: d.color, flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ color: '#475569', fontWeight: 500 }}>{d.name}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
