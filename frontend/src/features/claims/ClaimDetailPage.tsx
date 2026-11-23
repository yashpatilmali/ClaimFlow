import React from 'react';
import { useParams } from 'react-router-dom';

export const ClaimDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Claim {id}</h1>
        <p className="text-sm text-muted mt-1 prose-reading">
          Case file and multi-agent execution pipeline.
        </p>
      </div>
    </div>
  );
};
