import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ProfessionalRole } from '../../types/database';
import { AttendeeProfileInput } from '../../types/models';
import { getRoleColor } from '../../lib/utils';
import { ArrowRight, ArrowLeft, Check, Sparkles, User, Code2, Target } from 'lucide-react';

export interface OnboardingWizardProps {
  roomTitle: string;
  roomCategory: string;
  onComplete: (profile: AttendeeProfileInput) => Promise<void>;
}

const ROLES: ProfessionalRole[] = [
  'Frontend',
  'Backend',
  'Fullstack',
  'AI/ML',
  'Mobile',
  'UI/UX',
  'Product',
  'Founder',
  'Other',
];

const SUGGESTED_SKILLS = [
  'TypeScript',
  'Python',
  'React',
  'Supabase',
  'Next.js',
  'PostgreSQL',
  'Rust',
  'PyTorch',
  'Tailwind CSS',
  'Go',
  'Docker',
  'Node.js',
];

const INTENTS = [
  'Looking for Team',
  'Need Devs / Hiring',
  'Looking for Co-founder',
  'Open to Chat / Network',
  'Looking for Mentor / Advice',
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  roomTitle,
  roomCategory,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<ProfessionalRole>('Fullstack');
  const [headline, setHeadline] = useState('');
  const [skills, setSkills] = useState<string[]>(['TypeScript', 'React']);
  const [customSkill, setCustomSkill] = useState('');
  const [intent, setIntent] = useState<string[]>(['Looking for Team']);
  const [contactHandle, setContactHandle] = useState('');
  const [avatarGithub, setAvatarGithub] = useState('');

  // Validation
  const [error, setError] = useState<string | null>(null);

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      if (skills.length >= 6) return;
      setSkills([...skills, skill]);
    }
  };

  const addCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customSkill.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    if (skills.length >= 6) return;
    setSkills([...skills, trimmed]);
    setCustomSkill('');
  };

  const toggleIntent = (item: string) => {
    if (intent.includes(item)) {
      if (intent.length > 1) {
        setIntent(intent.filter((i) => i !== item));
      }
    } else {
      setIntent([...intent, item]);
    }
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!displayName.trim() || displayName.trim().length < 2) {
        setError('Please enter your name or nickname (min 2 characters).');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (skills.length === 0) {
        setError('Select at least 1 primary skill or tag.');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await onComplete({
        displayName: displayName.trim(),
        role,
        headline: headline.trim() || undefined,
        skills,
        intent,
        contactHandle: contactHandle.trim() || undefined,
        avatarGithub: avatarGithub.trim() || undefined,
        avatarColor: getRoleColor(role),
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to join room. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 bg-surface-card border border-surface-border rounded-3xl shadow-modal">
      {/* Header & Step Dots */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-brand-400 font-semibold">
            {roomCategory} Join Wizard
          </span>
          <h2 className="text-xl font-bold text-slate-100 mt-0.5 truncate max-w-[260px]">
            {roomTitle}
          </h2>
        </div>
        <div className="flex items-center gap-1.5" aria-label={`Step ${step} of 3`}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-7 bg-brand-500'
                  : s < step
                  ? 'w-2 bg-brand-500/40'
                  : 'w-2 bg-surface-border'
              }`}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* STEP 1: IDENTITY & ROLE */}
      {step === 1 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-semibold text-slate-100">Who are you?</h3>
            </div>
            <p className="text-xs text-slate-400">
              Your name and role displayed to people at this event.
            </p>
          </div>

          <Input
            label="Display Name or Pseudonym *"
            placeholder="e.g. Alex Chen"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoFocus
            maxLength={40}
          />

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Primary Role *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => {
                const isSelected = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`min-h-[44px] px-2.5 py-2 rounded-xl text-xs font-medium border text-center transition-all select-none ${
                      isSelected
                        ? 'bg-brand-500/15 border-brand-500 text-brand-300 font-semibold shadow-emerald'
                        : 'bg-surface-raised border-surface-border text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="Headline / Tagline (Optional)"
            placeholder="e.g. Building AI agents with Supabase"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            maxLength={80}
          />

          <Button onClick={handleNext} className="w-full mt-2">
            Continue to Skills
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* STEP 2: TECH STACK & SKILLS */}
      {step === 2 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Code2 className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-semibold text-slate-100">Tech Stack & Skills</h3>
            </div>
            <p className="text-xs text-slate-400">
              Pick 2 to 6 tags so others can discover and match with you.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {SUGGESTED_SKILLS.map((skill) => {
              const isSelected = skills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all select-none ${
                    isSelected
                      ? 'bg-brand-500 text-slate-950 border-brand-500 font-semibold shadow-emerald'
                      : 'bg-surface-raised text-slate-300 border-surface-border hover:border-slate-500'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  {skill}
                </button>
              );
            })}
          </div>

          <form onSubmit={addCustomSkill} className="flex gap-2">
            <input
              type="text"
              placeholder="Add other tag (e.g. GraphQL)..."
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              className="flex-1 min-h-[44px] px-3.5 bg-surface-raised border border-surface-border rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              maxLength={30}
            />
            <Button type="submit" variant="secondary" size="sm" className="min-h-[44px]">
              Add
            </Button>
          </form>

          <div className="flex items-center gap-3 pt-2">
            <Button variant="ghost" onClick={() => setStep(1)} className="min-h-[44px]">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button onClick={handleNext} className="flex-1 min-h-[44px]">
              Continue to Goals
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: INTENT & SOCIAL HANDOFF */}
      {step === 3 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-semibold text-slate-100">Intent & Social Link</h3>
            </div>
            <p className="text-xs text-slate-400">
              What brings you here, and how can mutual connections reach you?
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              I am here to... *
            </label>
            {INTENTS.map((item) => {
              const isSelected = intent.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleIntent(item)}
                  className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-medium border flex items-center justify-between text-left transition-all ${
                    isSelected
                      ? 'bg-brand-500/15 border-brand-500 text-brand-300 font-semibold'
                      : 'bg-surface-raised border-surface-border text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span>{item}</span>
                  {isSelected && <Check className="w-4 h-4 text-brand-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          <Input
            label="Direct Contact Handle (Unlocked upon mutual connection)"
            placeholder="e.g. @telegram, linkedin.com/in/you, or email"
            value={contactHandle}
            onChange={(e) => setContactHandle(e.target.value)}
            helperText="Protected: Only revealed to attendees you mutually connect with or scan."
          />

          <Input
            label="GitHub Username (Optional - for avatar & profile)"
            placeholder="e.g. octocat"
            value={avatarGithub}
            onChange={(e) => setAvatarGithub(e.target.value)}
          />

          <div className="flex items-center gap-3 pt-2">
            <Button variant="ghost" onClick={() => setStep(2)} className="min-h-[44px]">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button
              onClick={handleSubmit}
              isLoading={isSubmitting}
              className="flex-1 min-h-[44px]"
            >
              <Sparkles className="w-4 h-4" />
              Enter Live Room
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
