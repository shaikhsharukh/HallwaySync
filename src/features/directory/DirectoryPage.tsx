import React, { useState, useMemo } from 'react';
import { Attendee, Room } from '../../types/models';
import { ProfessionalRole } from '../../types/database';
import { AttendeeCard } from './AttendeeCard';
import { DirectoryFilters } from './DirectoryFilters';
import { AttendeeDetailModal } from './AttendeeDetailModal';
import { Users, Sparkles, RefreshCw } from 'lucide-react';

export interface DirectoryPageProps {
  room: Room;
  attendees: Attendee[];
  currentAttendee: Attendee | null;
  connections: Record<string, 'pending' | 'connected' | 'none'>;
  onSendWave: (recipientId: string) => Promise<void>;
  onEditProfile?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const DirectoryPage: React.FC<DirectoryPageProps> = ({
  attendees,
  currentAttendee,
  connections,
  onSendWave,
  onEditProfile,
  onRefresh,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<ProfessionalRole | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);

  // Compute skill frequencies for the cloud
  const skillCounts = useMemo(() => {
    const map = new Map<string, number>();
    attendees.forEach((a) => {
      a.skills.forEach((s) => {
        map.set(s, (map.get(s) || 0) + 1);
      });
    });
    return Array.from(map.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [attendees]);

  // Fast client-side filtering (< 50ms)
  const filteredAttendees = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return attendees.filter((a) => {
      if (availableOnly && !a.is_available_to_chat) return false;
      if (selectedRole && a.role !== selectedRole) return false;
      if (selectedSkill && !a.skills.includes(selectedSkill)) return false;

      if (!q) return true;
      const matchesName = a.display_name.toLowerCase().includes(q);
      const matchesRole = a.role.toLowerCase().includes(q);
      const matchesSkills = a.skills.some((s) => s.toLowerCase().includes(q));
      const matchesHeadline = a.headline?.toLowerCase().includes(q) ?? false;
      const matchesZone = a.current_zone?.toLowerCase().includes(q) ?? false;

      return matchesName || matchesRole || matchesSkills || matchesHeadline || matchesZone;
    });
  }, [attendees, searchQuery, selectedRole, selectedSkill, availableOnly]);

  return (
    <div className="space-y-4 max-w-4xl mx-auto p-4 sm:p-6 pb-24">
      {/* Search & Multi-Faceted Filters */}
      <DirectoryFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedRole={selectedRole}
        onRoleSelect={setSelectedRole}
        selectedSkill={selectedSkill}
        onSkillSelect={setSelectedSkill}
        availableOnly={availableOnly}
        onAvailableToggle={() => setAvailableOnly(!availableOnly)}
        skillCounts={skillCounts}
      />

      {/* Directory Stats Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div className="flex items-center gap-1.5 font-medium">
          <Users className="w-3.5 h-3.5 text-brand-400" />
          <span>
            Showing <strong className="text-slate-200">{filteredAttendees.length}</strong> of{' '}
            {attendees.length} attendees
          </span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1 hover:text-slate-200 transition-colors"
            title="Refresh directory"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}
      </div>

      {/* Attendees Grid */}
      {filteredAttendees.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredAttendees.map((attendee) => {
            const isSelf = attendee.id === currentAttendee?.id;
            const status = connections[attendee.id] || 'none';

            return (
              <AttendeeCard
                key={attendee.id}
                attendee={attendee}
                isSelf={isSelf}
                connectionStatus={status}
                onCardClick={() => setSelectedAttendee(attendee)}
                onWaveClick={() => onSendWave(attendee.id)}
                onEditProfile={onEditProfile}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 px-4 bg-surface-card border border-surface-border rounded-2xl">
          <Sparkles className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-200">No attendees found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Try adjusting your search query, clearing your filters, or waiting for newcomers to scan the room QR.
          </p>
        </div>
      )}

      {/* Detail Modal */}
      <AttendeeDetailModal
        attendee={selectedAttendee}
        isOpen={Boolean(selectedAttendee)}
        onClose={() => setSelectedAttendee(null)}
        isSelf={selectedAttendee?.id === currentAttendee?.id}
        connectionStatus={
          selectedAttendee ? connections[selectedAttendee.id] || 'none' : 'none'
        }
        onWaveClick={() => {
          if (selectedAttendee) {
            onSendWave(selectedAttendee.id);
          }
        }}
      />
    </div>
  );
};
