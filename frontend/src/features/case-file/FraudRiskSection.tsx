import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Cpu } from 'lucide-react';

export interface FraudRiskSectionProps {
  fraudData: any;
}

export const FraudRiskSection: React.FC<FraudRiskSectionProps> = ({ fraudData }) => {
  const score = Math.round(fraudData?.fraud_risk_score || 0);
  const mlProb = fraudData?.ml_model_probability || (score / 100);
  const riskDrivers = fraudData?.risk_drivers || [];
  const ruleFlags = fraudData?.rule_flags || [];

  const getScoreBand = () => {
    if (score >= 70) return { label: 'High Risk', color: 'text-status-denied', barColor: 'bg-status-denied', desc: 'Severe fraud anomalies detected. SIU referral mandated.' };
    if (score >= 30) return { label: 'Elevated Risk', color: 'text-status-review', barColor: 'bg-status-review', desc: 'Suspicious patterns detected. Requires adjuster review.' };
    return { label: 'Low Risk', color: 'text-status-approved', barColor: 'bg-status-approved', desc: 'Within safe parameters for automated straight-through processing.' };
  };

  const band = getScoreBand();

  return (
    <section id="fraud-risk" className="space-y-4 pt-4 border-t border-rule">
      <div className="flex items-center justify-between border-b border-rule pb-2">
        <h3 className="text-base font-bold text-ink flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-status-denied" />
          <span>3. Fraud Risk & Anomaly Investigation (Hybrid ML)</span>
        </h3>
        <span className="text-xs text-muted">Tabular ML + SQL Rule Checks</span>
      </div>

      <div className="rounded-panel border border-rule bg-surface p-5 space-y-5">
        {/* Score Gauge & Band Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule pb-4">
          <div className="space-y-1">
            <span className="text-xs text-muted block">Composite Fraud Risk Score</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-ink tnum">{score}</span>
              <span className="text-sm font-semibold text-muted">/ 100</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-tag ml-2 ${band.color} bg-paper border border-rule`}>
                {band.label}
              </span>
            </div>
            <p className="text-xs text-muted">{band.desc}</p>
          </div>

          <div className="text-left sm:text-right text-xs">
            <span className="text-muted block">ML Classifier Probability</span>
            <span className="text-lg font-bold text-ink tnum">
              {(mlProb * 100).toFixed(1)}%
            </span>
            <span className="text-[11px] text-muted block">Gradient Boosted Trees</span>
          </div>
        </div>

        {/* 0-100 Horizontal Bar with 3 Zones */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-muted font-medium">
            <span>Low (0–29)</span>
            <span>Elevated (30–69)</span>
            <span>High (70–100)</span>
          </div>
          <div className="h-3 w-full rounded-full bg-rule/50 overflow-hidden flex">
            <div className="h-full w-[30%] bg-status-approved/20 border-r border-surface" />
            <div className="h-full w-[40%] bg-status-review/20 border-r border-surface" />
            <div className="h-full w-[30%] bg-status-denied/20" />
          </div>
          {/* Needle indicator */}
          <div className="relative w-full h-2">
            <div
              className={`absolute top-0 -translate-x-1/2 w-3 h-3 rounded-full ${band.barColor} shadow-sm border border-surface`}
              style={{ left: `${Math.min(100, Math.max(0, score))}%` }}
              title={`Score: ${score}/100`}
            />
          </div>
        </div>

        {/* Identified Risk Drivers */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider block">
            Identified Risk Factors & Rule Flags
          </span>

          {riskDrivers.length > 0 || ruleFlags.length > 0 ? (
            <div className="space-y-2">
              {riskDrivers.map((driver: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-input bg-status-review-bg/40 border border-status-review/20 text-xs"
                >
                  <AlertTriangle className="h-4 w-4 text-status-review shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-ink">Risk Factor: </span>
                    <span className="text-muted">{driver}</span>
                  </div>
                </div>
              ))}

              {ruleFlags.map((flag: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-input bg-status-denied-bg/40 border border-status-denied/20 text-xs"
                >
                  <ShieldAlert className="h-4 w-4 text-status-denied shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-status-denied">Rule Flag: </span>
                    <span className="text-ink">{flag}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-input bg-status-approved-bg/30 text-status-approved text-xs border border-status-approved/20">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>No elevated anomaly indicators or red flags detected. Clean profile.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
