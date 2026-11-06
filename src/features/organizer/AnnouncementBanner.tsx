import React, { useState } from 'react';
import { Announcement } from '../../types/models';
import { Megaphone, X } from 'lucide-react';

export interface AnnouncementBannerProps {
  announcement: Announcement | null;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ announcement }) => {
  const [dismissedId, setDismissedId] = useState<string | null>(null);

  if (!announcement || !announcement.is_pinned || dismissedId === announcement.id) {
    return null;
  }

  return (
    <div className="bg-brand-500/10 border-b border-brand-500/30 px-4 py-2.5 text-slate-900 dark:text-slate-100 flex items-center justify-between gap-3 animate-in slide-in-from-top-1 duration-200">
      <div className="flex items-center gap-2.5 min-w-0 max-w-4xl mx-auto flex-1">
        <div className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
          <Megaphone className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0 text-xs sm:text-sm">
          <strong className="text-brand-700 dark:text-brand-300 font-semibold mr-1.5">
            {announcement.title}:
          </strong>
          <span className="text-slate-700 dark:text-slate-300">{announcement.message}</span>
        </div>
      </div>
      <button
        onClick={() => setDismissedId(announcement.id)}
        className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg -mr-1"
        aria-label="Dismiss announcement"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
