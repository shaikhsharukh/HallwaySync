# Interface Contract: Client Services & Algorithms

**Feature**: Tech Event Social & Networking Rooms  
**Language**: TypeScript  

---

## 1. Matchmaking Engine Contract (`lib/matching-rules.ts`)

Pure deterministic matching functions executing synchronously on client with zero network latency.

```typescript
export interface AttendeeMatchProfile {
  id: string;
  displayName: string;
  role: 'Frontend' | 'Backend' | 'Fullstack' | 'AI/ML' | 'Mobile' | 'UI/UX' | 'Product' | 'Founder' | 'Other';
  skills: string[];
  intent: string[];
  isAvailableToChat: boolean;
}

export interface MatchRecommendation {
  attendee: AttendeeMatchProfile;
  matchScore: number;       // 0 to 100
  matchReason: string;      // Human-readable rationale, e.g. "Complementary: Frontend + Backend for Hackathon Team"
  matchCategory: 'team_complement' | 'domain_affinity' | 'cross_discipline';
}

/**
 * Computes top matches for the current user against all room participants
 */
export function calculateRoomMatches(
  currentUser: AttendeeMatchProfile,
  allAttendees: AttendeeMatchProfile[],
  eventCategory: 'hackathon' | 'summit' | 'meetup',
  limit?: number
): MatchRecommendation[];
```

---

## 2. Room Service Contract (`features/room/room-service.ts`)

Interactions with Supabase BaaS for room operations.

```typescript
export interface CreateRoomInput {
  title: string;
  description?: string;
  category: 'hackathon' | 'summit' | 'meetup';
}

export interface RoomDetails {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: 'hackathon' | 'summit' | 'meetup';
  isActive: boolean;
  createdAt: string;
  creatorToken?: string;
}

export interface RoomService {
  createRoom(input: CreateRoomInput): Promise<{ room: RoomDetails; creatorToken: string }>;
  getRoomBySlug(slug: string): Promise<RoomDetails | null>;
  joinRoomAnonymously(roomId: string, profile: AttendeeProfileInput): Promise<AttendeeProfile>;
  getRoomAttendees(roomId: string): Promise<AttendeeProfile[]>;
  updateAvailability(attendeeId: string, isAvailable: boolean, zone?: string): Promise<void>;
}
```

---

## 3. Connection Handshake Contract (`features/connections/connection-service.ts`)

```typescript
export interface ConnectionService {
  sendWave(roomId: string, recipientId: string): Promise<{ connectionId: string }>;
  acceptWave(connectionId: string): Promise<void>;
  scanBadge(roomId: string, recipientId: string): Promise<{ connectionId: string; status: 'connected' }>;
  getMyConnections(roomId: string): Promise<ConnectionWithProfile[]>;
}
```

---

## 4. Organizer Analytics Contract (`features/organizer/organizer-service.ts`)

```typescript
export interface RoomAnalyticsSummary {
  totalAttendees: number;
  activeNow: number;
  connectionsCount: number;
  roleBreakdown: Record<string, number>;    // e.g. { "Frontend": 12, "Backend": 15, "AI/ML": 8 }
  topSkills: Array<{ tag: string; count: number }>;
  intentBreakdown: Record<string, number>;  // e.g. { "Looking for Team": 25, "Hiring": 5 }
}

export interface OrganizerService {
  getRoomAnalytics(roomId: string): Promise<RoomAnalyticsSummary>;
  postAnnouncement(roomId: string, creatorToken: string, title: string, message: string): Promise<void>;
  banAttendee(roomId: string, creatorToken: string, attendeeId: string): Promise<void>;
  exportAttendeesCSV(roomId: string): Promise<string>;
}
```
