import { describe, it, expect } from 'vitest';
import { isPresenceActive, formatZoneString } from '../../src/lib/utils';

describe('User Story 6: In-Person Availability & Auto-Expiration', () => {
  it('returns true when availability is active and timestamp is in the future', () => {
    const futureTime = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 mins future
    expect(isPresenceActive(true, futureTime)).toBe(true);
  });

  it('automatically returns false when timestamp has expired (past 60 minutes)', () => {
    const pastTime = new Date(Date.now() - 5 * 60 * 1000).toISOString(); // 5 mins ago
    expect(isPresenceActive(true, pastTime)).toBe(false);
  });

  it('formats micro-location zone string cleanly', () => {
    expect(formatZoneString('Table 14')).toBe('📍 Table 14');
    expect(formatZoneString('')).toBe('');
    expect(formatZoneString(null)).toBe('');
  });
});
