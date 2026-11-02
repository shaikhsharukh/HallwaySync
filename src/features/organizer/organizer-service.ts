import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Attendee, RoomAnalyticsSummary, Announcement } from '../../types/models';
import { isPresenceActive } from '../../lib/utils';
import { RealtimeChannel } from '@supabase/supabase-js';

const LOCAL_ANNOUNCEMENTS_KEY = 'hackbuild_local_announcements';
const LOCAL_ATTENDEES_KEY = 'hackbuild_local_attendees';

function sanitizeCell(value: string | null | undefined): string {
  if (!value) return '""';
  let str = value.replace(/"/g, '""');
  // Prevent spreadsheet formula injection (=, +, -, @)
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str}"`;
}

export function generateAttendeeCSV(attendees: Attendee[]): string {
  const headers = ['Display Name', 'Role', 'Skills', 'Intent', 'Contact Handle', 'Zone'];
  const rows = attendees
    .filter((a) => !a.is_banned)
    .map((a) => [
      sanitizeCell(a.display_name),
      sanitizeCell(a.role),
      sanitizeCell(a.skills.join(', ')),
      sanitizeCell(a.intent.join(', ')),
      sanitizeCell(a.contact_handle),
      sanitizeCell(a.current_zone),
    ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export const organizerService = {
  calculateAnalytics(attendees: Attendee[]): RoomAnalyticsSummary {
    const roleBreakdown: Record<string, number> = {};
    const intentBreakdown: Record<string, number> = {};
    const skillMap = new Map<string, number>();
    let activeNow = 0;

    for (const a of attendees) {
      if (a.is_banned) continue;
      if (isPresenceActive(a.is_available_to_chat, a.available_until)) {
        activeNow++;
      }

      roleBreakdown[a.role] = (roleBreakdown[a.role] || 0) + 1;

      for (const intent of a.intent) {
        intentBreakdown[intent] = (intentBreakdown[intent] || 0) + 1;
      }

      for (const s of a.skills) {
        skillMap.set(s, (skillMap.get(s) || 0) + 1);
      }
    }

    const topSkills = Array.from(skillMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalAttendees: attendees.filter((a) => !a.is_banned).length,
      activeNow,
      connectionsCount: 0,
      roleBreakdown,
      topSkills,
      intentBreakdown,
    };
  },

  async postAnnouncement(
    roomId: string,
    title: string,
    message: string,
    creatorToken: string = '',
    channel?: RealtimeChannel | null
  ): Promise<Announcement> {
    if (isSupabaseConfigured) {
      // Use secure RPC validating creator token
      const { data, error } = await (supabase as any).rpc('post_room_announcement', {
        p_room_id: roomId,
        p_title: title.trim(),
        p_message: message.trim(),
        p_creator_token: creatorToken,
      });

      if (error) {
        // Fallback to table insert if RPC not yet deployed
        const { data: fallbackData, error: fbError } = await supabase
          .from('announcements')
          .insert({
            room_id: roomId,
            title: title.trim(),
            message: message.trim(),
            is_pinned: true,
          } as any)
          .select()
          .single();

        if (fbError) throw new Error(fbError.message);

        if (channel) {
          channel.send({
            type: 'broadcast',
            event: 'announcement_published',
            payload: fallbackData,
          });
        }
        return fallbackData as unknown as Announcement;
      }

      // Broadcast immediately over Realtime channel
      if (channel) {
        channel.send({
          type: 'broadcast',
          event: 'announcement_published',
          payload: data,
        });
      }

      return data as unknown as Announcement;
    }

    // LocalStorage fallback
    const newAnn: Announcement = {
      id: `ann_${Date.now()}`,
      room_id: roomId,
      title: title.trim(),
      message: message.trim(),
      is_pinned: true,
      created_at: new Date().toISOString(),
    };

    const existing: Announcement[] = JSON.parse(
      localStorage.getItem(LOCAL_ANNOUNCEMENTS_KEY) || '[]'
    );
    existing.unshift(newAnn);
    localStorage.setItem(LOCAL_ANNOUNCEMENTS_KEY, JSON.stringify(existing));
    return newAnn;
  },

  async getLatestAnnouncement(roomId: string): Promise<Announcement | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('room_id', roomId)
        .eq('is_pinned', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;
      return data as unknown as Announcement;
    }

    const existing: Announcement[] = JSON.parse(
      localStorage.getItem(LOCAL_ANNOUNCEMENTS_KEY) || '[]'
    );
    return existing.find((a) => a.room_id === roomId && a.is_pinned) || null;
  },

  async banAttendee(roomId: string, attendeeId: string, creatorToken: string = ''): Promise<void> {
    if (isSupabaseConfigured) {
      // Call security-definer RPC to bypass regular attendee RLS
      const { error } = await (supabase as any).rpc('ban_attendee', {
        p_room_id: roomId,
        p_attendee_id: attendeeId,
        p_creator_token: creatorToken,
      });

      if (error) {
        // Fallback to direct update
        await (supabase.from('attendees') as any)
          .update({ is_banned: true })
          .eq('id', attendeeId)
          .eq('room_id', roomId);
      }
      return;
    }

    const existing: Attendee[] = JSON.parse(
      localStorage.getItem(LOCAL_ATTENDEES_KEY) || '[]'
    );
    const index = existing.findIndex((a) => a.id === attendeeId && a.room_id === roomId);
    if (index >= 0) {
      existing[index].is_banned = true;
      localStorage.setItem(LOCAL_ATTENDEES_KEY, JSON.stringify(existing));
    }
  },

  generateCSV(attendees: Attendee[]): string {
    return generateAttendeeCSV(attendees);
  },

  downloadCSV(roomSlug: string, attendees: Attendee[]): void {
    const csvContent = generateAttendeeCSV(attendees);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `attendees-${roomSlug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

