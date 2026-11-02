import React, { useState } from 'react';
import { ConnectionWithProfile, Attendee } from '../../types/models';
import { AvatarBadge } from '../../components/AvatarBadge';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { getRoleColor } from '../../lib/utils';
import {
  HandMetal,
  QrCode,
  Camera,
  Users,
  Send,
  Linkedin,
  Github,
  ExternalLink,
} from 'lucide-react';

export interface ConnectionsPageProps {
  connections: ConnectionWithProfile[];
  currentAttendee: Attendee | null;
  onOpenMyBadge: () => void;
  onOpenScanner: () => void;
  onAcceptWave: (connectionId: string) => Promise<void>;
}

export const ConnectionsPage: React.FC<ConnectionsPageProps> = ({
  connections,
  currentAttendee,
  onOpenMyBadge,
  onOpenScanner,
  onAcceptWave,
}) => {
  const [activeTab, setActiveTab] = useState<'connected' | 'pending'>('connected');

  const mutualConnections = connections.filter((c) => c.status === 'connected');
  const pendingWaves = connections.filter((c) => c.status === 'pending');

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4 sm:p-6 pb-24 animate-in fade-in duration-300">
      {/* Quick Action Buttons: My Badge & Scan Camera */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          size="md"
          variant="secondary"
          onClick={onOpenMyBadge}
          className="min-h-[48px] flex items-center justify-center gap-2 border-brand-500/30 text-brand-300 hover:bg-brand-500/10"
        >
          <QrCode className="w-4 h-4 text-brand-400" />
          <span>My Badge QR</span>
        </Button>
        <Button
          size="md"
          variant="primary"
          onClick={onOpenScanner}
          className="min-h-[48px] flex items-center justify-center gap-2 shadow-emerald"
        >
          <Camera className="w-4 h-4" />
          <span>Scan Peer Badge</span>
        </Button>
      </div>

      {/* Tabs: Mutual Contacts vs Pending Waves */}
      <div className="flex border-b border-surface-border">
        <button
          onClick={() => setActiveTab('connected')}
          className={`min-h-[44px] flex-1 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'connected'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Mutual Connections</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-brand-500/20 text-brand-300 font-bold">
            {mutualConnections.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`min-h-[44px] flex-1 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'pending'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Waves Sent & Received</span>
          {pendingWaves.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-surface-raised border border-surface-border text-slate-300 font-bold">
              {pendingWaves.length}
            </span>
          )}
        </button>
      </div>

      {/* MUTUAL CONNECTIONS LIST */}
      {activeTab === 'connected' && (
        <div className="space-y-3">
          {mutualConnections.length > 0 ? (
            mutualConnections.map(({ id, partner }) => {
              const handle = partner.contact_handle;
              const roleColor = getRoleColor(partner.role);

              return (
                <div
                  key={id}
                  className="p-4 bg-surface-card border border-surface-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-card"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <AvatarBadge
                      name={partner.display_name}
                      githubHandle={partner.avatar_github}
                      color={partner.avatar_color}
                      size="md"
                      isAvailable={partner.is_available_to_chat}
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-100 truncate">
                        {partner.display_name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="role" color={roleColor}>
                          {partner.role}
                        </Badge>
                        {partner.current_zone && (
                          <span className="text-[11px] text-slate-400 truncate">
                            • {partner.current_zone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Direct Contact Button */}
                  <div className="shrink-0 flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-surface-border">
                    {handle ? (
                      handle.startsWith('@') ? (
                        <a
                          href={`https://t.me/${handle.substring(1)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="min-h-[44px] px-3.5 py-2 bg-sky-500/15 border border-sky-500/30 text-sky-300 hover:bg-sky-500/25 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Telegram</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      ) : handle.includes('linkedin.com') ? (
                        <a
                          href={handle.startsWith('http') ? handle : `https://${handle}`}
                          target="_blank"
                          rel="noreferrer"
                          className="min-h-[44px] px-3.5 py-2 bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Linkedin className="w-3.5 h-3.5" />
                          <span>LinkedIn</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      ) : (
                        <span className="text-xs font-mono text-brand-300 bg-surface-raised px-3 py-2 rounded-lg border border-surface-border">
                          {handle}
                        </span>
                      )
                    ) : (
                      <span className="text-xs text-slate-400 italic">No contact link</span>
                    )}

                    {partner.avatar_github && (
                      <a
                        href={`https://github.com/${partner.avatar_github.replace('@', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-surface-raised border border-surface-border text-slate-300 hover:text-white rounded-xl"
                        title="GitHub profile"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 px-4 bg-surface-card border border-surface-border rounded-2xl">
              <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-200">No mutual connections yet</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Wave at people in the directory or scan their QR badge to unlock direct contact channels.
              </p>
            </div>
          )}
        </div>
      )}

      {/* PENDING WAVES LIST */}
      {activeTab === 'pending' && (
        <div className="space-y-3">
          {pendingWaves.length > 0 ? (
            pendingWaves.map(({ id, requester_id, partner }) => {
              const isIncoming = requester_id !== currentAttendee?.id;

              return (
                <div
                  key={id}
                  className="p-4 bg-surface-card border border-surface-border rounded-2xl flex items-center justify-between gap-3 shadow-card"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <AvatarBadge
                      name={partner.display_name}
                      githubHandle={partner.avatar_github}
                      color={partner.avatar_color}
                      size="md"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-100 truncate">
                        {partner.display_name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {isIncoming
                          ? `${partner.display_name} waved at you 👋`
                          : 'You waved • Waiting for response'}
                      </p>
                    </div>
                  </div>

                  {isIncoming && (
                    <Button
                      size="sm"
                      onClick={() => onAcceptWave(id)}
                      className="min-h-[44px] shrink-0"
                    >
                      <HandMetal className="w-4 h-4 text-brand-400 mr-1" />
                      <span>Wave Back</span>
                    </Button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 px-4 bg-surface-card border border-surface-border rounded-2xl">
              <HandMetal className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-200">No pending waves</h4>
              <p className="text-xs text-slate-400 mt-1">
                Explore the room directory and wave at fellow builders!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
