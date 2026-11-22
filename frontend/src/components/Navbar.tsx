import React from 'react';
import { ShieldCheck, Cpu, Users, BarChart3, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'submit' | 'graph' | 'hitl' | 'kpis';
  setActiveTab: (tab: 'submit' | 'graph' | 'hitl' | 'kpis') => void;
  pendingHITLCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, pendingHITLCount }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div 
          className="flex items-center gap-3 cursor-pointer self-start sm:self-auto" 
          onClick={() => setActiveTab('submit')}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-white tracking-tight">
                ClaimFlow <span className="text-cyan-400">AI</span>
              </span>
              <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50 rounded-full">
                ValueMomentum
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Smart Multi-Agent Auto Claims System</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'submit'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1. Test Lab & Claims</span>
          </button>

          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'graph'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>2. AI Agents Live View</span>
          </button>

          <button
            onClick={() => setActiveTab('hitl')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap relative ${
              activeTab === 'hitl'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>3. Human Review Queue</span>
            {pendingHITLCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full animate-pulse ml-1">
                {pendingHITLCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('kpis')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'kpis'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>4. Operations KPIs</span>
          </button>
        </nav>

        {/* Engine Status Pill */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-3"></span>
          <span className="font-medium text-[11px]">LangGraph Multi-Agent Ready</span>
        </div>
      </div>
    </header>
  );
};
