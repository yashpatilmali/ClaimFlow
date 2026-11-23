import React from 'react';
import { CheckCircle2, AlertCircle, XCircle, ShieldAlert, Loader2 } from 'lucide-react';
import { getStatusMeta } from '../../lib/status';

export interface StatusTagProps {
  status: string | null | undefined;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusTag: React.FC<StatusTagProps> = ({ status, className = '', size = 'md' }) => {
  const meta = getStatusMeta(status);

  const styleByCategory = {
    approved: 'bg-status-approved-bg text-status-approved border-status-approved/20',
    review: 'bg-status-review-bg text-status-review border-status-review/20',
    denied: 'bg-status-denied-bg text-status-denied border-status-denied/20',
    siu: 'bg-status-siu-bg text-status-siu border-status-siu/20',
    processing: 'bg-status-processing-bg text-status-processing border-status-processing/20',
  };

  const IconComponent = () => {
    const iconSize = size === 'sm' ? 12 : 14;
    switch (meta.icon) {
      case 'check-circle':
        return <CheckCircle2 size={iconSize} className="shrink-0" />;
      case 'alert-circle':
        return <AlertCircle size={iconSize} className="shrink-0" />;
      case 'x-circle':
        return <XCircle size={iconSize} className="shrink-0" />;
      case 'shield-alert':
        return <ShieldAlert size={iconSize} className="shrink-0" />;
      case 'loader':
      default:
        return <Loader2 size={iconSize} className="shrink-0 animate-spin" />;
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : 'px-2.5 py-1 text-xs gap-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-tag border select-none ${styleByCategory[meta.category]} ${sizeClasses} ${className}`}
      title={meta.description}
    >
      <IconComponent />
      <span>{meta.label}</span>
    </span>
  );
};
