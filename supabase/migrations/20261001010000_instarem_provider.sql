-- Instarem gets a provider row and an adapter (DECISIONS.md D115, D118). Its terms and US
-- customer agreement have no automated-access clause and robots.txt allows the quote
-- endpoint (read 2026-10-01). Quotes reference this row, so it has to exist before the
-- "Scrape" workflow's first Instarem run can save anything.

insert into public.providers (id, name, type, website, adapter_id, robots_note, terms_note) values
  ('instarem', 'Instarem', 'fintech', 'https://www.instarem.com', 'instarem',
   'robots.txt disallows only /wp-admin/ (checked 2026-10-01).',
   'Terms and conditions and the US customer agreement have no automated-access clause '
     || '(read 2026-10-01). Only the public quote endpoint its own calculator uses is called. '
     || 'The standing price is published; the first-transfer offer is not.')
on conflict (id) do nothing;
