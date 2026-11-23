import React from 'react';

export const ReviewQueuePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Adjuster Review Queue</h1>
        <p className="text-sm text-muted mt-1 prose-reading">
          Claims paused for governance review, exclusions, or elevated fraud risk.
        </p>
      </div>
    </div>
  );
};
