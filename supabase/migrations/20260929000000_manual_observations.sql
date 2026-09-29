-- Prices entered by hand in the app (DECISIONS.md D52, D54).
--
-- An admin reads a provider's public calculator and enters what it shows. The row waits
-- here as 'pending' until the engine picks it up, runs it through the same normaliser and
-- publish gate as any other quote (engine/src/remitbridge_engine/adapters/manual.py), and
-- writes the outcome back. Nothing in this table is ever shown to users: only the quote
-- the engine publishes from it is.
--
-- Access:
--   admins (profiles.is_admin) -> insert as themselves, read every row
--   engine (service_role)      -> reads pending rows, writes the outcome
--   everyone else              -> nothing

create table public.manual_observations (
  id bigint generated always as identity primary key,
  provider_id text not null references public.providers (id),
  route_id text not null references public.routes (id),
  send_amount numeric not null check (send_amount > 0),
  delivery_method text not null,
  payment_method text not null default 'bank_account',
  fee numeric not null check (fee >= 0),
  offered_rate numeric not null check (offered_rate > 0),
  amount_received numeric not null check (amount_received > 0),
  pickup_charge numeric not null default 0 check (pickup_charge >= 0),
  delivery_time text,
  promo_text text,
  source_url text not null,
  observed_at timestamptz not null default now(),
  -- Deleting an account deletes its rows (D19). Quotes already published from them stay:
  -- they carry the observation in the raw archive, not a link to the person.
  observed_by uuid not null default auth.uid() references auth.users (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'published', 'quarantined', 'rejected', 'skipped')),
  result_notes text[] not null default '{}',
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index manual_observations_pending on public.manual_observations (created_at)
  where status = 'pending';

-- A client can't backdate an entry or pre-set its outcome: observed_at and created_at are
-- stamped here, and a new row always starts pending.
create function public.manual_observations_stamp() returns trigger
language plpgsql as $$
begin
  new.observed_at := now();
  new.created_at := now();
  new.status := 'pending';
  new.result_notes := '{}';
  new.processed_at := null;
  return new;
end $$;

create trigger manual_observations_stamp before insert on public.manual_observations
  for each row execute function public.manual_observations_stamp();

alter table public.manual_observations enable row level security;

create policy "admins enter prices as themselves" on public.manual_observations
  for insert to authenticated
  with check (public.is_admin() and observed_by = auth.uid());
create policy "admins read entered prices" on public.manual_observations
  for select to authenticated using (public.is_admin());
-- No update or delete policies: only the engine (service_role) changes a row.
