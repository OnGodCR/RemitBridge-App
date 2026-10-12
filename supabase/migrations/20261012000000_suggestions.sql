-- Suggestions people send for the app (docs/whatsapp-ai-scope.md, D159).
--
-- The WhatsApp bot's model files a message like "please add Ria" or "cash pickup for Kenya"
-- here. Only the WhatsApp function writes rows (with the service key, which bypasses RLS);
-- only admins can read them, in the app's Admin screen. No phone number is kept: the source
-- and the language are enough to act on a suggestion, and "FORGET" has nothing to remove.

create table public.suggestions (
  id bigint generated always as identity primary key,
  text text not null check (char_length(text) between 1 and 1000),
  language text not null default 'en' check (language in ('en', 'hi', 'es', 'tl', 'vi')),
  source text not null default 'whatsapp' check (source in ('whatsapp', 'app')),
  status text not null default 'new' check (status in ('new', 'read', 'done', 'declined')),
  created_at timestamptz not null default now()
);

create index suggestions_newest on public.suggestions (created_at desc);

alter table public.suggestions enable row level security;

create policy "admins read suggestions" on public.suggestions
  for select to authenticated using (public.is_admin());

create policy "admins mark suggestions" on public.suggestions
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
-- No insert or delete policies: only the WhatsApp function (service role) adds a row.
