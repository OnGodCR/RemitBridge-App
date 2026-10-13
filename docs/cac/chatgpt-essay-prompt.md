# CAC essays: a first-draft prompt for ChatGPT (2026-10-13)

Angad asked for a prompt that lets ChatGPT draft the Congressional App Challenge essay
answers in his voice, which he then edits. Everything between the two lines is the prompt:
paste it into a new ChatGPT chat, then paste the form's questions under "THE QUESTIONS".

The facts in it are checked against the repo (DECISIONS.md, HANDOFF.md, the code). Two
claims from earlier notes are deliberately left out because they aren't true: there is no
volunteer team checking prices, and no provider site is scraped by an AI agent. If either
becomes true, add it here first.

The CAC asks entrants to disclose AI use. These drafts are AI-written until Angad rewrites
them; the final answers should be his words, and `docs/AI_USAGE.md` and the form's AI
question should say how the essays were drafted.

---

```
You're helping me, Angad Kochar, a high school student, draft my answers for the
Congressional App Challenge about my app, RemitBridge. Write first drafts in my voice that
I will edit myself. Use ONLY the facts below. If an answer needs something that isn't here,
write [ASK ANGAD: what you need] instead of inventing it. Never make up numbers, people,
partners, users, awards or quotes.

## My voice
- First person, plain and direct, like a thoughtful high schooler explaining something he
  built and cares about. Short sentences. Concrete examples over big claims.
- No hype words (revolutionary, game-changing, seamless, cutting-edge, leverage, empower).
- No em dashes. Never use the pattern "it's not X, it's Y" or "not just X, but Y".
- Show what I decided and why, and what went wrong and how I found it.
- Be honest about AI: I built RemitBridge with an AI coding assistant (Claude Code). I made
  the product decisions, directed the work, reviewed it, tested it on real phones, and did
  the outreach and business work; the assistant wrote much of the code. Phrase technical
  work as "I built" only where it's fair (design, decisions, debugging I led, testing), and
  use "with an AI coding assistant" where the code itself is meant.
- Never call RemitBridge Labs a "charity" or say "501(c)(3)" or "tax-deductible". It IS a
  Washington nonprofit corporation, which is fine to say.

## What RemitBridge is
- A free app (iPhone and Android) and WhatsApp bot that shows people sending money from the
  US what a transfer really costs: the fee they see plus the cost hidden in the exchange
  rate. It ranks providers only by how much the family actually receives. No affiliate
  links, no ads, no paid placement. It never moves money; it only informs.
- Published by RemitBridge Labs, a Washington nonprofit corporation I founded.
- Why it matters: senders often lose more to a bad exchange rate than to the fee, and most
  never see it. Since January 2026, cash and money-order transfers also carry a 1% federal
  remittance tax. The UN's goal is for sending money to cost under 3%.
- Features: Compare (26 routes from the US, 9 providers, ranked by amount received, with
  each price's source and when it was checked); a receipt scanner (photo of a past
  transfer receipt, personal details blacked out on the phone, then the true cost and what
  the family could have received with the best option that day); rate alerts; tools
  (fair rate, scam check, true cost, yearly cost, rate history); Learn (lessons and six
  game modes like Duolingo); a WhatsApp bot that answers price questions and reads receipt
  photos; five languages (English, Spanish, Hindi, Tagalog, Vietnamese; Hindi reviewed by a
  fluent speaker, my mother; the others are marked Draft until reviewers sign off).
- Accounts are optional. Comparing works without one. Deleting an account deletes
  everything.

## How it's built (true facts to draw on)
- App: TypeScript, React Native with Expo. Backend: Supabase (Postgres with row-level
  security, Edge Functions). Price collection: a Python engine that runs on GitHub Actions
  on a schedule (every few hours).
- One total-cost formula, written in TypeScript and Python, both held to the same shared
  test cases (and matched to the formula on my website), so no two screens can disagree.
- Everything runs on free tiers. The AI models (for reading hard receipt values and for
  understanding WhatsApp questions) are free-tier models with fallbacks when one is busy.
- Testing: hundreds of automated tests across the app, the receipt reader, the bot and the
  engine; a benchmark of 60 made-up receipts scored field by field.

## Real technical difficulties (use these for any "challenges" question)
1. Getting prices honestly. Most big providers have no public price API, and many of their
   terms of service forbid bots and scrapers. I decided not to scrape anyone who forbids it.
   Instead: Wise gave written permission to use its API; Instarem publishes a quote endpoint;
   my Python engine collects those automatically. For the rest (like Remitly and Western
   Union), I check prices by hand on their public calculators: I do all the clicking, an AI
   assistant reads my screenshots and fills in the numbers, and every hand price goes through
   the same checks before it's shown. I emailed 14 providers asking for permission or a price
   feed; Wise said yes.
2. Never showing a wrong number. Every price passes a "publish gate": the math must add up,
   and the rate is compared with the real mid-market rate from two independent sources. If
   anything fails, the price is held back. When the two rate sources drifted apart, the gate
   held back Mexico and India for days, so I added a third source (Wise's mid-market rate)
   to break ties.
3. Reading receipts privately. A receipt is full of names and account numbers. The phone
   reads it and blacks out personal details before anything is uploaded, and the server
   checks again. A free AI model reads only values the rules couldn't, and only from the
   redacted version.
4. The bug that made real receipts fail. Real scans were finding almost nothing, so people
   had to type every value. My test receipts passed at 99.7%, which hid the problem: they
   were read by a different text-recognition engine than the phone uses. The phone's
   engine splits a receipt row like "Transfer fee ...... $5.00" into two pieces, and the
   number often sits a pixel higher than its label, so every number got matched to the row
   above it (it read a $500 transfer as $4.99). I found it by recreating the phone's layout
   in a test, then fixed it by putting each row back together before reading. Real receipts
   now read much better. Lesson: test on real-world inputs, not just clean ones.
5. Receipts that include the fee. Some receipts take the fee out of the amount instead of
   adding it on top, which made the app count the fee twice. It now works out which kind it
   is from the receipt's own total.
6. An Android-only sign-in bug. On Android, people appeared signed in, but nothing they
   saved reached their account. The app encrypts the saved sign-in on the phone, and
   Android's decryption only accepted raw bytes, so every session was silently deleted. I
   found it with a self-test that runs when the app starts, and a test now reproduces
   Android's behavior so it can't come back.
7. Getting WhatsApp approved. Meta locked the bot's account until the business was
   verified, which needed my nonprofit's incorporation papers, a verified domain and a real
   phone number.

## What I learned / what's next (use for "future" or "what did you learn")
- Lessons: test with real inputs; a missing number is better than a wrong one; ask
  permission instead of scraping; design for people who read English as a second language
  (fewer words, big buttons, five languages).
- Next (RemitBridge 2.0): more provider partnerships so every price is automatic; more
  routes and languages; a yearly personal record of what your transfers cost and could have
  cost; a rights checker that explains senders' federal rights and helps file a complaint
  with the CFPB; a WhatsApp scam shield where you forward a suspicious message; receipt
  prices shared (with permission) to fill in providers that share no data; SMS and voice
  access for people without smartphones; and a monthly public price index measured
  against the UN's 3% target.

## How to answer
- Answer each question separately, with the question as a heading.
- Keep to the word or character limit given with each question; if none is given, aim for
  150 to 250 words.
- After each answer, list any sentence you weren't sure was supported by the facts above.

## THE QUESTIONS
[Paste the form's questions here, each with its word limit.]
```
