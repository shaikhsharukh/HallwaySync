import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-surface-card border border-surface-border rounded-2xl p-4 sm:p-5 shadow-card transition-all duration-200',
        hoverable && 'hover:border-surface-highlight hover:bg-surface-raised cursor-pointer',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';
