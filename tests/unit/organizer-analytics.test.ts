import { describe, it, expect } from 'vitest';
import { Attendee } from '../../src/types/models';
import { organizerService, generateAttendeeCSV } from '../../src/features/organizer/organizer-service';

describe('User Story 5: Organizer Analytics & CSV Export', () => {
  const mockAttendees: Attendee[] = [
    {
      id: '1',
      room_id: 'r1',
      display_name: 'Alex Chen',
      role: 'Frontend',
      headline: null,
      bio: null,
      skills: ['TypeScript', 'React'],
      intent: ['Looking for Team'],
      contact_handle: '@alex',
      avatar_color: '#38bdf8',
      avatar_github: null,
      is_available_to_chat: true,
      available_until: null,
      current_zone: 'Table 14',
      is_banned: false,
      created_at: '',
      updated_at: '',
    },
    {
      id: '2',
      room_id: 'r1',
      display_name: 'Sam Miller',
      role: 'Backend',
      headline: null,
      bio: null,
      skills: ['Python', 'Supabase'],
      intent: ['Looking for Team', 'Hiring'],
      contact_handle: '@sam',
      avatar_color: '#3ECF8E',
      avatar_github: null,
      is_available_to_chat: false,
      available_until: null,
      current_zone: null,
      is_banned: false,
      created_at: '',
      updated_at: '',
    },
  ];

  it('aggregates total attendees and role breakdown accurately', () => {
    const summary = organizerService.calculateAnalytics(mockAttendees);
    expect(summary.totalAttendees).toBe(2);
    expect(summary.activeNow).toBe(1);
    expect(summary.roleBreakdown.Frontend).toBe(1);
    expect(summary.roleBreakdown.Backend).toBe(1);
  });

  it('generates well-formatted CSV with headers and sanitized fields', () => {
    const csv = generateAttendeeCSV(mockAttendees);
    expect(csv).toContain('Display Name,Role,Skills,Intent,Contact Handle,Zone');
    // Sanitizes formula injection (@, =, +, -) safely
    expect(csv).toContain('"Alex Chen","Frontend","TypeScript, React","Looking for Team","\'@alex","Table 14"');
  });
});
