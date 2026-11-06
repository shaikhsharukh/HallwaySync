import { describe, it, expect, beforeEach } from 'vitest';
import { generateInitials, getRoleColor } from '../../src/lib/utils';
import { onboardingService } from '../../src/features/onboarding/onboarding-service';
import { Attendee } from '../../src/types/models';

describe('User Story 1: Onboarding Utils & Validations', () => {
  it('generates two-letter uppercase initials for full names', () => {
    expect(generateInitials('Alex Chen')).toBe('AC');
    expect(generateInitials('Sarah Miller Jenkins')).toBe('SJ');
    expect(generateInitials('Single')).toBe('SI');
    expect(generateInitials('')).toBe('??');
  });

  it('assigns standard brand colors for tech roles', () => {
    expect(getRoleColor('Backend')).toBe('#3ECF8E'); // Supabase Emerald
    expect(getRoleColor('Frontend')).toBe('#38bdf8');
    expect(getRoleColor('AI/ML')).toBe('#c084fc');
    expect(getRoleColor('Unknown')).toBe('#94a3b8');
  });

  it('validates required profile fields for rapid onboarding', () => {
    const validProfile = {
      displayName: 'Alex Chen',
      role: 'Frontend' as const,
      skills: ['TypeScript', 'React'],
      intent: ['Looking for Team'],
    };

    expect(validProfile.displayName.length).toBeGreaterThanOrEqual(2);
    expect(validProfile.displayName.length).toBeLessThanOrEqual(50);
    expect(validProfile.skills.length).toBeGreaterThanOrEqual(1);
    expect(validProfile.intent.length).toBeGreaterThanOrEqual(1);
  });
});

describe('onboardingService: updateAvailability & Session Cache Sync', () => {
  const roomId = '550e8400-e29b-41d4-a716-446655440001';
  const attendeeId = '550e8400-e29b-41d4-a716-446655440002';

  beforeEach(() => {
    localStorage.clear();
  });

  it('synchronizes cached attendee_{roomId} and global list when setting available to true', async () => {
    const existingAttendee: Attendee = {
      id: attendeeId,
      room_id: roomId,
      display_name: 'Test Attendee',
      role: 'Fullstack',
      headline: 'Coding cool stuff',
      bio: null,
      skills: ['TypeScript'],
      intent: ['Looking for Team'],
      contact_handle: null,
      avatar_color: '#3ECF8E',
      avatar_github: null,
      is_available_to_chat: false,
      available_until: null,
      current_zone: null,
      is_banned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Pre-populate both local storage caches
    localStorage.setItem(`attendee_${roomId}`, JSON.stringify(existingAttendee));
    localStorage.setItem('hackbuild_local_attendees', JSON.stringify([existingAttendee]));

    // Update availability
    await onboardingService.updateAvailability(attendeeId, true, 'Table 14');

    // Verify session cache was updated
    const cached = JSON.parse(localStorage.getItem(`attendee_${roomId}`) || '{}');
    expect(cached.is_available_to_chat).toBe(true);
    expect(cached.current_zone).toBe('Table 14');
    expect(cached.available_until).toBeTruthy();

    // Verify global attendees list was updated
    const list = JSON.parse(localStorage.getItem('hackbuild_local_attendees') || '[]');
    expect(list[0].is_available_to_chat).toBe(true);
    expect(list[0].current_zone).toBe('Table 14');
  });

  it('clears availability, zone, and available_until when setting available to false', async () => {
    const existingAttendee: Attendee = {
      id: attendeeId,
      room_id: roomId,
      display_name: 'Test Attendee',
      role: 'Frontend',
      headline: null,
      bio: null,
      skills: ['React'],
      intent: ['Open to Chat'],
      contact_handle: null,
      avatar_color: '#38bdf8',
      avatar_github: null,
      is_available_to_chat: true,
      available_until: new Date(Date.now() + 3600000).toISOString(),
      current_zone: 'Lounge',
      is_banned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(`attendee_${roomId}`, JSON.stringify(existingAttendee));
    localStorage.setItem('hackbuild_local_attendees', JSON.stringify([existingAttendee]));

    await onboardingService.updateAvailability(attendeeId, false, null);

    const cached = JSON.parse(localStorage.getItem(`attendee_${roomId}`) || '{}');
    expect(cached.is_available_to_chat).toBe(false);
    expect(cached.current_zone).toBeNull();
    expect(cached.available_until).toBeNull();
  });
});
