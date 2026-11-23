import React from 'react';

export const ClaimsListPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Claims Directory</h1>
        <p className="text-sm text-muted mt-1 prose-reading">
          Search and review submitted auto insurance claims.
        </p>
      </div>
    </div>
  );
};
