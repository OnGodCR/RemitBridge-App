-- Housekeeping for supabase/tests/rls_smoke.sh, which inserts events with a fixed
-- install_id to prove that anonymous inserts work.
--
-- 1. Prove the events_stamp trigger works. The smoke test sends created_at = 2001-01-01;
--    if any of its rows kept that date, a client can backdate events and this migration
--    fails loudly rather than letting it slide.
-- 2. Delete the test's events.
-- 3. Register the test install_id as internal, so any later smoke-test run never counts
--    in metrics (DECISIONS.md D31).

do $$
begin
  if exists (
    select 1 from public.events
    where install_id = '00000000-0000-4000-8000-00000000c0de'
      and created_at < now() - interval '1 day'
  ) then
    raise exception 'events_stamp failed: a client-supplied created_at survived';
  end if;
end $$;

delete from public.events where install_id = '00000000-0000-4000-8000-00000000c0de';

insert into public.internal_installs (install_id, label)
values ('00000000-0000-4000-8000-00000000c0de', 'supabase/tests/rls_smoke.sh')
on conflict (install_id) do nothing;
