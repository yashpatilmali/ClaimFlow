import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, HelpCircle, Activity, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { api } from '../lib/api-client';
import * as Popover from '@radix-ui/react-popover';

interface TopBarProps {
  onOpenGlossary: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenGlossary }) => {
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState('');

  const { data: health } = useQuery({
    queryKey: ['system-health'],
    queryFn: api.getHealth,
    staleTime: 60 * 1000,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchId.trim();
    if (trimmed) {
      navigate(`/claims/${trimmed}`);
      setSearchId('');
    }
  };

  const llmProvider = health?.llm_provider || 'MockLLM';
  const dbMode = health?.database_mode || 'SQLite';

  return (
    <header className="h-14 border-b border-rule bg-surface px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="max-w-xs w-full relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted pointer-events-none" />
        <Input
          type="text"
          placeholder="Search by claim ID (e.g. CLM-1042)…"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="pl-9 h-9 text-xs"
        />
      </form>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* System Status Popover */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-input border border-rule bg-paper text-xs text-ink hover:bg-rule/50 transition-colors focus:outline-none focus:ring-2 focus:ring-status-processing"
              title="System runtime diagnostics"
            >
              <span className="h-2 w-2 rounded-full bg-status-approved" />
              <span className="hidden sm:inline font-medium">System:</span>
              <span className="text-muted">{llmProvider}</span>
              <ChevronDown className="h-3 w-3 text-muted ml-0.5" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              className="z-50 w-72 rounded-panel border border-rule bg-surface p-4 shadow-floating text-xs"
              sideOffset={8}
              align="end"
            >
              <div className="flex items-center gap-2 border-b border-rule pb-2 mb-3">
                <Activity className="h-4 w-4 text-status-processing" />
                <span className="font-semibold text-ink">System Diagnostics</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted">LLM Provider:</span>
                  <span className="font-medium text-ink">{llmProvider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Database Engine:</span>
                  <span className="font-medium text-ink">{dbMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Fraud ML Model:</span>
                  <span className="font-medium text-status-approved">Loaded & Ready</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Durable Checkpointer:</span>
                  <span className="font-medium text-ink">Active (LangGraph)</span>
                </div>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* Glossary / Help Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenGlossary}
          className="text-muted hover:text-ink h-9 px-2.5 text-xs"
          title="Open system glossary"
        >
          <HelpCircle className="h-4 w-4 mr-1 text-muted" />
          <span className="hidden sm:inline">Glossary</span>
        </Button>

        {/* New Claim Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/claims/new')}
          className="h-9 text-xs"
        >
          <Plus className="h-4 w-4 mr-1" />
          <span>New claim</span>
        </Button>
      </div>
    </header>
  );
};
