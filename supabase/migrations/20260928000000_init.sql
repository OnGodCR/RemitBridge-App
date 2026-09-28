-- RemitBridge: first schema.
--
-- Rule from the website, paid for there: row-level security is the thing that holds,
-- not the UI. Every table has RLS on. Policies are written before the features that
-- use them, and every insert policy pins the columns a client must not choose.
--
-- Who writes what:
--   engine (service_role, bypasses RLS)  -> quotes, mid_market_rates, scrape_runs,
--                                            adapter_state, providers, provider_routes
--   anyone (anon)                         -> reads published quotes and reference data;
--                                            inserts analytics events
--   signed-in users (authenticated)       -> their own profile, saved comparisons,
--                                            saved transfers
--   admins (profiles.is_admin)            -> read everything for the dashboards

-- ---------------------------------------------------------------------------------------
-- Reference data
-- ---------------------------------------------------------------------------------------

create table public.routes (
  id text primary key,                      -- e.g. 'us-in'
  send_country text not null,
  send_currency text not null,
  receive_country text not null,
  receive_currency text not null,
  tier int not null,
  status text not null default 'building'
    check (status in ('requested', 'under_review', 'building', 'live', 'not_feasible')),
  status_reason text,                       -- required reading for 'not_feasible'
  reference_rate_note text                  -- which mid-market reference markup uses (PRD 6.4)
);

create table public.providers (
  id text primary key,                      -- e.g. 'remitly'
  name text not null,
  type text not null check (type in ('bank', 'credit_union', 'mto', 'fintech')),
  website text not null,
  adapter_id text,                          -- null: no adapter (manual or not collected)
  active boolean not null default true,
  robots_note text,
  terms_note text
);

create table public.provider_routes (
  provider_id text not null references public.providers (id),
  route_id text not null references public.routes (id),
  delivery_methods text[] not null default '{}',
  payment_methods text[] not null default '{}',
  health text not null default 'unsupported'
    check (health in ('fresh', 'stale', 'broken', 'unsupported')),
  last_valid_quote_at timestamptz,
  primary key (provider_id, route_id)
);

-- ---------------------------------------------------------------------------------------
-- Engine output
-- ---------------------------------------------------------------------------------------

create table public.scrape_runs (
  id uuid primary key default gen_random_uuid(),
  adapter_id text not null,
  adapter_version text not null,
  strategy text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text check (status in ('success', 'partial', 'failed', 'blocked', 'skipped')),
  quotes_captured int,
  quotes_published int,
  quotes_rejected int,                      -- rejected + quarantined
  failed_requests int,
  error_class text,
  error_message text
);

create table public.adapter_state (
  adapter_id text primary key,
  consecutive_failures int not null default 0,
  breaker_open_until timestamptz,
  fingerprints jsonb not null default '{}',
  last_run_at timestamptz,
  last_success_at timestamptz
);

create table public.mid_market_rates (
  id bigint generated always as identity primary key,
  send_currency text not null,
  receive_currency text not null,
  rate numeric not null,
  source text not null,
  is_reference boolean not null,            -- the one markup is measured against
  rate_date date not null,                  -- the date the source says the rate is for
  fetched_at timestamptz not null
);
create index on public.mid_market_rates (send_currency, receive_currency, fetched_at desc);

-- Quotes are an append-only time series (PRD 8). dedupe_key makes re-runs idempotent.
create table public.quotes (
  id bigint generated always as identity primary key,
  dedupe_key text not null unique,
  provider_id text not null references public.providers (id),
  route_id text not null references public.routes (id),
  send_currency text not null,
  receive_currency text not null,
  send_amount numeric not null,
  delivery_method text not null,
  payment_method text not null,
  fee numeric not null,
  offered_rate numeric not null,
  mid_market_rate numeric not null,
  mid_market_source text not null,
  pickup_charge numeric not null default 0,
  amount_received numeric not null,         -- as the provider stated it
  computed_amount_received numeric not null,
  markup_pct numeric not null,
  total_cost numeric not null,
  total_cost_pct numeric not null,
  delivery_time text,
  is_promotional boolean not null default false,
  source text not null check (source in ('scraper', 'api', 'manual', 'partner')),
  strategy text not null,
  scrape_run_id uuid references public.scrape_runs (id),
  captured_at timestamptz not null,
  raw_archive_path text,
  validation_status text not null
    check (validation_status in ('published', 'quarantined', 'rejected')),
  validation_notes text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index on public.quotes (route_id, send_amount, delivery_method, captured_at desc)
  where validation_status = 'published';
create index on public.quotes (provider_id, route_id, captured_at desc);

-- What the app reads: the latest published quote per provider, route, amount and
-- method, no older than 48 hours (PRD 9.5: stale after 24h, gone from rankings at 48h).
create view public.latest_quotes with (security_invoker = true) as
select distinct on (q.provider_id, q.route_id, q.send_amount, q.delivery_method, q.payment_method)
  q.id, q.provider_id, p.name as provider_name, q.route_id, q.send_currency,
  q.receive_currency, q.send_amount, q.delivery_method, q.payment_method, q.fee,
  q.offered_rate, q.mid_market_rate, q.mid_market_source, q.pickup_charge,
  q.amount_received, q.markup_pct, q.total_cost, q.total_cost_pct, q.delivery_time,
  q.is_promotional, q.source, q.captured_at,
  (now() - q.captured_at) > interval '24 hours' as is_stale
from public.quotes q
join public.providers p on p.id = q.provider_id
where q.validation_status = 'published'
  and q.captured_at > now() - interval '48 hours'
order by q.provider_id, q.route_id, q.send_amount, q.delivery_method, q.payment_method,
  q.captured_at desc;

-- ---------------------------------------------------------------------------------------
-- Accounts (DECISIONS.md D19): optional, owner-only, deleted with the account.
-- ---------------------------------------------------------------------------------------

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  is_admin boolean not null default false,  -- set by hand in the dashboard, never by a client
  created_at timestamptz not null default now()
);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id) values (new.id);
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select is_admin from public.profiles where user_id = auth.uid()), false)
$$;

create table public.saved_comparisons (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  route_id text not null references public.routes (id),
  send_amount numeric not null check (send_amount > 0),
  delivery_method text not null,
  created_at timestamptz not null default now()
);

-- Past transfers, typed in by the user (DECISIONS.md D30). The same symbols as the formula.
create table public.saved_transfers (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  provider_name text not null,
  route_id text references public.routes (id),
  send_currency text not null,
  receive_currency text not null,
  sent numeric not null check (sent > 0),
  fee numeric not null default 0 check (fee >= 0),
  quoted_rate numeric not null check (quoted_rate > 0),
  mid_rate numeric,
  mid_rate_source text,
  pickup_charge numeric not null default 0 check (pickup_charge >= 0),
  sent_on date not null,
  note text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------------------
-- Metrics (DECISIONS.md D31): first-party events. Anyone can write their own; only
-- admins can read. install_id is a random ID the app generates, not a device ID.
-- ---------------------------------------------------------------------------------------

create table public.events (
  id bigint generated always as identity primary key,
  install_id uuid not null,
  user_id uuid references auth.users (id) on delete set null,
  name text not null check (name ~ '^[a-z][a-z0-9_]{1,63}$'),
  props jsonb not null default '{}' check (pg_column_size(props) < 4096),
  platform text check (platform in ('ios', 'android', 'web', 'whatsapp')),
  app_version text,
  created_at timestamptz not null default now()
);
create index on public.events (name, created_at);
create index on public.events (install_id, created_at);

-- Devices and accounts excluded from every metric (D31: no counting ourselves).
create table public.internal_installs (
  install_id uuid primary key,
  label text not null,
  added_at timestamptz not null default now()
);

-- A client can't backdate an event or attribute it to someone else. created_at is
-- overwritten here rather than trusted; user_id is checked by the policy below.
create function public.events_stamp() returns trigger
language plpgsql as $$
begin
  new.created_at := now();
  return new;
end $$;

create trigger events_stamp before insert on public.events
  for each row execute function public.events_stamp();

-- ---------------------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------------------

alter table public.routes enable row level security;
alter table public.providers enable row level security;
alter table public.provider_routes enable row level security;
alter table public.scrape_runs enable row level security;
alter table public.adapter_state enable row level security;
alter table public.mid_market_rates enable row level security;
alter table public.quotes enable row level security;
alter table public.profiles enable row level security;
alter table public.saved_comparisons enable row level security;
alter table public.saved_transfers enable row level security;
alter table public.events enable row level security;
alter table public.internal_installs enable row level security;

-- Public reference data.
create policy "routes are public" on public.routes for select using (true);
create policy "providers are public" on public.providers for select using (true);
create policy "coverage is public" on public.provider_routes for select using (true);
create policy "mid-market rates are public" on public.mid_market_rates for select using (true);

-- Only published quotes are public. Quarantined and rejected ones exist for review only.
create policy "published quotes are public" on public.quotes
  for select using (validation_status = 'published');
create policy "admins read every quote" on public.quotes
  for select to authenticated using (public.is_admin());

-- Engine health is for admins.
create policy "admins read runs" on public.scrape_runs
  for select to authenticated using (public.is_admin());
create policy "admins read adapter state" on public.adapter_state
  for select to authenticated using (public.is_admin());

-- Profiles: read your own. No insert or update from clients: the trigger creates the
-- row, and is_admin is only ever set by hand.
create policy "read own profile" on public.profiles
  for select to authenticated using (user_id = auth.uid());

-- Saved data: owner only, every operation.
create policy "own saved comparisons" on public.saved_comparisons
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own saved transfers" on public.saved_transfers
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Events: anyone may insert, but only as themselves (or anonymously). Nobody but
-- admins can read. No update or delete.
create policy "insert own events" on public.events
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
create policy "admins read events" on public.events
  for select to authenticated using (public.is_admin());

create policy "admins manage internal installs" on public.internal_installs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- The view is read through the caller's rights (security_invoker), so the quotes policy
-- above decides what it shows.
grant select on public.latest_quotes to anon, authenticated;

-- ---------------------------------------------------------------------------------------
-- Raw archive bucket: private. Only the engine (service_role) writes or reads it.
-- ---------------------------------------------------------------------------------------

insert into storage.buckets (id, name, public) values ('raw-archive', 'raw-archive', false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------------------
-- Seed: Tier 1 routes (PRD 6.1) and the Tier 1 provider list (DECISIONS.md D3).
-- adapter_id stays null until an adapter passes the robots/terms check (D4).
-- ---------------------------------------------------------------------------------------

insert into public.routes (id, send_country, send_currency, receive_country, receive_currency, tier) values
  ('us-in', 'US', 'USD', 'IN', 'INR', 1),
  ('us-mx', 'US', 'USD', 'MX', 'MXN', 1),
  ('us-ph', 'US', 'USD', 'PH', 'PHP', 1),
  ('us-vn', 'US', 'USD', 'VN', 'VND', 1);

insert into public.providers (id, name, type, website, terms_note) values
  ('remitly', 'Remitly', 'mto', 'https://www.remitly.com',
   'User agreement forbids "any robot, spider, scraper, automatic device, or manual process to monitor or copy our website or app" (checked 2026-09-28). No adapter: manual research.'),
  ('wise', 'Wise', 'fintech', 'https://wise.com',
   'US terms of use forbid "any robot, spider, other automatic device, or manual process to monitor or copy our websites without our prior written permission" (checked 2026-09-28), although robots.txt allows the pricing endpoints. No adapter: manual research.'),
  ('xoom', 'Xoom', 'mto', 'https://www.xoom.com', null),
  ('western-union', 'Western Union', 'mto', 'https://www.westernunion.com', null),
  ('moneygram', 'MoneyGram', 'mto', 'https://www.moneygram.com', null),
  ('xe', 'Xe', 'fintech', 'https://www.xe.com', null),
  ('worldremit', 'WorldRemit', 'mto', 'https://www.worldremit.com', null),
  ('ria', 'Ria', 'mto', 'https://www.riamoneytransfer.com', null);
