import React from 'react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Claims Adjudication Desk</h1>
        <p className="text-sm text-muted mt-1 prose-reading">
          Select a sample claim to observe multi-agent orchestration, policy citations, and governance.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={() => navigate('/claims/new')}>Submit a claim</Button>
        <Button variant="outline" onClick={() => navigate('/test-lab')}>Explore test lab</Button>
      </div>
    </div>
  );
};
