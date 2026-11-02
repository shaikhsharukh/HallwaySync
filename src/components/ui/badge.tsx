import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'brand' | 'outline' | 'role' | 'availability';
  color?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  color,
  style,
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium select-none transition-colors';

  const variants = {
    default: 'bg-surface-raised text-slate-300 border border-surface-border',
    brand: 'bg-brand-500/10 text-brand-400 border border-brand-500/20',
    outline: 'border border-surface-border text-slate-400 bg-transparent',
    role: 'border font-medium',
    availability: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
  };

  const customStyle = color
    ? {
        backgroundColor: `${color}15`,
        borderColor: `${color}35`,
        color: color,
        ...style,
      }
    : style;

  return (
    <span
      className={cn(base, variants[variant], className)}
      style={customStyle}
      {...props}
    >
      {children}
    </span>
  );
};
