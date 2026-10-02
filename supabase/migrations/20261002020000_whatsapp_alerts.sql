-- Rate alerts by WhatsApp (DECISIONS.md D139; Angad, 2026-10-02: "you can store numbers as
-- long as its encrypted for whatsapp and abides by all data protection/privacy").
--
-- To message someone first, Meta needs their number, so a linked chat now keeps it, sealed:
--   number_sealed   AES-GCM, with a key only the whatsapp function holds (derived from
--                   WHATSAPP_HASH_SECRET, a different label from the photo queue's). The
--                   database never sees the number in the clear, and no one reading it can.
-- Kept only while the chat is linked: unlinking, STOP, or deleting the account clears it
-- (and the person's WhatsApp alerts with it). Never in logs, never sent anywhere but Meta.
--
-- rate_alerts gains a channel: 'push' (a phone notification, as before) or 'whatsapp'
-- (no push token; only for an account with a linked chat). The "Rate alerts" workflow asks
-- the whatsapp function to send the WhatsApp ones, since only it can open the number.

alter table public.whatsapp_users
  add column number_sealed text check (number_sealed is null or length(number_sealed) between 16 and 200);

-- Unlinked (by the person, by STOP's delete, or by the account's deletion): the number goes.
create or replace function public.whatsapp_users_unlinked() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.user_id is null then
    new.linked_at := null;
    new.number_sealed := null;
  end if;
  return new;
end $$;

drop function public.link_whatsapp(text, text);
create function public.link_whatsapp(p_code text, p_phone_hash text, p_number_sealed text default null) returns boolean
language plpgsql volatile security definer set search_path = '' as $$
declare
  uid uuid;
begin
  delete from public.whatsapp_link_codes
   where code = upper(trim(p_code)) and expires_at > now()
  returning user_id into uid;
  if uid is null then
    return false;
  end if;
  -- One chat per account: another chat linked before is unlinked, its number cleared.
  update public.whatsapp_users set user_id = null where user_id = uid and phone_hash <> p_phone_hash;
  insert into public.whatsapp_users (phone_hash, user_id, linked_at, number_sealed)
    values (p_phone_hash, uid, now(), p_number_sealed)
  on conflict (phone_hash) do update
    set user_id = excluded.user_id, linked_at = excluded.linked_at, number_sealed = excluded.number_sealed;
  return true;
end $$;
revoke execute on function public.link_whatsapp(text, text, text) from public, anon, authenticated;
grant execute on function public.link_whatsapp(text, text, text) to service_role;

-- When a chat is unlinked or forgotten, the alerts that would go to it go too.
create function public.whatsapp_alerts_forget() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if old.user_id is not null and (tg_op = 'DELETE' or new.user_id is distinct from old.user_id) then
    delete from public.rate_alerts where user_id = old.user_id and channel = 'whatsapp';
  end if;
  return null;
end $$;
revoke execute on function public.whatsapp_alerts_forget() from public, anon, authenticated;

alter table public.rate_alerts
  add column channel text not null default 'push' check (channel in ('push', 'whatsapp')),
  alter column push_token drop not null,
  add constraint rate_alerts_channel_token check ((channel = 'push') = (push_token is not null));

create trigger whatsapp_alerts_forget after update of user_id or delete on public.whatsapp_users
  for each row execute function public.whatsapp_alerts_forget();

-- As before (at most ten, no backdating, the sender alone stamps a send), plus: a WhatsApp
-- alert needs a linked chat that can be messaged.
create or replace function public.rate_alerts_stamp() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if (select count(*) from public.rate_alerts where user_id = new.user_id) >= 10 then
      raise exception 'at most 10 rate alerts' using errcode = '23514';
    end if;
    new.created_at := now();
  end if;
  if new.channel = 'whatsapp' and not exists (
    select 1 from public.whatsapp_users w where w.user_id = new.user_id and w.number_sealed is not null
  ) then
    raise exception 'link WhatsApp first' using errcode = '23514';
  end if;
  if current_setting('role', true) = 'authenticated' then
    new.last_notified_at := case when tg_op = 'UPDATE' then old.last_notified_at else null end;
  end if;
  return new;
end $$;

-- The sender's list gains the channel and, for WhatsApp, the account to look the number up by.
drop function public.due_rate_alerts();
create function public.due_rate_alerts()
returns table (
  id bigint,
  channel text,
  user_id uuid,
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
language sql stable security definer set search_path = '' as $$
  select a.id, a.channel, a.user_id, a.push_token, a.language, a.route_id, a.send_amount, a.delivery_method,
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
