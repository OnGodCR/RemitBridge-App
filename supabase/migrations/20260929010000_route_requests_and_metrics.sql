-- Route requests (PRD 6.7) and the admin metrics screen (DECISIONS.md D31, D64, D65).

-- ---------------------------------------------------------------------------------------
-- Route requests
-- ---------------------------------------------------------------------------------------
-- Anyone can ask for a route that isn't covered. Requests set the build order and feed the
-- public route board, which shows counts only. What's kept per request is what PRD 6.7
-- lists: the two countries, an optional delivery method, where it came from, when, and a
-- way to tell the person when the route launches, only if they gave one. That address is
-- deleted once the launch notification has gone out (a check below makes it impossible to
-- keep both), or as soon as the route is marked not feasible.
--
-- Access:
--   anyone (anon, authenticated) -> insert a request as themselves, from the app
--   everyone                     -> request counts per route, via route_request_counts()
--   admins                       -> read and delete requests (spam)
--   service_role                 -> WhatsApp and partner requests, launch notifications

create table public.route_requests (
  id bigint generated always as identity primary key,
  send_country text not null check (send_country ~ '^[A-Z]{2}$'),
  receive_country text not null check (receive_country ~ '^[A-Z]{2}$'),
  delivery_method text check (delivery_method in
    ('bank_deposit', 'cash_pickup', 'mobile_wallet', 'upi', 'debit_card', 'home_delivery')),
  source text not null default 'app' check (source in ('app', 'whatsapp', 'partner')),
  -- One phone asking twice counts once: the random install ID from D31, not a device ID.
  install_id uuid,
  -- Deleting an account deletes its requests (D19).
  user_id uuid references auth.users (id) on delete cascade,
  notify_email text check (notify_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(notify_email) <= 254),
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  check (send_country <> receive_country),
  check (notified_at is null or notify_email is null)
);

create unique index route_requests_once_per_install
  on public.route_requests (install_id, send_country, receive_country);

-- A client can't backdate a request or mark it notified. Codes are upper-cased and the
-- address trimmed before the checks run, so "in" and " Me@X.org " are both accepted.
create function public.route_requests_stamp() returns trigger
language plpgsql as $$
begin
  new.created_at := now();
  new.notified_at := null;
  new.send_country := upper(new.send_country);
  new.receive_country := upper(new.receive_country);
  new.notify_email := nullif(lower(trim(new.notify_email)), '');
  return new;
end $$;

create trigger route_requests_stamp before insert on public.route_requests
  for each row execute function public.route_requests_stamp();

alter table public.route_requests enable row level security;

create policy "anyone asks for a route, as themselves" on public.route_requests
  for insert to anon, authenticated
  with check (source = 'app' and (user_id is null or user_id = auth.uid()));
create policy "admins read route requests" on public.route_requests
  for select to authenticated using (public.is_admin());
create policy "admins delete route requests" on public.route_requests
  for delete to authenticated using (public.is_admin());

-- The board's numbers: requests per route, counting each person once (by account, else by
-- install), and never the smoke test's or our own phones (internal_installs, D31).
-- Aggregates only, so it runs with the owner's rights and never exposes a row.
create function public.route_request_counts()
returns table (send_country text, receive_country text, requests bigint)
language sql stable security definer set search_path = '' as $$
  select r.send_country, r.receive_country,
         count(distinct coalesce(r.user_id::text, r.install_id::text, r.id::text))
  from public.route_requests r
  where r.install_id is null
     or r.install_id not in (select i.install_id from public.internal_installs i)
  group by r.send_country, r.receive_country
$$;

grant execute on function public.route_request_counts() to anon, authenticated;

-- Marking a route not feasible means nobody will be told it launched, so the addresses
-- waiting for that launch go at once. Route ids are the lower-cased pair, e.g. 'us-in'.
create function public.route_requests_forget_contacts() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.route_requests
     set notify_email = null
   where lower(send_country || '-' || receive_country) = new.id
     and notify_email is not null;
  return new;
end $$;

create trigger routes_not_feasible
  after insert or update of status on public.routes
  for each row when (new.status = 'not_feasible')
  execute function public.route_requests_forget_contacts();

-- ---------------------------------------------------------------------------------------
-- Admin metrics (D31)
-- ---------------------------------------------------------------------------------------
-- Every figure on the admin metrics screen comes from this one function, so each is
-- reproducible from the raw rows and has one definition (the app shows it next to the
-- number). The honesty rules from D31:
--   - Internal installs are excluded: the ones in internal_installs, and every install
--     that has ever been signed in to an admin account (so the maintainer's own phone
--     never counts, before or after sign-in). Admin accounts are left out of sign-ups.
--   - Savings are best vs. median, never vs. the worst (PRD 10), and are worked out here
--     from published quotes rather than trusted from the app.
--   - Props are written by clients, so every cast is guarded: a malformed event is skipped
--     instead of breaking the function.
-- Security definer so it can read auth.users for sign-ups; the first thing it does is
-- refuse anyone who isn't an admin, with the same code RLS uses.

create function public.admin_metrics(p_days int default 30)
returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  days int := greatest(1, least(coalesce(p_days, 30), 366));
  since timestamptz := now() - days * interval '1 day';
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'admins only' using errcode = '42501';
  end if;

  with
  admins as (select user_id from public.profiles where is_admin),
  internal as (
    select install_id from public.internal_installs
    union
    select distinct e.install_id from public.events e where e.user_id in (select user_id from admins)
  ),
  ev as (select e.* from public.events e where e.install_id not in (select install_id from internal)),
  win as (select * from ev where created_at >= since),
  firsts as (select install_id, min(created_at) as first_at from ev group by install_id),
  comps as (
    -- One row per install, route, method, amount and day compared.
    select distinct on (install_id, props->>'route', props->>'method', props->>'checked_amount', created_at::date)
      install_id, props->>'route' as route_id, props->>'method' as method,
      (props->>'checked_amount')::numeric as amount, created_at
    from win
    where name = 'comparison_run' and props->>'checked_amount' ~ '^\d{1,6}$'
  ),
  gaps as (
    -- Best minus median amount received among the standing quotes that were current when
    -- the comparison ran (the latest per provider in the 48 hours before), in the sending
    -- currency at the mid-market rate. Only where 3 or more providers were shown.
    select (max(q.amount_received) - percentile_cont(0.5) within group (order by q.amount_received))
             / avg(q.mid_market_rate) as saved
    from comps c
    cross join lateral (
      select distinct on (q.provider_id) q.amount_received, q.mid_market_rate
      from public.quotes q
      where q.validation_status = 'published' and not q.is_promotional
        and q.route_id = c.route_id and q.delivery_method = c.method and q.send_amount = c.amount
        and q.captured_at between c.created_at - interval '48 hours' and c.created_at
      order by q.provider_id, q.captured_at desc
    ) q
    group by c.install_id, c.route_id, c.method, c.amount, c.created_at
    having count(*) >= 3
  )
  select jsonb_build_object(
    'days', days,
    'generated_at', now(),
    'usage', jsonb_build_object(
      'active_installs', (select count(distinct install_id) from win),
      'new_installs', (select count(*) from firsts where first_at >= since),
      'sessions', (select count(*) from win where name = 'app_opened'),
      'dau', (select count(distinct install_id) from ev where created_at >= now() - interval '1 day'),
      'wau', (select count(distinct install_id) from ev where created_at >= now() - interval '7 days'),
      'mau', (select count(distinct install_id) from ev where created_at >= now() - interval '30 days'),
      'retention', (
        select coalesce(jsonb_object_agg('d' || n, jsonb_build_object('cohort', cohort, 'pct', pct)), '{}')
        from (
          select d.n, count(*) as cohort,
            round(100.0 * count(*) filter (where exists (
              select 1 from ev e2
              where e2.install_id = f.install_id
                and e2.created_at >= f.first_at + d.n * interval '1 day'
                and e2.created_at < f.first_at + (d.n + 1) * interval '1 day'
            )) / count(*), 1) as pct
          from (values (1), (7), (30)) as d (n)
          join firsts f
            on f.first_at < now() - (d.n + 1) * interval '1 day'
           and f.first_at >= now() - interval '120 days'
          group by d.n
        ) r
      )
    ),
    'funnel', jsonb_build_object(
      'onboarding_started', (select count(distinct install_id) from win where name = 'onboarding_started'),
      'route_picked', (select count(distinct install_id) from win where name = 'onboarding_route_picked'),
      'signed_in', (select count(distinct install_id) from win where name = 'signed_in'),
      'skipped', (select count(distinct install_id) from win where name = 'onboarding_skipped'),
      'compared', (select count(distinct install_id) from win where name = 'comparison_run'),
      'saw_prices', (select count(distinct install_id) from win
                     where name = 'comparison_run' and props->>'quotes' ~ '^[1-9]\d{0,3}$'),
      'opened_quote', (select count(distinct install_id) from win where name = 'quote_opened')
    ),
    'activity', jsonb_build_object(
      'comparisons', (select count(*) from win where name = 'comparison_run'),
      'by_route', (select coalesce(jsonb_object_agg(k, c), '{}') from (
        select props->>'route' as k, count(*) as c from win
        where name = 'comparison_run' and props->>'route' is not null group by 1) x),
      'by_amount', (select coalesce(jsonb_object_agg(k, c), '{}') from (
        select props->>'checked_amount' as k, count(*) as c from win
        where name = 'comparison_run' and props->>'checked_amount' is not null group by 1) x),
      'by_platform', (select coalesce(jsonb_object_agg(k, c), '{}') from (
        select coalesce(platform, 'unknown') as k, count(*) as c from win
        where name = 'comparison_run' group by 1) x),
      'tools', (select coalesce(jsonb_object_agg(k, c), '{}') from (
        select props->>'tool' as k, count(*) as c from win
        where name = 'tool_opened' and props->>'tool' is not null group by 1) x),
      'quotes_opened', (select count(*) from win where name = 'quote_opened'),
      'sign_ups', (select count(*) from auth.users u
                   where u.created_at >= since and u.id not in (select user_id from admins)),
      'saved_checks', (select count(*) from public.saved_transfers s
                       where s.created_at >= since and s.user_id not in (select user_id from admins)),
      'saved_comparisons', (select count(*) from public.saved_comparisons s
                            where s.created_at >= since and s.user_id not in (select user_id from admins)),
      'route_requests', (select count(*) from public.route_requests r
                         where r.created_at >= since
                           and (r.install_id is null or r.install_id not in (select install_id from internal))),
      'price_reports', (select count(*) from win where name = 'price_reported'),
      'accounts_deleted', (select count(*) from win where name = 'account_deleted')
    ),
    'impact', jsonb_build_object(
      'savings_usd', (select coalesce(round(sum(saved)::numeric, 2), 0) from gaps),
      'savings_comparisons', (select count(*) from gaps),
      'quotes_published', (select count(*) from public.quotes
                           where captured_at >= since and validation_status = 'published'),
      'quotes_held', (select count(*) from public.quotes
                      where captured_at >= since and validation_status <> 'published'),
      'providers_live', (select count(distinct provider_id) from public.quotes
                         where captured_at >= since and validation_status = 'published'),
      'routes_live', (select count(distinct route_id) from public.quotes
                      where captured_at >= since and validation_status = 'published'),
      'prices_entered', (select count(*) from public.manual_observations where created_at >= since),
      'runs', (select coalesce(jsonb_object_agg(k, c), '{}') from (
        select coalesce(status, 'running') as k, count(*) as c from public.scrape_runs
        where started_at >= since group by 1) x),
      'last_good_run', (select max(finished_at) from public.scrape_runs where status = 'success')
    )
  ) into result;

  return result;
end $$;

revoke execute on function public.admin_metrics(int) from public, anon;
grant execute on function public.admin_metrics(int) to authenticated;
