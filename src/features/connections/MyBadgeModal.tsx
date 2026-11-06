import React from 'react';
import { Modal } from '../../components/ui/modal';
import { QRCodeSVG } from 'qrcode.react';
import { Attendee } from '../../types/models';
import { AvatarBadge } from '../../components/AvatarBadge';
import { Badge } from '../../components/ui/badge';
import { getRoleColor } from '../../lib/utils';
import { QrCode, ScanLine } from 'lucide-react';

export interface MyBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendee: Attendee | null;
  roomId: string;
}

export const MyBadgeModal: React.FC<MyBadgeModalProps> = ({
  isOpen,
  onClose,
  attendee,
  roomId,
}) => {
  if (!isOpen || !attendee) return null;

  const roleColor = getRoleColor(attendee.role);
  // Special URI payload encoded in QR badge (supports HallwaySync protocol)
  const badgePayload = `hallwaysync:badge:${roomId}:${attendee.id}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="text-center">
      <div className="space-y-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-raised border border-surface-border rounded-full text-slate-600 dark:text-slate-300 text-xs font-semibold mb-2">
            <QrCode className="w-3.5 h-3.5 text-brand-400" />
            <span>In-Person Networking Badge</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Show to Connect
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Let someone scan this badge with their phone camera to instantly connect with you.
          </p>
        </div>

        {/* Badge Card Presentation */}
        <div className="p-6 bg-surface-raised border border-surface-border rounded-2xl flex flex-col items-center">
          <AvatarBadge
            name={attendee.display_name}
            githubHandle={attendee.avatar_github}
            color={attendee.avatar_color}
            size="lg"
            className="mb-2"
          />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{attendee.display_name}</h3>
          <Badge variant="role" color={roleColor} className="mt-1">
            {attendee.role}
          </Badge>

          {/* QR Code */}
          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 mt-4">
            <QRCodeSVG
              value={badgePayload}
              size={180}
              level="M"
              includeMargin={false}
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-3 font-mono">
            <ScanLine className="w-3.5 h-3.5 text-brand-400" />
            <span>Instant Bidirectional Handshake</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
