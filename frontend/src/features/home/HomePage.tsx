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
      showToast(`Running ${name}…`, 'info');
      const result = await api.executeScenario(scenarioId);
      const claimNo = result.claim_number;
      showToast(`Claim ${claimNo} ready. Opening live view…`, 'success');
      navigate(`/claims/${claimNo}?view=run`);
    } catch (err: any) {
      showToast(err.message || 'Failed to execute demo scenario', 'error');
    } finally {
      setExecutingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-ink">Auto Claims Desk</h1>
        <p className="text-sm text-muted mt-1 prose-reading">
          Pick a sample claim to watch instant AI checks and payout calculations, or submit a new claim.
        </p>
      </div>

      {/* 4 Demo Claim Files Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-ink">Sample Claims</h2>
          <span className="text-xs text-muted">Click Run to see live checks in Indian Rupees (₹)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarios.map((sc: any) => {
            const isRunning = executingId === sc.scenario_id;

            return (
              <div
                key={sc.scenario_id}
                className="rounded-panel border border-rule bg-surface p-4 flex flex-col justify-between hover:border-field transition-all shadow-sm"
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
                      <span className="font-semibold text-ink font-payload">
                        {formatCurrency(sc.claimed_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Expected net:</span>
                      <span className="font-semibold text-ink font-payload">
                        {formatCurrency(sc.expected_payout)}
                      </span>
                    </div>
                    <div className="pt-1">
                      <span className="text-muted text-[11px] block">What happens:</span>
                      <p className="text-xs text-ink/90 italic font-document leading-snug">
                        {sc.expected_reason}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-rule/60">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs"
                    disabled={isRunning}
                    onClick={() => handleRunDemo(sc.scenario_id, sc.name)}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    <span>{isRunning ? 'Processing…' : 'Run this claim'}</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How ClaimFlow Works (3 Steps) */}
      <div className="rounded-panel border border-rule bg-surface p-6 sm:p-7">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-ink">How ClaimFlow Works</h2>
          <p className="text-xs text-muted mt-0.5">
            Simple 3-step automatic claims check and payout calculation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="space-y-2">
            <div className="h-8 w-8 rounded-panel bg-paper border border-rule flex items-center justify-center text-ink font-semibold text-xs font-payload">
              1
            </div>
            <h3 className="text-sm font-semibold text-ink flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-status-processing" />
              <span>Upload & Privacy Check</span>
            </h3>
            <p className="text-xs text-muted leading-relaxed prose-reading">
              Claim story and repair bills are received. Phone numbers, emails, and personal IDs are masked securely before analysis.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <div className="h-8 w-8 rounded-panel bg-paper border border-rule flex items-center justify-center text-ink font-semibold text-xs font-payload">
              2
            </div>
            <h3 className="text-sm font-semibold text-ink flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-status-processing" />
              <span>Three Instant Checks</span>
            </h3>
            <p className="text-xs text-muted leading-relaxed prose-reading">
              AI checks policy coverage terms, scores fraud risk, and spots if another driver or commercial vehicle was at fault.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-2">
            <div className="h-8 w-8 rounded-panel bg-paper border border-rule flex items-center justify-center text-ink font-semibold text-xs font-payload">
              3
            </div>
            <h3 className="text-sm font-semibold text-ink flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-status-approved" />
              <span>Payout & Final Decision</span>
            </h3>
            <p className="text-xs text-muted leading-relaxed prose-reading">
              Calculates repair parts and labor in Rupees (₹). Clean claims are approved instantly; complex claims are sent to an adjuster.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-rule flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-muted">
            Have your own repair bill or accident report to test?
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/claims/new')}
            className="text-xs"
          >
            <span>Submit a new claim</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
