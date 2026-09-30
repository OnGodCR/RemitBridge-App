-- Wise gets an adapter (DECISIONS.md D91). Its row said "No adapter: manual research",
-- which stopped being true when Wise gave written permission for its Comparison API.
-- Metadata only: nothing reads these columns to decide what's shown.

update public.providers
set
  adapter_id = 'wise',
  robots_note = 'api.wise.com has no robots.txt (404, checked 2026-09-30). wise.com is never fetched.',
  terms_note = 'The website terms forbid automated access without prior written permission. '
    || 'Wise gave it for the Comparison API on 2026-09-30 (Simon Bruins): "The current '
    || 'documentation is correct and you can use it. If you are a considerate user it '
    || 'shouldn''t be a problem." Only Wise''s own quote is used, never its estimates of '
    || 'other providers.'
where id = 'wise';
