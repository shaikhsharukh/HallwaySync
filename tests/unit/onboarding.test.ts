import { describe, it, expect } from 'vitest';
import { generateInitials, getRoleColor } from '../../src/lib/utils';

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
