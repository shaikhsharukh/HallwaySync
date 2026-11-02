# Interface Contract: Supabase Realtime Channels

**Feature**: Tech Event Social & Networking Rooms  
**Protocol**: Supabase Realtime (WebSockets)  
**Channel Scopes**: Per-Room Isolation (`room:{room_slug}`)  

---

## 1. Presence Channel: `room:{slug}:presence`

Ephemeral in-memory tracking of active in-venue participants. Does not trigger database disk writes.

### 1.1 State Payload (Tracked by Each Client)

```typescript
export interface AttendeePresenceState {
  userId: string;              // auth.uid()
  displayName: string;         // e.g. "Alex Chen"
  role: string;                // e.g. "Frontend"
  avatarColor: string;         // e.g. "#6366f1"
  avatarGithub?: string;       // e.g. "alexchen"
  isAvailableToChat: boolean;  // true if toggled on
  currentZone?: string;        // e.g. "Table 14"
  joinedAt: string;            // ISO 8601 timestamp
}
```

### 1.2 Channel Lifecycle Events

- **Join**: Client calls `channel.track(presencePayload)` upon room entry.
- **Sync**: Client listens to `'sync'` event to calculate real-time online headcount and render green presence dots on active attendee cards.
- **Leave**: Disconnect or tab close automatically dispatches `'leave'` event to peers in room.

---

## 2. Broadcast Channel: `room:{slug}:broadcast`

Transient peer-to-peer event notifications pushed to active clients in under 500ms.

### 2.1 Event: `wave_sent`

Dispatched when User A waves at User B.

```typescript
export interface WaveSentBroadcast {
  type: 'broadcast';
  event: 'wave_sent';
  payload: {
    connectionId: string;
    requesterId: string;
    requesterName: string;
    requesterRole: string;
    recipientId: string;       // Filtered client-side so only User B displays toast
    timestamp: string;
  };
}
```

### 2.2 Event: `wave_accepted`

Dispatched when User B accepts User A's wave.

```typescript
export interface WaveAcceptedBroadcast {
  type: 'broadcast';
  event: 'wave_accepted';
  payload: {
    connectionId: string;
    requesterId: string;
    recipientId: string;
    recipientName: string;
    timestamp: string;
  };
}
```

### 2.3 Event: `announcement_published`

Dispatched when an organizer posts an announcement.

```typescript
export interface AnnouncementBroadcast {
  type: 'broadcast';
  event: 'announcement_published';
  payload: {
    announcementId: string;
    title: string;
    message: string;
    isPinned: boolean;
    createdAt: string;
  };
}
```

---

## 3. Postgres Changes Channel: `room:{slug}:db_changes`

Listens for permanent database table changes via PostgreSQL CDC.

### 3.1 Table `connections` Listener

- **Event**: `INSERT` / `UPDATE`
- **Filter**: `room_id=eq.{roomId}`
- **Behavior**: Client updates local "Connections" tab and unlocks contact handle buttons when `status === 'connected'`.
