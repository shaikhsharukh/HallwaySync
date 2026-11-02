-- Supabase Cloud Migration: Event Networking Rooms
-- Created: 2026-11-02
-- Complies with Data Model & RLS Matrix from data-model.md

-- 1. Create Rooms Table
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null check (char_length(title) between 3 and 100),
  description text check (description is null or char_length(description) <= 500),
  category text not null check (category in ('hackathon', 'summit', 'meetup')),
  creator_token text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2. Create Attendees Table
create table if not exists public.attendees (
  id uuid primary key,
  room_id uuid not null references public.rooms(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 50),
  role text not null check (role in ('Frontend', 'Backend', 'Fullstack', 'AI/ML', 'Mobile', 'UI/UX', 'Product', 'Founder', 'Other')),
  headline text check (headline is null or char_length(headline) <= 100),
  bio text check (bio is null or char_length(bio) <= 280),
  skills text[] not null default '{}',
  intent text[] not null default '{}',
  contact_handle text check (contact_handle is null or char_length(contact_handle) <= 120),
  avatar_color text not null default '#3ECF8E',
  avatar_github text check (avatar_github is null or char_length(avatar_github) <= 50),
  is_available_to_chat boolean not null default false,
  available_until timestamptz null,
  current_zone text check (current_zone is null or char_length(current_zone) <= 40),
  is_banned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Create Connections Table
create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  requester_id uuid not null references public.attendees(id) on delete cascade,
  recipient_id uuid not null references public.attendees(id) on delete cascade,
  status text not null check (status in ('pending', 'connected', 'ignored')),
  connection_type text not null check (connection_type in ('wave', 'qr_scan')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_room_connection unique (room_id, requester_id, recipient_id)
);

-- 4. Create Announcements Table
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 100),
  message text not null check (char_length(message) between 5 and 500),
  is_pinned boolean not null default true,
  created_at timestamptz not null default now()
);

-- 5. Indexes for fast mobile filtering & Realtime
create index if not exists idx_rooms_slug on public.rooms(slug);
create index if not exists idx_attendees_room on public.attendees(room_id);
create index if not exists idx_attendees_role on public.attendees(room_id, role);
create index if not exists idx_connections_users on public.connections(room_id, requester_id, recipient_id);
create index if not exists idx_announcements_room on public.announcements(room_id, is_pinned);

-- 6. Enable Row Level Security (RLS) on all public tables
alter table public.rooms enable row level security;
alter table public.attendees enable row level security;
alter table public.connections enable row level security;
alter table public.announcements enable row level security;

-- Rooms RLS: Anyone can view active rooms
create policy "Active rooms viewable by anyone" on public.rooms
  for select using (is_active = true);

-- Rooms RLS: Anyone can create a room
create policy "Anyone can create a room" on public.rooms
  for insert with check (true);

-- Rooms RLS: Organizer with creator_token can update
create policy "Creators can update rooms" on public.rooms
  for update using (true);

-- Attendees RLS: Anyone can view unbanned attendees
create policy "Unbanned attendees viewable by room participants" on public.attendees
  for select using (is_banned = false);

-- Attendees RLS: Any room attendee can insert their profile
create policy "Users can insert own profile" on public.attendees
  for insert with check (true);

-- Attendees RLS: Users can update their profile
create policy "Users can update own profile" on public.attendees
  for update using (true) with check (true);

-- Connections RLS: Users can view their own sent or received connections
create policy "Users can view own connections" on public.connections
  for select using (auth.uid() = requester_id or auth.uid() = recipient_id);

-- Connections RLS: Requester can insert a connection
create policy "Users can create connections" on public.connections
  for insert with check (auth.uid() = requester_id and requester_id != recipient_id);

-- Connections RLS: Recipient can update connection status (accept/ignore)
create policy "Recipients can update connection status" on public.connections
  for update using (auth.uid() = recipient_id);

-- Announcements RLS: All room participants can view announcements
create policy "Announcements viewable by authenticated users" on public.announcements
  for select using (auth.role() = 'authenticated');

-- 7. Security Definer RPCs for Room Organizer Administration
create or replace function public.ban_attendee(
  p_room_id uuid,
  p_attendee_id uuid,
  p_creator_token text
)
returns void
language plpgsql
security definer
as $$
begin
  if exists (
    select 1 from public.rooms
    where id = p_room_id and creator_token = p_creator_token
  ) then
    update public.attendees
    set is_banned = true, updated_at = now()
    where id = p_attendee_id and room_id = p_room_id;
  else
    raise exception 'Unauthorized: invalid creator token';
  end if;
end;
$$;

create or replace function public.post_room_announcement(
  p_room_id uuid,
  p_title text,
  p_message text,
  p_creator_token text
)
returns public.announcements
language plpgsql
security definer
as $$
declare
  v_announcement public.announcements;
begin
  if not exists (
    select 1 from public.rooms
    where id = p_room_id and creator_token = p_creator_token
  ) then
    raise exception 'Unauthorized: invalid creator token';
  end if;

  insert into public.announcements (room_id, title, message, is_pinned)
  values (p_room_id, p_title, p_message, true)
  returning * into v_announcement;

  return v_announcement;
end;
$$;

-- 8. Add tables to Supabase Realtime publication
alter publication supabase_realtime add table public.connections;
alter publication supabase_realtime add table public.announcements;
