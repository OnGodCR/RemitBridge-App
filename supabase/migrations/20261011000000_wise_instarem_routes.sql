-- Every route Wise or Instarem can price from the US (DECISIONS.md D158).
--
-- Angad, 2026-10-11: "Now that we have instarem and WISE's API, let's go ahead and set that up
-- for every single route since we have infinite data for them, and for all the other ones we
-- will just focus on manual scraping w a few."
--
-- Checked 2026-10-11, one request per currency to each: Wise's Comparison API prices all 22
-- countries below from USD, Instarem's public quote endpoint 15 of them, and both mid-market
-- sources (Frankfurter and open.er-api) cover every currency. Somalia, Eritrea, Cuba,
-- Afghanistan and Venezuela had neither provider, and El Salvador and Ecuador use dollars, so
-- those stay request-only. Each new route starts as 'building' and goes live by itself when
-- its first checked price is published (the trigger below).

insert into public.routes (id, send_country, send_currency, receive_country, receive_currency, tier) values
  ('us-cn', 'US', 'USD', 'CN', 'CNY', 2),
  ('us-gt', 'US', 'USD', 'GT', 'GTQ', 2),
  ('us-hn', 'US', 'USD', 'HN', 'HNL', 2),
  ('us-do', 'US', 'USD', 'DO', 'DOP', 2),
  ('us-et', 'US', 'USD', 'ET', 'ETB', 2),
  ('us-ke', 'US', 'USD', 'KE', 'KES', 2),
  ('us-ng', 'US', 'USD', 'NG', 'NGN', 2),
  ('us-pk', 'US', 'USD', 'PK', 'PKR', 2),
  ('us-bd', 'US', 'USD', 'BD', 'BDT', 2),
  ('us-kr', 'US', 'USD', 'KR', 'KRW', 2),
  ('us-ua', 'US', 'USD', 'UA', 'UAH', 2),
  ('us-co', 'US', 'USD', 'CO', 'COP', 2),
  ('us-pe', 'US', 'USD', 'PE', 'PEN', 2),
  ('us-ni', 'US', 'USD', 'NI', 'NIO', 2),
  ('us-jm', 'US', 'USD', 'JM', 'JMD', 2),
  ('us-ht', 'US', 'USD', 'HT', 'HTG', 2),
  ('us-br', 'US', 'USD', 'BR', 'BRL', 2),
  ('us-gh', 'US', 'USD', 'GH', 'GHS', 2),
  ('us-np', 'US', 'USD', 'NP', 'NPR', 2),
  ('us-lk', 'US', 'USD', 'LK', 'LKR', 2),
  ('us-eg', 'US', 'USD', 'EG', 'EGP', 2),
  ('us-ug', 'US', 'USD', 'UG', 'UGX', 2)
on conflict (id) do nothing;

-- The first four have had published prices since 2026-09-30, but nothing ever moved them
-- out of 'building', so the route board showed them as "Being built".
update public.routes set status = 'live'
where id in ('us-in', 'us-mx', 'us-ph', 'us-vn') and status = 'building';

-- A route goes live when a checked price on it is first published. Only forward: a route
-- someone marked not feasible, or one already live, is left as it is.
create or replace function public.route_goes_live()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.routes
  set status = 'live'
  where id = new.route_id and status in ('requested', 'under_review', 'building');
  return null;
end;
$$;

revoke execute on function public.route_goes_live() from public, anon, authenticated;

create trigger route_goes_live
after insert on public.quotes
for each row
when (new.validation_status = 'published')
execute function public.route_goes_live();
