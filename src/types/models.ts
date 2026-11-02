import { Database, ProfessionalRole } from './database';

export type Room = Database['public']['Tables']['rooms']['Row'];
export type Attendee = Database['public']['Tables']['attendees']['Row'];
export type Connection = Database['public']['Tables']['connections']['Row'];
export type Announcement = Database['public']['Tables']['announcements']['Row'];

export interface AttendeeProfileInput {
  displayName: string;
  role: ProfessionalRole;
  headline?: string;
  bio?: string;
  skills: string[];
  intent: string[];
  contactHandle?: string;
  avatarGithub?: string;
  avatarColor?: string;
}

export interface ConnectionWithProfile extends Connection {
  partner: Attendee;
}

export interface MatchRecommendation {
  attendee: Attendee;
  matchScore: number;
  matchReason: string;
  matchCategory: 'team_complement' | 'domain_affinity' | 'cross_discipline';
}

export interface RoomAnalyticsSummary {
  totalAttendees: number;
  activeNow: number;
  connectionsCount: number;
  roleBreakdown: Record<string, number>;
  topSkills: Array<{ tag: string; count: number }>;
  intentBreakdown: Record<string, number>;
}
