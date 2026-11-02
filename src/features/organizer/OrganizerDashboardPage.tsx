import React, { useState, useMemo } from 'react';
import { Room, Attendee } from '../../types/models';
import { organizerService } from './organizer-service';
import { DemographicCharts } from './DemographicCharts';
import { AvatarBadge } from '../../components/AvatarBadge';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { getRoleColor } from '../../lib/utils';
import {
  Users,
  Download,
  Megaphone,
  Sparkles,
  Ban,
  ArrowLeft,
  Activity,
  Send,
  Info,
} from 'lucide-react';

export interface OrganizerDashboardPageProps {
  room: Room;
  attendees: Attendee[];
  onBackToRoom: () => void;
  onPostAnnouncement: (title: string, message: string) => Promise<void>;
  onBanAttendee: (attendeeId: string) => Promise<void>;
}

export const OrganizerDashboardPage: React.FC<OrganizerDashboardPageProps> = ({
  room,
  attendees,
  onBackToRoom,
  onPostAnnouncement,
  onBanAttendee,
}) => {
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  const announcementTemplates = [
    {
      title: '🍕 Food & Refreshments Ready',
      message: 'Lunch is now served in Hall B. Vegetarian and halal options available at Station 1.',
    },
    {
      title: '⏰ 1 Hour Until Hacking Deadline',
      message: 'Please push your project repositories and complete Devpost submissions before 4:00 PM.',
    },
    {
      title: '🏆 Presentation Demos on Main Stage',
      message: 'Top 10 teams please assemble at the front stage for lightning presentations.',
    },
    {
      title: '🤝 Mentor Hours Available',
      message: 'Cloud and AI mentors are stationed at Tables 1-5 for project feedback.',
    },
  ];

  const analytics = useMemo(() => {
    return organizerService.calculateAnalytics(attendees);
  }, [attendees]);

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementMessage.trim()) return;
    setIsPosting(true);
    try {
      await onPostAnnouncement(announcementTitle, announcementMessage);
      setAnnouncementTitle('');
      setAnnouncementMessage('');
      setPostSuccess(true);
      setTimeout(() => setPostSuccess(false), 3000);
    } finally {
      setIsPosting(false);
    }
  };

  const handleExportCSV = () => {
    organizerService.downloadCSV(room.slug, attendees);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 pb-24 animate-in fade-in duration-300">
      {/* TOP NAVIGATION & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <button
            onClick={onBackToRoom}
            className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-semibold mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projector QR Lobby</span>
          </button>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100">
              {room.title}
            </h1>
            <Badge variant="brand" className="uppercase font-mono text-[10px]">
              Command Center
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Live demographic intelligence, stage broadcast alerts, and participant moderation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="md"
            variant="primary"
            onClick={handleExportCSV}
            className="min-h-[44px] text-xs font-semibold"
          >
            <Download className="w-4 h-4 mr-1.5" />
            <span>Export Sanitized CSV</span>
          </Button>
        </div>
      </div>

      {/* INTUITIVE PURPOSE BANNER */}
      <div className="p-4 bg-surface-card border border-surface-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-100 block mb-0.5">
              How the Organizer Center Works
            </span>
            <span className="text-slate-400 leading-relaxed block">
              You have full operational control over this room: broadcast instant banners to all active phone screens, review technical role balance to guide mentors, and moderate participants.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-[11px] font-mono text-slate-400 border-t sm:border-t-0 sm:border-l border-surface-border pt-2 sm:pt-0 sm:pl-3">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Realtime Connected
          </span>
        </div>
      </div>

      {/* METRIC CARDS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-surface-card border border-surface-border rounded-2xl shadow-card">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Users className="w-4 h-4 text-brand-400" />
            <span>Total Registered</span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-2">
            {analytics.totalAttendees}
          </p>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
            Joined via mobile QR scan
          </span>
        </div>

        <div className="p-4 bg-surface-card border border-surface-border rounded-2xl shadow-card">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Active & Available</span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-2">
            {analytics.activeNow}
          </p>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
            Status: Available to chat
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 bg-surface-card border border-surface-border rounded-2xl shadow-card">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Distinct Skills</span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-400 mt-2">
            {analytics.topSkills.length}
          </p>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
            Unique tech competencies
          </span>
        </div>
      </div>

      {/* DEMOGRAPHIC CHARTS */}
      <DemographicCharts analytics={analytics} />

      {/* BROADCAST ANNOUNCEMENT CARD */}
      <div className="bg-surface-card border border-surface-border p-5 rounded-3xl shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Broadcast Real-Time Stage Announcement
            </h3>
          </div>
          <span className="text-[10px] font-mono text-brand-400 px-2 py-0.5 rounded-full bg-brand-500/10">
            Instant Push to Attendees
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Pushes an immediate, sticky notification banner to the top of every attendee screen currently in this networking hall via Supabase Realtime broadcast.
        </p>

        {/* 1-CLICK QUICK TEMPLATES */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Quick Templates (Click to fill):
          </span>
          <div className="flex flex-wrap gap-2">
            {announcementTemplates.map((tmpl) => (
              <button
                key={tmpl.title}
                type="button"
                onClick={() => {
                  setAnnouncementTitle(tmpl.title);
                  setAnnouncementMessage(tmpl.message);
                }}
                className="text-xs px-2.5 py-1 bg-surface-raised border border-surface-border hover:border-brand-500 text-slate-300 rounded-xl transition-all"
              >
                {tmpl.title}
              </button>
            ))}
          </div>
        </div>

        {postSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold">
            ✓ Announcement broadcasted live to all attendee screens!
          </div>
        )}

        <form onSubmit={handlePostAnnouncement} className="space-y-3 pt-1">
          <Input
            label="Banner Title"
            placeholder="e.g. Lunch is served in Hall B"
            value={announcementTitle}
            onChange={(e) => setAnnouncementTitle(e.target.value)}
            required
            maxLength={60}
          />
          <Input
            label="Message Content"
            placeholder="e.g. Vegetarian and gluten-free options available at Counter 2."
            value={announcementMessage}
            onChange={(e) => setAnnouncementMessage(e.target.value)}
            required
            maxLength={280}
          />
          <Button
            type="submit"
            size="md"
            isLoading={isPosting}
            className="min-h-[44px] text-xs font-semibold"
          >
            <Send className="w-4 h-4 mr-1.5" />
            <span>Publish Broadcast to Attendees</span>
          </Button>
        </form>
      </div>

      {/* LIVE ATTENDEE MODERATION ROSTER */}
      <div className="bg-surface-card border border-surface-border rounded-3xl p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-bold text-slate-100">Live Attendee Roster & Moderation</h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Banning hides the profile from all participant discovery and directory queries immediately.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 px-2.5 py-1 bg-surface-raised rounded-full border border-surface-border">
            {attendees.length} in roster
          </span>
        </div>

        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead>
              <tr className="border-b border-surface-border text-slate-400 font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">Participant</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Skills</th>
                <th className="py-2.5 px-3">Intent</th>
                <th className="py-2.5 px-3 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/60">
              {attendees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No attendees have joined this room yet. Share the stage QR code to begin onboarding!
                  </td>
                </tr>
              ) : (
                attendees.map((attendee) => {
                  const roleColor = getRoleColor(attendee.role);

                  return (
                    <tr key={attendee.id} className="hover:bg-surface-raised/40 transition-colors">
                      <td className="py-3 px-3 flex items-center gap-2.5">
                        <AvatarBadge
                          name={attendee.display_name}
                          githubHandle={attendee.avatar_github}
                          color={attendee.avatar_color}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-200 block truncate max-w-[120px]">
                            {attendee.display_name}
                          </span>
                          {attendee.contact_handle && (
                            <span className="text-[10px] text-slate-400 font-mono block truncate max-w-[120px]">
                              {attendee.contact_handle}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <Badge variant="role" color={roleColor}>
                          {attendee.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-slate-300 line-clamp-1 max-w-[180px]">
                          {attendee.skills.slice(0, 3).join(', ')}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-brand-300 line-clamp-1 max-w-[140px]">
                          {attendee.intent.join(', ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {attendee.is_banned ? (
                          <span className="text-rose-400 font-semibold text-[10px] px-2 py-0.5 rounded bg-rose-500/10">
                            Banned
                          </span>
                        ) : (
                          <button
                            onClick={() => onBanAttendee(attendee.id)}
                            className="min-h-[36px] px-2.5 py-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold"
                            title="Ban attendee from room"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Ban</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
