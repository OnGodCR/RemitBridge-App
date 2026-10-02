-- Security hardening from the 2026-10-01 audit (DECISIONS.md D135).
--
-- 1. Password sign-in is refused. The app signs in with an email code, Apple or Google, and
--    never sets a password; but Supabase's email provider takes passwords too, and with
--    sign-ups auto-confirmed, someone could create an account for another person's address
--    with a password of their own, then read whatever that person later saved in it. Auth
--    calls custom_access_token_hook() before it issues any token: a password sign-in, or a
--    refresh of a session that began with one, gets no token. (Code sign-ups get a random
--    password from Supabase that nobody knows, so "has a password" can't be the test.)
-- 2. Rate limits by network address on what the public key can write (events, route
--    requests) and, through take_hit_for_ip(), on the scan-receipt function. The address is
--    never stored: only an HMAC of it with a random key that changes every day, and the
--    counters and keys are deleted within a day.
-- 3. The promised deletions run on a clock, not only when the next receipt or photo comes
--    in: receipts past their 30 days (hourly), WhatsApp numbers waiting for a reply (every
--    10 minutes, gone within the hour as promised), and the rate-limit counters.
-- 4. Tidying the security advisor raised: trigger functions and is_admin() can't be called
--    through the API by anonymous callers, and every function has a fixed search_path.
-- 5. Size limits: the receipt-images bucket takes only JPEG and PNG up to 8 MB, and the
--    free-text columns people can fill have a length cap.

-- ---------------------------------------------------------------------------------------
-- 1. No password sign-in
-- ---------------------------------------------------------------------------------------

create function public.custom_access_token_hook(event jsonb) returns jsonb
language plpgsql stable set search_path = '' as $$
begin
  if event ->> 'authentication_method' = 'password'
     or exists (
       select 1 from jsonb_array_elements(coalesce(event -> 'claims' -> 'amr', '[]'::jsonb)) as a
       where a ->> 'method' = 'password')
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
    grant usage on schema public to supabase_auth_admin;
    grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
  end if;
end $$;

-- ---------------------------------------------------------------------------------------
-- 2. Rate limits
-- ---------------------------------------------------------------------------------------

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

-- Not exposed through the API (only public and graphql_public are), and no grants.
create schema if not exists private;
revoke all on schema private from public;

create table private.rate_limit_keys (
  day date primary key,
  secret bytea not null default extensions.gen_random_bytes(32)
);

create table private.rate_limit_hits (
  bucket text not null,
  client text not null,
  window_start timestamptz not null,
  hits int not null default 0,
  primary key (bucket, client, window_start)
);

-- The caller's network address as PostgREST passes it on, or null when there isn't one
-- (a migration, the SQL editor).
create function private.request_ip() returns text
language sql stable set search_path = '' as $$
  select nullif(trim(coalesce(
    h ->> 'cf-connecting-ip',
    h ->> 'x-real-ip',
    split_part(h ->> 'x-forwarded-for', ',', 1)
  )), '')
  from (select nullif(current_setting('request.headers', true), '')::json as h) r
$$;

-- Counts one hit for an address in a bucket, and says whether it's still within p_max per
-- p_window. The address goes in only as an HMAC with today's random key.
create function private.take_hit(p_bucket text, p_ip text, p_max int, p_window interval) returns boolean
language plpgsql volatile security definer set search_path = '' as $$
declare
  k bytea;
  w timestamptz := pg_catalog.date_bin(p_window, now(), timestamptz '2000-01-01');
  n int;
begin
  if p_ip is null or p_ip = '' then
    return true;
  end if;
  insert into private.rate_limit_keys (day) values (current_date) on conflict (day) do nothing;
  select secret into k from private.rate_limit_keys where day = current_date;
  insert into private.rate_limit_hits as h (bucket, client, window_start, hits)
    values (p_bucket, encode(extensions.hmac(convert_to(p_ip, 'UTF8'), k, 'sha256'), 'hex'), w, 1)
  on conflict (bucket, client, window_start) do update set hits = h.hits + 1
  returning hits into n;
  return n <= p_max;
end $$;
revoke all on function private.take_hit(text, text, int, interval) from public;

-- For the scan-receipt function, which passes the caller's address from its own request.
create function public.take_hit_for_ip(p_bucket text, p_ip text, p_max int, p_window_seconds int) returns boolean
language sql volatile security definer set search_path = '' as $$
  select private.take_hit(p_bucket, p_ip, p_max, make_interval(secs => p_window_seconds))
$$;
revoke execute on function public.take_hit_for_ip(text, text, int, int) from public, anon, authenticated;
grant execute on function public.take_hit_for_ip(text, text, int, int) to service_role;

-- What the public key writes directly. The service role (the WhatsApp function, the engine)
-- isn't limited: its address is Supabase's own, shared by every WhatsApp user.
create function private.limit_public_writes() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  max_hits int := tg_argv[0]::int;
  per interval := tg_argv[1]::interval;
begin
  if coalesce(current_setting('role', true), '') in ('anon', 'authenticated')
     and not private.take_hit(tg_table_name, private.request_ip(), max_hits, per) then
    raise exception 'too many requests, try again later' using errcode = '54000';
  end if;
  return new;
end $$;
revoke all on function private.limit_public_writes() from public;

-- Generous enough for a whole school or office behind one address.
create trigger events_rate_limit before insert on public.events
  for each row execute function private.limit_public_writes('600', '10 minutes');
create trigger route_requests_rate_limit before insert on public.route_requests
  for each row execute function private.limit_public_writes('30', '1 hour');
create trigger rate_alerts_rate_limit before insert on public.rate_alerts
  for each row execute function private.limit_public_writes('60', '1 hour');
create trigger saved_transfers_rate_limit before insert on public.saved_transfers
  for each row execute function private.limit_public_writes('120', '1 hour');
create trigger saved_comparisons_rate_limit before insert on public.saved_comparisons
  for each row execute function private.limit_public_writes('120', '1 hour');

create function private.forget_rate_limits() returns void
language sql volatile security definer set search_path = '' as $$
  delete from private.rate_limit_hits where window_start < now() - interval '1 day';
  delete from private.rate_limit_keys where day < current_date;
$$;
revoke all on function private.forget_rate_limits() from public;

-- ---------------------------------------------------------------------------------------
-- 3. Deletions on a clock
-- ---------------------------------------------------------------------------------------

do $$
begin
  -- pg_cron is on every Supabase project; the local test database doesn't have it.
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.schedule('forget-expired-receipts', '7 * * * *', 'select public.forget_expired_receipts()');
    perform cron.schedule('forget-stale-receipt-intake', '*/10 * * * *', 'select public.forget_stale_receipt_intake()');
    perform cron.schedule('forget-rate-limits', '23 * * * *', 'select private.forget_rate_limits()');
  end if;
end $$;

-- ---------------------------------------------------------------------------------------
-- 4. What the API can call
-- ---------------------------------------------------------------------------------------

-- Trigger functions: nobody calls these through /rpc.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.rate_alerts_stamp() from public, anon, authenticated;
revoke execute on function public.route_requests_forget_contacts() from public, anon, authenticated;
revoke execute on function public.events_stamp() from public, anon, authenticated;
revoke execute on function public.manual_observations_stamp() from public, anon, authenticated;
revoke execute on function public.route_requests_stamp() from public, anon, authenticated;
-- is_admin() stays callable by signed-in users: the admin policies call it as them.
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

alter function public.events_stamp() set search_path = '';
alter function public.manual_observations_stamp() set search_path = '';
alter function public.route_requests_stamp() set search_path = '';
alter function public.rate_alerts_stamp() set search_path = '';
alter function public.due_rate_alerts() set search_path = '';

-- ---------------------------------------------------------------------------------------
-- 5. Size limits
-- ---------------------------------------------------------------------------------------

do $$
begin
  -- Supabase's storage.buckets has these columns; the local stand-in doesn't.
  if exists (select 1 from information_schema.columns
             where table_schema = 'storage' and table_name = 'buckets' and column_name = 'allowed_mime_types') then
    update storage.buckets
       set file_size_limit = 8 * 1024 * 1024, allowed_mime_types = array['image/jpeg', 'image/png']
     where id = 'receipt-images';
  end if;
end $$;

alter table public.saved_transfers
  add constraint saved_transfers_note_length check (note is null or length(note) <= 500),
  add constraint saved_transfers_provider_length check (length(provider_name) between 1 and 80);
