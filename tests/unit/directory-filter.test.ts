import { describe, it, expect } from 'vitest';
import { Attendee } from '../../src/types/models';

export function filterAttendees(
  attendees: Attendee[],
  query: string,
  selectedRole: string | null,
  selectedSkill: string | null,
  availableOnly: boolean
): Attendee[] {
  const normalizedQuery = query.toLowerCase().trim();

  return attendees.filter((attendee) => {
    if (availableOnly && !attendee.is_available_to_chat) {
      return false;
    }

    if (selectedRole && attendee.role !== selectedRole) {
      return false;
    }

    if (selectedSkill && !attendee.skills.includes(selectedSkill)) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const matchesName = attendee.display_name.toLowerCase().includes(normalizedQuery);
    const matchesHeadline = attendee.headline?.toLowerCase().includes(normalizedQuery);
    const matchesSkills = attendee.skills.some((s) => s.toLowerCase().includes(normalizedQuery));
    const matchesRole = attendee.role.toLowerCase().includes(normalizedQuery);

    return matchesName || matchesHeadline || matchesSkills || matchesRole;
  });
}

describe('User Story 2: Directory Search & Filtering Engine', () => {
  const mockAttendees: Attendee[] = [
    {
      id: '1',
      room_id: 'r1',
      display_name: 'Alex Chen',
      role: 'Frontend',
      headline: 'React Hacker',
      bio: null,
      skills: ['TypeScript', 'React', 'Tailwind CSS'],
      intent: ['Looking for Team'],
      contact_handle: '@alex',
      avatar_color: '#38bdf8',
      avatar_github: 'alex',
      is_available_to_chat: true,
      available_until: null,
      current_zone: 'Table 1',
      is_banned: false,
      created_at: '',
      updated_at: '',
    },
    {
      id: '2',
      room_id: 'r1',
      display_name: 'Sam Miller',
      role: 'Backend',
      headline: 'Python & Supabase',
      bio: null,
      skills: ['Python', 'Supabase', 'PostgreSQL'],
      intent: ['Looking for Team'],
      contact_handle: '@sam',
      avatar_color: '#3ECF8E',
      avatar_github: 'sam',
      is_available_to_chat: false,
      available_until: null,
      current_zone: null,
      is_banned: false,
      created_at: '',
      updated_at: '',
    },
    {
      id: '3',
      room_id: 'r1',
      display_name: 'Taylor Swift',
      role: 'AI/ML',
      headline: 'PyTorch models',
      bio: null,
      skills: ['Python', 'PyTorch'],
      intent: ['Open to Chat'],
      contact_handle: null,
      avatar_color: '#c084fc',
      avatar_github: null,
      is_available_to_chat: true,
      available_until: null,
      current_zone: 'Stage',
      is_banned: false,
      created_at: '',
      updated_at: '',
    },
  ];

  it('filters by query string across name and skills', () => {
    const results = filterAttendees(mockAttendees, 'supabase', null, null, false);
    expect(results).toHaveLength(1);
    expect(results[0].display_name).toBe('Sam Miller');
  });

  it('filters by role facet', () => {
    const results = filterAttendees(mockAttendees, '', 'Frontend', null, false);
    expect(results).toHaveLength(1);
    expect(results[0].display_name).toBe('Alex Chen');
  });

  it('filters by skill tag', () => {
    const results = filterAttendees(mockAttendees, '', null, 'Python', false);
    expect(results).toHaveLength(2);
  });

  it('filters by availability toggle', () => {
    const results = filterAttendees(mockAttendees, '', null, null, true);
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.display_name)).toEqual(['Alex Chen', 'Taylor Swift']);
  });
});
