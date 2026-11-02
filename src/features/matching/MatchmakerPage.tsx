import React, { useState, useMemo } from 'react';
import { Attendee, Room } from '../../types/models';
import { calculateRoomMatches } from '../../lib/matching-rules';
import { AttendeeCard } from '../directory/AttendeeCard';
import { AttendeeDetailModal } from '../directory/AttendeeDetailModal';
import { Sparkles, Users, Award } from 'lucide-react';

export interface MatchmakerPageProps {
  room: Room;
  currentAttendee: Attendee;
  allAttendees: Attendee[];
  connections: Record<string, 'pending' | 'connected' | 'none'>;
  onSendWave: (recipientId: string) => Promise<void>;
}

export const MatchmakerPage: React.FC<MatchmakerPageProps> = ({
  room,
  currentAttendee,
  allAttendees,
  connections,
  onSendWave,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'team' | 'affinity'>('all');
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);

  const allMatches = useMemo(() => {
    return calculateRoomMatches(currentAttendee, allAttendees, room.category);
  }, [currentAttendee, allAttendees, room.category]);

  const displayedMatches = useMemo(() => {
    if (activeCategory === 'team') {
      return allMatches.filter((m) => m.matchCategory === 'team_complement');
    }
    if (activeCategory === 'affinity') {
      return allMatches.filter((m) => m.matchCategory === 'domain_affinity');
    }
    return allMatches;
  }, [allMatches, activeCategory]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 pb-24 animate-in fade-in duration-300">
      {/* Intro Header */}
      <div className="bg-surface-card border border-surface-border p-5 rounded-3xl shadow-card flex items-start gap-3.5">
        <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-400 shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-100">
            Intelligent {room.category === 'hackathon' ? 'Team' : 'Peer'} Matchmaker
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Recommendations calculated by pairing your role (<strong className="text-slate-200">{currentAttendee.role}</strong>) and skills with complementary builders in this room.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-surface-border">
        <button
          onClick={() => setActiveCategory('all')}
          className={`min-h-[44px] flex-1 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
            activeCategory === 'all'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Top Matches</span>
          <span className="text-[10px] bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded-full font-bold">
            {allMatches.length}
          </span>
        </button>

        <button
          onClick={() => setActiveCategory('team')}
          className={`min-h-[44px] flex-1 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
            activeCategory === 'team'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Complements</span>
        </button>

        <button
          onClick={() => setActiveCategory('affinity')}
          className={`min-h-[44px] flex-1 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
            activeCategory === 'affinity'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Stack Affinity</span>
        </button>
      </div>

      {/* Match Cards List */}
      {displayedMatches.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayedMatches.map(({ attendee, matchScore, matchReason }) => {
            const status = connections[attendee.id] || 'none';

            return (
              <div key={attendee.id} className="space-y-2">
                {/* Match Score Reason Header */}
                <div className="flex items-center justify-between px-2 text-xs">
                  <span className="font-semibold text-brand-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {matchScore}% Match
                  </span>
                  <span className="text-[11px] text-slate-400 truncate max-w-[150px] sm:max-w-[220px]">
                    {matchReason}
                  </span>
                </div>

                <AttendeeCard
                  attendee={attendee}
                  isSelf={false}
                  connectionStatus={status}
                  onCardClick={() => setSelectedAttendee(attendee)}
                  onWaveClick={() => onSendWave(attendee.id)}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 px-4 bg-surface-card border border-surface-border rounded-2xl">
          <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-200">No match candidates found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            As more attendees join this room with complementary roles, top recommendations will appear here automatically.
          </p>
        </div>
      )}

      {/* Profile Detail Modal */}
      <AttendeeDetailModal
        attendee={selectedAttendee}
        isOpen={Boolean(selectedAttendee)}
        onClose={() => setSelectedAttendee(null)}
        isSelf={false}
        connectionStatus={
          selectedAttendee ? connections[selectedAttendee.id] || 'none' : 'none'
        }
        onWaveClick={() => {
          if (selectedAttendee) onSendWave(selectedAttendee.id);
        }}
      />
    </div>
  );
};
