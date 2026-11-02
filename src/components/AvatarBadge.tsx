import React, { useState } from 'react';
import { generateInitials, cn } from '../lib/utils';

export interface AvatarBadgeProps {
  name: string;
  githubHandle?: string | null;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isAvailable?: boolean;
  className?: string;
}

export const AvatarBadge: React.FC<AvatarBadgeProps> = ({
  name,
  githubHandle,
  color = '#3ECF8E',
  size = 'md',
  isAvailable = false,
  className,
}) => {
  const [imgError, setImgError] = useState(false);
  const initials = generateInitials(name);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm', // 44px
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl font-bold',
  };

  const indicatorSize = {
    sm: 'w-2.5 h-2.5 bottom-0 right-0',
    md: 'w-3.5 h-3.5 bottom-0 right-0',
    lg: 'w-4 h-4 bottom-0.5 right-0.5',
    xl: 'w-5 h-5 bottom-1 right-1',
  };

  const hasGithub = githubHandle && !imgError;
  const githubAvatarUrl = githubHandle
    ? `https://github.com/${githubHandle.replace('@', '').trim()}.png`
    : undefined;

  return (
    <div className={cn('relative inline-block shrink-0', className)}>
      <div
        className={cn(
          'rounded-2xl flex items-center justify-center font-semibold overflow-hidden border border-surface-border shadow-sm select-none',
          sizeClasses[size]
        )}
        style={{
          backgroundColor: hasGithub ? '#1b202a' : `${color}20`,
          borderColor: hasGithub ? '#2a3242' : `${color}40`,
          color: color,
        }}
      >
        {hasGithub ? (
          <img
            src={githubAvatarUrl}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {isAvailable && (
        <span
          className={cn(
            'absolute bg-emerald-400 rounded-full border-2 border-surface-card ring-2 ring-emerald-500/30 animate-pulse',
            indicatorSize[size]
          )}
          title="Available to chat right now"
        />
      )}
    </div>
  );
};
