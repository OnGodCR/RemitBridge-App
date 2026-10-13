# RemitBridge 2.0: what comes after launch

A working draft (2026-10-13), written at Angad's request: "What improvements would you make
if you were to create a 2.0 version of your app?" It's a menu of ideas to choose from.
Nothing here is decided until it's in `DECISIONS.md`.

## The ground rules don't change

Every idea below has to keep the rules that make RemitBridge trustworthy (CLAUDE.md):

- **Never move money.** RemitBridge informs; it never sends, holds or exchanges anything.
- **Rank only by amount received.** No affiliate links, no paid placement, no "sponsored".
- **Never publish a number we can't verify.** A gap beats a guess.
- **Information, not advice.** We say what the numbers mean, never what someone should do.
- **Privacy first.** Accounts stay optional, data stays minimal, and deleting an account
  deletes everything.
- **Free, on free tiers.** A feature that only works on a paid plan waits.

## The foundation (assumed, not the headline)

- **Partnerships and automatic prices.** Today Wise and Instarem are automatic and the rest
  are checked by hand (D142, D167). 2.0's biggest single gain is more providers sharing
  prices directly, so every price is fresh and none depend on a person clicking.
- **More routes and languages.** Implied. They grow with partners and volunteer reviewers
  (D69, D158).

The rest of this document is about what 2.0 could *do* with that foundation.

---

## 1. Your money, over a year: a personal remittance record

**What it is.** Every receipt someone scans (or enters) builds a private history: how much
they sent, to whom (by country, never by name), what it really cost, and what they could
have kept with the best option that day. Once a year, a one-page summary: "In 2026 you sent
$4,800 home. It cost you $312, $190 of it hidden in exchange rates. The cheapest options
those days would have saved you $141."

**Why it matters.** People feel a $5 fee; they rarely see that the markup cost them more
than the fee, every month, for years. A yearly number makes the hidden cost real, and it's
the strongest reason to compare before every transfer.

**What exists already.** Receipt scanning, "what you could have kept" (D119), saved
transfers, the Yearly cost tool, and the shared formula.

**What 2.0 adds.** Automatic history from scans (with consent), the yearly summary as a
shareable card, and an export for the person's own records (the 1% federal remittance tax
on cash and money-order transfers makes a record useful at tax time).

## 2. A rights checker: "was this transfer done right?"

**What it is.** US law (the CFPB's Remittance Transfer Rule) gives senders rights: a
receipt must show the fee, rate, amount received and date available; the sender can cancel
within 30 minutes; errors must be investigated. RemitBridge already checks whether a
scanned receipt shows the required disclosures (D95). 2.0 turns that into help: when
something's missing, or money arrives late or short, it explains the person's rights in
plain words and walks them through filing a complaint with the CFPB, with the details
pre-filled for them to review and submit themselves.

**Why it matters.** Most senders don't know these rights exist. This is consumer
protection that a price comparison site can't offer, and it fits a nonprofit's mission.

**Care needed.** It informs and prepares; it never files on someone's behalf and never
gives legal advice. Wording reviewed by a lawyer before launch.

## 3. Scam shield on WhatsApp

**What it is.** Someone forwards a suspicious message, screenshot or voice note to the
RemitBridge WhatsApp number ("your cousin needs money now", "send a deposit to release
your prize"). The bot reads it and answers in plain words: which warning signs it shows,
what to check before sending, and where to report it. The app's Scam check tool (and
Learn's "Spot the scam" game) become the same engine.

**Why it matters.** Remittance senders are a prime target for impersonation and "money
mule" scams, and the moment of doubt happens in a chat app, not in ours.

**What exists already.** The WhatsApp agent with tools (D160), the Scam check tool, and
Meta's rules that allow on-topic bots (money transfers and safety are on topic).

**Care needed.** It never says a message is "safe", only what to check. Images and voice
notes follow the same privacy rules as receipts (read, answered, deleted).

## 4. Community prices: receipts that help everyone

**What it is.** With permission, a scanned receipt (personal details already removed on
the phone) becomes a verified price data point: provider, route, amount, fee, rate, amount
received, date. Enough of them fill in routes and providers that share no prices, show what
people actually paid versus what was advertised, and catch promotional rates that vanish
after the first transfer.

**Why it matters.** It's the one source of prices that doesn't depend on any provider's
cooperation, and it grows with the community instead of with our time.

**What exists already.** Redaction on the phone (D79), research consent (D81), the receipt
observatory (D96), and the publish gate that every price must pass.

**Care needed.** A receipt price is shown as "reported by senders" with its date, never
mixed silently with live quotes, and only after it passes the same checks.

## 5. Reaching people without smartphones or data

**What it is.**
- **SMS:** text "500 India" to a number, get the top three prices back.
- **Voice notes on WhatsApp:** ask a question by speaking, in your own language, and get
  the answer as text and, optionally, as audio.
- **Printable price sheets:** a weekly one-page sheet per route, for community centers,
  churches, and shops to post on the wall.

**Why it matters.** The people who lose the most to fees are often the least likely to have
a data plan, read English comfortably, or install an app. 2.0 meets them where they are.

**What exists already.** The bot's message parser and reply templates, which an SMS gateway
can reuse; the price data; translations.

## 6. Smarter alerts that state facts, not forecasts

**What it is.** Today a rate alert fires when a provider reaches a target (D113). 2.0 adds
context people can act on themselves: "Today's rate to India is the best in 30 days",
"Your usual provider's price to Mexico changed this week", and a home-screen widget with
the current best amount received on your route.

**Why it matters.** Most people send on a schedule. Knowing whether today is a typical day
or an unusually good or bad one is useful without anyone predicting the future.

**Care needed.** No predictions and no "send now" nudges: only what's true today compared
with the recent past (information, not advice).

## 7. Tools for the organizations that serve senders

**What it is.** A free dashboard for community organizations, credit unions, consulates,
and teachers: workshop kits built from Learn, a classroom mode where a group plays the same
lesson together, printable sheets (above), and anonymous totals of what their community
pays on its routes (never any individual's data).

**Why it matters.** Trusted local organizations already reach the people RemitBridge wants
to help. Equipping them multiplies reach far beyond app downloads.

**What exists already.** Learn's modules and games (D172), partner links (D48), the
metrics system with its aggregate-only rule (D31), and the partner outreach list.

## 8. Open data and a public price index

**What it is.** A monthly RemitBridge Remittance Price Index: what it costs to send $200
and $500 from the US to each route, against the UN's 3% target (SDG 10.c), published as a
short report and an open dataset for researchers, journalists, and policymakers.

**Why it matters.** Good public data on US remittance prices is scarce between the World
Bank's quarterly surveys. A trustworthy, frequent index gives RemitBridge a voice in policy
(for example, the 1% remittance tax) and makes the nonprofit's research credible.

**What exists already.** Every published price is archived with its raw response (the
engine's rule), the World Bank survey data for comparison, and RemitBench.

---

## Smaller ideas worth keeping

- **Delivery speed from receipts:** when money became available, by provider and route,
  shown as information next to prices (never as a ranking).
- **Provider complaint context:** public counts from the CFPB complaint database, shown as
  facts with their source.
- **Split a transfer:** siblings sending to the same parent see each one's share of the
  cost.
- **Recipient view:** a link the sender can share so family sees what should arrive and
  when, in their language.
- **Accessibility:** a voice-first mode and an even simpler large-type mode.

## If we can only do three

1. **The personal remittance record (1)**, because it turns one scan into a reason to keep
   coming back, and shows the hidden cost over a year.
2. **The scam shield (3)**, because it protects people at the moment they're about to send,
   and builds on what already works on WhatsApp.
3. **The rights checker (2)**, because no one else offers it, and it's the clearest
   expression of a nonprofit mission.

Community prices (4) and the price index (8) follow naturally once enough people scan.
