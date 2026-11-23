import React from 'react';
import { Slot } from '@radix-ui/react-slot';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', asChild = false, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    const baseStyles =
      'inline-flex items-center justify-center font-sans font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-processing disabled:pointer-events-none disabled:opacity-50 select-none';

    const variants = {
      primary: 'bg-ink text-surface hover:bg-opacity-90 active:bg-opacity-95',
      secondary: 'bg-paper text-ink hover:bg-rule active:bg-opacity-80 border border-rule',
      outline: 'bg-surface text-ink border border-field-border hover:bg-paper',
      ghost: 'bg-transparent text-ink hover:bg-paper',
      danger: 'bg-status-denied text-surface hover:bg-opacity-90',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs rounded-input gap-1.5',
      md: 'h-10 px-4 text-sm rounded-input gap-2',
      lg: 'h-11 px-5 text-base rounded-input gap-2.5',
    };

    return (
      <Comp
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
