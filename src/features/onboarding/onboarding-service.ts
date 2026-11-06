import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Attendee, AttendeeProfileInput } from '../../types/models';
import { getRoleColor } from '../../lib/utils';

const LOCAL_ATTENDEES_KEY = 'hackbuild_local_attendees';

export const onboardingService = {
  async joinRoom(
    roomId: string,
    userId: string,
    profile: AttendeeProfileInput
  ): Promise<Attendee> {
    const avatarColor = profile.avatarColor || getRoleColor(profile.role);
    const avatarGithub = profile.avatarGithub?.replace('@', '').trim() || null;
    const contactHandle = profile.contactHandle?.trim() || null;

    const newAttendee: Omit<Attendee, 'created_at' | 'updated_at'> = {
      id: userId,
      room_id: roomId,
      display_name: profile.displayName.trim(),
      role: profile.role,
      headline: profile.headline?.trim() || null,
      bio: profile.bio?.trim() || null,
      skills: profile.skills,
      intent: profile.intent,
      contact_handle: contactHandle,
      avatar_color: avatarColor,
      avatar_github: avatarGithub,
      is_available_to_chat: false,
      available_until: null,
      current_zone: null,
      is_banned: false,
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('attendees')
        .upsert(newAttendee as any, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Cache locally for fast retrieval
      localStorage.setItem(`attendee_${roomId}`, JSON.stringify(data));
      return data as unknown as Attendee;
    }

    // LocalStorage fallback for offline demo
    const fullAttendee: Attendee = {
      ...newAttendee,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const existing: Attendee[] = JSON.parse(
      localStorage.getItem(LOCAL_ATTENDEES_KEY) || '[]'
    );
    const index = existing.findIndex((a) => a.id === userId && a.room_id === roomId);
    if (index >= 0) {
      existing[index] = fullAttendee;
    } else {
      existing.push(fullAttendee);
    }

    localStorage.setItem(LOCAL_ATTENDEES_KEY, JSON.stringify(existing));
    localStorage.setItem(`attendee_${roomId}`, JSON.stringify(fullAttendee));

    return fullAttendee;
  },

  async getCurrentAttendee(roomId: string, userId: string): Promise<Attendee | null> {
    // Check local session cache first
    const cached = localStorage.getItem(`attendee_${roomId}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.id === userId && parsed.room_id === roomId && !parsed.is_banned) {
          return parsed;
        }
      } catch {
        // Continue
      }
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('attendees')
        .select('*')
        .eq('room_id', roomId)
        .eq('id', userId)
        .eq('is_banned', false)
        .maybeSingle();

      if (error || !data) return null;
      localStorage.setItem(`attendee_${roomId}`, JSON.stringify(data));
      return data as unknown as Attendee;
    }

    const existing: Attendee[] = JSON.parse(
      localStorage.getItem(LOCAL_ATTENDEES_KEY) || '[]'
    );
    return existing.find((a) => a.id === userId && a.room_id === roomId && !a.is_banned) || null;
  },

  async updateAvailability(
    attendeeId: string,
    isAvailable: boolean,
    zone?: string | null
  ): Promise<void> {
    const availableUntil = isAvailable
      ? new Date(Date.now() + 60 * 60 * 1000).toISOString() // 60 mins
      : null;

    // Update session caches in localStorage so room refreshes preserve updated availability
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('attendee_')) {
          const item = JSON.parse(localStorage.getItem(key) || '{}');
          if (item.id === attendeeId) {
            item.is_available_to_chat = isAvailable;
            item.available_until = availableUntil;
            item.current_zone = zone ?? null;
            localStorage.setItem(key, JSON.stringify(item));
          }
        }
      }
    } catch {
      // Ignore cache storage errors
    }

    if (isSupabaseConfigured) {
      const { error } = await (supabase.from('attendees') as any)
        .update({
          is_available_to_chat: isAvailable,
          available_until: availableUntil,
          current_zone: zone ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', attendeeId);

      if (error) {
        console.error('Failed to update availability in Supabase:', error);
      }
      return;
    }

    const existing: Attendee[] = JSON.parse(
      localStorage.getItem(LOCAL_ATTENDEES_KEY) || '[]'
    );
    const index = existing.findIndex((a) => a.id === attendeeId);
    if (index >= 0) {
      existing[index].is_available_to_chat = isAvailable;
      existing[index].available_until = availableUntil;
      existing[index].current_zone = zone ?? null;
      localStorage.setItem(LOCAL_ATTENDEES_KEY, JSON.stringify(existing));
    }
  },
};
