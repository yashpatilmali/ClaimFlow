import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Cpu, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { StatusTag } from '../../components/ui/status-tag';
import { Skeleton } from '../../components/ui/skeleton';
import { ErrorState } from '../../components/ui/empty-state';
import { CaseFileView } from '../case-file/CaseFileView';
import { AgentRunView } from '../agent-run/AgentRunView';
import { api } from '../../lib/api-client';

export const ClaimDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentView = searchParams.get('view') === 'run' ? 'run' : 'case-file';

  const {
    data: claim,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['claim-details', id],
    queryFn: () => api.getClaim(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      // Auto-refresh every 3s if analyzing or pending
      const status = query.state.data?.status;
      return status === 'ANALYZING' || status === 'SUBMITTED' ? 3000 : false;
    },
  });

  const handleViewChange = (view: 'case-file' | 'run') => {
    setSearchParams({ view });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-96 lg:col-span-10" />
        </div>
      </div>
    );
  }

  if (isError || !claim) {
    return (
      <ErrorState
        title={`Claim ${id} not found`}
        message={error instanceof Error ? error.message : 'Unable to locate claim records.'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Claim Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/claims')}
            className="h-8 px-2 text-xs text-muted hover:text-ink"
            title="Back to Claims directory"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-ink font-payload">{claim.claim_number}</h1>
              <StatusTag status={claim.status} size="sm" />
            </div>
            <p className="text-xs text-muted mt-0.5">
              <span>{claim.claimant_name || 'Insured'}</span>
              <span className="mx-1.5">·</span>
              <span>Loss: {claim.incident_date}</span>
              <span className="mx-1.5">·</span>
              <span className="font-payload">{claim.policy_number}</span>
            </p>
          </div>
        </div>

        {/* View Switcher: Case file vs Agent run */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8 px-2 text-xs text-muted"
            title="Refresh claim data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>

          <div className="inline-flex rounded-input border border-rule bg-paper p-0.5">
            <button
              onClick={() => handleViewChange('case-file')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-input text-xs font-semibold transition-colors ${
                currentView === 'case-file'
                  ? 'bg-surface text-ink shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Case file</span>
            </button>

            <button
              onClick={() => handleViewChange('run')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-input text-xs font-semibold transition-colors ${
                currentView === 'run'
                  ? 'bg-surface text-ink shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Agent run</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {currentView === 'case-file' ? (
        <CaseFileView claim={claim} onRefresh={refetch} />
      ) : (
        <AgentRunView
          claim={claim}
          onSwitchToCaseFile={() => handleViewChange('case-file')}
        />
      )}
    </div>
  );
};
