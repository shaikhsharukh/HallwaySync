import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { roomService } from './room-service';
import { Room } from '../../types/models';
import { EventCategory } from '../../types/database';
import {
  Sparkles,
  Terminal,
  Users,
  Calendar,
  QrCode,
  ShieldCheck,
  Zap,
  BarChart3,
  ArrowRight,
  Radio,
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
      description: 'Hacking tables 1-30. Mentor desks located by the coffee station. Team formation until 2 PM.',
    },
    {
      label: '☁️ AWS Cloud Summit',
      category: 'summit',
      title: 'Cloud Community Day 2026 - Networking Lounge',
      description: 'Networking hall for engineers, leads, and founders. Breakout zones by topic.',
    },
    {
      label: '☕ Builders Meetup & Social',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 3) {
      setError('Event title must be at least 3 characters.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const { room } = await roomService.createRoom({
        title,
        description,
        category,
      });
      onRoomCreated(room);
    } catch (err: any) {
      setError(err?.message || 'Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
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
      label: 'Hackathon Mode',
      icon: <Terminal className="w-4 h-4 text-brand-400" />,
      desc: 'Optimized for rapid team formation and complementary technical skill balance.',
      matchmakingHighlight: 'Matches Frontend ↔ Backend ↔ AI/ML ↔ Designers',
    },
    {
      id: 'summit',
      label: 'Tech Summit Mode',
      icon: <Calendar className="w-4 h-4 text-sky-400" />,
      desc: 'Cross-discipline discovery connecting developers, tech leads, PMs, and founders.',
      matchmakingHighlight: 'Matches Founders ↔ Engineers ↔ Product Leaders',
    },
    {
      id: 'meetup',
      label: 'Developer Meetup Mode',
      icon: <Users className="w-4 h-4 text-purple-400" />,
      desc: 'Casual peer networking, lightning discussions, and local community collaboration.',
      matchmakingHighlight: 'Matches Shared Tech Stacks & Learning Goals',
    },
  ];

  return (
    <main className="max-w-3xl mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in duration-300 pb-16">
      {/* HERO SECTION */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-Time In-Person Event Networking • Zero App Downloads</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          Create an Event Networking Hall
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          Project a live QR code on stage. Attendees scan with their phone camera to onboard in{' '}
          <span className="text-slate-200 font-semibold">&lt;45 seconds</span>, discover complementary teammates, exchange contact handles, and view live hall activity.
        </p>
      </div>

      {/* 3-STEP EXPLAINER CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-surface-card border border-surface-border rounded-2xl space-y-1.5 shadow-sm">
          <div className="w-7 h-7 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-xs">
            1
          </div>
          <h2 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5 text-brand-400" />
            Project QR on Stage
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Create your room and display the dynamic QR code on screen or venue banners.
          </p>
        </div>

        <div className="p-4 bg-surface-card border border-surface-border rounded-2xl space-y-1.5 shadow-sm">
          <div className="w-7 h-7 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-xs">
            2
          </div>
          <h2 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            &lt;45s Phone Onboard
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Attendees scan to pick role, skills & intent. Zero app install or account creation.
          </p>
        </div>

        <div className="p-4 bg-surface-card border border-surface-border rounded-2xl space-y-1.5 shadow-sm">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
            3
          </div>
          <h2 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            Connect & Moderate
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Attendees swap contacts via waves; organizers track live stats & broadcast stage alerts.
          </p>
        </div>
      </div>

      {/* QUICK PRESETS BANNER */}
      <div className="p-4 bg-surface-card/60 border border-surface-border/80 rounded-2xl space-y-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
          Quick Start Presets (Click to autofill):
        </span>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-xs px-3 py-1.5 bg-surface-raised border border-surface-border hover:border-brand-500/60 hover:bg-brand-500/10 text-slate-200 rounded-xl transition-all"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN FORM CARD */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-surface-card border border-surface-border p-6 sm:p-8 rounded-3xl shadow-card"
      >
        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
            {error}
          </div>
        )}

        <Input
          label="Event or Hall Title *"
          placeholder="e.g. Supabase Hackathon 2026 - Main Hall"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={100}
          autoFocus
        />

        {/* FORMAT SELECTOR */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300">
            Event Format & Matchmaking Logic *
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {categories.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`min-h-[50px] p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all select-none ${
                    isSelected
                      ? 'bg-brand-500/10 border-brand-500 text-slate-100 shadow-emerald'
                      : 'bg-surface-raised border-surface-border text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{cat.icon}</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-100">{cat.label}</h4>
                      {isSelected && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-mono">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">{cat.desc}</p>
                    <div className="text-[10px] text-brand-400/90 font-mono font-medium flex items-center gap-1 pt-0.5">
                      <Radio className="w-3 h-3 shrink-0" />
                      <span>{cat.matchmakingHighlight}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <Input
          label="Description / Venue Guidelines (Optional)"
          placeholder="e.g. Table 1-20 are hacking zones. Coffee station at the back. Mentors wearing green badges."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={300}
        />

        <Button type="submit" size="lg" isLoading={isLoading} className="w-full text-sm font-semibold">
          <span>Launch Room & Generate Stage QR Code</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </form>

      {/* FEATURE PILLARS FOOTER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs text-slate-400 pt-2">
        <div className="p-2.5 rounded-xl bg-surface-card/40 border border-surface-border/50">
          <ShieldCheck className="w-4 h-4 text-brand-400 mx-auto mb-1" />
          <span className="font-semibold text-slate-300 block">Privacy-First</span>
          <span>Handles hidden until mutual match</span>
        </div>
        <div className="p-2.5 rounded-xl bg-surface-card/40 border border-surface-border/50">
          <Zap className="w-4 h-4 text-sky-400 mx-auto mb-1" />
          <span className="font-semibold text-slate-300 block">&lt;45s Onboard</span>
          <span>Anonymous session, zero app install</span>
        </div>
        <div className="p-2.5 rounded-xl bg-surface-card/40 border border-surface-border/50">
          <Radio className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <span className="font-semibold text-slate-300 block">Live Presence</span>
          <span>Proximity radar & auto-expiring status</span>
        </div>
        <div className="p-2.5 rounded-xl bg-surface-card/40 border border-surface-border/50">
          <BarChart3 className="w-4 h-4 text-brand-400 mx-auto mb-1" />
          <span className="font-semibold text-slate-300 block">Demographics</span>
          <span>Real-time charts & clean CSV export</span>
        </div>
      </div>
    </main>
  );
};
