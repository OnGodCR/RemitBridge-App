-- WhatsApp bot state (PRD 5.8, DECISIONS.md D68).
--
-- One row per number, keyed by an HMAC of the number with a secret only the function holds
-- (WHATSAPP_HASH_SECRET), so a list of every phone number can't be hashed to find anyone.
-- What's kept is what PRD 5.8 allows: the hash, the reply language, and the rate-limit
-- counter; plus the last route and delivery method and a route waiting for YES, so "cash
-- 200" and "yes" make sense. Never the number, a name, or an amount. STOP deletes the row.
--
-- Access: only the whatsapp Edge Function, as service_role. No policies, so every client
-- key is refused.

create table public.whatsapp_users (
  phone_hash text primary key check (phone_hash ~ '^[0-9a-f]{64}$'),
  language text not null default 'en' check (language in ('en', 'hi')),
  last_route text references public.routes (id) on delete set null,
  last_method text check (last_method in
    ('bank_deposit', 'cash_pickup', 'mobile_wallet', 'upi', 'debit_card', 'home_delivery')),
  pending_request text check (pending_request ~ '^[A-Z]{2}-[A-Z]{2}$'),
  -- Meta can deliver a message twice; the function answers an ID once.
  last_message_id text,
  window_started_at timestamptz not null default now(),
  messages_in_window int not null default 0 check (messages_in_window >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.whatsapp_users enable row level security;
-- No policies on purpose.
