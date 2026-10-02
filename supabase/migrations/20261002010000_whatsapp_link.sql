-- Linking a WhatsApp chat to an app account (DECISIONS.md D138).
--
-- The app asks for a one-time code (whatsapp_link_code, signed in only) and opens WhatsApp
-- with "LINK <code>" typed in; sending it proves the person holds that number, and the
-- whatsapp function calls link_whatsapp() to tie the chat's row to the account. No phone
-- number is asked for or stored: the row is still keyed by the keyed hash (D68). Once
-- linked, "SAVE 500 to India" on WhatsApp saves that comparison to the account, and
-- "UNLINK" (or Unlink in the app) undoes it. Deleting the account unlinks the chat.
--
-- app_settings holds the bot's number and whether it's open to everyone, so the app can
-- show "Chat on WhatsApp" once Meta lets the bot reply, without a new app build.

alter table public.whatsapp_users
  add column user_id uuid references auth.users (id) on delete set null,
  add column linked_at timestamptz;

-- Deleting the account sets user_id to null; the link's date goes with it. (A check tying
-- the two together made account deletion fail, since the foreign key only clears user_id.)
create function public.whatsapp_users_unlinked() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.user_id is null then
    new.linked_at := null;
  end if;
  return new;
end $$;
revoke execute on function public.whatsapp_users_unlinked() from public, anon, authenticated;
create trigger whatsapp_users_unlinked before insert or update on public.whatsapp_users
  for each row execute function public.whatsapp_users_unlinked();
-- One chat per account: linking a new number moves the link.
create unique index whatsapp_users_one_per_account on public.whatsapp_users (user_id) where user_id is not null;

create table public.whatsapp_link_codes (
  -- No 0/O or 1/I: read off a screen and typed if WhatsApp doesn't fill it in.
  code text primary key check (code ~ '^[A-HJ-NP-Z2-9]{6}$'),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  expires_at timestamptz not null default now() + interval '10 minutes'
);
alter table public.whatsapp_link_codes enable row level security;
-- No policies: only the functions below touch it.

-- A fresh code for the signed-in person, replacing any earlier one; valid 10 minutes.
create function public.whatsapp_link_code() returns text
language plpgsql volatile security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  c text;
begin
  if uid is null then
    raise exception 'sign in first' using errcode = '42501';
  end if;
  delete from public.whatsapp_link_codes where user_id = uid or expires_at < now();
  loop
    -- 32 letters and digits, picked by random bytes: about a billion codes.
    select string_agg(substr(alphabet, 1 + get_byte(extensions.gen_random_bytes(1), 0) % 32, 1), '')
      into c from generate_series(1, 6);
    begin
      insert into public.whatsapp_link_codes (code, user_id) values (c, uid);
      return c;
    exception when unique_violation then
      -- Another live code is the same: draw again.
    end;
  end loop;
end $$;

-- Whether the signed-in person's account has a WhatsApp chat linked, and since when.
create function public.whatsapp_link_status() returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'linked', exists (select 1 from public.whatsapp_users w where w.user_id = auth.uid()),
    'linked_at', (select w.linked_at from public.whatsapp_users w where w.user_id = auth.uid()))
$$;

-- Unlinks the signed-in person's chat (the chat itself, and its STOP, stay the person's).
create function public.unlink_whatsapp() returns void
language sql volatile security definer set search_path = '' as $$
  update public.whatsapp_users set user_id = null, linked_at = null where user_id = auth.uid()
$$;

-- For the whatsapp function: uses a code once, and links the chat with this hash to its
-- account. False for a code that's wrong or past its 10 minutes.
create function public.link_whatsapp(p_code text, p_phone_hash text) returns boolean
language plpgsql volatile security definer set search_path = '' as $$
declare
  uid uuid;
begin
  delete from public.whatsapp_link_codes
   where code = upper(trim(p_code)) and expires_at > now()
  returning user_id into uid;
  if uid is null then
    return false;
  end if;
  update public.whatsapp_users set user_id = null, linked_at = null where user_id = uid and phone_hash <> p_phone_hash;
  insert into public.whatsapp_users (phone_hash, user_id, linked_at) values (p_phone_hash, uid, now())
  on conflict (phone_hash) do update set user_id = excluded.user_id, linked_at = excluded.linked_at;
  return true;
end $$;

revoke execute on function public.whatsapp_link_code() from public, anon;
revoke execute on function public.whatsapp_link_status() from public, anon;
revoke execute on function public.unlink_whatsapp() from public, anon;
revoke execute on function public.link_whatsapp(text, text) from public, anon, authenticated;
grant execute on function public.whatsapp_link_code() to authenticated;
grant execute on function public.whatsapp_link_status() to authenticated;
grant execute on function public.unlink_whatsapp() to authenticated;
grant execute on function public.link_whatsapp(text, text) to service_role;

-- Settings the app reads: public, written only from the dashboard or the service role.
create table public.app_settings (
  key text primary key check (key ~ '^[a-z_]{1,40}$'),
  value text not null check (length(value) <= 200)
);
alter table public.app_settings enable row level security;
create policy "app settings are public" on public.app_settings for select using (true);

-- Meta's test number for now; whatsapp_live turns "Chat on WhatsApp" on for everyone once
-- the bot can reply to anyone (until then only development builds show it).
insert into public.app_settings (key, value) values
  ('whatsapp_number', '15551845383'),
  ('whatsapp_live', 'false')
on conflict (key) do nothing;
