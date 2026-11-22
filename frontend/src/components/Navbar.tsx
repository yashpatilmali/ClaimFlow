import React from 'react';
import { ShieldCheck, Activity, Users, BarChart3, Cpu, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'submit' | 'graph' | 'hitl' | 'kpis';
  setActiveTab: (tab: 'submit' | 'graph' | 'hitl' | 'kpis') => void;
  pendingHITLCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, pendingHITLCount }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('submit')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">ClaimFlow <span className="text-cyan-400">AI</span></span>
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-blue-900/60 text-blue-300 border border-blue-700/50 rounded-full">
                ValueMomentum Edition
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Multi-Agent P&C Claims Orchestrator</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'submit'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Submit & Demos</span>
          </button>

          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'graph'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Agent Orchestrator</span>
          </button>

          <button
            onClick={() => setActiveTab('hitl')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
              activeTab === 'hitl'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Adjuster Queue</span>
            {pendingHITLCount > 0 && (
              <span className="px-1.5 py-0.5 text-xs font-bold bg-amber-500 text-slate-950 rounded-full animate-pulse">
                {pendingHITLCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('kpis')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'kpis'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Operations KPIs</span>
          </button>
        </nav>

        {/* Status Pill */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-3"></span>
          <span className="font-medium">LangGraph Engine Active</span>
        </div>
      </div>
    </header>
  );
};
