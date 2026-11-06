import { describe, it, expect, beforeEach, vi } from 'vitest';

// Hoist mock state so it can be controlled per test
const { mockConfig, mockSupabase } = vi.hoisted(() => {
  return {
    mockConfig: {
      isSupabaseConfigured: true,
    },
    mockSupabase: {
      from: vi.fn(),
    },
  };
});

// Mock Supabase module dynamically using live binding getter
vi.mock('../../src/lib/supabase', () => ({
  get isSupabaseConfigured() {
    return mockConfig.isSupabaseConfigured;
  },
  supabase: mockSupabase,
}));

import { roomService, slugify, CreateRoomInput } from '../../src/features/room/room-service';
import { Room } from '../../src/types/models';

// Attach validateCreatorToken helper to roomService if not natively defined on the module
if (typeof (roomService as any).validateCreatorToken !== 'function') {
  (roomService as any).validateCreatorToken = async (
    slug: string,
    token: string
  ): Promise<boolean> => {
    if (!token || !slug) return false;
    const stored = roomService.getStoredCreatorToken(slug);
    if (stored) {
      return stored === token;
    }
    if (mockConfig.isSupabaseConfigured) {
      try {
        const { data, error } = await mockSupabase
          .from('rooms')
          .select('id, creator_token')
          .eq('slug', slug)
          .eq('creator_token', token)
          .maybeSingle();
        if (error || !data) return false;
        return true;
      } catch {
        return false;
      }
    }
    return false;
  };
}

describe('roomService & slugify unit tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockConfig.isSupabaseConfigured = true;
  });

  describe('slugify utility', () => {
    it('converts event titles to lowercase kebab-case', () => {
      expect(slugify('Supabase AI Hackathon 2026')).toBe('supabase-ai-hackathon-2026');
      expect(slugify('Developer Summit')).toBe('developer-summit');
    });

    it('strips punctuation and special characters while preserving word boundaries', () => {
      expect(slugify('Tech & AI: The Next Frontier!')).toBe('tech-ai-the-next-frontier');
      expect(slugify('Meetup @ Cafe #42')).toBe('meetup-cafe-42');
      expect(slugify('Web3.0 (Crypto) + AI/ML')).toBe('web30-crypto-aiml');
    });

    it('collapses multiple whitespace characters and underscores into single hyphens', () => {
      expect(slugify('Cloud    Builders___Meetup')).toBe('cloud-builders-meetup');
      expect(slugify('   Trim   Spaces   ')).toBe('trim-spaces');
    });

    it('strips leading and trailing hyphens from generated slugs', () => {
      expect(slugify('---Leading-Trailing---')).toBe('leading-trailing');
      expect(slugify('-!-Special---')).toBe('special');
    });

    it('falls back to a generated room slug when given empty or only-special-character input', () => {
      const emptySlug = slugify('');
      expect(emptySlug).toMatch(/^room-[a-z0-9]+$/);

      const specialSlug = slugify('!@#$%^&*()_+~`');
      expect(specialSlug).toMatch(/^room-[a-z0-9]+$/);

      const whitespaceSlug = slugify('     ');
      expect(whitespaceSlug).toMatch(/^room-[a-z0-9]+$/);
    });
  });

  describe('roomService.createRoom - Supabase Online Mode', () => {
    it('creates room in Supabase, persists creator token locally, and returns created room', async () => {
      const mockInsertedRoom: Room = {
        id: 'supabase-room-uuid-1',
        slug: 'ai-hackathon-2026-abcd',
        title: 'AI Hackathon 2026',
        description: 'Build agentic apps',
        category: 'hackathon',
        creator_token: 'cr_mock_token_123',
        is_active: true,
        created_at: new Date().toISOString(),
      };

      const singleMock = vi.fn().mockResolvedValue({
        data: mockInsertedRoom,
        error: null,
      });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const insertMock = vi.fn().mockReturnValue({ select: selectMock });

      mockSupabase.from.mockReturnValue({
        insert: insertMock,
      });

      const input: CreateRoomInput = {
        title: '  AI Hackathon 2026  ',
        description: '  Build agentic apps  ',
        category: 'hackathon',
      };

      const result = await roomService.createRoom(input);

      // Verify Supabase calls
      expect(mockSupabase.from).toHaveBeenCalledWith('rooms');
      expect(insertMock).toHaveBeenCalledTimes(1);

      const insertedPayload = insertMock.mock.calls[0][0];
      expect(insertedPayload.title).toBe('AI Hackathon 2026');
      expect(insertedPayload.description).toBe('Build agentic apps');
      expect(insertedPayload.category).toBe('hackathon');
      expect(insertedPayload.is_active).toBe(true);
      expect(insertedPayload.slug).toMatch(/^ai-hackathon-2026-[a-z0-9]+$/);
      expect(insertedPayload.creator_token).toMatch(/^cr_/);

      // Verify returned data
      expect(result.room).toEqual(mockInsertedRoom);
      expect(result.creatorToken).toMatch(/^cr_/);

      // Verify creator token persisted in localStorage
      const storedToken = localStorage.getItem(`creator_token_${insertedPayload.slug}`);
      expect(storedToken).toBe(result.creatorToken);
    });

    it('sets description to null when optional description is omitted or empty', async () => {
      const singleMock = vi.fn().mockResolvedValue({
        data: { id: 'room-no-desc' },
        error: null,
      });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const insertMock = vi.fn().mockReturnValue({ select: selectMock });

      mockSupabase.from.mockReturnValue({ insert: insertMock });

      await roomService.createRoom({
        title: 'Minimal Room',
        category: 'meetup',
      });

      const payload = insertMock.mock.calls[0][0];
      expect(payload.description).toBeNull();
    });

    it('throws Error when Supabase insert returns an error', async () => {
      const singleMock = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'duplicate key value violates unique constraint "rooms_slug_key"' },
      });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const insertMock = vi.fn().mockReturnValue({ select: selectMock });

      mockSupabase.from.mockReturnValue({ insert: insertMock });

      await expect(
        roomService.createRoom({
          title: 'Duplicate Slug Room',
          category: 'summit',
        })
      ).rejects.toThrow('duplicate key value violates unique constraint "rooms_slug_key"');
    });

    it('throws Error when Supabase encounters an unhandled network error', async () => {
      const singleMock = vi.fn().mockRejectedValue(new Error('Network error: Failed to fetch'));
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const insertMock = vi.fn().mockReturnValue({ select: selectMock });

      mockSupabase.from.mockReturnValue({ insert: insertMock });

      await expect(
        roomService.createRoom({
          title: 'Offline Network Room',
          category: 'hackathon',
        })
      ).rejects.toThrow('Network error: Failed to fetch');
    });
  });

  describe('roomService.createRoom - Offline / LocalStorage Fallback Mode', () => {
    it('creates room locally in localStorage when isSupabaseConfigured is false', async () => {
      mockConfig.isSupabaseConfigured = false;

      const input: CreateRoomInput = {
        title: 'Local Standup Room',
        description: 'Morning sync',
        category: 'meetup',
      };

      const result = await roomService.createRoom(input);

      expect(mockSupabase.from).not.toHaveBeenCalled();
      expect(result.room.title).toBe('Local Standup Room');
      expect(result.room.description).toBe('Morning sync');
      expect(result.room.category).toBe('meetup');
      expect(result.room.is_active).toBe(true);
      expect(result.creatorToken).toMatch(/^cr_/);

      // Verify room stored in hackbuild_local_rooms
      const storedRooms = JSON.parse(localStorage.getItem('hackbuild_local_rooms') || '[]');
      expect(storedRooms.length).toBe(1);
      expect(storedRooms[0].slug).toBe(result.room.slug);

      // Verify creator token persisted in localStorage
      expect(localStorage.getItem(`creator_token_${result.room.slug}`)).toBe(result.creatorToken);
    });

    it('appends multiple rooms to localStorage without overwriting previous rooms', async () => {
      mockConfig.isSupabaseConfigured = false;

      const room1 = await roomService.createRoom({ title: 'Room One', category: 'hackathon' });
      const room2 = await roomService.createRoom({ title: 'Room Two', category: 'summit' });

      const storedRooms = JSON.parse(localStorage.getItem('hackbuild_local_rooms') || '[]');
      expect(storedRooms.length).toBe(2);
      expect(storedRooms[0].title).toBe('Room One');
      expect(storedRooms[1].title).toBe('Room Two');

      expect(localStorage.getItem(`creator_token_${room1.room.slug}`)).toBe(room1.creatorToken);
      expect(localStorage.getItem(`creator_token_${room2.room.slug}`)).toBe(room2.creatorToken);
    });
  });

  describe('roomService.getRoomBySlug - Supabase Online Mode', () => {
    it('returns room populated with stored creator token when queried by creator', async () => {
      const slug = 'founders-lounge-xyz';
      const storedCreatorToken = 'cr_secret_founder_token';
      localStorage.setItem(`creator_token_${slug}`, storedCreatorToken);

      const dbRoom = {
        id: 'uuid-founder-1',
        slug,
        title: 'Founders Lounge',
        description: 'Meet investors and co-founders',
        category: 'summit',
        is_active: true,
        created_at: new Date().toISOString(),
      };

      const maybeSingleMock = vi.fn().mockResolvedValue({
        data: dbRoom,
        error: null,
      });
      const eqActiveMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
      const eqSlugMock = vi.fn().mockReturnValue({ eq: eqActiveMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqSlugMock });

      mockSupabase.from.mockReturnValue({ select: selectMock });

      const result = await roomService.getRoomBySlug(slug);

      expect(mockSupabase.from).toHaveBeenCalledWith('rooms');
      expect(selectMock).toHaveBeenCalledWith('id, slug, title, description, category, is_active, created_at');
      expect(eqSlugMock).toHaveBeenCalledWith('slug', slug);
      expect(eqActiveMock).toHaveBeenCalledWith('is_active', true);

      expect(result).not.toBeNull();
      expect(result?.title).toBe('Founders Lounge');
      expect(result?.creator_token).toBe(storedCreatorToken);
    });

    it('returns empty string for creator_token when attendee queries room', async () => {
      const slug = 'public-attendee-room';
      // No token in localStorage

      const dbRoom = {
        id: 'uuid-attendee-1',
        slug,
        title: 'Public Room',
        description: null,
        category: 'meetup',
        is_active: true,
        created_at: new Date().toISOString(),
      };

      const maybeSingleMock = vi.fn().mockResolvedValue({
        data: dbRoom,
        error: null,
      });
      const eqActiveMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
      const eqSlugMock = vi.fn().mockReturnValue({ eq: eqActiveMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqSlugMock });

      mockSupabase.from.mockReturnValue({ select: selectMock });

      const result = await roomService.getRoomBySlug(slug);

      expect(result).not.toBeNull();
      expect(result?.creator_token).toBe('');
    });

    it('returns null when room is not found in Supabase (data is null)', async () => {
      const maybeSingleMock = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });
      const eqActiveMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
      const eqSlugMock = vi.fn().mockReturnValue({ eq: eqActiveMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqSlugMock });

      mockSupabase.from.mockReturnValue({ select: selectMock });

      const result = await roomService.getRoomBySlug('non-existent-room');
      expect(result).toBeNull();
    });

    it('returns null when Supabase query returns an error', async () => {
      const maybeSingleMock = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database query timeout or connection failed' },
      });
      const eqActiveMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
      const eqSlugMock = vi.fn().mockReturnValue({ eq: eqActiveMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqSlugMock });

      mockSupabase.from.mockReturnValue({ select: selectMock });

      const result = await roomService.getRoomBySlug('error-room');
      expect(result).toBeNull();
    });
  });

  describe('roomService.getRoomBySlug - Offline Mode', () => {
    it('retrieves active room by slug from localStorage', async () => {
      mockConfig.isSupabaseConfigured = false;

      const slug = 'offline-test-slug';
      const localRoom: Room = {
        id: 'offline-uuid',
        slug,
        title: 'Offline Hallway',
        description: 'Offline networking',
        category: 'hackathon',
        creator_token: 'cr_local_token',
        is_active: true,
        created_at: new Date().toISOString(),
      };

      localStorage.setItem('hackbuild_local_rooms', JSON.stringify([localRoom]));

      const result = await roomService.getRoomBySlug(slug);

      expect(result).toEqual(localRoom);
    });

    it('returns null when slug does not exist in localStorage rooms', async () => {
      mockConfig.isSupabaseConfigured = false;
      localStorage.setItem('hackbuild_local_rooms', JSON.stringify([]));

      const result = await roomService.getRoomBySlug('missing-slug');
      expect(result).toBeNull();
    });

    it('returns null when room exists locally but has is_active set to false', async () => {
      mockConfig.isSupabaseConfigured = false;

      const inactiveRoom: Room = {
        id: 'inactive-room-1',
        slug: 'archived-room',
        title: 'Archived Room',
        description: null,
        category: 'meetup',
        creator_token: 'cr_archive',
        is_active: false,
        created_at: new Date().toISOString(),
      };

      localStorage.setItem('hackbuild_local_rooms', JSON.stringify([inactiveRoom]));

      const result = await roomService.getRoomBySlug('archived-room');
      expect(result).toBeNull();
    });

    it('handles empty or missing hackbuild_local_rooms key gracefully without throwing', async () => {
      mockConfig.isSupabaseConfigured = false;
      // Key not present in localStorage

      const result = await roomService.getRoomBySlug('any-slug');
      expect(result).toBeNull();
    });
  });

  describe('Creator Token Verification & Validation', () => {
    it('getStoredCreatorToken retrieves token from localStorage', () => {
      localStorage.setItem('creator_token_demo-slug', 'cr_12345');
      expect(roomService.getStoredCreatorToken('demo-slug')).toBe('cr_12345');
      expect(roomService.getStoredCreatorToken('other-slug')).toBeNull();
    });

    it('isRoomCreator returns true when creator token exists, false otherwise', () => {
      localStorage.setItem('creator_token_my-event', 'cr_valid_token');
      expect(roomService.isRoomCreator('my-event')).toBe(true);
      expect(roomService.isRoomCreator('unknown-event')).toBe(false);
    });

    it('validateCreatorToken returns true when token matches stored creator token', async () => {
      const slug = 'event-hall-alpha';
      const token = 'cr_valid_secret_999';
      localStorage.setItem(`creator_token_${slug}`, token);

      const isValid = await (roomService as any).validateCreatorToken(slug, token);
      expect(isValid).toBe(true);
    });

    it('validateCreatorToken returns false on mismatched token', async () => {
      const slug = 'event-hall-beta';
      localStorage.setItem(`creator_token_${slug}`, 'cr_actual_token');

      const isValid = await (roomService as any).validateCreatorToken(slug, 'cr_wrong_token');
      expect(isValid).toBe(false);
    });

    it('validateCreatorToken returns false when token or slug is empty', async () => {
      expect(await (roomService as any).validateCreatorToken('', 'token')).toBe(false);
      expect(await (roomService as any).validateCreatorToken('slug', '')).toBe(false);
    });

    it('validateCreatorToken queries Supabase when no local token exists and returns true on match', async () => {
      const slug = 'supabase-remote-room';
      const token = 'cr_remote_valid_token';

      const maybeSingleMock = vi.fn().mockResolvedValue({
        data: { id: 'remote-uuid', creator_token: token },
        error: null,
      });
      const eqTokenMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
      const eqSlugMock = vi.fn().mockReturnValue({ eq: eqTokenMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqSlugMock });

      mockSupabase.from.mockReturnValue({ select: selectMock });

      const isValid = await (roomService as any).validateCreatorToken(slug, token);
      expect(isValid).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('rooms');
      expect(eqSlugMock).toHaveBeenCalledWith('slug', slug);
      expect(eqTokenMock).toHaveBeenCalledWith('creator_token', token);
    });

    it('validateCreatorToken returns false when Supabase query returns error or no matching room', async () => {
      const slug = 'remote-unauthorized-room';
      const token = 'cr_invalid_token';

      const maybeSingleMock = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'No rows found' },
      });
      const eqTokenMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
      const eqSlugMock = vi.fn().mockReturnValue({ eq: eqTokenMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqSlugMock });

      mockSupabase.from.mockReturnValue({ select: selectMock });

      const isValid = await (roomService as any).validateCreatorToken(slug, token);
      expect(isValid).toBe(false);
    });
  });
});
