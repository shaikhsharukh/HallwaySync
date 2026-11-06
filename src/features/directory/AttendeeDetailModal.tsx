import React from 'react';
import { Attendee } from '../../types/models';
import { Modal } from '../../components/ui/modal';
import { AvatarBadge } from '../../components/AvatarBadge';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { getRoleColor } from '../../lib/utils';
import {
  HandMetal,
  MapPin,
  ExternalLink,
  Github,
  Send,
  Linkedin,
  Mail,
  ShieldCheck,
  Pencil,
} from 'lucide-react';

export interface AttendeeDetailModalProps {
  attendee: Attendee | null;
  isOpen: boolean;
  onClose: () => void;
  isSelf: boolean;
  connectionStatus?: 'pending' | 'connected' | 'none';
  onWaveClick?: () => void;
  onEditProfile?: () => void;
}

export const AttendeeDetailModal: React.FC<AttendeeDetailModalProps> = ({
  attendee,
  isOpen,
  onClose,
  isSelf,
  connectionStatus = 'none',
  onWaveClick,
  onEditProfile,
}) => {
  if (!attendee) return null;

  const roleColor = getRoleColor(attendee.role);
  const isConnected = connectionStatus === 'connected';

  // Format contact link helper
  const renderContactButton = () => {
    const handle = attendee.contact_handle;
    if (!handle) {
      return (
        <p className="text-xs text-slate-400 italic">No contact link provided.</p>
      );
    }

    if (handle.startsWith('@')) {
      const telegramUrl = `https://t.me/${handle.substring(1)}`;
      return (
        <a
          href={telegramUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20 rounded-xl text-xs font-semibold transition-colors"
        >
          <Send className="w-4 h-4" />
          <span>Telegram: {handle}</span>
          <ExternalLink className="w-3.5 h-3.5 ml-auto" />
        </a>
      );
    }

    if (handle.includes('linkedin.com')) {
      const url = handle.startsWith('http') ? handle : `https://${handle}`;
      return (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 rounded-xl text-xs font-semibold transition-colors"
        >
          <Linkedin className="w-4 h-4" />
          <span>LinkedIn Profile</span>
          <ExternalLink className="w-3.5 h-3.5 ml-auto" />
        </a>
      );
    }

    if (handle.includes('@')) {
      return (
        <a
          href={`mailto:${handle}`}
          className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 rounded-xl text-xs font-semibold transition-colors"
        >
          <Mail className="w-4 h-4" />
          <span>Email: {handle}</span>
          <ExternalLink className="w-3.5 h-3.5 ml-auto" />
        </a>
      );
    }

    const url = handle.startsWith('http') ? handle : `https://${handle}`;
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 bg-brand-500/10 border border-brand-500/30 text-brand-400 hover:bg-brand-500/20 rounded-xl text-xs font-semibold transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        <span>Contact: {handle}</span>
      </a>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <AvatarBadge
            name={attendee.display_name}
            githubHandle={attendee.avatar_github}
            color={attendee.avatar_color}
            size="lg"
            isAvailable={attendee.is_available_to_chat}
          />
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
              {attendee.display_name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="role" color={roleColor}>
                {attendee.role}
              </Badge>
              {attendee.is_available_to_chat && (
                <Badge variant="availability">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                  <span>Available to Chat</span>
                </Badge>
              )}
            </div>
            {attendee.current_zone && (
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{attendee.current_zone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Headline or Bio */}
        {attendee.headline && (
          <div className="p-3 bg-surface-raised border border-surface-border rounded-xl">
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
              "{attendee.headline}"
            </p>
          </div>
        )}

        {attendee.bio && (
          <div>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              About
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {attendee.bio}
            </p>
          </div>
        )}

        {/* Skills */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Tech Stack & Skills
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {attendee.skills.map((skill) => (
              <span
                key={skill}
                className="text-xs font-medium px-3 py-1 rounded-lg bg-surface-raised border border-surface-border text-slate-700 dark:text-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Intent */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Looking For
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {attendee.intent.map((goal) => (
              <span
                key={goal}
                className="text-xs font-medium px-3 py-1 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-700 dark:text-brand-300"
              >
                {goal}
              </span>
            ))}
          </div>
        </div>

        {/* GitHub link if available */}
        {attendee.avatar_github && (
          <div>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              GitHub
            </h4>
            <a
              href={`https://github.com/${attendee.avatar_github.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 bg-surface-raised border border-surface-border text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-medium transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>github.com/{attendee.avatar_github.replace('@', '')}</span>
              <ExternalLink className="w-3.5 h-3.5 ml-auto" />
            </a>
          </div>
        )}

        {/* Contact Handoff Section */}
        <div className="p-4 bg-surface-raised border border-surface-border rounded-2xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-200">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            <span>Direct Contact Channel</span>
          </div>

          {isConnected ? (
            <div className="pt-1">{renderContactButton()}</div>
          ) : isSelf ? (
            <div className="space-y-3 pt-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your contact info is: <span className="text-brand-700 dark:text-brand-300 font-mono">{attendee.contact_handle || 'Not set'}</span>
              </p>
              {onEditProfile && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    onClose();
                    onEditProfile();
                  }}
                  className="w-full min-h-[44px] text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5 text-brand-400" />
                  <span>Edit My Badge & Profile</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <p className="text-xs text-slate-400">
                Contact details are shielded. Send a mutual Wave or scan each other's in-person badge to unlock direct links.
              </p>
              {onWaveClick && (
                <Button
                  onClick={() => {
                    onWaveClick();
                  }}
                  variant="primary"
                  className="w-full mt-2"
                  disabled={connectionStatus === 'pending'}
                >
                  <HandMetal className="w-4 h-4" />
                  <span>
                    {connectionStatus === 'pending'
                      ? 'Wave Sent (Waiting for response)'
                      : 'Wave to Connect 👋'}
                  </span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
