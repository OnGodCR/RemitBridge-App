# Learn tab: game modes and a simpler first post (handover to ChatGPT, 2026-10-12)

Angad asked for a prompt that lets ChatGPT redesign the Learn tab's lessons as game modes, so
learning is engaging instead of the same loop every time, and replace Library's "Latest post"
with the first, most basic post. Everything between the two lines below is the prompt. It
assumes ChatGPT can read the private repo `OnGodCR/RemitBridge-App` (GitHub connector or
Codex). It works on a branch and opens a pull request; Claude reviews it and merges to `main`.

---

```
You're improving the Learn tab of RemitBridge, a free app (iPhone and Android) from
RemitBridge Labs, a Washington nonprofit, that compares what it really costs to send money
from the US. The code is in the GitHub repo OnGodCR/RemitBridge-App. The app is in
mobile/ (Expo SDK 57, expo-router, React Native, TypeScript, Reanimated). Another AI
assistant (Claude) maintains the repo; it will review your pull request and merge it, so
follow the rules below exactly.

## Read these first
- mobile/src/app/(tabs)/learn.tsx: the Learn tab (Modules and Library).
- mobile/src/components/learn-path.tsx: the climbing path of modules.
- mobile/src/app/lesson/[id].tsx and mobile/src/lib/lesson.ts: a lesson today.
- mobile/src/lib/learn-progress.ts: what's learned, XP, the day streak (on the phone only).
- mobile/src/data/modules.ts and mobile/src/data/glossary.ts: 8 modules over 80 glossary terms.
- mobile/src/__tests__/lesson.test.ts, lesson-screen.test.tsx, learn-progress.test.ts.
- mobile/src/i18n/en.ts (the "learn" section) and mobile/src/constants/theme.ts.
- mobile/src/components/illustrations.tsx and mobile/src/components/ui.tsx.
- CLAUDE.md at the root (rules), and DECISIONS.md entries D104, D107, D136, D152.

## The problem
Every lesson is the same loop: meet a word on a card, pick the word for a definition, then
pick the definition for the word. After a few lessons it's boring. Angad wants game modes,
or something better, that make people want to keep learning.

## Part 1: game modes (propose first, then build)
First reply with a short proposal, no code: 4 to 6 modes, each with one sentence on how it
plays, why it's fun, which words or modules it uses, and how it decides right and wrong.
Wait for Angad's pick before building.

Starting ideas; improve on them or replace them:
- Match pairs: tap a word, then its meaning, until the board is clear.
- Quick fire: true or false on short statements, with an optional timer.
- Spot the hidden cost: two example transfers side by side; which one leaves the family
  more? Then show why (fee vs exchange-rate markup).
- Read the receipt: a made-up receipt as text; tap the fee, the rate, the amount received.
- Scam or safe: short scenarios ("a stranger asks you to receive money for them"); decide.
- A module's final round that mixes everything it taught.
A mode can unlock as modules are finished, and the path can show which mode each lesson is.

## Part 2: Library starts with the basics
In learn.tsx, Library opens with "Latest post", the newest post with a body, which today is
a technical one about blockchains. Replace it with the first post, id 1 in
mobile/src/data/blog.json ("What is an international remittance, and why is it more than a
money transfer?"). Rename the section to "Start here" (a new string, see the rules), keep
the "All posts" row under it, and remove the LATEST sort, which nothing else uses.

## Rules (from CLAUDE.md; breaking one is a bug)
Content and numbers
- Never show a number that looks like a real price. Any money in a game is a clearly
  labelled example ("Example"), never a real provider's name, and its arithmetic uses the
  shared formula, computeTransferCost from @remitbridge/formula (see mobile/src/lib/quotes.ts),
  so it matches the rest of the app.
- Information, not advice: no "you should send with...". Rank by amount received.
- Use the app's terms: mid-market rate, exchange-rate markup, total cost, amount received,
  provider. Say "route" in the app, never "corridor" outside the glossary itself.
- Plain words, short sentences, few words on screen (one fact per line). No hype ("Amazing!",
  "Best deal"). American English. In anything people read, no em dashes and never the
  pattern "it's not X, it's Y".

Healthy engagement (it's a nonprofit tool)
- No lives or hearts that stop someone learning, no guilt, no loss-aversion pressure, no
  streak-break warnings, no notifications, nothing paid, no ads. XP and the streak can stay.
- Any timer is optional, with an untimed way to play the same mode.

Privacy and data
- Progress stays on the phone, as in learn-progress.ts (localStorage). No account needed,
  nothing sent to a server, no new database tables.

Code
- No new native modules or packages: the change must work in the current builds, with
  JavaScript only. Ask Angad before adding any dependency.
- Keep game logic pure in mobile/src/lib/ (like lesson.ts, with a seedable random) and test it
  in mobile/src/__tests__/. The screens draw that state.
- Colors and sizes only from constants/theme.ts tokens, never a hex value. No emoji. Visuals
  from components/illustrations.tsx or the Icon component. Buttons are the existing Button.
- Accessibility: 44-point tap targets, every control labelled for VoiceOver and TalkBack,
  right/wrong said aloud (see announce in lib/announce.ts), color never the only signal,
  Reduced Motion respected (useReducedMotion), nothing that needs press-and-hold or a drag
  without a tap alternative.

Strings in five languages
- Every word on screen goes in mobile/src/i18n/en.ts, never inline in a screen. es.ts, hi.ts,
  tl.ts and vi.ts are full copies, so add each new string to all five (the type check fails
  otherwise). Use plain, natural translations.
- Hindi is reviewed by a person: for each new or changed Hindi string, add a row by hand to
  docs/translation-review/hi.md in the same table format, marked "NEW 2026-10-12" or
  "CHANGED 2026-10-12". Never run scripts/review-sheet.ts: it rewrites the whole file and
  erases the reviewer's notes.

Scope and git
- Touch only the Learn tab, lessons, the path, Library and their tests and strings. Not
  Compare, Scan, WhatsApp, Tools, Account, supabase/, engine/ or site/.
- Work on a branch named chatgpt/learn-game-modes and open a pull request into main. Never
  push to main. Commit messages say why, in plain prose.
- Before opening the PR, run in mobile/: npx tsc --noEmit, npx expo lint, npx jest. All must
  pass; say so in the PR with the test count. If you can't run them, say that plainly.
- In the PR description: what each mode does, which files changed, the new strings, and
  anything you weren't sure about.
```

---

Claude's side: review the pull request against these rules, check it on the dev build, add a
DECISIONS.md entry, and merge. Angad's: pick the modes from ChatGPT's proposal, and his mother
reads the new Hindi rows.
