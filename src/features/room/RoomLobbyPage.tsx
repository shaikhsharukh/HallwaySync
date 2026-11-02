import React from 'react';
import { Room } from '../../types/models';
import { QRCodeDisplay } from '../../components/QRCodeDisplay';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Sparkles,
  ArrowRight,
  LayoutDashboard,
  Tv,
  Users,
  ShieldCheck,
  Megaphone,
  BarChart2,
} from 'lucide-react';

export interface RoomLobbyPageProps {
  room: Room;
  isCreator: boolean;
  onJoinClick: () => void;
  onDashboardClick?: () => void;
}

export const RoomLobbyPage: React.FC<RoomLobbyPageProps> = ({
  room,
  isCreator,
  onJoinClick,
  onDashboardClick,
}) => {
  const joinUrl = `${window.location.origin}/#room=${room.slug}`;

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-300 pb-16">
      {/* HOST / STAGE PROJECTOR NOTICE */}
      {isCreator && (
        <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-start gap-3 text-left">
          <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 shrink-0 mt-0.5">
            <Tv className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                Stage & Projector Presentation Mode
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-mono">
                Host
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Display this screen on your venue projector or slides. When attendees point their phone camera at the QR code, they immediately enter the{' '}
              <span className="text-slate-100 font-semibold">&lt;45s onboarding flow</span>.
            </p>
          </div>
        </div>
      )}

      {/* EVENT HEADER */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Badge variant="brand" className="uppercase font-mono tracking-wider text-xs">
            {room.category} Hall
          </Badge>
          <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live & Ready
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          {room.title}
        </h1>
        {room.description && (
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            {room.description}
          </p>
        )}
      </div>

      {/* QR CODE PRESENTATION CONTAINER */}
      <QRCodeDisplay
        value={joinUrl}
        size={220}
        title="Scan with Phone to Join Hall"
        subtitle="Open your camera to find teammates, exchange contact handles, and connect in real time."
        showActions={true}
      />

      {/* PRIMARY ACTIONS */}
      <div className="space-y-3 pt-2">
        {/* Join Button */}
        <Button size="lg" onClick={onJoinClick} className="w-full text-sm font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>{isCreator ? 'Preview Attendee Experience (<45s)' : 'Join Room As Attendee'}</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>

        {/* Organizer Command Center Action */}
        {isCreator && onDashboardClick && (
          <div className="p-4 bg-surface-card border border-surface-border rounded-2xl space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <LayoutDashboard className="w-3.5 h-3.5 text-brand-400" />
                  Organizer Command Center
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Live demographics, real-time stage announcements, participant moderation, and 1-click CSV export.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={onDashboardClick}
                className="shrink-0 font-medium"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-[10px] text-slate-400 border-t border-surface-border/60">
              <div className="flex items-center gap-1">
                <Megaphone className="w-3 h-3 text-brand-400" />
                <span>Live Alerts</span>
              </div>
              <div className="flex items-center gap-1">
                <BarChart2 className="w-3 h-3 text-purple-400" />
                <span>Demographics</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-sky-400" />
                <span>CSV Export</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER BADGES */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-surface-border/60">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
          <span>Anonymous Authentication</span>
        </span>
        <span>•</span>
        <span>Zero App Store Downloads</span>
        <span>•</span>
        <span>Supabase Realtime Powered</span>
      </div>
    </div>
  );
};
