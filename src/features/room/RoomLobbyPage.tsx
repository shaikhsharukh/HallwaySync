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
    <div className="max-w-xl lg:max-w-5xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-300 pb-12">
      {/* 2-COLUMN DESKTOP COMMAND LAYOUT FOR HOSTS, 1-COLUMN FOR ATTENDEES */}
      <div className={isCreator ? "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" : "space-y-6 max-w-xl mx-auto"}>
        
        {/* LEFT COLUMN: EVENT HEADER & STAGE QR CODE */}
        <div className={isCreator ? "lg:col-span-7 space-y-4" : "space-y-6"}>
          {/* EVENT HEADER */}
          <div className="text-center lg:text-left space-y-2 bg-surface-card border border-surface-border p-4 sm:p-5 rounded-2xl shadow-card">
            <div className="flex items-center justify-center lg:justify-start gap-2 flex-wrap">
              <Badge variant="brand" className="uppercase font-mono tracking-wider text-xs">
                {room.category} Hall
              </Badge>
              <span className="text-xs text-emerald-500 dark:text-emerald-400 font-mono flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live & Ready
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {room.title}
            </h1>
            {room.description && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {room.description}
              </p>
            )}
          </div>

          {/* QR CODE PRESENTATION CONTAINER */}
          <QRCodeDisplay
            value={joinUrl}
            size={isCreator ? 190 : 220}
            title="Scan with Phone to Join Hall"
            subtitle="Open your camera to find teammates, exchange contact handles, and connect in real time."
            showActions={true}
          />

          {/* NON-CREATOR JOIN CTA */}
          {!isCreator && (
            <Button size="lg" onClick={onJoinClick} className="w-full text-sm font-semibold min-h-[48px]">
              <Sparkles className="w-4 h-4" />
              <span>Join Room As Attendee</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}

          {/* FOOTER BADGES */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-surface-border/60">
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

        {/* RIGHT COLUMN: HOST COMMAND & ATTENDEE PREVIEW (ONLY FOR CREATOR) */}
        {isCreator && (
          <div className="lg:col-span-5 space-y-4">
            {/* HOST / STAGE PROJECTOR NOTICE */}
            <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-start gap-3 text-left">
              <div className="p-2 rounded-xl bg-brand-500/20 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5">
                <Tv className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                    Stage & Projector Presentation Mode
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-700 dark:text-brand-300 font-mono font-semibold">
                    Host
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  Display this screen on your venue projector or slides. When attendees point their phone camera at the QR code, they immediately enter the{' '}
                  <span className="text-slate-900 dark:text-slate-100 font-semibold">&lt;45s onboarding flow</span>.
                </p>
              </div>
            </div>

            {/* ORGANIZER COMMAND CENTER CARD */}
            {onDashboardClick && (
              <div className="p-4 sm:p-5 bg-surface-card border border-surface-border rounded-2xl space-y-3.5 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                      <LayoutDashboard className="w-3.5 h-3.5 text-brand-400" />
                      Organizer Command Center
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Live demographics, real-time stage announcements, participant moderation, and 1-click CSV export.
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={onDashboardClick}
                  className="w-full text-xs font-semibold min-h-[44px]"
                >
                  <LayoutDashboard className="w-4 h-4 mr-1.5" />
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </Button>

                <div className="grid grid-cols-3 gap-2 pt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-surface-border/60">
                  <div className="flex items-center gap-1">
                    <Megaphone className="w-3 h-3 text-brand-400" />
                    <span>Live Alerts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart2 className="w-3 h-3 text-emerald-400" />
                    <span>Demographics</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-sky-400" />
                    <span>CSV Export</span>
                  </div>
                </div>
              </div>
            )}

            {/* ATTENDEE EXPERIENCE PREVIEW */}
            <div className="p-4 bg-surface-card border border-surface-border rounded-2xl space-y-2.5 shadow-card">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block">
                Attendee Walkthrough
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Test the mobile participant flow yourself before doors open.
              </p>
              <Button size="lg" onClick={onJoinClick} className="w-full text-xs sm:text-sm font-semibold min-h-[48px]">
                <Sparkles className="w-4 h-4" />
                <span>Preview Attendee Experience (&lt;45s)</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
