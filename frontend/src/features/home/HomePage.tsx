import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Play,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Scale,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { StatusTag } from '../../components/ui/status-tag';
import { formatCurrency } from '../../lib/format';
import { api } from '../../lib/api-client';
import { useToast } from '../../components/ui/toast';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [executingId, setExecutingId] = useState<string | null>(null);

  const { data: scenarios = [] } = useQuery({
    queryKey: ['demo-scenarios'],
    queryFn: api.getScenarios,
  });

  const handleRunDemo = async (scenarioId: string, name: string) => {
    try {
      setExecutingId(scenarioId);
      showToast(`Launching ${name}…`, 'info');
      const result = await api.executeScenario(scenarioId);
      const claimNo = result.claim_number;
      showToast(`Claim ${claimNo} generated. Loading workflow…`, 'success');
      navigate(`/claims/${claimNo}?view=run`);
    } catch (err: any) {
      showToast(err.message || 'Failed to execute demo scenario', 'error');
    } finally {
      setExecutingId(null);
    }
  };

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-ink">Claims Adjudication Desk</h1>
        <p className="text-sm text-muted mt-1 prose-reading">
          Select a sample claim file to observe multi-agent orchestration, citations, and governance, or submit a custom FNOL packet.
        </p>
      </div>

      {/* 4 Demo Claim Files Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-ink">Featured Demo Claims</h2>
          <span className="text-xs text-muted">Click Run to trace agents in real time</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarios.map((sc: any) => {
            const isRunning = executingId === sc.scenario_id;

            return (
              <div
                key={sc.scenario_id}
                className="rounded-panel border border-rule bg-surface p-5 flex flex-col justify-between hover:border-field-border transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-muted font-payload">
                      {sc.policy_number}
                    </span>
                    <StatusTag status={sc.expected_outcome} size="sm" />
                  </div>

                  <h3 className="text-sm font-semibold text-ink mb-1 line-clamp-1">{sc.name}</h3>
                  <p className="text-xs text-muted leading-relaxed mb-3 line-clamp-2 font-document">
                    "{sc.narrative}"
                  </p>

                  <div className="border-t border-rule/60 pt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted">Claimed:</span>
                      <span className="font-semibold text-ink tnum">
                        {formatCurrency(sc.claimed_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Expected:</span>
                      <span className="font-semibold text-ink tnum">
                        {formatCurrency(sc.expected_payout)}
                      </span>
                    </div>
                    <div className="pt-1">
                      <span className="text-muted text-[11px] block">What to watch:</span>
                      <p className="text-xs text-ink/90 italic font-document leading-snug">
                        {sc.expected_reason}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-rule/60">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs"
                    disabled={isRunning}
                    onClick={() => handleRunDemo(sc.scenario_id, sc.name)}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    <span>{isRunning ? 'Running agents…' : 'Run this claim'}</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How ClaimFlow Works (3 Steps) */}
      <div className="rounded-panel border border-rule bg-surface p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-ink">How ClaimFlow Works</h2>
          <p className="text-xs text-muted mt-0.5">
            End-to-end auto insurance claims adjudication with cited policy RAG, hybrid ML fraud scoring, and durable governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="space-y-2">
            <div className="h-8 w-8 rounded-panel bg-paper border border-rule flex items-center justify-center text-ink font-semibold text-xs tnum">
              1
            </div>
            <h3 className="text-sm font-semibold text-ink flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-status-processing" />
              <span>FNOL Arrival & Redaction</span>
            </h3>
            <p className="text-xs text-muted leading-relaxed prose-reading">
              Claimant narrative and repair invoice PDFs arrive. Local regex and NER gates mask sensitive PII (phones, emails, SSNs, policy IDs) before external analysis.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <div className="h-8 w-8 rounded-panel bg-paper border border-rule flex items-center justify-center text-ink font-semibold text-xs tnum">
              2
            </div>
            <h3 className="text-sm font-semibold text-ink flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-status-processing" />
              <span>Parallel 3-Agent Audit</span>
            </h3>
            <p className="text-xs text-muted leading-relaxed prose-reading">
              Agents 2, 3, and 4 execute simultaneously: Policy RAG verifies coverage clauses, Hybrid ML scores fraud risk (0–100), and Subrogation spots at-fault third parties.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-2">
            <div className="h-8 w-8 rounded-panel bg-paper border border-rule flex items-center justify-center text-ink font-semibold text-xs tnum">
              3
            </div>
            <h3 className="text-sm font-semibold text-ink flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-status-approved" />
              <span>Deterministic Math & Ruling</span>
            </h3>
            <p className="text-xs text-muted leading-relaxed prose-reading">
              A pure Python math tool benchmarks line items and calculates exact payout. The adjudicator authorizes straight-through settlement or pauses for adjuster review.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-rule flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-muted">
            Have a custom invoice or incident to test?
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/claims/new')}
            className="text-xs"
          >
            <span>Submit a custom claim</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
