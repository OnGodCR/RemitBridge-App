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

-- ---------------------------------------------------------------------------------------
-- Rate alerts (20261001000000_rate_alerts.sql): owner-only, sent only by the service role
-- ---------------------------------------------------------------------------------------
select pg_temp.as_user(null);
set role anon;
select pg_temp.expect($$insert into public.rate_alerts (user_id, route_id, send_amount, delivery_method, target_received, push_token)
  values ('00000000-0000-4000-8000-0000000000b2', 'us-in', 500, 'bank_deposit', 47000, 'ExponentPushToken[abcdefghijklmnop]')$$,
  '42501', 'alerts: anon can''t make one');
select pg_temp.expect($$select public.due_rate_alerts()$$, '42501', 'alerts: anon can''t read due alerts or their tokens');
reset role;

set role authenticated;
select pg_temp.as_user('00000000-0000-4000-8000-0000000000b2');
insert into public.rate_alerts (user_id, route_id, send_amount, delivery_method, target_received, push_token, last_notified_at)
  values ('00000000-0000-4000-8000-0000000000b2', 'us-in', 500, 'bank_deposit', 47000, 'ExponentPushToken[abcdefghijklmnop]', now());
select pg_temp.ok((select count(*) = 1 and bool_and(last_notified_at is null) from public.rate_alerts),
  'alerts: a person makes one, and can''t mark it as already sent');
select pg_temp.expect($$insert into public.rate_alerts (user_id, route_id, send_amount, delivery_method, target_received, push_token)
  values ('00000000-0000-4000-8000-0000000000b2', 'us-in', 500, 'bank_deposit', 47000, 'not-a-token')$$,
  '23514', 'alerts: only an Expo push token is kept');
select pg_temp.expect($$select public.due_rate_alerts()$$, '42501', 'alerts: a person can''t read the due list');
insert into public.rate_alerts (user_id, route_id, send_amount, delivery_method, target_received, push_token)
select '00000000-0000-4000-8000-0000000000b2', 'us-mx', 200 * i, 'bank_deposit', 3000, 'ExponentPushToken[abcdefghijklmnop]'
  from generate_series(1, 9) i;
select pg_temp.expect($$insert into public.rate_alerts (user_id, route_id, send_amount, delivery_method, target_received, push_token)
  values ('00000000-0000-4000-8000-0000000000b2', 'us-ph', 500, 'bank_deposit', 28000, 'ExponentPushToken[abcdefghijklmnop]')$$,
  '23514', 'alerts: at most ten each');
select pg_temp.as_user('00000000-0000-4000-8000-0000000000a1');
select pg_temp.ok((select count(*) = 0 from public.rate_alerts), 'alerts: nobody else sees them, not even an admin');
reset role;
select pg_temp.as_user(null);

-- A published Wise price for $500 to India by bank deposit: ₹47,495 received.
insert into public.quotes (dedupe_key, provider_id, route_id, send_currency, receive_currency, send_amount, delivery_method,
  payment_method, fee, offered_rate, mid_market_rate, mid_market_source, amount_received, computed_amount_received,
  markup_pct, total_cost, total_cost_pct, source, strategy, captured_at, validation_status)
values ('alert-check', 'wise', 'us-in', 'USD', 'INR', 500, 'bank_deposit', 'bank_account', 5, 95.95, 96, 'check', 47495, 47495,
  0.05, 5.03, 1.0, 'api', 'check', now(), 'published');
set role service_role;
select pg_temp.ok((select count(*) = 1 and min(best_received) = 47495 and min(provider_name) = 'Wise' from public.due_rate_alerts()),
  'alerts: due once the best standing price meets the target');
update public.rate_alerts set last_notified_at = now();
select pg_temp.ok((select count(*) = 0 from public.due_rate_alerts()), 'alerts: not again within a day of being sent');
reset role;

-- Deleting an account takes its requests and saved comparisons with it (D19).
delete from auth.users where id = '00000000-0000-4000-8000-0000000000b2';
select pg_temp.ok((select count(*) = 0 from public.route_requests where user_id = '00000000-0000-4000-8000-0000000000b2')
  and (select count(*) = 0 from public.saved_comparisons)
  and (select count(*) = 0 from public.rate_alerts), 'deleting an account deletes its requests, comparisons and alerts');

-- ---------------------------------------------------------------------------------------
-- Receipts (20260930000000_receipts.sql): only the function writes; the ID reads a result
-- ---------------------------------------------------------------------------------------
set role service_role;
insert into public.receipts (id, channel, provider_id, route_id, redaction_status, expires_at) values
  ('50000000-0000-4000-8000-000000000001', 'app', 'western-union', 'us-mx', 'device', now() + interval '30 days'),
  ('50000000-0000-4000-8000-000000000002', 'app', null, null, 'device_rechecked', now() - interval '1 minute');
insert into public.receipts (id, channel, provider_name, redaction_status, research_consent, image_retained, image_path) values
  ('50000000-0000-4000-8000-000000000003', 'whatsapp', 'Corner Store Remit', 'server', true, true, 'r/3.jpg');
insert into public.receipt_fields (receipt_id, field_name, value, extraction_path, confidence, validated) values
  ('50000000-0000-4000-8000-000000000001', 'amount_sent', '500', 'parser', 0.95, true),
  ('50000000-0000-4000-8000-000000000001', 'fee', '4.99', 'model', 0.9, false),
  ('50000000-0000-4000-8000-000000000002', 'fee', '1', 'user_corrected', 1, true);
insert into public.receipt_comparisons (receipt_id, advertised_rate, receipt_rate, gap_amount, gap_currency, tax_expected, tax_found)
  values ('50000000-0000-4000-8000-000000000001', 17.3, 17.2, 2.89, 'USD', 5, 5);
select pg_temp.expect($$insert into public.receipts (channel, redaction_status, image_retained, image_path, expires_at)
  values ('app', 'device', true, 'x.jpg', now())$$, '23514', 'receipts: no image kept without research consent');
select pg_temp.expect($$insert into public.receipts (channel, redaction_status) values ('app', 'device')$$,
  '23514', 'receipts: without research consent, a receipt must expire');
select pg_temp.expect($$insert into public.receipts (channel, redaction_status, expires_at) values ('web', 'device', now())$$,
  '23514', 'receipts: channel is app or whatsapp');
select pg_temp.expect($$insert into public.receipt_fields (receipt_id, field_name, value, extraction_path, confidence)
  values ('50000000-0000-4000-8000-000000000001', 'sender_name', 'x', 'parser', 0.5)$$, '23514', 'receipts: only the listed fields');
select pg_temp.expect($$insert into public.receipt_fields (receipt_id, field_name, value, extraction_path, confidence)
  values ('50000000-0000-4000-8000-000000000001', 'tax', '5', 'guess', 0.5)$$, '23514', 'receipts: extraction path is parser, model or user_corrected');
select pg_temp.expect($$insert into public.receipt_fields (receipt_id, field_name, value, extraction_path, confidence)
  values ('50000000-0000-4000-8000-000000000001', 'tax', '5', 'parser', 1.5)$$, '23514', 'receipts: confidence is 0 to 1');
select pg_temp.ok((select public.take_receipt_model_call(2)) and (select public.take_receipt_model_call(2))
  and not (select public.take_receipt_model_call(2)), 'receipts: the monthly model cap stops at the cap');
select pg_temp.ok(not (select public.take_receipt_model_call(0)), 'receipts: a cap of zero allows no calls');
reset role;

set role anon;
select pg_temp.as_user(null);
select pg_temp.ok((select count(*) = 0 from public.receipts) and (select count(*) = 0 from public.receipt_fields)
  and (select count(*) = 0 from public.receipt_comparisons) and (select count(*) = 0 from public.receipt_model_calls),
  'anon: receipt tables are not readable');
select pg_temp.expect($$insert into public.receipts (channel, redaction_status, expires_at) values ('app', 'device', now())$$,
  '42501', 'anon: can''t write a receipt');
select pg_temp.expect($$select public.take_receipt_model_call(100)$$, '42501', 'anon: can''t spend model calls');
select pg_temp.expect($$select public.forget_expired_receipts()$$, '42501', 'anon: can''t delete receipts');
select pg_temp.ok((select public.receipt_result('50000000-0000-4000-8000-000000000001') -> 'fields' -> 'fee' ->> 'path' = 'model'),
  'anon: the ID reads its result, with each field''s path');
select pg_temp.ok((select public.receipt_result('50000000-0000-4000-8000-000000000001') -> 'comparison' ->> 'gap_currency' = 'USD'),
  'anon: the result carries the comparison');
select pg_temp.ok((select public.receipt_result('50000000-0000-4000-8000-000000000002') is null), 'anon: an expired receipt reads as nothing');
select pg_temp.ok((select public.receipt_result('50000000-0000-4000-8000-0000000000ff') is null), 'anon: an unknown ID reads as nothing');
reset role;

set role service_role;
select pg_temp.ok((select public.forget_expired_receipts() = 1), 'receipts: the expired one is deleted');
reset role;
select pg_temp.ok((select count(*) = 2 from public.receipts) and (select count(*) = 2 from public.receipt_fields),
  'receipts: its fields go with it; the others and the consented one stay');
select pg_temp.ok((select count(*) = 1 from storage.buckets where id = 'receipt-images' and not public),
  'receipts: the image bucket is private');

-- ---------------------------------------------------------------------------------------
-- WhatsApp receipt photos (20260930020000_whatsapp_receipts.sql): a queue only the
-- functions and the worker touch; the worker never gets the number
-- ---------------------------------------------------------------------------------------
set role service_role;
insert into public.receipt_intake (id, phone_hash, phone_sealed, media_id, language, created_at) values
  ('60000000-0000-4000-8000-000000000001', repeat('a', 64), 'sealed-number-ciphertext', 'media_1', 'hi', now() - interval '2 minutes'),
  ('60000000-0000-4000-8000-000000000002', repeat('b', 64), 'sealed-number-ciphertext', 'media_2', 'en', now() - interval '2 hours');
select pg_temp.ok((select count(*) = 1 and bool_and(media_id = 'media_1' and language = 'hi')
  from public.claim_receipt_intake(5)), 'intake: the worker takes the waiting photo, not the hour-old one');
select pg_temp.ok((select count(*) = 0 from public.claim_receipt_intake(5)), 'intake: a photo being read isn''t taken twice');
update public.receipt_intake set claimed_at = now() - interval '11 minutes' where id = '60000000-0000-4000-8000-000000000001';
select pg_temp.ok((select count(*) = 1 from public.claim_receipt_intake(5)), 'intake: a photo a dead worker left is taken again');
update public.receipt_intake set claimed_at = now() - interval '11 minutes', attempts = 3 where id = '60000000-0000-4000-8000-000000000001';
select pg_temp.ok((select count(*) = 0 from public.claim_receipt_intake(5)), 'intake: at most three tries');
select pg_temp.ok((select public.forget_stale_receipt_intake() = 1), 'intake: rows older than an hour are deleted');
select pg_temp.expect($$insert into public.receipt_intake (phone_hash, phone_sealed, media_id) values ('+15551234567', 'sealed-number-ciphertext', 'm')$$,
  '23514', 'intake: the hash column takes only a hash');
select pg_temp.expect($$insert into public.receipt_intake (phone_hash, phone_sealed, media_id) values (repeat('c', 64), 'sealed-number-ciphertext', '../x')$$,
  '23514', 'intake: media IDs are checked');
select pg_temp.expect($$update public.whatsapp_users set pending_receipt = '50000000-0000-4000-8000-000000000001'$$,
  '23514', 'intake: a receipt being checked needs the field being asked');
select pg_temp.expect($$update public.whatsapp_users set pending_receipt = '50000000-0000-4000-8000-000000000001', pending_field = 'sender_name'$$,
  '23514', 'intake: only receipt fields can be asked about');
update public.whatsapp_users set pending_receipt = '50000000-0000-4000-8000-000000000001', pending_field = 'fee';
select pg_temp.ok((select count(*) = 1 from public.whatsapp_users where pending_field = 'fee'), 'intake: the function can note the value being asked');
reset role;

set role anon;
select pg_temp.ok((select count(*) = 0 from public.receipt_intake), 'anon: the photo queue is not readable');
select pg_temp.expect($$select * from public.claim_receipt_intake(1)$$, '42501', 'anon: can''t take photos off the queue');
select pg_temp.expect($$select public.forget_stale_receipt_intake()$$, '42501', 'anon: can''t clear the queue');
select pg_temp.expect($$insert into public.receipt_intake (phone_hash, phone_sealed, media_id) values (repeat('d', 64), 'sealed-number-ciphertext', 'm')$$,
  '42501', 'anon: can''t queue a photo');
reset role;


-- ---------------------------------------------------------------------------------------
-- The observatory (20260930030000_receipt_observatory.sql): totals only, research consent
-- only, no group under five
-- ---------------------------------------------------------------------------------------
set role anon;
select pg_temp.ok((select public.receipt_observatory() ->> 'receipts' = '0')
  and (select public.receipt_observatory() -> 'groups' = '[]'::jsonb),
  'observatory: receipts without research consent never count');
reset role;

set role service_role;
insert into public.receipts (id, channel, provider_id, route_id, redaction_status, research_consent, disclosures_missing)
select ('70000000-0000-4000-8000-00000000000' || i)::uuid, 'app', 'western-union', 'us-mx', 'device', true,
       case when i <= 2 then array['cfpb_contact'] else '{}'::text[] end
  from generate_series(1, 5) i;
insert into public.receipts (id, channel, provider_id, route_id, redaction_status, research_consent)
  values ('70000000-0000-4000-8000-000000000009', 'app', 'ria', 'us-mx', 'device', true);
insert into public.receipt_comparisons (receipt_id, receipt_rate, gap_amount, gap_currency, tax_expected, tax_found, total_cost_pct, markup_pct)
select ('70000000-0000-4000-8000-00000000000' || i)::uuid, 17.2, case when i = 1 then null else i - 3 end, 'USD',
       5, case when i = 5 then null else 5 end, i, i / 2.0
  from generate_series(1, 5) i;
insert into public.receipt_comparisons (receipt_id, receipt_rate, total_cost_pct, markup_pct)
  values ('70000000-0000-4000-8000-000000000009', 17.1, 9, 4);
select pg_temp.expect($$update public.receipts set disclosures_missing = array['sender_name'] where id = '70000000-0000-4000-8000-000000000001'$$,
  '23514', 'observatory: only the listed disclosure items');
reset role;

set role anon;
select pg_temp.ok((select public.receipt_observatory() ->> 'receipts' = '6'), 'observatory: counts every consented, checked receipt');
select pg_temp.ok((select jsonb_array_length(public.receipt_observatory() -> 'groups') = 1), 'observatory: a group under five is left out');
select pg_temp.ok((select public.receipt_observatory() -> 'groups' -> 0 @>
  '{"provider_id":"western-union","route_id":"us-mx","receipts":5,"median_total_cost_pct":3,"median_markup_pct":1.5,"compared":4,"paid_more_than_advertised":2}'::jsonb),
  'observatory: medians and counts per provider and route');
select pg_temp.ok((select public.receipt_observatory() -> 'tax' = '{"taxed":5,"matches":4,"not_found":1}'::jsonb), 'observatory: the tax totals');
select pg_temp.ok((select public.receipt_observatory() -> 'disclosures_missing' = '{"cfpb_contact":2}'::jsonb), 'observatory: missing disclosures, counted');
select pg_temp.ok((select public.receipt_result('70000000-0000-4000-8000-000000000001') -> 'disclosures_missing' = '["cfpb_contact"]'::jsonb),
  'receipts: the result carries the missing disclosures');
reset role;

-- ---------------------------------------------------------------------------------------
-- Security hardening (D135)
-- ---------------------------------------------------------------------------------------
-- Password sign-in gets no token; a code, Apple, Google or a refresh of one of those does.
select pg_temp.ok((select public.custom_access_token_hook('{"authentication_method": "password", "claims": {"sub": "x"}}') ? 'error'),
  'hook: a password sign-in gets no token');
select pg_temp.ok((select public.custom_access_token_hook(
    '{"authentication_method": "token_refresh", "claims": {"sub": "x", "amr": [{"method": "password", "timestamp": 1}]}}') ? 'error'),
  'hook: nor does refreshing a session that began with a password');
select pg_temp.ok((select public.custom_access_token_hook('{"authentication_method": "otp", "claims": {"sub": "x", "role": "authenticated"}}')
    = '{"claims": {"sub": "x", "role": "authenticated"}}'::jsonb),
  'hook: an email code passes its claims through unchanged');
select pg_temp.ok((select not (public.custom_access_token_hook(
    '{"authentication_method": "token_refresh", "claims": {"sub": "x", "amr": [{"method": "oauth", "timestamp": 1}]}}') ? 'error')),
  'hook: refreshing a Google or Apple session works');

set role anon;
select pg_temp.expect($$select public.custom_access_token_hook('{}')$$, '42501', 'anon: can''t call the sign-in hook');
select pg_temp.expect($$select public.take_hit_for_ip('scan', '1.2.3.4', 1, 60)$$, '42501', 'anon: can''t touch rate limits');
select pg_temp.expect($$select public.is_admin()$$, '42501', 'anon: is_admin() isn''t callable');
select pg_temp.expect($$select * from private.rate_limit_hits$$, '42501', 'anon: the private schema is closed');
-- Seven events from one address against a limit of 600 per 10 minutes: all fine.
select set_config('request.headers', '{"x-forwarded-for": "203.0.113.9, 10.0.0.1"}', false);
insert into public.events (install_id, name) select '30000000-0000-4000-8000-000000000003', 'app_opened' from generate_series(1, 7);
reset role;
select pg_temp.ok((select hits = 7 from private.rate_limit_hits where bucket = 'events'),
  'rate limit: hits counted per address');
select pg_temp.ok((select client !~ '203' and length(client) = 64 from private.rate_limit_hits where bucket = 'events'),
  'rate limit: the address is kept only as a keyed hash');
-- The limit itself, made tiny for the test.
select pg_temp.ok((select private.take_hit('test', '198.51.100.7', 2, interval '1 hour')
                     and private.take_hit('test', '198.51.100.7', 2, interval '1 hour')
                     and not private.take_hit('test', '198.51.100.7', 2, interval '1 hour')
                     and private.take_hit('test', '198.51.100.8', 2, interval '1 hour')),
  'rate limit: the third hit in the window is refused, another address is not');
select pg_temp.ok((select private.take_hit('test', null, 0, interval '1 hour')), 'rate limit: no address (SQL, migrations) is never limited');
-- Route requests from one address, past 30 an hour.
set role anon;
select set_config('request.headers', '{"x-real-ip": "192.0.2.44"}', false);
insert into public.route_requests (send_country, receive_country, install_id)
  select 'US', 'TZ', gen_random_uuid() from generate_series(1, 30);
select pg_temp.expect($$insert into public.route_requests (send_country, receive_country, install_id)
  values ('US', 'TZ', gen_random_uuid())$$, '54000', 'rate limit: the 31st route request in an hour is refused');
select set_config('request.headers', '', false);
reset role;
select pg_temp.ok((select count(*) = 30 from public.route_requests where receive_country = 'TZ'), 'rate limit: the first 30 went in');
-- The service role (WhatsApp, the engine) shares Supabase's address and isn't limited.
set role service_role;
select set_config('request.headers', '{"x-real-ip": "192.0.2.44"}', false);
insert into public.route_requests (send_country, receive_country, install_id, source) values ('US', 'TZ', gen_random_uuid(), 'whatsapp');
select set_config('request.headers', '', false);
reset role;
select pg_temp.ok(true, 'rate limit: the service role isn''t limited');
select private.forget_rate_limits();

-- Free text has a cap.
select pg_temp.expect($$insert into public.saved_transfers (user_id, provider_name, send_currency, receive_currency, sent, quoted_rate, sent_on, note)
  values ('00000000-0000-4000-8000-0000000000b2', 'Wise', 'USD', 'INR', 100, 88, '2026-09-01', repeat('x', 501))$$,
  '23514', 'saved transfers: a note over 500 characters is refused');

-- ---------------------------------------------------------------------------------------
-- Linking WhatsApp to an account (D138)
-- ---------------------------------------------------------------------------------------
insert into auth.users (id, email) values ('00000000-0000-4000-8000-0000000000c3', 'linker@example.org');
set role anon;
select pg_temp.as_user(null);
select pg_temp.expect($$select public.whatsapp_link_code()$$, '42501', 'anon: can''t get a link code');
select pg_temp.expect($$select public.link_whatsapp('ABCDEF', repeat('c', 64))$$, '42501', 'anon: can''t link a chat');
select pg_temp.ok((select count(*) = 0 from public.whatsapp_link_codes), 'anon: link codes are not readable');
select pg_temp.ok((select value = 'false' from public.app_settings where key = 'whatsapp_live'), 'anon: app settings are readable');
select pg_temp.expect($$insert into public.app_settings (key, value) values ('evil', 'x')$$, '42501', 'anon: can''t change app settings');
reset role;

set role authenticated;
select pg_temp.as_user('00000000-0000-4000-8000-0000000000c3');
create temp table link_code as select public.whatsapp_link_code() as code;
reset role;
grant select on link_code to authenticated, service_role;
select pg_temp.ok((select code ~ '^[A-HJ-NP-Z2-9]{6}$' from link_code), 'link: a six-character code without look-alike letters');
set role authenticated;
select pg_temp.as_user('00000000-0000-4000-8000-0000000000c3');
select pg_temp.ok((select (public.whatsapp_link_status() ->> 'linked')::boolean = false), 'link: not linked yet');
select pg_temp.expect($$select public.link_whatsapp((select code from link_code), repeat('c', 64))$$, '42501', 'user: can''t link a chat themselves');
-- A second code replaces the first.
select public.whatsapp_link_code();
reset role;
select pg_temp.ok((select count(*) = 1 from public.whatsapp_link_codes), 'link: one live code per person');
delete from public.whatsapp_link_codes;
insert into public.whatsapp_link_codes (code, user_id) values ('K7P2QX', '00000000-0000-4000-8000-0000000000c3');
set role service_role;
select pg_temp.ok((select public.link_whatsapp('k7p2qx', repeat('c', 64))), 'link: the function links with a valid code, any case');
select pg_temp.ok((select not public.link_whatsapp('K7P2QX', repeat('d', 64))), 'link: a code works once');
reset role;
select pg_temp.ok((select user_id = '00000000-0000-4000-8000-0000000000c3' from public.whatsapp_users where phone_hash = repeat('c', 64)),
  'link: the chat row now points at the account');
insert into public.whatsapp_link_codes (code, user_id, expires_at) values ('ZZZZZZ', '00000000-0000-4000-8000-0000000000c3', now() - interval '1 second');
set role service_role;
select pg_temp.ok((select not public.link_whatsapp('ZZZZZZ', repeat('d', 64))), 'link: an expired code doesn''t work');
reset role;
set role authenticated;
select pg_temp.as_user('00000000-0000-4000-8000-0000000000c3');
select pg_temp.ok((select (public.whatsapp_link_status() ->> 'linked')::boolean), 'link: the app sees it linked');
select public.unlink_whatsapp();
select pg_temp.ok((select (public.whatsapp_link_status() ->> 'linked')::boolean = false), 'link: unlinked from the app');
reset role;
-- Linked again, then the account deleted: the chat stays, unlinked.
delete from public.whatsapp_link_codes;
insert into public.whatsapp_link_codes (code, user_id) values ('M3N4P5', '00000000-0000-4000-8000-0000000000c3');
set role service_role;
select public.link_whatsapp('M3N4P5', repeat('c', 64));
reset role;
delete from auth.users where id = '00000000-0000-4000-8000-0000000000c3';
select pg_temp.ok((select user_id is null and linked_at is null from public.whatsapp_users where phone_hash = repeat('c', 64)),
  'link: deleting the account unlinks the chat');

-- ---------------------------------------------------------------------------------------
-- Rate alerts by WhatsApp, with the number sealed (D139)
-- ---------------------------------------------------------------------------------------
insert into auth.users (id, email) values ('00000000-0000-4000-8000-0000000000d4', 'alerts@example.org');
set role authenticated;
select pg_temp.as_user('00000000-0000-4000-8000-0000000000d4');
select pg_temp.expect($$insert into public.rate_alerts (user_id, route_id, send_amount, delivery_method, target_received, channel)
  values ('00000000-0000-4000-8000-0000000000d4', 'us-in', 500, 'bank_deposit', 47000, 'whatsapp')$$,
  '23514', 'whatsapp alert: refused without a linked chat');
select pg_temp.expect($$insert into public.rate_alerts (user_id, route_id, send_amount, delivery_method, target_received)
  values ('00000000-0000-4000-8000-0000000000d4', 'us-in', 500, 'bank_deposit', 47000)$$,
  '23514', 'push alert: still needs a push token');
reset role;
insert into public.whatsapp_link_codes (code, user_id) values ('Q8R9S2', '00000000-0000-4000-8000-0000000000d4');
set role service_role;
select pg_temp.ok((select public.link_whatsapp('Q8R9S2', repeat('e', 64), repeat('S', 40))), 'whatsapp alert: linked with the sealed number');
reset role;
set role authenticated;
select pg_temp.as_user('00000000-0000-4000-8000-0000000000d4');
insert into public.rate_alerts (user_id, route_id, send_amount, delivery_method, target_received, channel)
  values ('00000000-0000-4000-8000-0000000000d4', 'us-in', 500, 'bank_deposit', 1, 'whatsapp');
select pg_temp.ok((select count(*) = 1 from public.rate_alerts where channel = 'whatsapp'), 'whatsapp alert: allowed once linked, with no push token');
select pg_temp.ok((select count(*) = 0 from public.whatsapp_users), 'user: sees no WhatsApp rows, sealed numbers included');
reset role;
set role anon;
select pg_temp.expect($$select public.link_whatsapp('Q8R9S2', repeat('e', 64), 'x')$$, '42501', 'anon: can''t link, number or not');
reset role;
-- Unlinking clears the number and the alerts that would go to it.
set role authenticated;
select pg_temp.as_user('00000000-0000-4000-8000-0000000000d4');
select public.unlink_whatsapp();
reset role;
select pg_temp.ok((select number_sealed is null and user_id is null from public.whatsapp_users where phone_hash = repeat('e', 64)),
  'whatsapp alert: unlinking deletes the sealed number');
select pg_temp.ok((select count(*) = 0 from public.rate_alerts where user_id = '00000000-0000-4000-8000-0000000000d4' and channel = 'whatsapp'),
  'whatsapp alert: unlinking deletes the WhatsApp alerts');
-- STOP (the row deleted) does the same.
insert into public.whatsapp_link_codes (code, user_id) values ('T3U4V5', '00000000-0000-4000-8000-0000000000d4');
set role service_role;
select public.link_whatsapp('T3U4V5', repeat('e', 64), repeat('S', 40));
reset role;
insert into public.rate_alerts (user_id, route_id, send_amount, delivery_method, target_received, channel)
  values ('00000000-0000-4000-8000-0000000000d4', 'us-in', 500, 'bank_deposit', 1, 'whatsapp');
delete from public.whatsapp_users where phone_hash = repeat('e', 64);
select pg_temp.ok((select count(*) = 0 from public.rate_alerts where user_id = '00000000-0000-4000-8000-0000000000d4' and channel = 'whatsapp'),
  'whatsapp alert: STOP deletes the WhatsApp alerts');
delete from auth.users where id = '00000000-0000-4000-8000-0000000000d4';

-- ---------------------------------------------------------------------------------------
-- AI limits (D140): per-person daily counters and the daily model cap
-- ---------------------------------------------------------------------------------------
select pg_temp.ok((select public.count_hit('scan_day_phone', 'install-1', 86400)) = 1
                  and (select public.count_hit('scan_day_phone', 'install-1', 86400)) = 2
                  and (select public.count_hit('scan_day_phone', 'install-2', 86400)) = 1,
  'ai limits: count_hit counts each key on its own');
select pg_temp.ok((select public.count_hit('scan_day_phone', '', 86400)) = 0, 'ai limits: an empty key isn''t counted');
select pg_temp.ok(not exists (select 1 from private.rate_limit_hits where client like '%install%'),
  'ai limits: the key is kept only as an HMAC');
select pg_temp.ok((select private.take_hit('test2', '198.51.100.8', 1, interval '1 hour'))
                  and not (select private.take_hit('test2', '198.51.100.8', 1, interval '1 hour')),
  'ai limits: the address limit still refuses past its ceiling');
delete from public.receipt_model_calls;
select pg_temp.ok((select public.take_receipt_model_call(100, 2)) and (select public.take_receipt_model_call(100, 2))
                  and not (select public.take_receipt_model_call(100, 2)),
  'ai limits: the daily model cap stops at the cap');
select pg_temp.ok((select calls = 2 from public.receipt_model_calls_daily where day = current_date)
                  and (select calls = 2 from public.receipt_model_calls),
  'ai limits: a refused call isn''t counted against the month');
delete from public.receipt_model_calls_daily;
delete from public.receipt_model_calls;
select public.take_receipt_model_call(1, 10);
select pg_temp.ok(not (select public.take_receipt_model_call(1, 10))
                  and (select calls = 1 from public.receipt_model_calls_daily where day = current_date),
  'ai limits: when the month is used up, the day''s call is given back');
set role anon;
select pg_temp.expect($$select public.count_hit('x', 'y', 60)$$, '42501', 'anon: can''t touch the daily counters');
select pg_temp.expect($$select public.take_receipt_model_call(100, 100)$$, '42501', 'anon: can''t spend daily model calls');
select pg_temp.expect($$select * from public.receipt_model_calls_daily$$, '42501', 'anon: can''t read the daily model count');
reset role;
set role authenticated;
select pg_temp.expect($$select public.count_hit('x', 'y', 60)$$, '42501', 'user: can''t touch the daily counters');
reset role;
set role service_role;
select pg_temp.ok((select public.count_hit('wa_photo', repeat('f', 64), 86400)) = 1, 'service role: counts a WhatsApp photo');
reset role;

-- ---------------------------------------------------------------------------------------
-- Research receipts end after 24 months (D141)
-- ---------------------------------------------------------------------------------------
set role service_role;
insert into public.receipts (id, channel, redaction_status, research_consent, image_retained, image_path)
  values ('80000000-0000-4000-8000-000000000001', 'app', 'device', true, true, 'r/81.jpg');
select pg_temp.ok((select expires_at = submitted_at + interval '24 months' from public.receipts
                    where id = '80000000-0000-4000-8000-000000000001'),
  'research receipts: 24 months when no end is given');
select pg_temp.ok(not exists (select 1 from public.receipts where expires_at is null),
  'research receipts: every receipt has an end');
select pg_temp.expect($$insert into public.receipts (channel, redaction_status, research_consent, expires_at)
  values ('app', 'device', true, now() + interval '25 months')$$, '23514', 'research receipts: never past 24 months');
update public.receipts set expires_at = now() - interval '1 minute' where id = '80000000-0000-4000-8000-000000000001';
select public.forget_expired_receipts();
select pg_temp.ok(exists (select 1 from public.receipts where id = '80000000-0000-4000-8000-000000000001'),
  'research receipts: the job leaves one with an image for the function (its image first)');
select pg_temp.ok((select image_path = 'r/81.jpg' from public.expired_receipt_images(10)
                    where id = '80000000-0000-4000-8000-000000000001'),
  'research receipts: the function is told which images to delete');
delete from public.receipts where id = '80000000-0000-4000-8000-000000000001';
reset role;
set role anon;
select pg_temp.expect($$select * from public.expired_receipt_images(10)$$, '42501', 'anon: can''t list receipt images');
reset role;

\echo 'all local checks passed'
