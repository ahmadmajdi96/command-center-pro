
create or replace function public.tg_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- Restrict security-definer helpers so only authenticated users (needed by RLS) can execute
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
revoke execute on function public.is_admin(uuid) from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.is_admin(uuid) to authenticated;
