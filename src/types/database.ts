export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type EventCategory = 'hackathon' | 'summit' | 'meetup';

export type ProfessionalRole =
  | 'Frontend'
  | 'Backend'
  | 'Fullstack'
  | 'AI/ML'
  | 'Mobile'
  | 'UI/UX'
  | 'Product'
  | 'Founder'
  | 'Other';

export type ConnectionStatus = 'pending' | 'connected' | 'ignored';
export type ConnectionType = 'wave' | 'qr_scan';

export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          category: EventCategory;
          creator_token: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          category: EventCategory;
          creator_token: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          category?: EventCategory;
          creator_token?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      attendees: {
        Row: {
          id: string;
          room_id: string;
          display_name: string;
          role: ProfessionalRole;
          headline: string | null;
          bio: string | null;
          skills: string[];
          intent: string[];
          contact_handle: string | null;
          avatar_color: string;
          avatar_github: string | null;
          is_available_to_chat: boolean;
          available_until: string | null;
          current_zone: string | null;
          is_banned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          room_id: string;
          display_name: string;
          role: ProfessionalRole;
          headline?: string | null;
          bio?: string | null;
          skills?: string[];
          intent?: string[];
          contact_handle?: string | null;
          avatar_color?: string;
          avatar_github?: string | null;
          is_available_to_chat?: boolean;
          available_until?: string | null;
          current_zone?: string | null;
          is_banned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          display_name?: string;
          role?: ProfessionalRole;
          headline?: string | null;
          bio?: string | null;
          skills?: string[];
          intent?: string[];
          contact_handle?: string | null;
          avatar_color?: string;
          avatar_github?: string | null;
          is_available_to_chat?: boolean;
          available_until?: string | null;
          current_zone?: string | null;
          is_banned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      connections: {
        Row: {
          id: string;
          room_id: string;
          requester_id: string;
          recipient_id: string;
          status: ConnectionStatus;
          connection_type: ConnectionType;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          requester_id: string;
          recipient_id: string;
          status?: ConnectionStatus;
          connection_type: ConnectionType;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          requester_id?: string;
          recipient_id?: string;
          status?: ConnectionStatus;
          connection_type?: ConnectionType;
          created_at?: string;
          updated_at?: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          room_id: string;
          title: string;
          message: string;
          is_pinned: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          title: string;
          message: string;
          is_pinned?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          title?: string;
          message?: string;
          is_pinned?: boolean;
          created_at?: string;
        };
      };
    };
    Functions: {
      ban_attendee: {
        Args: {
          p_room_id: string;
          p_attendee_id: string;
          p_creator_token: string;
        };
        Returns: void;
      };
      post_room_announcement: {
        Args: {
          p_room_id: string;
          p_title: string;
          p_message: string;
          p_creator_token: string;
        };
        Returns: {
          id: string;
          room_id: string;
          title: string;
          message: string;
          is_pinned: boolean;
          created_at: string;
        };
      };
      cleanup_expired_rooms: {
        Args: {
          p_expiry_hours?: number;
        };
        Returns: {
          deactivated_count: number;
          purged_count: number;
        }[];
      };
    };
  };
}
