import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  helperText?: string;
  showCount?: boolean;
  maxLength?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error, label, helperText, showCount, maxLength, id, value, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const count = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-medium text-ink mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          maxLength={maxLength}
          className={`flex min-h-[80px] w-full rounded-input border border-field-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-status-processing focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
            error ? 'border-status-denied focus:ring-status-denied' : ''
          } ${className}`}
          {...props}
        />
        <div className="flex justify-between items-center mt-1">
          {error ? (
            <p className="text-xs text-status-denied">{error}</p>
          ) : helperText ? (
            <p className="text-xs text-muted">{helperText}</p>
          ) : (
            <span />
          )}
          {showCount && (
            <span className="text-xs text-muted tnum">
              {count}
              {maxLength ? ` / ${maxLength}` : ' characters'}
            </span>
          )}
        </div>
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
