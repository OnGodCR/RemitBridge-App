-- Checks run by local_migrations.sh after every migration is applied to a throwaway
-- Postgres. They cover what rls_smoke.sh can't reach with the public key alone: signed-in
-- callers, admins, service_role, the triggers, and admin_metrics() running on real rows.
-- A check that fails stops the run with FAIL and what it got.

\set ON_ERROR_STOP on
set client_min_messages = notice;
-- Results go nowhere; each check reports through a NOTICE ("ok ...") or stops with FAIL.
\o /dev/null

create function pg_temp.expect(stmt text, code text, label text) returns void language plpgsql as $$
begin
  begin
    execute stmt;
  exception when others then
    if sqlstate = code then
      raise notice 'ok    %', label;
      return;
    end if;
    raise exception 'FAIL  % (expected %, got %: %)', label, code, sqlstate, sqlerrm;
  end;
  raise exception 'FAIL  % (expected %, got success)', label, code;
end $$;

create function pg_temp.ok(passed boolean, label text) returns void language plpgsql as $$
begin
  if passed is distinct from true then raise exception 'FAIL  %', label; end if;
  raise notice 'ok    %', label;
end $$;

create function pg_temp.as_user(sub text) returns void language sql as $$
  select set_config('request.jwt.claims', case when sub is null then '' else json_build_object('sub', sub)::text end, false)
$$;

-- People: an admin, a regular user. The signup trigger makes their profiles.
insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-0000000000a1', 'admin@example.org'),
  ('00000000-0000-4000-8000-0000000000b2', 'person@example.org');
update public.profiles set is_admin = true where user_id = '00000000-0000-4000-8000-0000000000a1';
select pg_temp.ok((select count(*) = 2 from public.profiles), 'the signup trigger made both profiles');

-- ---------------------------------------------------------------------------------------
-- Anyone, with the public key
-- ---------------------------------------------------------------------------------------
set role anon;
select pg_temp.as_user(null);
select pg_temp.ok((select count(*) = 0 from public.route_requests), 'anon: route requests are not readable');
select pg_temp.ok((select count(*) = 0 from public.whatsapp_users), 'anon: WhatsApp users are not readable');
select pg_temp.expect($$insert into public.route_requests (send_country, receive_country, install_id, user_id)
  values ('US', 'NP', '00000000-0000-4000-8000-00000000c0de', '00000000-0000-4000-8000-0000000000b2')$$,
  '42501', 'anon: can''t ask for a route as someone else');
select pg_temp.expect($$insert into public.route_requests (send_country, receive_country, install_id, source)
  values ('US', 'NP', '00000000-0000-4000-8000-00000000c0de', 'whatsapp')$$,
  '42501', 'anon: can''t file a request as WhatsApp');
select pg_temp.expect($$insert into public.route_requests (send_country, receive_country, install_id)
  values ('USA', 'NP', '00000000-0000-4000-8000-00000000c0de')$$, '23514', 'anon: countries are validated');
select pg_temp.expect($$insert into public.route_requests (send_country, receive_country, install_id)
  values ('US', 'US', '00000000-0000-4000-8000-00000000c0de')$$, '23514', 'anon: a route needs two countries');
select pg_temp.expect($$insert into public.route_requests (send_country, receive_country, install_id, notify_email)
  values ('US', 'NP', '00000000-0000-4000-8000-00000000c0de', 'not an address')$$, '23514', 'anon: addresses are validated');
-- The smoke test's own request, from the internal test install, lower-case on purpose.
insert into public.route_requests (send_country, receive_country, install_id, delivery_method)
  values ('us', 'np', '00000000-0000-4000-8000-00000000c0de', 'bank_deposit');
select pg_temp.expect($$insert into public.route_requests (send_country, receive_country, install_id)
  values ('US', 'NP', '00000000-0000-4000-8000-00000000c0de')$$, '23505', 'anon: the same install can''t ask twice');
-- A real person asking, with a messy address, trying to backdate it and pre-mark it sent.
insert into public.route_requests (send_country, receive_country, install_id, notify_email, created_at)
  values ('US', 'NP', '00000000-0000-4000-8000-0000000000f1', '  Me@Example.ORG ', '2001-01-01');
-- Pre-marking a request as notified is quietly undone by the stamp trigger.
insert into public.route_requests (send_country, receive_country, install_id, notified_at)
  values ('US', 'GH', '00000000-0000-4000-8000-0000000000f2', now());
select pg_temp.ok((select requests = 1 from public.route_request_counts() where send_country = 'US' and receive_country = 'NP'),
  'anon: counts are public, one person counted, the test install left out');
select pg_temp.expect($$select public.admin_metrics(30)$$, '42501', 'anon: metrics refuse strangers');
select pg_temp.expect($$insert into public.whatsapp_users (phone_hash) values (repeat('a', 64))$$,
  '42501', 'anon: can''t write a WhatsApp user');
select pg_temp.expect($$insert into public.saved_comparisons (user_id, route_id, send_amount, delivery_method)
  values ('00000000-0000-4000-8000-0000000000b2', 'us-in', 500, 'upi')$$, '42501', 'anon: can''t save a comparison');
reset role;

select pg_temp.ok((select notify_email = 'me@example.org' and created_at > now() - interval '1 minute' and notified_at is null
  from public.route_requests where install_id = '00000000-0000-4000-8000-0000000000f1'),
  'stamp: address trimmed and lower-cased, created_at not backdated');
select pg_temp.ok((select notified_at is null from public.route_requests where install_id = '00000000-0000-4000-8000-0000000000f2'),
  'stamp: a client can''t mark its own request as notified');

-- ---------------------------------------------------------------------------------------
-- A signed-in person who isn't an admin
-- ---------------------------------------------------------------------------------------
set role authenticated;
select pg_temp.as_user('00000000-0000-4000-8000-0000000000b2');
insert into public.route_requests (send_country, receive_country, install_id, user_id, notify_email)
  values ('US', 'KE', '00000000-0000-4000-8000-0000000000d4', '00000000-0000-4000-8000-0000000000b2', 'person@example.org');
select pg_temp.ok((select count(*) = 0 from public.route_requests), 'user: can ask, but reads no requests, not even their own');
insert into public.saved_comparisons (user_id, route_id, send_amount, delivery_method)
  values ('00000000-0000-4000-8000-0000000000b2', 'us-in', 750, 'upi');
select pg_temp.ok((select count(*) = 1 from public.saved_comparisons), 'user: saves and reads their own comparison');
select pg_temp.expect($$select public.admin_metrics(30)$$, '42501', 'user: metrics refuse non-admins');
-- RLS hides the rows rather than refusing, so a delete runs and removes nothing.
delete from public.route_requests;
reset role;
select pg_temp.ok((select count(*) = 1 from public.route_requests where receive_country = 'KE'),
  'user: a delete by a non-admin removes nothing');

-- ---------------------------------------------------------------------------------------
-- Metrics, as an admin, on rows that exercise every rule
-- ---------------------------------------------------------------------------------------
-- An ordinary install compares India at $500 and sees three prices...
insert into public.events (install_id, name, props, platform) values
  ('10000000-0000-4000-8000-000000000001', 'app_opened', '{}', 'ios'),
  ('10000000-0000-4000-8000-000000000001', 'onboarding_started', '{}', 'ios'),
  ('10000000-0000-4000-8000-000000000001', 'comparison_run',
    '{"route": "us-in", "checked_amount": 500, "method": "bank_deposit", "quotes": 3}', 'ios'),
  ('10000000-0000-4000-8000-000000000001', 'quote_opened', '{"provider": "wise", "route": "us-in"}', 'ios'),
  -- ...a WhatsApp number does the same, and a client sends props that are garbage...
  ('20000000-0000-4000-8000-000000000002', 'comparison_run',
    '{"route": "us-in", "checked_amount": "abc", "method": "bank_deposit", "quotes": "lots"}', 'whatsapp'),
  ('20000000-0000-4000-8000-000000000002', 'tool_opened', '{"tool": {"nested": true}}', 'whatsapp'),
  -- ...the smoke test's internal install, and the admin's own phone, which must not count.
  ('00000000-0000-4000-8000-00000000c0de', 'comparison_run', '{"route": "us-in", "checked_amount": 500}', 'ios'),
  ('30000000-0000-4000-8000-000000000003', 'comparison_run', '{"route": "us-mx", "checked_amount": 200}', 'ios');
insert into public.events (install_id, user_id, name, props, platform) values
  ('30000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-0000000000a1', 'signed_in', '{"method": "email"}', 'ios');

-- Three published standing prices for that comparison, checked two hours earlier.
insert into public.quotes (dedupe_key, provider_id, route_id, send_currency, receive_currency, send_amount,
  delivery_method, payment_method, fee, offered_rate, mid_market_rate, mid_market_source, amount_received,
  computed_amount_received, markup_pct, total_cost, total_cost_pct, source, strategy, captured_at, validation_status)
select 'local-' || p, p, 'us-in', 'USD', 'INR', 500, 'bank_deposit', 'bank_account', 0, r, 95.92, 'test', 500 * r,
  500 * r, (95.92 - r) / 95.92 * 100, 500 - 500 * r / 95.92, (500 - 500 * r / 95.92) / 5, 'manual', 'manual',
  now() - interval '2 hours', 'published'
from (values ('wise', 95.10), ('remitly', 94.34), ('xoom', 94.00)) as v (p, r);

set role authenticated;
select pg_temp.as_user('00000000-0000-4000-8000-0000000000a1');
select pg_temp.ok((select count(*) = 4 from public.route_requests), 'admin: reads every request');
create temp table m as select public.admin_metrics(30) as j;
reset role;

select pg_temp.ok((select (j -> 'usage' ->> 'active_installs')::int = 2 from m),
  'metrics: two active installs (internal and admin phones left out)');
select pg_temp.ok((select (j -> 'activity' ->> 'comparisons')::int = 2 from m), 'metrics: two comparisons counted');
select pg_temp.ok((select j -> 'activity' -> 'by_platform' = '{"ios": 1, "whatsapp": 1}'::jsonb from m),
  'metrics: comparisons by platform');
select pg_temp.ok((select (j -> 'funnel' ->> 'saw_prices')::int = 1 from m), 'metrics: "lots" of quotes is ignored, not an error');
select pg_temp.ok((select (j -> 'activity' ->> 'sign_ups')::int = 1 from m), 'metrics: sign-ups leave the admin out');
select pg_temp.ok((select (j -> 'activity' ->> 'route_requests')::int = 3 from m),
  'metrics: route requests leave the internal install out');
-- Best 47,550 minus median 47,170 rupees, at 95.92 per dollar: $3.96.
select pg_temp.ok((select (j -> 'impact' ->> 'savings_usd')::numeric = 3.96 and (j -> 'impact' ->> 'savings_comparisons')::int = 1 from m),
  'metrics: savings are best minus median, in dollars, from published quotes');
select pg_temp.ok((select (j -> 'impact' ->> 'quotes_published')::int = 3 from m), 'metrics: quotes published');

-- ---------------------------------------------------------------------------------------
-- Triggers and the service role
-- ---------------------------------------------------------------------------------------
select pg_temp.expect($$update public.route_requests set notified_at = now() where receive_country = 'KE'$$,
  '23514', 'notify: an address can''t survive being notified');
update public.route_requests set notify_email = null, notified_at = now() where receive_country = 'KE';
select pg_temp.ok((select notified_at is not null and notify_email is null from public.route_requests where receive_country = 'KE'),
  'notify: clearing the address and stamping notified_at together works');

insert into public.routes (id, send_country, send_currency, receive_country, receive_currency, tier, status, status_reason)
  values ('us-np', 'US', 'USD', 'NP', 'NPR', 3, 'not_feasible', 'No provider publishes prices yet');
select pg_temp.ok((select count(*) = 0 from public.route_requests where receive_country = 'NP' and notify_email is not null),
  'not feasible: waiting addresses are deleted at once');

set role service_role;
insert into public.whatsapp_users (phone_hash, language, last_route, last_method, pending_request)
  values (repeat('b', 64), 'hi', 'us-in', 'upi', 'US-NP');
insert into public.route_requests (send_country, receive_country, source, install_id)
  values ('US', 'NP', 'whatsapp', '40000000-0000-4000-8000-000000000004');
select pg_temp.expect($$insert into public.whatsapp_users (phone_hash) values ('not-a-hash')$$, '23514', 'whatsapp: only hashes are stored');
select pg_temp.expect($$insert into public.whatsapp_users (phone_hash, pending_request) values (repeat('c', 64), 'us-np')$$,
  '23514', 'whatsapp: pending requests are country codes');
select pg_temp.expect($$insert into public.whatsapp_users (phone_hash, language) values (repeat('d', 64), 'fr')$$,
  '23514', 'whatsapp: only English and Hindi');
reset role;
select pg_temp.ok((select count(*) = 1 from public.whatsapp_users), 'whatsapp: the function (service_role) can write');

-- Deleting an account takes its requests and saved comparisons with it (D19).
delete from auth.users where id = '00000000-0000-4000-8000-0000000000b2';
select pg_temp.ok((select count(*) = 0 from public.route_requests where user_id = '00000000-0000-4000-8000-0000000000b2')
  and (select count(*) = 0 from public.saved_comparisons), 'deleting an account deletes its requests and comparisons');

\echo 'all local checks passed'
