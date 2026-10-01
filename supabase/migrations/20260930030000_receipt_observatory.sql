-- The disclosure check and the receipt observatory (DECISIONS.md D95, D96).
--
-- receipts.disclosures_missing   the standard receipt disclosures (Regulation E) that
--                                couldn't be found on the receipt, from the redacted text
-- receipt_comparisons gains the receipt's total cost and exchange-rate markup, as
--                                percentages, so the observatory can report them
-- receipt_result() returns the disclosures too.
-- receipt_observatory()          totals over receipts whose senders agreed to research use,
--                                for anyone to read: no single receipt, and no group smaller
--                                than five.

alter table public.receipts
  add column disclosures_missing text[] not null default '{}'
    check (disclosures_missing <@ array['transfer_amount', 'fees', 'taxes', 'total', 'exchange_rate',
      'amount_received', 'date_available', 'recipient', 'error_rights', 'cancellation',
      'provider_contact', 'cfpb_contact']::text[]);

alter table public.receipt_comparisons
  add column total_cost_pct numeric check (total_cost_pct between -100 and 100),
  add column markup_pct numeric check (markup_pct between -100 and 100);

create or replace function public.receipt_result(p_id uuid) returns jsonb
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
    'disclosures_missing', to_jsonb(r.disclosures_missing),
    'fields', coalesce((
      select jsonb_object_agg(f.field_name, jsonb_build_object(
        'value', f.value, 'path', f.extraction_path, 'confidence', f.confidence, 'validated', f.validated))
      from public.receipt_fields f where f.receipt_id = r.id), '{}'::jsonb),
    'comparison', (select to_jsonb(c) - 'receipt_id' from public.receipt_comparisons c where c.receipt_id = r.id)
  )
  from public.receipts r
  where r.id = p_id and (r.expires_at is null or r.expires_at > now())
$$;

-- Totals over research-consented, checked receipts (a comparison row means the person went
-- through the result). Groups of fewer than five receipts are left out, and so is every
-- breakdown while there are fewer than five receipts in all; `receipts` is always given, so
-- the sample size is never hidden.
create function public.receipt_observatory() returns jsonb
language sql stable security definer set search_path = '' as $$
  with r as (
    select re.provider_id, re.route_id, re.disclosures_missing, re.submitted_at,
           c.total_cost_pct, c.markup_pct, c.gap_amount, c.tax_expected, c.tax_found
      from public.receipts re
      join public.receipt_comparisons c on c.receipt_id = re.id
     where re.research_consent
  ),
  n as (select count(*)::int as total from r)
  select jsonb_build_object(
    'receipts', n.total,
    'min_group', 5,
    'since', (select to_char(date_trunc('month', min(submitted_at)), 'YYYY-MM') from r),
    'groups', case when n.total < 5 then '[]'::jsonb else coalesce((
      select jsonb_agg(g order by (g ->> 'receipts')::int desc, g ->> 'provider_id')
        from (
          select jsonb_build_object(
                   'provider_id', provider_id,
                   'route_id', route_id,
                   'receipts', count(*),
                   'median_total_cost_pct', round((percentile_cont(0.5) within group (order by total_cost_pct))::numeric, 2),
                   'median_markup_pct', round((percentile_cont(0.5) within group (order by markup_pct))::numeric, 2),
                   'compared', count(gap_amount),
                   'paid_more_than_advertised', count(*) filter (where gap_amount > 0.005)
                 ) as g
            from r
           where provider_id is not null and route_id is not null
           group by provider_id, route_id
          having count(*) >= 5
        ) groups), '[]'::jsonb) end,
    'tax', case when n.total < 5 then null else (
      select jsonb_build_object(
               'taxed', count(tax_expected),
               'matches', count(*) filter (where tax_expected is not null and abs(tax_found - tax_expected) <= 0.01),
               'not_found', count(*) filter (where tax_expected is not null and tax_found is null))
        from r) end,
    'disclosures_missing', case when n.total < 5 then '{}'::jsonb else coalesce((
      select jsonb_object_agg(item, missing)
        from (select unnest(disclosures_missing) as item, count(*)::int as missing from r group by 1) d), '{}'::jsonb) end
  )
  from n
$$;

grant execute on function public.receipt_observatory() to anon, authenticated;
