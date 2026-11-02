import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../src/lib/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: {},
}));

import { connectionService } from '../../src/features/connections/connection-service';
import { Attendee } from '../../src/types/models';

describe('User Story 3: Connection Handshake State Transitions', () => {
  const userA: Attendee = {
    id: 'user_a',
    room_id: 'room_1',
    display_name: 'Alice',
    role: 'Frontend',
    headline: null,
    bio: null,
    skills: ['React'],
    intent: ['Collaborate'],
    contact_handle: '@alice',
    avatar_color: '#38bdf8',
    avatar_github: null,
    is_available_to_chat: true,
    available_until: null,
    current_zone: null,
    is_banned: false,
    created_at: '',
    updated_at: '',
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('creates a pending wave when User A waves at User B', async () => {
    const { connection, isMutual } = await connectionService.sendWave('room_1', userA, 'user_b');
    expect(connection.status).toBe('pending');
    expect(connection.connection_type).toBe('wave');
    expect(isMutual).toBe(false);
  });

  it('triggers a mutual match when User B waves back at User A', async () => {
    // User A waves at User B first
    await connectionService.sendWave('room_1', userA, 'user_b');

    // User B waves back at User A
    const userB: Attendee = { ...userA, id: 'user_b', display_name: 'Bob', role: 'Backend' };
    const { connection, isMutual } = await connectionService.sendWave('room_1', userB, 'user_a');
    expect(connection.status).toBe('connected');
    expect(isMutual).toBe(true);
  });

  it('immediately connects on in-person physical QR badge scan', async () => {
    const connection = await connectionService.scanBadge('room_1', 'user_a', 'user_b');
    expect(connection.status).toBe('connected');
    expect(connection.connection_type).toBe('qr_scan');
  });
});
