-- Compare's prices (DECISIONS.md D144; Angad, 2026-10-07: bring back the hand-checked
-- prices, marked old, and re-check them).
--
-- latest_quotes drops every price at 48 hours (PRD 9.5), which suits the scraped and API
-- prices that refresh every few hours. Hand-checked prices (source 'manual', D142) come
-- from Angad going through each provider's site, so they can't refresh that often, and
-- they vanished from Compare two days after each check. This view is latest_quotes plus
-- hand-checked prices up to 7 days old, with is_older marking anything past 48 hours.
-- Compare lists those under their own "Older prices" heading, ranked among themselves and
-- never above a current price.
--
-- latest_quotes itself is unchanged, so rate alerts, the WhatsApp bot and the receipt
-- result still only ever use prices from the last 48 hours.
--
-- Like latest_quotes, one row per provider, route, amount, method and payment, the newest.
-- A provider can have rows at two nearby amounts (hand prices are stored at the total paid,
-- such as $501.99 for $500 plus a $1.99 fee); the app keeps the one nearest the amount.

create view public.compare_quotes with (security_invoker = true) as
select distinct on (q.provider_id, q.route_id, q.send_amount, q.delivery_method, q.payment_method)
  q.id, q.provider_id, p.name as provider_name, q.route_id, q.send_currency,
  q.receive_currency, q.send_amount, q.delivery_method, q.payment_method, q.fee,
  q.offered_rate, q.mid_market_rate, q.mid_market_source, q.pickup_charge,
  q.amount_received, q.markup_pct, q.total_cost, q.total_cost_pct, q.delivery_time,
  q.is_promotional, q.source, q.captured_at,
  (now() - q.captured_at) > interval '24 hours' as is_stale,
  (now() - q.captured_at) > interval '48 hours' as is_older
from public.quotes q
join public.providers p on p.id = q.provider_id
where q.validation_status = 'published'
  and (
    q.captured_at > now() - interval '48 hours'
    or (q.source = 'manual' and q.captured_at > now() - interval '7 days')
  )
order by q.provider_id, q.route_id, q.send_amount, q.delivery_method, q.payment_method,
  q.captured_at desc;

grant select on public.compare_quotes to anon, authenticated;
