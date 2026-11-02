import { describe, it, expect } from 'vitest';
import { calculateRoomMatches } from '../../src/lib/matching-rules';
import { Attendee } from '../../src/types/models';

describe('User Story 4: Deterministic Matchmaking Engine', () => {
  const currentUser: Attendee = {
    id: 'user_frontend',
    room_id: 'room_1',
    display_name: 'Frontend Hacker',
    role: 'Frontend',
    headline: 'React & Tailwind',
    bio: null,
    skills: ['TypeScript', 'React', 'Tailwind CSS'],
    intent: ['Looking for Team'],
    contact_handle: '@frontend',
    avatar_color: '#38bdf8',
    avatar_github: null,
    is_available_to_chat: true,
    available_until: null,
    current_zone: 'Table 1',
    is_banned: false,
    created_at: '',
    updated_at: '',
  };

  const pool: Attendee[] = [
    {
      id: 'candidate_backend',
      room_id: 'room_1',
      display_name: 'Backend Builder',
      role: 'Backend',
      headline: 'Python & Supabase',
      bio: null,
      skills: ['Python', 'Supabase', 'PostgreSQL'],
      intent: ['Looking for Team'],
      contact_handle: '@backend',
      avatar_color: '#3ECF8E',
      avatar_github: null,
      is_available_to_chat: true,
      available_until: null,
      current_zone: 'Table 2',
      is_banned: false,
      created_at: '',
      updated_at: '',
    },
    {
      id: 'candidate_frontend_peer',
      room_id: 'room_1',
      display_name: 'Fellow React Dev',
      role: 'Frontend',
      headline: 'Also React',
      bio: null,
      skills: ['TypeScript', 'React', 'Next.js'],
      intent: ['Open to Chat / Network'],
      contact_handle: null,
      avatar_color: '#38bdf8',
      avatar_github: null,
      is_available_to_chat: false,
      available_until: null,
      current_zone: null,
      is_banned: false,
      created_at: '',
      updated_at: '',
    },
  ];

  it('ranks complementary roles (Frontend + Backend) as top team match in hackathons', () => {
    const matches = calculateRoomMatches(currentUser, pool, 'hackathon');
    expect(matches.length).toBeGreaterThan(0);
    const topMatch = matches[0];
    expect(topMatch.attendee.display_name).toBe('Backend Builder');
    expect(topMatch.matchCategory).toBe('team_complement');
    expect(topMatch.matchReason).toContain('Complementary');
  });

  it('ranks same-skill peers under affinity matches', () => {
    const matches = calculateRoomMatches(currentUser, pool, 'meetup');
    const affinity = matches.find((m) => m.attendee.display_name === 'Fellow React Dev');
    expect(affinity).toBeDefined();
    expect(affinity?.matchCategory).toBe('domain_affinity');
  });
});
