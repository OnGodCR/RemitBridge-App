-- Receipt photos on WhatsApp (DECISIONS.md D80, D94).
--
-- A photo arrives at the whatsapp Edge Function, which can't read it in its 2 seconds of
-- CPU. So it queues the photo here and a GitHub Actions worker reads it: it downloads the
-- photo from Meta, reads it with OCR, hides personal details, and sends only the redacted
-- text through the scan-receipt pipeline. The worker never sees the phone number. When
-- it's done, the whatsapp function sends the reply and deletes the queue row.
--
-- receipt_intake   one row per photo waiting to be read, for minutes:
--   phone_hash     the same keyed hash as whatsapp_users (to find the conversation)
--   phone_sealed   the number, encrypted (AES-GCM) with a key only the whatsapp function
--                  holds, because the reply has to go to it. Deleted with the row once the
--                  reply is sent, and every row is deleted after an hour regardless. This is
--                  the one place a number is kept in any form but the hash (D94).
--   media_id       Meta's ID for the photo; the photo itself is never stored.
--
-- whatsapp_users gains the receipt a person is being asked about, and which value, while
-- the bot checks unsure values with them one at a time. Cleared when the checking is done.

create table public.receipt_intake (
  id uuid primary key default gen_random_uuid(),
  phone_hash text not null check (phone_hash ~ '^[0-9a-f]{64}$'),
  phone_sealed text not null check (length(phone_sealed) between 16 and 200),
  media_id text not null check (media_id ~ '^[0-9A-Za-z_-]{1,128}$'),
  language text not null default 'en' check (language in ('en', 'hi')),
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  attempts int not null default 0 check (attempts >= 0)
);
create index receipt_intake_waiting on public.receipt_intake (created_at);

alter table public.receipt_intake enable row level security;
-- No policies on purpose: only service_role (the two functions and the worker).

alter table public.whatsapp_users
  add column pending_receipt uuid references public.receipts (id) on delete set null,
  add column pending_field text check (pending_field in (
    'provider', 'send_currency', 'receive_currency', 'amount_sent', 'fee', 'tax', 'total_paid',
    'exchange_rate', 'amount_received', 'pickup_charge', 'transfer_date', 'funding_method',
    'delivery_method')),
  add column pending_questions int not null default 0 check (pending_questions >= 0),
  add check ((pending_receipt is null) = (pending_field is null));

-- The worker takes up to p_limit photos to read. A photo taken but not finished within 10
-- minutes (a worker that died) can be taken again, three times at most. The number stays
-- behind: only the ID, the photo's media ID and the reply language go to the worker.
create function public.claim_receipt_intake(p_limit int) returns table (id uuid, media_id text, language text)
language sql volatile security definer set search_path = '' as $$
  update public.receipt_intake i
     set claimed_at = now(), attempts = i.attempts + 1
   where i.id in (
     select w.id from public.receipt_intake w
      where (w.claimed_at is null or w.claimed_at < now() - interval '10 minutes')
        and w.attempts < 3
        and w.created_at > now() - interval '1 hour'
      order by w.created_at
      limit greatest(0, least(p_limit, 20))
      for update skip locked)
  returning i.id, i.media_id, i.language
$$;

-- Deletes queue rows older than an hour, number and all. The whatsapp function calls it
-- on every photo, so nothing sits there when a reply never went out.
create function public.forget_stale_receipt_intake() returns int
language sql volatile security definer set search_path = '' as $$
  with gone as (delete from public.receipt_intake where created_at <= now() - interval '1 hour' returning 1)
  select count(*)::int from gone
$$;

revoke execute on function public.claim_receipt_intake(int) from public, anon, authenticated;
revoke execute on function public.forget_stale_receipt_intake() from public, anon, authenticated;
grant execute on function public.claim_receipt_intake(int) to service_role;
grant execute on function public.forget_stale_receipt_intake() to service_role;
