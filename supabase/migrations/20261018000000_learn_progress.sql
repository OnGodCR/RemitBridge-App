-- Learn progress follows the account (D190, Angad 2026-10-18: "my learn tab reset completely
-- because i uninstalled and reinstalled, make sure thats something linked to the account and
-- backend, not the device"). One row per signed-in person: the terms learned, XP, the day
-- streak and lessons finished. Signed out, progress stays on the phone as before; on sign-in
-- the phone's and the account's are merged (the union of terms, the larger counts), so
-- nothing learned either way is lost. Owner only, like saved comparisons, and deleting the
-- account deletes the row.
create table public.learn_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  learned text[] not null default '{}'
    check (cardinality(learned) <= 1000 and array_to_string(learned, '') !~ '[^a-z0-9_-]'),
  xp integer not null default 0 check (xp between 0 and 10000000),
  streak integer not null default 0 check (streak between 0 and 100000),
  last_day date,
  lessons integer not null default 0 check (lessons between 0 and 1000000),
  updated_at timestamptz not null default now()
);

alter table public.learn_progress enable row level security;

create policy "own learn progress" on public.learn_progress
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- A lesson writes once when it ends, and once per term learned at most; this is far above
-- that and still stops a runaway loop.
create trigger learn_progress_rate_limit before insert or update on public.learn_progress
  for each row execute function private.limit_public_writes('600', '1 hour');
