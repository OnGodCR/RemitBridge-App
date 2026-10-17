-- App review sign-in (DECISIONS.md D184, Angad 2026-10-17).
--
-- Google Play and Apple review need sign-in details they can use themselves: they can't
-- create accounts or receive an email code. RemitBridge refuses every password sign-in
-- (D135, 20261002000000_security_hardening.sql), because Supabase's email provider takes
-- passwords the app never asks for. This keeps that refusal for everyone except accounts
-- listed in private.review_accounts, which only the database owner can fill (the SQL
-- editor). The review account is created in the dashboard with a password Angad sets and
-- types into the store consoles himself; nobody else can add a row or sign in that way.

create table private.review_accounts (
  user_id uuid primary key,
  note text not null default 'App Store and Google Play review',
  created_at timestamptz not null default now()
);

-- The live project switched row-level security on for this table by itself, so the
-- sign-in hook saw an empty list and refused the review account too (2026-10-17). RLS
-- stays on with one read policy for the role Supabase Auth runs hooks as; nobody else
-- gets a policy.
alter table private.review_accounts enable row level security;

create or replace function public.custom_access_token_hook(event jsonb) returns jsonb
language plpgsql stable set search_path = '' as $$
begin
  if (event ->> 'authentication_method' = 'password'
      or exists (
        select 1 from jsonb_array_elements(coalesce(event -> 'claims' -> 'amr', '[]'::jsonb)) as a
        where a ->> 'method' = 'password'))
     and not exists (
       select 1 from private.review_accounts r where r.user_id::text = event ->> 'user_id')
  then
    return jsonb_build_object('error', jsonb_build_object(
      'http_code', 403,
      'message', 'RemitBridge signs in with an email code, Apple or Google, not a password.'));
  end if;
  return jsonb_build_object('claims', event -> 'claims');
end $$;

revoke execute on function public.custom_access_token_hook(jsonb) from public, anon, authenticated;
do $$
begin
  -- Supabase Auth runs hooks as supabase_auth_admin (absent from the local test database).
  if exists (select 1 from pg_roles where rolname = 'supabase_auth_admin') then
    grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
    grant usage on schema private to supabase_auth_admin;
    grant select on private.review_accounts to supabase_auth_admin;
    create policy "sign-in reads the review list" on private.review_accounts
      for select to supabase_auth_admin using (true);
  end if;
end $$;
