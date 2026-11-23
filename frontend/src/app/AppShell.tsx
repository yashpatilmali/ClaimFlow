import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { GlossaryDrawer } from './GlossaryDrawer';
import { X, Info } from 'lucide-react';

export const AppShell: React.FC = () => {
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [noticeDismissed, setNoticeDismissed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      {/* Dismissible Synthetic Data Notice */}
      {!noticeDismissed && (
        <aside
          aria-label="Demo environment notice"
          className="bg-paper border-b border-rule/80 px-4 py-1.5 text-xs text-muted flex items-center justify-between text-center select-none"
        >
          <div className="flex items-center justify-center gap-1.5 w-full">
            <Info className="h-3.5 w-3.5 text-muted shrink-0" />
            <span>Demo environment. All policies, people, and claims are synthetic.</span>
          </div>
          <button
            onClick={() => setNoticeDismissed(true)}
            className="p-0.5 rounded-tag hover:bg-rule/50 text-muted hover:text-ink transition-colors ml-2"
            title="Dismiss notice"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </aside>
      )}

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar onOpenGlossary={() => setGlossaryOpen(true)} />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Glossary Drawer */}
      <GlossaryDrawer open={glossaryOpen} onOpenChange={setGlossaryOpen} />
    </div>
  );
};
