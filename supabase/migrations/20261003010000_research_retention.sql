-- Research receipts are kept 24 months, not forever (DECISIONS.md D141; Angad, 2026-10-02:
-- "Change the code so consented images are kept for 24 months, not indefinitely, and say so
-- in the policy").
--
-- Before: a receipt with research consent had no expires_at and was kept with its redacted
-- image for good. Now every receipt has an end: 30 days without consent (as before), 24
-- months with it. Existing research receipts get 24 months from when they were sent.
--
-- Deleting: the hourly job still deletes expired receipts, but only those without an image.
-- An image lives in Storage, and Supabase allows deleting it only through the Storage API,
-- not from SQL; deleting the row alone would leave the image behind. So scan-receipt, which
-- can use that API, deletes each expired image and then its row (expired_receipt_images()).

-- The old rule tied consent to "never expires"; find it by its definition, since it was
-- created without a name.
do $$
declare
  c text;
begin
  select conname into c from pg_constraint
   where conrelid = 'public.receipts'::regclass and contype = 'c'
     and pg_get_constraintdef(oid) ilike '%research_consent = (expires_at IS NULL)%';
  if c is null then
    raise exception 'the consent/expiry check on receipts was not found';
  end if;
  execute format('alter table public.receipts drop constraint %I', c);
end $$;

-- A research receipt sent without an end date gets 24 months; any other must carry its own.
create function public.receipts_research_expiry() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.research_consent and new.expires_at is null then
    new.expires_at := new.submitted_at + interval '24 months';
  end if;
  return new;
end $$;
revoke execute on function public.receipts_research_expiry() from public, anon, authenticated;
create trigger receipts_research_expiry before insert or update on public.receipts
  for each row execute function public.receipts_research_expiry();

update public.receipts set expires_at = submitted_at + interval '24 months' where expires_at is null;

alter table public.receipts
  add constraint receipts_expire check (expires_at is not null),
  add constraint receipts_at_most_24_months check (expires_at <= submitted_at + interval '24 months 1 day');

-- The hourly job: expired receipts without an image (their fields and comparison go with
-- them, by cascade). Ones with an image wait for scan-receipt, below.
create or replace function public.forget_expired_receipts() returns int
language sql volatile security definer set search_path = '' as $$
  with gone as (delete from public.receipts where expires_at <= now() and image_path is null returning 1)
  select count(*)::int from gone
$$;

-- For scan-receipt: expired receipts that still have an image, oldest first. It deletes each
-- image through the Storage API, then the row.
create function public.expired_receipt_images(p_limit int default 100)
returns table (id uuid, image_path text)
language sql stable security definer set search_path = '' as $$
  select r.id, r.image_path from public.receipts r
   where r.expires_at <= now() and r.image_path is not null
   order by r.expires_at
   limit greatest(1, least(coalesce(p_limit, 100), 500))
$$;
revoke execute on function public.expired_receipt_images(int) from public, anon, authenticated;
grant execute on function public.expired_receipt_images(int) to service_role;
