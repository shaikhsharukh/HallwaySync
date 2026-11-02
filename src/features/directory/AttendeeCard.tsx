import React from 'react';
import { Attendee } from '../../types/models';
import { AvatarBadge } from '../../components/AvatarBadge';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { getRoleColor } from '../../lib/utils';
import { HandMetal, MapPin, Check, Sparkles } from 'lucide-react';

export interface AttendeeCardProps {
  attendee: Attendee;
  isSelf: boolean;
  connectionStatus?: 'pending' | 'connected' | 'none';
  onCardClick: () => void;
  onWaveClick?: () => void;
}

export const AttendeeCard: React.FC<AttendeeCardProps> = ({
  attendee,
  isSelf,
  connectionStatus = 'none',
  onCardClick,
  onWaveClick,
}) => {
  const roleColor = getRoleColor(attendee.role);

  return (
    <div
      onClick={onCardClick}
      className="group relative bg-surface-card border border-surface-border hover:border-surface-highlight hover:bg-surface-raised rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-card flex flex-col justify-between"
    >
      <div>
        {/* Top Header: Avatar + Identity + Wave Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <AvatarBadge
              name={attendee.display_name}
              githubHandle={attendee.avatar_github}
              color={attendee.avatar_color}
              size="md"
              isAvailable={attendee.is_available_to_chat}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm font-bold text-slate-100 truncate group-hover:text-brand-300 transition-colors">
                  {attendee.display_name}
                </h3>
                {isSelf && (
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 font-semibold">
                    You
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <Badge variant="role" color={roleColor}>
                  {attendee.role}
                </Badge>
                {attendee.is_available_to_chat && (
                  <Badge variant="availability">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Available</span>
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Action Button: Wave or Connected */}
          {!isSelf && onWaveClick && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (connectionStatus === 'none') onWaveClick();
              }}
              className="shrink-0"
            >
              {connectionStatus === 'connected' ? (
                <div className="min-h-[44px] px-3 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-400 flex items-center gap-1.5 text-xs font-semibold select-none">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Connected</span>
                </div>
              ) : connectionStatus === 'pending' ? (
                <div className="min-h-[44px] px-3 rounded-xl bg-surface-border text-slate-400 flex items-center gap-1.5 text-xs font-medium select-none">
                  <HandMetal className="w-4 h-4" />
                  <span>Waved</span>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  className="min-h-[44px] px-3.5 hover:border-brand-500/40 hover:text-brand-300"
                >
                  <HandMetal className="w-4 h-4 text-brand-400" />
                  <span>Wave</span>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Micro-Location Zone */}
        {attendee.current_zone && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">{attendee.current_zone}</span>
          </div>
        )}

        {/* Headline */}
        {attendee.headline && (
          <p className="text-xs text-slate-300 mt-2 line-clamp-1">
            {attendee.headline}
          </p>
        )}
      </div>

      {/* Skills & Intent Pills */}
      <div className="mt-3 pt-3 border-t border-surface-border/60 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {attendee.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-surface-raised border border-surface-border text-slate-300"
            >
              {skill}
            </span>
          ))}
          {attendee.skills.length > 3 && (
            <span className="text-[10px] text-slate-400 self-center">
              +{attendee.skills.length - 3}
            </span>
          )}
        </div>

        {attendee.intent.length > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-brand-400 font-medium truncate">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span className="truncate">{attendee.intent.join(' • ')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
