-- Supabase Migration: Performance Indexes, RPC Search Path Hardening, and Room Expiration
-- Created: 2026-11-06

-- 1. Hardening RPC functions with fixed search_path to prevent search-path hijacking
alter function public.post_room_announcement set search_path = public, pg_temp;
alter function public.ban_attendee set search_path = public, pg_temp;

-- 2. Index covering foreign keys on connections table for fast lookup & cascade delete
create index if not exists idx_connections_recipient on public.connections(recipient_id);
create index if not exists idx_connections_requester on public.connections(requester_id);

-- 3. Remove redundant index on attendees (covered by idx_attendees_role)
drop index if exists public.idx_attendees_room;

-- 4. Clean up empty test rooms older than 24 hours (0 attendees, 0 announcements)
delete from public.rooms r
where r.created_at < now() - interval '24 hours'
  and not exists (select 1 from public.attendees a where a.room_id = r.id)
  and not exists (select 1 from public.announcements ann where ann.room_id = r.id);

-- 5. Helper function for automated room lifecycle management
create or replace function public.cleanup_expired_rooms(p_expiry_hours integer default 48)
returns table(deactivated_count integer, purged_count integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_deactivated integer;
  v_purged integer;
begin
  -- Deactivate rooms older than p_expiry_hours
  update public.rooms
  set is_active = false
  where is_active = true
    and created_at < now() - (p_expiry_hours || ' hours')::interval;
  get diagnostics v_deactivated = row_count;

  -- Delete empty/abandoned rooms older than 24 hours
  delete from public.rooms r
  where r.created_at < now() - interval '24 hours'
    and not exists (select 1 from public.attendees a where a.room_id = r.id)
    and not exists (select 1 from public.announcements ann where ann.room_id = r.id);
  get diagnostics v_purged = row_count;

  return query select v_deactivated, v_purged;
end;
$$;

revoke execute on function public.cleanup_expired_rooms(integer) from public, anon, authenticated;
grant execute on function public.cleanup_expired_rooms(integer) to service_role;
