import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { roomService } from './room-service';
import { Room } from '../../types/models';
import { EventCategory } from '../../types/database';
import {
  Terminal,
  Users,
  Calendar,
  QrCode,
  ShieldCheck,
  Zap,
  ArrowRight,
  Radio,
  Tv,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export interface CreateRoomPageProps {
  onRoomCreated: (room: Room) => void;
}

interface PresetOption {
  label: string;
  category: EventCategory;
  title: string;
  description: string;
}

export const CreateRoomPage: React.FC<CreateRoomPageProps> = ({ onRoomCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('hackathon');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presets: PresetOption[] = [
    {
      label: '🚀 Supabase AI Hackathon',
      category: 'hackathon',
      title: 'Supabase AI Hackathon 2026 - Main Hall',
      description: 'Hacking tables 1-30. Mentor desks by coffee station. Team formation until 2 PM.',
    },
    {
      label: '☁️ AWS Cloud Summit',
      category: 'summit',
      title: 'Cloud Community Day 2026 - Networking Lounge',
      description: 'Networking hall for engineers, leads, and founders. Breakout zones by topic.',
    },
    {
      label: '☕ Builders Meetup',
      category: 'meetup',
      title: 'Frontend & AI Builders Meetup',
      description: 'Casual lightning talks, demo sharing, and peer collaboration.',
    },
  ];

  const handleApplyPreset = (preset: PresetOption) => {
    setTitle(preset.title);
    setDescription(preset.description);
    setCategory(preset.category);
    setError(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || title.trim().length < 3) {
      setError('Event title must be at least 3 characters.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const { room } = await roomService.createRoom({
        title: title.trim(),
        description: description.trim(),
        category,
      });
      onRoomCreated(room);
    } catch (err: any) {
      setError(err?.message || 'Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  const categories: Array<{
    id: EventCategory;
    label: string;
    icon: React.ReactNode;
    desc: string;
    matchmakingHighlight: string;
  }> = [
    {
      id: 'hackathon',
      label: 'Hackathon',
      icon: <Terminal className="w-4 h-4 text-brand-400" />,
      desc: 'Balanced team formation',
      matchmakingHighlight: 'Matches Frontend ↔ Backend ↔ AI/ML ↔ Designers',
    },
    {
      id: 'summit',
      label: 'Tech Summit',
      icon: <Calendar className="w-4 h-4 text-sky-400" />,
      desc: 'Cross-role discovery',
      matchmakingHighlight: 'Matches Founders ↔ Engineers ↔ Product Leaders',
    },
    {
      id: 'meetup',
      label: 'Meetup',
      icon: <Users className="w-4 h-4 text-purple-400" />,
      desc: 'Peer collaboration',
      matchmakingHighlight: 'Matches Shared Tech Stacks & Learning Goals',
    },
  ];

  const activeCategory = categories.find((c) => c.id === category) || categories[0];

  return (
    <main
      onKeyDown={handleKeyDown}
      className="max-w-6xl mx-auto px-4 py-4 sm:py-6 lg:py-8 animate-in fade-in duration-300"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT COLUMN: PRIMARY ACTION COMMAND CENTER (Zero Scroll) */}
        <section className="lg:col-span-7 space-y-4">
          {/* COMPACT HERO HEADLINE */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-400 text-xs font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>Real-Time In-Person Event Networking • Zero App Downloads</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Create an Event Networking Hall
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Launch a live stage QR code for attendees to scan, onboard in &lt;45s, and start team matchmaking with zero app downloads.
            </p>
          </div>

          {/* MAIN FORM CARD */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-surface-card border border-surface-border p-5 sm:p-6 rounded-2xl shadow-card"
          >
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 dark:text-rose-300 text-xs flex items-center justify-between">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-xs underline hover:opacity-80"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* QUICK PRESETS (Inline Chip Cluster) */}
            <div className="space-y-1.5 pb-3 border-b border-surface-border/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                  Quick Start Templates:
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">Click to autofill</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="min-h-[36px] text-xs px-3 py-1.5 bg-surface-raised border border-surface-border hover:border-brand-500/60 hover:bg-brand-500/10 text-slate-700 dark:text-slate-200 rounded-xl transition-all"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* EVENT TITLE INPUT */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Event or Hall Title *
                </label>
                <span className="text-[11px] text-slate-400 font-mono">{title.length}/100</span>
              </div>
              <Input
                placeholder="e.g. Supabase AI Hackathon 2026 - Main Hall"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={100}
                autoFocus
              />
            </div>

            {/* FORMAT SELECTOR: COMPACT 3-COLUMN SEGMENTED SWITCH */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Event Format & Matchmaking Rules *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`min-h-[48px] p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all select-none ${
                        isSelected
                          ? 'bg-brand-500/10 border-brand-500 text-slate-900 dark:text-slate-100 shadow-emerald ring-1 ring-brand-500/40'
                          : 'bg-surface-raised border-surface-border text-slate-700 dark:text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="shrink-0">{cat.icon}</span>
                        {isSelected && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 font-mono font-medium">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="mt-1">
                        <h4 className="text-xs font-bold leading-tight truncate">{cat.label}</h4>
                        <p className="text-[11px] text-slate-400 leading-none truncate mt-0.5 hidden sm:block">{cat.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* DYNAMIC MATCHMAKING RULE HIGHLIGHT CALLOUT */}
              <div className="flex items-start sm:items-center gap-2 px-3 py-2 rounded-xl bg-surface-raised/70 border border-surface-border text-xs text-slate-600 dark:text-slate-300">
                <Radio className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5 sm:mt-0" />
                <div className="leading-snug">
                  <strong className="text-slate-900 dark:text-slate-100">{activeCategory.label} Mode:</strong>{' '}
                  <span className="font-mono text-brand-400/90">{activeCategory.matchmakingHighlight}</span>
                </div>
              </div>
            </div>

            {/* VENUE GUIDELINES (Optional) */}
            <Input
              label="Description / Venue Guidelines (Optional)"
              placeholder="e.g. Table 1-20 are hacking zones. Mentor desks by coffee station."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
            />

            {/* PRIMARY CTA & SHORTCUT HINT */}
            <div className="pt-1 space-y-1.5">
              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                className="w-full text-sm font-semibold min-h-[48px]"
              >
                <span>Launch Room & Generate Stage QR Code</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <p className="text-center text-[11px] text-slate-400 font-mono">
                Tip: Press <kbd className="px-1.5 py-0.5 bg-surface-raised border border-surface-border rounded text-slate-300">⌘+Enter</kbd> to launch immediately
              </p>
            </div>
          </form>
        </section>

        {/* RIGHT COLUMN: LIVE STAGE PREVIEW & WORKFLOW */}
        <aside className="lg:col-span-5 space-y-4">
          {/* SIMULATED STAGE PROJECTOR CARD */}
          <div className="p-4 sm:p-5 bg-surface-card border border-surface-border rounded-2xl shadow-card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-border/60">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5 text-brand-400" />
                  Stage Screen Preview
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">16:9 Display</span>
            </div>

            {/* MOCK PROJECTOR MONITOR FRAME */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-3 shadow-inner">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-[11px] font-mono">
                <span>{activeCategory.label} Live Hall</span>
              </div>

              <div className="space-y-1 px-2">
                <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">
                  {title.trim() || 'Your Event Title Will Appear Here'}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {description.trim() || 'Attendees scan below to enter directory & match teams.'}
                </p>
              </div>

              {/* MOCK QR CODE CONTAINER */}
              <div className="w-28 h-28 mx-auto p-2 bg-white rounded-xl shadow-lg flex flex-col items-center justify-center">
                <QrCode className="w-20 h-20 text-slate-950" />
                <span className="text-[8px] font-mono font-bold text-slate-700 uppercase tracking-tighter">
                  Scan to Join
                </span>
              </div>

              <p className="text-xs text-brand-400 font-medium">
                &lt;45s Phone Setup • Zero App Downloads
              </p>
            </div>

            {/* 3 WORKFLOW MILESTONES */}
            <div className="space-y-2 pt-1 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span><strong>Instant Projector Ready:</strong> Display the live QR badge on your stage screen or banner.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span><strong>Fast Attendee Onboarding:</strong> Participants choose skills, roles, and intents anonymously.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Live Waves & Matching:</strong> Instant contact exchange when both parties connect.</span>
              </div>
            </div>
          </div>

          {/* PRIVACY & PLATFORM GUARANTEES */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-surface-card border border-surface-border text-center space-y-1">
              <ShieldCheck className="w-4 h-4 text-brand-400 mx-auto" />
              <div className="font-semibold text-slate-900 dark:text-slate-200">Privacy-First</div>
              <div className="text-[11px] text-slate-400">Contacts hidden until mutual wave match</div>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-card border border-surface-border text-center space-y-1">
              <Zap className="w-4 h-4 text-sky-400 mx-auto" />
              <div className="font-semibold text-slate-900 dark:text-slate-200">No App Required</div>
              <div className="text-[11px] text-slate-400">Works directly in mobile browser</div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};
