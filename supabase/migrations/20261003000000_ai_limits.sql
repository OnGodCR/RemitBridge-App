-- Limits on what costs money to run (DECISIONS.md D140; Angad, 2026-10-02: "someone shouldnt
-- just be able to drain all my api because theyre spamming it").
--
-- Each receipt scan asks the model at most once. Before this, the only bounds were 30 scans
-- an hour per network address and 2,000 model calls a month, so one person could spend the
-- whole month in a day, and the WhatsApp bot (exempt from the address limit) had none
-- beyond its 30 messages an hour. Now:
--
--   count_hit()   a counter keyed by anything (an install ID, an account, a WhatsApp
--                 chat's keyed hash), for the scan-receipt and whatsapp functions to cap
--                 per person per day. Same storage as the address limits: the key is never
--                 kept, only an HMAC of it with the day's random key, deleted within a day.
--   take_receipt_model_call(cap, daily_cap)
--                 the month's allowance as before, plus a daily one, so a bad day can
--                 spend only a slice of the month.

create function private.count_hit(p_bucket text, p_key text, p_window interval) returns int
language plpgsql volatile security definer set search_path = '' as $$
declare
  k bytea;
  w timestamptz := pg_catalog.date_bin(p_window, now(), timestamptz '2000-01-01');
  n int;
begin
  if p_key is null or p_key = '' then
    return 0;
  end if;
  insert into private.rate_limit_keys (day) values (current_date) on conflict (day) do nothing;
  select secret into k from private.rate_limit_keys where day = current_date;
  insert into private.rate_limit_hits as h (bucket, client, window_start, hits)
    values (p_bucket, encode(extensions.hmac(convert_to(p_key, 'UTF8'), k, 'sha256'), 'hex'), w, 1)
  on conflict (bucket, client, window_start) do update set hits = h.hits + 1
  returning hits into n;
  return n;
end $$;
revoke all on function private.count_hit(text, text, interval) from public;

-- The address limit is the same counter with a ceiling.
create or replace function private.take_hit(p_bucket text, p_ip text, p_max int, p_window interval) returns boolean
language sql volatile security definer set search_path = '' as $$
  select private.count_hit(p_bucket, p_ip, p_window) <= p_max
$$;

-- For the functions: counts one hit and returns how many this window holds, so the caller
-- can answer the first refusal and stay quiet after it. 0 for an empty key.
create function public.count_hit(p_bucket text, p_key text, p_window_seconds int) returns int
language sql volatile security definer set search_path = '' as $$
  select private.count_hit(p_bucket, p_key, make_interval(secs => p_window_seconds))
$$;
revoke execute on function public.count_hit(text, text, int) from public, anon, authenticated;
grant execute on function public.count_hit(text, text, int) to service_role;

-- Model calls per day, beside the month's (receipt_model_calls). Counts only; no receipt,
-- person or address. Kept as a record of spend.
create table public.receipt_model_calls_daily (
  day date primary key,
  calls int not null default 0 check (calls >= 0)
);
alter table public.receipt_model_calls_daily enable row level security;
-- No policies, and no table rights for the public roles: only the function below writes it.
revoke all on public.receipt_model_calls_daily from anon, authenticated;

create function public.take_receipt_model_call(p_cap int, p_daily_cap int) returns boolean
language plpgsql volatile security definer set search_path = '' as $$
declare
  taken boolean;
begin
  if p_daily_cap is null or p_daily_cap <= 0 then
    return false;
  end if;
  insert into public.receipt_model_calls_daily as c (day, calls) values (current_date, 1)
  on conflict (day) do update set calls = c.calls + 1 where c.calls < p_daily_cap
  returning true into taken;
  if not coalesce(taken, false) then
    return false;
  end if;
  if public.take_receipt_model_call(p_cap) then
    return true;
  end if;
  -- The month is used up: give the day's call back, so the count stays true.
  update public.receipt_model_calls_daily set calls = calls - 1 where day = current_date;
  return false;
end $$;
revoke execute on function public.take_receipt_model_call(int, int) from public, anon, authenticated;
grant execute on function public.take_receipt_model_call(int, int) to service_role;
