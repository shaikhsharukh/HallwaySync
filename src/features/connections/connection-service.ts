import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Connection, Attendee, ConnectionWithProfile } from '../../types/models';
import { RealtimeChannel } from '@supabase/supabase-js';

const LOCAL_CONNECTIONS_KEY = 'hackbuild_local_connections';

export interface WaveBroadcastPayload {
  connectionId: string;
  requesterId: string;
  requesterName: string;
  requesterRole: string;
  recipientId: string;
  isMutual: boolean;
}

export const connectionService = {
  async sendWave(
    roomId: string,
    requester: Attendee,
    recipientId: string,
    channel?: RealtimeChannel | null
  ): Promise<{ connection: Connection; isMutual: boolean }> {
    // 1. Check if reverse wave exists (Recipient had already waved at requester)
    if (isSupabaseConfigured) {
      const { data: reverse } = await supabase
        .from('connections')
        .select('*')
        .eq('room_id', roomId)
        .eq('requester_id', recipientId)
        .eq('recipient_id', requester.id)
        .maybeSingle();

      if (reverse) {
        // Mutual match!
        const reverseId = (reverse as any).id;
        const { data: updated, error } = await (supabase.from('connections') as any)
          .update({
            status: 'connected',
            updated_at: new Date().toISOString(),
          })
          .eq('id', reverseId)
          .select()
          .single();

        if (error) throw new Error(error.message);

        // Broadcast mutual wave accepted event
        if (channel) {
          channel.send({
            type: 'broadcast',
            event: 'wave_accepted',
            payload: {
              connectionId: reverseId,
              requesterId: requester.id,
              recipientId,
              isMutual: true,
            },
          });
        }

        return { connection: updated as unknown as Connection, isMutual: true };
      }

      // Insert new wave
      const { data, error } = await (supabase.from('connections') as any)
        .upsert(
          {
            room_id: roomId,
            requester_id: requester.id,
            recipient_id: recipientId,
            status: 'pending',
            connection_type: 'wave',
          },
          { onConflict: 'room_id,requester_id,recipient_id' }
        )
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Broadcast incoming wave notification
      if (channel) {
        channel.send({
          type: 'broadcast',
          event: 'wave_sent',
          payload: {
            connectionId: (data as any)?.id,
            requesterId: requester.id,
            requesterName: requester.display_name,
            requesterRole: requester.role,
            recipientId,
            isMutual: false,
          },
        });
      }

      return { connection: data as unknown as Connection, isMutual: false };
    }

    // LocalStorage Fallback for Offline / Demo
    const existing: Connection[] = JSON.parse(
      localStorage.getItem(LOCAL_CONNECTIONS_KEY) || '[]'
    );
    const reverse = existing.find(
      (c) =>
        c.room_id === roomId &&
        c.requester_id === recipientId &&
        c.recipient_id === requester.id
    );

    if (reverse) {
      reverse.status = 'connected';
      reverse.updated_at = new Date().toISOString();
      localStorage.setItem(LOCAL_CONNECTIONS_KEY, JSON.stringify(existing));
      return { connection: reverse, isMutual: true };
    }

    const newConn: Connection = {
      id: `conn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      room_id: roomId,
      requester_id: requester.id,
      recipient_id: recipientId,
      status: 'pending',
      connection_type: 'wave',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    existing.push(newConn);
    localStorage.setItem(LOCAL_CONNECTIONS_KEY, JSON.stringify(existing));
    return { connection: newConn, isMutual: false };
  },

  async scanBadge(
    roomId: string,
    scannerId: string,
    badgeOwnerId: string,
    channel?: RealtimeChannel | null
  ): Promise<Connection> {
    if (isSupabaseConfigured) {
      // 1. Check if reverse connection already exists
      const { data: reverse } = await (supabase.from('connections') as any)
        .select('*')
        .eq('room_id', roomId)
        .eq('requester_id', badgeOwnerId)
        .eq('recipient_id', scannerId)
        .maybeSingle();

      let connection: Connection;

      if (reverse) {
        const { data: updated, error } = await (supabase.from('connections') as any)
          .update({
            status: 'connected',
            connection_type: 'qr_scan',
            updated_at: new Date().toISOString(),
          })
          .eq('id', (reverse as any).id)
          .select()
          .single();

        if (error) throw new Error(error.message);
        connection = updated as unknown as Connection;
      } else {
        const { data, error } = await (supabase.from('connections') as any)
          .upsert(
            {
              room_id: roomId,
              requester_id: scannerId,
              recipient_id: badgeOwnerId,
              status: 'connected',
              connection_type: 'qr_scan',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'room_id,requester_id,recipient_id' }
          )
          .select()
          .single();

        if (error) throw new Error(error.message);
        connection = data as unknown as Connection;
      }

      // 2. Broadcast mutual connection so peer device gets toast & celebration
      if (channel) {
        channel.send({
          type: 'broadcast',
          event: 'wave_accepted',
          payload: {
            connectionId: connection.id,
            requesterId: scannerId,
            recipientId: badgeOwnerId,
            isMutual: true,
          },
        });
      }

      return connection;
    }

    // Local fallback
    const existing: Connection[] = JSON.parse(
      localStorage.getItem(LOCAL_CONNECTIONS_KEY) || '[]'
    );
    let conn = existing.find(
      (c) =>
        c.room_id === roomId &&
        ((c.requester_id === scannerId && c.recipient_id === badgeOwnerId) ||
          (c.requester_id === badgeOwnerId && c.recipient_id === scannerId))
    );

    if (conn) {
      conn.status = 'connected';
      conn.connection_type = 'qr_scan';
      conn.updated_at = new Date().toISOString();
    } else {
      conn = {
        id: `scan_${Date.now()}`,
        room_id: roomId,
        requester_id: scannerId,
        recipient_id: badgeOwnerId,
        status: 'connected',
        connection_type: 'qr_scan',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      existing.push(conn);
    }

    localStorage.setItem(LOCAL_CONNECTIONS_KEY, JSON.stringify(existing));
    return conn;
  },

  async getMyConnections(
    roomId: string,
    userId: string,
    allAttendees: Attendee[]
  ): Promise<ConnectionWithProfile[]> {
    let connections: Connection[] = [];

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('room_id', roomId)
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`);

      if (!error && data) {
        connections = data as unknown as Connection[];
      }
    } else {
      const existing: Connection[] = JSON.parse(
        localStorage.getItem(LOCAL_CONNECTIONS_KEY) || '[]'
      );
      connections = existing.filter(
        (c) =>
          c.room_id === roomId &&
          (c.requester_id === userId || c.recipient_id === userId)
      );
    }

    const attendeeMap = new Map(allAttendees.map((a) => [a.id, a]));

    return connections
      .map((conn) => {
        const partnerId =
          conn.requester_id === userId ? conn.recipient_id : conn.requester_id;
        const partner = attendeeMap.get(partnerId);
        if (!partner) return null;
        return {
          ...conn,
          partner,
        };
      })
      .filter(Boolean) as ConnectionWithProfile[];
  },
};
