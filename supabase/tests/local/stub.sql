-- Stand-ins for what a Supabase project provides before any migration runs, so the
-- migrations can be applied to a throwaway local Postgres (local_migrations.sh). Only what
-- the migrations and checks.sql touch: the API roles, auth.users with auth.uid(), and
-- storage.buckets. The grants mirror Supabase's defaults for the public schema.

create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;

create schema auth;
create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  created_at timestamptz not null default now()
);
-- Supabase reads the caller from the JWT claims PostgREST sets for the request.
create function auth.uid() returns uuid language sql stable as $$
  select nullif(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub', '')::uuid
$$;
grant usage on schema auth to anon, authenticated, service_role;

create schema storage;
create table storage.buckets (id text primary key, name text not null, public boolean not null default false);

grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
