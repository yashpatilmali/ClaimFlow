import React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Separator: React.FC<SeparatorProps> = ({ orientation = 'horizontal', className = '' }) => {
  return (
    <SeparatorPrimitive.Root
      orientation={orientation}
      className={`shrink-0 bg-rule ${
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]'
      } ${className}`}
    />
  );
};
