import { useEffect, useState, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Attendee, Announcement } from '../../types/models';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface PresencePayload {
  userId: string;
  displayName: string;
  role: string;
  currentZone?: string | null;
  isAvailableToChat: boolean;
}

export interface UseRoomPresenceProps {
  roomSlug: string;
  currentAttendee: Attendee | null;
  onIncomingWave?: (requesterName: string, requesterRole: string) => void;
  onMutualMatch?: (partnerId: string) => void;
  onNewAnnouncement?: (announcement: Announcement) => void;
}

export function useRoomPresence({
  roomSlug,
  currentAttendee,
  onIncomingWave,
  onMutualMatch,
  onNewAnnouncement,
}: UseRoomPresenceProps) {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Keep latest callbacks in refs to avoid stale closure trap
  const onIncomingWaveRef = useRef(onIncomingWave);
  onIncomingWaveRef.current = onIncomingWave;
  const onMutualMatchRef = useRef(onMutualMatch);
  onMutualMatchRef.current = onMutualMatch;
  const onNewAnnouncementRef = useRef(onNewAnnouncement);
  onNewAnnouncementRef.current = onNewAnnouncement;
  const currentAttendeeRef = useRef(currentAttendee);
  currentAttendeeRef.current = currentAttendee;

  useEffect(() => {
    if (!roomSlug || !isSupabaseConfigured) {
      // Mock local presence
      if (currentAttendee) {
        setOnlineUserIds(new Set([currentAttendee.id]));
      }
      return;
    }

    const channelName = `room:${roomSlug}:events`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: currentAttendeeRef.current?.id || 'anon',
        },
      },
    });

    channelRef.current = channel;

    // 1. Presence Sync
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresencePayload>();
        const ids = new Set<string>();
        Object.keys(state).forEach((key) => {
          ids.add(key);
        });
        setOnlineUserIds(ids);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setOnlineUserIds((prev) => new Set([...prev, key]));
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUserIds((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      });

    // 2. Broadcast Listeners (using refs to guarantee freshest closure)
    channel.on('broadcast', { event: 'wave_sent' }, ({ payload }) => {
      const myId = currentAttendeeRef.current?.id;
      if (payload.recipientId === myId) {
        onIncomingWaveRef.current?.(payload.requesterName, payload.requesterRole);
      }
    });

    channel.on('broadcast', { event: 'wave_accepted' }, ({ payload }) => {
      const myId = currentAttendeeRef.current?.id;
      if (payload.requesterId === myId || payload.recipientId === myId) {
        const partnerId =
          payload.requesterId === myId
            ? payload.recipientId
            : payload.requesterId;
        onMutualMatchRef.current?.(partnerId);
      }
    });

    channel.on('broadcast', { event: 'announcement_published' }, ({ payload }) => {
      onNewAnnouncementRef.current?.(payload);
    });

    // Subscribe and track presence
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED' && currentAttendeeRef.current) {
        const att = currentAttendeeRef.current;
        await channel.track({
          userId: att.id,
          displayName: att.display_name,
          role: att.role,
          currentZone: att.current_zone,
          isAvailableToChat: att.is_available_to_chat,
        });
      }
    });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [roomSlug]); // Stable dependency: only reconnects if roomSlug changes

  const trackPresence = async (updated: Attendee) => {
    if (channelRef.current && isSupabaseConfigured) {
      await channelRef.current.track({
        userId: updated.id,
        displayName: updated.display_name,
        role: updated.role,
        currentZone: updated.current_zone,
        isAvailableToChat: updated.is_available_to_chat,
      });
    }
  };

  return {
    channel: channelRef.current,
    onlineUserIds,
    onlineCount: onlineUserIds.size,
    trackPresence,
  };
}
