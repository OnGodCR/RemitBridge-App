-- Scanned receipts (DECISIONS.md D72-D81).
--
-- A receipt is read on the phone (or, for WhatsApp, by a worker), with personal details
-- hidden before anything leaves it. What's stored is what the brief asks for and nothing
-- that identifies a person:
--   receipts             one row per scan: when, which channel, which provider and route,
--                        how it was redacted, and the two consent flags. No user ID, no
--                        install ID, no phone number (D81).
--   receipt_fields       each value read: the field, the value as text, where it came
--                        from (parser / model / user_corrected), confidence, validated.
--   receipt_comparisons  advertised vs. paid and the tax check, filled in by Phase 3.
-- Values are amounts, currency codes, a date, the provider's name and two method names.
--
-- How long it's kept: without research consent, 30 days, for the result page; then the
-- whole receipt is deleted (expires_at). With research consent, it's kept for the
-- observatory, and so is the redacted image (image_path); without consent the image is
-- never stored at all. The `route_id` column is the brief's `corridor_id`: "route" is
-- what this schema calls a corridor everywhere else.
--
-- Access: only the scan-receipt Edge Function (service_role) reads or writes the tables.
-- Anyone holding a receipt's ID reads its result through receipt_result(); the ID is a
-- random UUID, so it works as the key to one receipt and nothing else.

create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  submitted_at timestamptz not null default now(),
  channel text not null check (channel in ('app', 'whatsapp')),
  provider_id text references public.providers (id) on delete set null,
  -- The provider's name as read, for one we don't track (so the result can say so).
  provider_name text check (length(provider_name) between 1 and 80),
  route_id text references public.routes (id) on delete set null,
  -- device: hidden on the phone, and the server's second check found nothing more.
  -- device_rechecked: the server's check found more in the text; it hid it and never
  --   stored or sent on the image.
  -- server: hidden by the WhatsApp worker (Phase 5).
  redaction_status text not null check (redaction_status in ('device', 'device_rechecked', 'server')),
  image_retained boolean not null default false,
  research_consent boolean not null default false,
  image_path text,
  expires_at timestamptz,
  check (image_retained = (image_path is not null)),
  check (research_consent or not image_retained),
  check (research_consent = (expires_at is null))
);
create index receipts_expiring on public.receipts (expires_at) where expires_at is not null;

create table public.receipt_fields (
  receipt_id uuid not null references public.receipts (id) on delete cascade,
  field_name text not null check (field_name in (
    'provider', 'send_currency', 'receive_currency', 'amount_sent', 'fee', 'tax', 'total_paid',
    'exchange_rate', 'amount_received', 'pickup_charge', 'transfer_date', 'funding_method',
    'delivery_method')),
  value text not null check (length(value) between 1 and 80),
  extraction_path text not null check (extraction_path in ('parser', 'model', 'user_corrected')),
  confidence numeric not null check (confidence between 0 and 1),
  validated boolean not null default false,
  primary key (receipt_id, field_name)
);

create table public.receipt_comparisons (
  receipt_id uuid primary key references public.receipts (id) on delete cascade,
  -- The published quote the receipt was compared with, if one matched (D82).
  matched_quote_id bigint references public.quotes (id) on delete set null,
  advertised_rate numeric check (advertised_rate > 0),
  receipt_rate numeric check (receipt_rate > 0),
  gap_amount numeric,
  gap_currency text check (gap_currency ~ '^[A-Z]{3}$'),
  tax_expected numeric check (tax_expected >= 0),
  tax_found numeric check (tax_found >= 0),
  created_at timestamptz not null default now()
);

-- Model calls this month, for the spend cap (D79).
create table public.receipt_model_calls (
  month date primary key check (month = date_trunc('month', month)::date),
  calls int not null default 0 check (calls >= 0)
);

alter table public.receipts enable row level security;
alter table public.receipt_fields enable row level security;
alter table public.receipt_comparisons enable row level security;
alter table public.receipt_model_calls enable row level security;
-- No policies on purpose: every client key is refused. The Edge Function uses service_role.

-- ---------------------------------------------------------------------------------------
-- Functions
-- ---------------------------------------------------------------------------------------

-- One receipt's result, for whoever holds its ID: the app's result screen now, the result
-- page linked from WhatsApp later. Null once it has expired, or if there's no such receipt.
create function public.receipt_result(p_id uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'id', r.id,
    'submitted_at', r.submitted_at,
    'channel', r.channel,
    'provider_id', r.provider_id,
    'provider_name', r.provider_name,
    'route_id', r.route_id,
    'research_consent', r.research_consent,
    'expires_at', r.expires_at,
    'fields', coalesce((
      select jsonb_object_agg(f.field_name, jsonb_build_object(
        'value', f.value, 'path', f.extraction_path, 'confidence', f.confidence, 'validated', f.validated))
      from public.receipt_fields f where f.receipt_id = r.id), '{}'::jsonb),
    'comparison', (select to_jsonb(c) - 'receipt_id' from public.receipt_comparisons c where c.receipt_id = r.id)
  )
  from public.receipts r
  where r.id = p_id and (r.expires_at is null or r.expires_at > now())
$$;
grant execute on function public.receipt_result(uuid) to anon, authenticated;

-- Takes one model call from this month's allowance: true if there was one left.
create function public.take_receipt_model_call(p_cap int) returns boolean
language plpgsql volatile security definer set search_path = '' as $$
declare
  taken boolean;
begin
  if p_cap is null or p_cap <= 0 then
    return false;
  end if;
  insert into public.receipt_model_calls as c (month, calls)
    values (date_trunc('month', now())::date, 1)
  on conflict (month) do update set calls = c.calls + 1 where c.calls < p_cap
  returning true into taken;
  return coalesce(taken, false);
end $$;

-- Deletes receipts past their 30 days. The Edge Function calls it on every scan.
create function public.forget_expired_receipts() returns int
language sql volatile security definer set search_path = '' as $$
  with gone as (delete from public.receipts where expires_at <= now() returning 1)
  select count(*)::int from gone
$$;

revoke execute on function public.take_receipt_model_call(int) from public, anon, authenticated;
revoke execute on function public.forget_expired_receipts() from public, anon, authenticated;
grant execute on function public.take_receipt_model_call(int) to service_role;
grant execute on function public.forget_expired_receipts() to service_role;

-- ---------------------------------------------------------------------------------------
-- Redacted images, kept only with research consent. Private: only service_role.
-- ---------------------------------------------------------------------------------------

insert into storage.buckets (id, name, public) values ('receipt-images', 'receipt-images', false)
on conflict (id) do nothing;
