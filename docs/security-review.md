# Security review (for Angad)

Everything from the security pass on 2026-10-01 (DECISIONS.md D135), as a list to go
through. Tick an item once you've read it and you're happy with it, or write a note under it.
The technical version, with every threat and what stops it, is `docs/SECURITY.md`.

## 1. Changes already live (please review)

- [ ] **Email confirmation is on.** Before, anyone could sign up with someone else's email
      address and a password, and the account was confirmed at once. Now an address has to
      be confirmed by its owner. People signing in with the emailed code see no difference:
      the code itself confirms the address. Changed in Supabase's live settings.
- [ ] **Sign-in can only return to the app.** After Google sign-in, Supabase sends the person
      back to an address on a list. The list allowed any Expo address on the internet, so a
      fake Expo server could have received someone's sign-in. Now it's only the real app
      (`remitbridge://`) and Expo Go on this Mac or a home network, for testing.
- [ ] **The receipt scanner checks images are real.** A saved image must really be a JPEG
      or PNG (checked by its first bytes), so nothing else can be stored as a "receipt".
      Deployed.
- [ ] **The receipt scanner has a limit per network address:** 30 scans an hour, so one
      person can't flood the database or use up the month's AI calls. The WhatsApp bot is
      exempt (all its users share one address). Deployed; it starts counting once the
      database update below is pushed.

## 2. Changes waiting on your `supabase db push` (please review, then push)

The file is `supabase/migrations/20261002000000_security_hardening.sql`. After you push it,
tell Claude, who switches on the sign-in hook and runs the live security test.

- [ ] **Password sign-in is refused.** The app never uses passwords (email code, Apple or
      Google), but Supabase accepts them anyway. A small check now refuses to issue a
      login for a password, so a password someone else set on an account is useless.
- [ ] **Limits per network address** on everything the app writes without an account
      (usage events, route requests, saved items, rate alerts). Generous, so a whole school
      behind one address is fine. The address itself is never stored: only a scrambled
      version that changes every day, deleted within a day.
- [ ] **Deletions run on a timer.** Receipts are deleted after 30 days, and a WhatsApp
      number within an hour, as the privacy policy promises. Before, this only happened
      when the next receipt or photo arrived, so a quiet week could leave old ones behind.
- [ ] **Tidying from Supabase's own security checker:** a few internal functions can no
      longer be called from outside, and every function has a fixed search path.
- [ ] **Size caps:** receipt images at most 8 MB, notes on saved transfers at most 500
      characters.

## 3. Changes in the app (ship with the next build; please review)

- [ ] **Your login is encrypted on the phone.** The tokens that keep you signed in were
      saved as plain text in the app's storage, which can end up in iCloud backups. Now
      they're encrypted with a key kept in the iPhone Keychain (or Android Keystore) that
      never leaves the phone. Someone restoring a backup on another phone just has to sign
      in again.
- [ ] **Android backups are off,** for the same reason.
- [ ] **Unredacted receipt photos are deleted right away.** Taking or choosing a photo left a
      copy (names and all) in the app's storage until the phone cleared it. Now it's
      deleted as soon as the text is read; the app keeps only the covered version.
- [ ] **Apple sign-in uses a one-time code,** so a stolen Apple token can't be reused.
- [ ] **Push notification codes stay out of logs** (the rate alert job).
- [ ] **The privacy policy** (`site/privacy.html`, live on app.remitbridgelabs.org) now covers
      "Ask for a route" emails, network addresses, and a "Keeping it safe" section. Read it
      through once; it's your promise to users.

## 4. Things only you can do

- [ ] **Push the database update:** `supabase db push`, then tell Claude.
- [ ] **Replace the old JWT secret, with Claude.** While checking the project's settings,
      Claude accidentally printed this secret into the chat. It isn't public, but anyone who
      had it could make a key with full database access, so it should be replaced. Steps:
      Claude first moves the functions and GitHub jobs to Supabase's newer `sb_secret_` key;
      then you go to Supabase > Settings > JWT and click Migrate, then Rotate, then (after an
      hour) Revoke the old secret.
- [ ] **Turn on SSL enforcement:** Supabase dashboard > Database > Settings > Enforce SSL.
- [ ] **Two-factor authentication on every account that can reach data:** Supabase, GitHub,
      Expo, the RemitBridge Gmail, Google Cloud and Firebase, Vercel, GoDaddy, Resend, Groq,
      Meta. Most break-ins come through a weak account, not the code.
- [ ] **Database password:** make sure it's long and random (Claude can't see it). If you're
      not sure, reset it in Supabase > Database > Settings.

## 4b. WhatsApp numbers (your yes, 2026-10-02)

- [ ] **Linked chats keep the number, locked.** When someone links WhatsApp to their account,
      the bot stores their number encrypted, so it can send the WhatsApp alerts they turn on.
      Only the WhatsApp server function can unlock it. Unlinking, STOP, or deleting the
      account deletes it and their WhatsApp alerts straight away. The app says this next to
      the Link button, and the privacy policy says it too.

## 5. Checked and fine (nothing to do, for your information)

- [ ] Every table has row-level security; private tables (receipts, WhatsApp, the photo
      queue) have no public access at all. Supabase's checker found no exposed data.
- [ ] No keys or secret files anywhere in git history (one false alarm was part of a sample
      receipt image).
- [ ] The WhatsApp bot checks Meta's signature on every message, stores only a scrambled
      version of each number, and keeps the real number encrypted for at most an hour.
- [ ] Logs never contain receipt text, amounts, phone numbers or names.
- [ ] `npm audit` found three issues, all inside Expo's build tools on the computer; none
      ship in the app or touch user data. They'll clear when Expo updates them.
