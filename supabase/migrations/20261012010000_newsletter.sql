-- The newsletter (D169): an email now and then to people who turned it on in the app.
--
-- Opting in needs an account, so the address is the one the person already signed in with
-- and proved they own; nothing new is collected and no address is copied here. The row holds
-- only who opted in, when, their app language and a random token for the one-tap unsubscribe
-- link in every email. Deleting the account deletes the row (cascade), and so does the
-- unsubscribe link or the switch in the app.
--
-- Nobody reads the tables directly. The app uses the functions below (signed in only); the
-- send-newsletter function, with the service key, reads the recipients and logs each issue;
-- admins see the issues they sent and how many people get the next one.

create table public.newsletter_subscribers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  language text not null default 'en' check (language in ('en', 'hi', 'es', 'tl', 'vi')),
  unsubscribe_token uuid not null unique default gen_random_uuid(),
  subscribed_at timestamptz not null default now()
);
alter table public.newsletter_subscribers enable row level security;
-- No policies: only the functions below touch it.

create table public.newsletter_issues (
  id bigint generated always as identity primary key,
  subject text not null check (char_length(subject) between 1 and 150),
  body text not null check (char_length(body) between 1 and 20000),
  sent_by uuid references auth.users (id) on delete set null,
  recipients int not null default 0,
  sent int not null default 0,
  failed int not null default 0,
  created_at timestamptz not null default now()
);
create index newsletter_issues_newest on public.newsletter_issues (created_at desc);
alter table public.newsletter_issues enable row level security;
create policy "admins read newsletter issues" on public.newsletter_issues
  for select to authenticated using (public.is_admin());
-- No insert, update or delete policies: only send-newsletter (service role) logs an issue.

-- Whether the signed-in person gets the newsletter.
create function public.newsletter_status() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.newsletter_subscribers where user_id = auth.uid())
$$;

-- Turn it on (or update the language). Signed in only.
create function public.newsletter_subscribe(p_language text default 'en') returns void
language plpgsql volatile security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception 'sign in first' using errcode = '42501';
  end if;
  insert into public.newsletter_subscribers (user_id, language)
    values (auth.uid(), coalesce(p_language, 'en'))
    on conflict (user_id) do update set language = excluded.language;
end $$;

-- Turn it off. Deletes the row, so nothing about the newsletter is kept.
create function public.newsletter_unsubscribe() returns void
language plpgsql volatile security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception 'sign in first' using errcode = '42501';
  end if;
  delete from public.newsletter_subscribers where user_id = auth.uid();
end $$;

-- How many people the next issue goes to. Admins only.
create function public.newsletter_count() returns int
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'admins only' using errcode = '42501';
  end if;
  return (select count(*)::int from public.newsletter_subscribers);
end $$;

-- Who gets the next issue, with each person's unsubscribe token. send-newsletter only.
create function public.newsletter_recipients()
returns table (email text, unsubscribe_token uuid, language text)
language sql stable security definer set search_path = '' as $$
  select u.email::text, s.unsubscribe_token, s.language
  from public.newsletter_subscribers s
  join auth.users u on u.id = s.user_id
  where u.email is not null and u.email <> ''
  order by s.subscribed_at
$$;

revoke execute on function public.newsletter_status() from public, anon;
revoke execute on function public.newsletter_subscribe(text) from public, anon;
revoke execute on function public.newsletter_unsubscribe() from public, anon;
revoke execute on function public.newsletter_count() from public, anon;
revoke execute on function public.newsletter_recipients() from public, anon, authenticated;
grant execute on function public.newsletter_status() to authenticated;
grant execute on function public.newsletter_subscribe(text) to authenticated;
grant execute on function public.newsletter_unsubscribe() to authenticated;
grant execute on function public.newsletter_count() to authenticated;
grant execute on function public.newsletter_recipients() to service_role;
