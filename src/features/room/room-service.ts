import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Room } from '../../types/models';
import { EventCategory } from '../../types/database';

export interface CreateRoomInput {
  title: string;
  description?: string;
  category: EventCategory;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || `room-${Math.random().toString(36).substring(2, 8)}`;
}

const LOCAL_ROOMS_KEY = 'hackbuild_local_rooms';

export const roomService = {
  async createRoom(input: CreateRoomInput): Promise<{ room: Room; creatorToken: string }> {
    const baseSlug = slugify(input.title);
    const creatorToken = `cr_${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)}`;
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    const newRoom: Omit<Room, 'id' | 'created_at'> & { id?: string } = {
      slug,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      category: input.category,
      creator_token: creatorToken,
      is_active: true,
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('rooms')
        .insert(newRoom as any)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Persist creator token locally
      localStorage.setItem(`creator_token_${slug}`, creatorToken);
      return { room: data as unknown as Room, creatorToken };
    }

    // Offline / Demo LocalStorage Mode
    const fullRoom: Room = {
      id: crypto.randomUUID ? crypto.randomUUID() : `room-${Date.now()}`,
      slug,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      category: input.category,
      creator_token: creatorToken,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const existing: Room[] = JSON.parse(localStorage.getItem(LOCAL_ROOMS_KEY) || '[]');
    existing.push(fullRoom);
    localStorage.setItem(LOCAL_ROOMS_KEY, JSON.stringify(existing));
    localStorage.setItem(`creator_token_${slug}`, creatorToken);

    return { room: fullRoom, creatorToken };
  },

  async getRoomBySlug(slug: string): Promise<Room | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('rooms')
        .select('id, slug, title, description, category, is_active, created_at')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !data) return null;
      return {
        ...(data as any),
        creator_token: this.getStoredCreatorToken(slug) || '',
      } as Room;
    }

    // Local fallback
    const existing: Room[] = JSON.parse(localStorage.getItem(LOCAL_ROOMS_KEY) || '[]');
    return existing.find((r) => r.slug === slug && r.is_active) || null;
  },

  getStoredCreatorToken(slug: string): string | null {
    return localStorage.getItem(`creator_token_${slug}`);
  },

  isRoomCreator(slug: string): boolean {
    return Boolean(this.getStoredCreatorToken(slug));
  },
};
