import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { StatusTag } from '../../components/ui/status-tag';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';
import { formatCurrency, formatDate, formatRelativeTime } from '../../lib/format';
import { api } from '../../lib/api-client';

export const ClaimsListPage: React.FC = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const {
    data: claims = [],
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['claims-list', statusFilter, search, sortBy, sortOrder],
    queryFn: () =>
      api.getClaims({
        status: statusFilter,
        search,
      }),
    refetchInterval: 15000,
  });

  // Calculate Status Counts
  const counts = useMemo(() => {
    return {
      all: claims.length,
      approved: claims.filter((c: any) => c.status === 'APPROVED_STP').length,
      review: claims.filter((c: any) => c.status === 'PENDING_HITL').length,
      denied: claims.filter((c: any) => c.status === 'RESOLVED_DENY').length,
      siu: claims.filter((c: any) => c.status === 'RESOLVED_REFER_SIU').length,
    };
  }, [claims]);

  // Client-side pagination slice
  const paginatedClaims = useMemo(() => {
    const start = (page - 1) * pageSize;
    return claims.slice(start, start + pageSize);
  }, [claims, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(claims.length / pageSize));

  const filterTabs = [
    { id: 'ALL', label: 'All claims', count: counts.all },
    { id: 'APPROVED_STP', label: 'Auto-approved', count: counts.approved },
    { id: 'PENDING_HITL', label: 'Needs review', count: counts.review },
    { id: 'RESOLVED_DENY', label: 'Denied', count: counts.denied },
    { id: 'RESOLVED_REFER_SIU', label: 'Sent to SIU', count: counts.siu },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink">Claims Directory</h1>
          <p className="text-xs text-muted mt-0.5">
            Monitor, inspect, and adjudicate all auto insurance claims.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs"
            title="Refresh claims"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/claims/new')}
            className="text-xs"
          >
            <Plus className="h-4 w-4 mr-1" />
            <span>New claim</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-rule overflow-x-auto">
        {filterTabs.map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap -mb-[1px] ${
                isActive
                  ? 'border-ink text-ink font-semibold'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-tag text-[11px] tnum ${
                  isActive ? 'bg-ink text-surface' : 'bg-paper text-muted'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted pointer-events-none" />
          <Input
            placeholder="Search by ID, policyholder, VIN…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
          <span className="text-muted">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-8 rounded-input border border-field-border bg-surface px-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-status-processing"
          >
            <option value="created_at">Date created</option>
            <option value="incident_date">Loss date</option>
            <option value="claimed_amount">Claimed amount</option>
            <option value="net_payout">Net payout</option>
            <option value="fraud_risk_score">Fraud score</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="p-1.5 rounded-input border border-field-border bg-surface hover:bg-paper text-muted hover:text-ink transition-colors"
            title={`Sort ${sortOrder === 'desc' ? 'ascending' : 'descending'}`}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Claims Table */}
      <div className="rounded-panel border border-rule bg-surface overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : paginatedClaims.length === 0 ? (
          <EmptyState
            title="No claims found"
            description="No claims match your current filter or search criteria. Try clearing search filters or run a test packet."
            actionLabel="Go to Test Lab"
            onAction={() => navigate('/test-lab')}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim ID</TableHead>
                <TableHead>Policyholder</TableHead>
                <TableHead>Loss Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Claimed</TableHead>
                <TableHead className="text-right">Net Payout</TableHead>
                <TableHead className="text-center">Fraud Risk</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClaims.map((claim: any) => (
                <TableRow
                  key={claim.claim_number}
                  onClick={() => navigate(`/claims/${claim.claim_number}`)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-semibold text-ink font-payload text-xs">
                    {claim.claim_number}
                  </TableCell>
                  <TableCell className="text-xs text-ink">
                    {claim.claimant_name_masked || '—'}
                  </TableCell>
                  <TableCell className="text-xs text-muted">
                    {formatDate(claim.incident_date)}
                  </TableCell>
                  <TableCell className="text-xs text-muted">
                    {claim.loss_type || 'Collision'}
                  </TableCell>
                  <TableCell className="text-xs text-right font-medium text-ink tnum">
                    {formatCurrency(claim.claimed_amount)}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold text-status-approved tnum">
                    {formatCurrency(claim.net_payout)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`text-xs font-semibold tnum px-1.5 py-0.5 rounded-tag ${
                        claim.fraud_risk_score >= 60
                          ? 'bg-status-denied-bg text-status-denied'
                          : claim.fraud_risk_score >= 30
                          ? 'bg-status-review-bg text-status-review'
                          : 'bg-paper text-muted'
                      }`}
                    >
                      {Math.round(claim.fraud_risk_score || 0)}/100
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusTag status={claim.status} size="sm" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/claims/${claim.claim_number}`);
                      }}
                      className="h-7 px-2 text-xs"
                    >
                      <span>Open</span>
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination Footer */}
      {!isLoading && claims.length > 0 && (
        <div className="flex items-center justify-between text-xs text-muted pt-2">
          <span>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, claims.length)} of{' '}
            <strong className="text-ink tnum">{claims.length}</strong> claims
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-8 px-2.5 text-xs"
            >
              Previous
            </Button>
            <span className="text-xs font-medium text-ink px-2 tnum">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-8 px-2.5 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
