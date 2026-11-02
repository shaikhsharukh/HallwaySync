import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/modal';
import { Input } from '../../components/ui/input';
import { MapPin, Check, Clock } from 'lucide-react';

export interface AvailabilityToggleProps {
  isAvailable: boolean;
  currentZone: string | null;
  onUpdate: (isAvailable: boolean, zone: string | null) => Promise<void>;
}

const COMMON_ZONES = [
  'Table 1–10 (Hacking)',
  'Table 11–20 (Hacking)',
  'Main Stage / Audience',
  'Coffee & Snacks Lounge',
  'Workshop Room A',
  'Outdoor Terrace',
];

export const AvailabilityToggle: React.FC<AvailabilityToggleProps> = ({
  isAvailable,
  currentZone,
  onUpdate,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zone, setZone] = useState(currentZone || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (isAvailable) {
      // Turn off
      setIsLoading(true);
      try {
        await onUpdate(false, null);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Open modal to specify zone
      setZone(currentZone || '');
      setIsModalOpen(true);
    }
  };

  const handleConfirmAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onUpdate(true, zone.trim() || 'Venue Hall');
      setIsModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`min-h-[44px] px-2.5 sm:px-3.5 py-2 rounded-xl border flex items-center gap-1.5 sm:gap-2 text-xs font-semibold transition-all select-none ${
            isAvailable
              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-emerald'
              : 'bg-surface-card border-surface-border text-slate-300 hover:border-slate-500'
          }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
            }`}
          />
          <span className="hidden sm:inline">
            {isAvailable ? 'Available to Chat' : 'Set Available'}
          </span>
          <span className="sm:hidden text-[11px]">
            {isAvailable ? 'Chatting' : 'Available'}
          </span>
        </button>

        {isAvailable && currentZone && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="min-h-[44px] px-2 sm:px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border text-slate-300 hover:text-white text-xs flex items-center gap-1"
            title="Update physical location zone"
          >
            <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span className="truncate max-w-[70px] sm:max-w-[120px]">{currentZone}</span>
          </button>
        )}
      </div>

      {/* Set Zone & Availability Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="In-Person Availability Status"
        description="Let people know you are open to chat in person right now. Auto-expires after 60 minutes."
      >
        <form onSubmit={handleConfirmAvailability} className="space-y-4 pt-2">
          <Input
            label="Current Location / Table Zone"
            placeholder="e.g. Table 14 or Coffee Lounge"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            maxLength={40}
            autoFocus
          />

          <div>
            <span className="block text-[11px] font-medium text-slate-400 mb-2">
              Quick select popular event areas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_ZONES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setZone(item)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border text-left transition-colors ${
                    zone === item
                      ? 'bg-brand-500/20 text-brand-300 border-brand-500'
                      : 'bg-surface-raised border-surface-border text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-2">
            <Clock className="w-3.5 h-3.5 text-brand-400" />
            <span>Resets automatically to standard status in 60 minutes</span>
          </div>

          <Button type="submit" size="md" isLoading={isLoading} className="w-full">
            <Check className="w-4 h-4 mr-1" />
            <span>Set Status: Available to Chat</span>
          </Button>
        </form>
      </Modal>
    </>
  );
};
