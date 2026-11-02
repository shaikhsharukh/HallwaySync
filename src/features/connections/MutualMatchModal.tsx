import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Modal } from '../../components/ui/modal';
import { AvatarBadge } from '../../components/AvatarBadge';
import { Attendee } from '../../types/models';
import { Button } from '../../components/ui/button';
import { Sparkles, Send, Linkedin, Github, ExternalLink } from 'lucide-react';

export interface MutualMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Attendee | null;
  partner: Attendee | null;
}

export const MutualMatchModal: React.FC<MutualMatchModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  partner,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire celebratory confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3ECF8E', '#38bdf8', '#c084fc', '#facc15'],
      });
    }
  }, [isOpen]);

  if (!isOpen || !partner || !currentUser) return null;

  const handle = partner.contact_handle;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="text-center">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 border border-brand-500/30 rounded-full text-brand-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>It's a Mutual Match!</span>
        </div>

        {/* Dual Avatars Connection Visual */}
        <div className="flex items-center justify-center gap-4 py-2">
          <AvatarBadge
            name={currentUser.display_name}
            githubHandle={currentUser.avatar_github}
            color={currentUser.avatar_color}
            size="lg"
          />
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 font-bold text-sm">
            ⚡
          </div>
          <AvatarBadge
            name={partner.display_name}
            githubHandle={partner.avatar_github}
            color={partner.avatar_color}
            size="lg"
          />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-slate-100">
            You & {partner.display_name} connected!
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            You both waved or scanned badges. Their direct contact details are now unlocked.
          </p>
        </div>

        {/* Unlocked Contact Actions */}
        <div className="p-4 bg-surface-raised border border-surface-border rounded-2xl space-y-3">
          <h4 className="text-xs font-semibold text-slate-300">
            {partner.display_name}'s Contact Channel
          </h4>

          {handle ? (
            <div className="flex flex-col gap-2">
              {handle.startsWith('@') ? (
                <a
                  href={`https://t.me/${handle.substring(1)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 bg-sky-500 text-slate-950 font-semibold rounded-xl text-xs hover:bg-sky-400 transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Open Telegram ({handle})</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              ) : handle.includes('linkedin.com') ? (
                <a
                  href={handle.startsWith('http') ? handle : `https://${handle}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl text-xs hover:bg-blue-500 transition-colors shadow-sm"
                >
                  <Linkedin className="w-4 h-4" />
                  <span>Connect on LinkedIn</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              ) : (
                <div className="p-2.5 bg-surface-card border border-surface-border rounded-lg text-xs font-mono text-brand-300">
                  {handle}
                </div>
              )}

              {partner.avatar_github && (
                <a
                  href={`https://github.com/${partner.avatar_github.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 bg-surface-card border border-surface-border text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>github.com/{partner.avatar_github.replace('@', '')}</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No external link provided.</p>
          )}
        </div>

        <Button onClick={onClose} variant="secondary" className="w-full">
          Done
        </Button>
      </div>
    </Modal>
  );
};
