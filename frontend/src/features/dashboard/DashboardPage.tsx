import React from 'react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Operations Dashboard</h1>
        <p className="text-sm text-muted mt-1 prose-reading">
          Real-time metrics: straight-through processing rates, triage speed, and financial impact.
        </p>
      </div>
    </div>
  );
};
