-- Rate alerts as push notifications (DECISIONS.md D34, D113).
--
-- A signed-in person asks to hear when a route pays at least a target amount; after each
-- price check, the "Rate alerts" workflow calls due_rate_alerts() with the service role
-- and sends a push through Expo's push service to the phone's Expo push token. At most
-- one alert a day per alert. Owner-only like saved comparisons (D19), at most ten each,
-- and deleted with the account.

create table public.rate_alerts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  route_id text not null references public.routes (id),
  -- One of the amounts prices are checked at (the app picks the nearest at or below).
  send_amount numeric not null check (send_amount > 0 and send_amount <= 50000),
  delivery_method text not null check (delivery_method in ('bank_deposit', 'cash_pickup', 'mobile_wallet', 'upi')),
  payment_method text not null default 'bank_account'
    check (payment_method in ('bank_account', 'debit_card', 'credit_card', 'cash', 'money_order', 'cashiers_check')),
  -- In the receiving currency, for send_amount.
  target_received numeric not null check (target_received > 0),
  -- Expo's token for this phone; nothing else about the device is kept.
  push_token text not null check (push_token ~ '^Expo(nent)?PushToken\[[A-Za-z0-9_-]{10,}\]$'),
  language text not null default 'en' check (language in ('en', 'es', 'hi', 'tl', 'vi')),
  last_notified_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.rate_alerts (route_id, send_amount, delivery_method);
create index on public.rate_alerts (user_id);

alter table public.rate_alerts enable row level security;
create policy "own rate alerts" on public.rate_alerts
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- A client can't pretend an alert was already sent (so it'd never fire), or backdate it.
create function public.rate_alerts_stamp() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if (select count(*) from public.rate_alerts where user_id = new.user_id) >= 10 then
      raise exception 'at most 10 rate alerts' using errcode = '23514';
    end if;
    new.created_at := now();
  end if;
  -- Signed-in clients run as `authenticated`; only the sender (service_role) stamps a send.
  if current_setting('role', true) = 'authenticated' then
    new.last_notified_at := case when tg_op = 'UPDATE' then old.last_notified_at else null end;
  end if;
  return new;
end $$;
create trigger rate_alerts_stamp before insert or update on public.rate_alerts
  for each row execute function public.rate_alerts_stamp();

-- What the sender reads: every alert whose best current standing price (not a promotion,
-- not stale) now meets its target, and that hasn't fired in the last 20 hours. Only the
-- service role may call it: it returns push tokens.
create function public.due_rate_alerts()
returns table (
  id bigint,
  push_token text,
  language text,
  route_id text,
  send_amount numeric,
  delivery_method text,
  target_received numeric,
  best_received numeric,
  receive_currency text,
  provider_name text
)
language sql stable security definer set search_path = public as $$
  select a.id, a.push_token, a.language, a.route_id, a.send_amount, a.delivery_method,
         a.target_received, b.amount_received, b.receive_currency, b.provider_name
  from public.rate_alerts a
  join lateral (
    select q.amount_received, q.receive_currency, q.provider_name
    from public.latest_quotes q
    where q.route_id = a.route_id
      and q.send_amount = a.send_amount
      and q.delivery_method = a.delivery_method
      and q.payment_method = a.payment_method
      and not q.is_stale
      and not q.is_promotional
    order by q.amount_received desc
    limit 1
  ) b on true
  where b.amount_received >= a.target_received
    and (a.last_notified_at is null or a.last_notified_at < now() - interval '20 hours');
$$;
revoke all on function public.due_rate_alerts() from public, anon, authenticated;
grant execute on function public.due_rate_alerts() to service_role;
