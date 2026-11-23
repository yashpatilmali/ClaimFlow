import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'neutral' | 'warning' | 'danger' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({ className = '', variant = 'default', children, ...props }) => {
  const variants = {
    default: 'bg-ink/10 text-ink',
    neutral: 'bg-paper text-muted border border-rule',
    warning: 'bg-status-review-bg text-status-review border border-status-review/20',
    danger: 'bg-status-denied-bg text-status-denied border border-status-denied/20',
    info: 'bg-status-processing-bg text-status-processing border border-status-processing/20',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-tag text-xs font-medium tnum select-none ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
