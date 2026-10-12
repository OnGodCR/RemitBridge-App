# Scope: an AI model in the WhatsApp bot

Angad, 2026-10-11: connect an AI model to the WhatsApp bot, free and not Groq. It gets all our
data and decides what to show; it answers questions, links people to the website and to app
features, and takes feature suggestions that Angad can read.

This is the scope only. Nothing is built yet. The open questions for Angad are at the end.

## What the bot does today

The bot has no AI for text (D68). A parser we wrote (`packages/bot/src/parse.ts`) reads
"500 to India", the code looks up checked prices in the database, and fixed templates write
the reply in English or Hindi. It's fast, never wrong about a number, and free. But it only
understands the shapes it was written for: anything else gets a "try 500 to India" help
message.

## What changes

The model sits in front of the existing code, not in place of it.

1. **Understand.** The model reads the message and returns a small JSON answer. It says what
   the person wants and fills in the details:
   - prices (amount, country, way of receiving);
   - explain a word or a cost;
   - how something in the app works;
   - a scam worry;
   - a suggestion for the app;
   - something off topic.
2. **Fetch.** Our code gets the data for that intent:
   - prices from the database, through the same functions the bot uses now;
   - definitions from the glossary's 80 terms;
   - posts from the blog;
   - the right app screen or website page from a fixed list of links.
3. **Answer.**
   - **Prices** keep today's template. **The model never writes a number**: every amount,
     rate and fee still comes from the database through our formatting.
   - **Questions** get a short answer the model writes from the material we fetched, plus one
     or two links.
4. **Check.** Before anything is sent, our code checks the reply:
   - every number in it must appear in what we fetched;
   - every link must be on our list;
   - it must be short enough for WhatsApp.

   If any check fails, the bot sends the plain template instead.
5. **Fall back.** If the model is down, slow or over its daily limit, the bot works exactly as
   it does today.

### What it can link to

- The website (remitbridgelabs.org): blog posts, the tools, the methodology.
- App screens, through links that open the app if it's installed and the website if not
  (`app.remitbridgelabs.org/open/compare?to=IN&amount=500`, `/open/scan`, `/open/learn/cost`,
  and so on). Today only `/p/*` partner links open the app, so this needs a new path in
  `apple-app-site-association` and `assetlinks.json`, an `open/` route in the app, and a
  fallback page on the site. That's native config, so it needs new store builds.

### Feature suggestions

- "I wish the app showed Ria" or "can you add Kenya cash pickup" becomes a row in a new
  `suggestions` table. The row holds the text, the language, the date and where it came from.
  There's no phone number: at most the keyed hash we already use, to rate-limit repeat
  senders.
- The bot thanks the person and says the suggestion is logged.
- Angad reads them in the app (Account → Admin → **Suggestions**, the same admin gate as Add
  a price), with an optional weekly email digest to hello@ through Resend.
- RLS: nobody can read the table except admins. Only the WhatsApp function writes to it.

## Which free model

| Option | Free amount | Trains on our data? | Fit |
|---|---|---|---|
| **Cloudflare Workers AI** (recommended) | 10,000 "neurons" a day, reset at midnight UTC | No: Cloudflare says it doesn't use customer content to train any model on Workers AI | Open-weight models (Qwen3 30B-A3B, Gemma 4 26B, Llama 3.3 70B, gpt-oss). Our Edge Functions can call it over HTTPS |
| Google Gemini (AI Studio free tier) | Flash models only, about 1,000 requests a day | **Yes**: free-tier content is used to improve Google's products | Ruled out: people's money questions would train Google's models |
| Cerebras | Sources conflict: a time-limited trial ($5 credit, card required) or a daily allowance | Not clearly stated | Not reliably free |
| Mistral free tier | Free "Experiment" plan | Trains unless you opt out | Possible, but the opt-out is one more thing to get wrong |
| Groq | Free tier | No | Excluded at Angad's request |

**How far the Cloudflare allowance goes**, at about 2,500 tokens in and 250 out per model
call, two calls per message:
- Qwen3 30B-A3B: about 20 neurons a call, so roughly **250 messages a day** free.
- Gemma 4 26B: about 30 a call, roughly 160 a day.
- Llama 3.3 70B: about 120 a call, roughly 40 a day.

Beyond that the bot quietly falls back to today's template replies. Nothing is charged:
Cloudflare's free plan fails over the limit rather than billing.

Start with **Qwen3 30B-A3B**, compared against Gemma 4 26B on a test set before choosing (see
below). Qwen's Hindi is a known strength, but that has to be checked, not assumed.

## Rules it has to keep

- **Never a number we can't verify.** Prices only come from the database, through the
  template. The model's own text is checked for numbers, and any it didn't get from us means
  the reply is replaced.
- **Information, not advice.** It ranks by amount received like the rest of the app, says
  what the numbers mean, and never tells someone what to do with their money (we're not
  licensed advisers).
- **On topic only.** Since January 15, 2026, Meta's WhatsApp Business terms forbid
  general-purpose AI assistants on the API. Bots about the business's own service are
  allowed. So the model answers about sending money and RemitBridge, and politely declines
  everything else.
- **Privacy.**
  - The model gets the message text only: never the phone number, never a receipt photo.
    Receipt photos stay on the existing scan pipeline.
  - The privacy policy gains a line naming Cloudflare as a processor of message text.
  - The suggestions table keeps no number.
- **Same voice as the app**: plain, short, no hype, the terminology table, English and Hindi
  (and the other three languages once the app's are reviewed).
- **Limits**, like D140:
  - a cap per number per day on model calls;
  - a global daily cap under the free allowance;
  - a metric for how often it falls back.

## How we'd know it works

Before it answers real people:
- **A test set of about 150 messages** in English and Hindi, each with the right intent and
  details: real phrasings ("how much to send 300 to mom in india", "what's a markup", "is
  this a scam", "add Ria pls"), typos, mixed languages, and off-topic ones.
- **A scored run of each candidate model** on intent accuracy, detail accuracy, wrong-number
  rate (must be zero), off-topic refusals, and latency.
- **Pass bar:** at least 95% intents right, no invented numbers, under 4 seconds per reply.

## Work, roughly

| Step | What | Who | Size |
|---|---|---|---|
| 1 | Cloudflare account (free) and an API token limited to Workers AI, set as a Supabase secret from his terminal | Angad | 15 min |
| 2 | Test set and scoring script; compare two models | Claude | 1 day |
| 3 | Understand step, JSON schema, fallback, limits; prices stay on the template | Claude | 1 day |
| 4 | Answers from our content (glossary, blog, FAQ, feature list) with the number and link checks | Claude | 1–2 days |
| 5 | `suggestions` table, RLS and smoke test, admin screen, optional weekly email | Claude, Angad runs the migration | 1 day |
| 6 | App links (`/open/...`): AASA, assetlinks, app route, site fallback; needs new builds | Claude | 1 day |
| 7 | Privacy policy line, DECISIONS entry, Hindi review rows | Claude, Angad reviews | half a day |

About **5–6 days of work**, steps 2–5 first. Step 6 can follow, since until then links point
at the website.

## Questions for Angad

1. **Cloudflare Workers AI**: okay to use? You'd make the free account (sign up with the
   RemitBridge Gmail) and the token.
2. **Where to read suggestions**: the admin screen in the app, a weekly email, or both?
3. **Scope of answers**: only RemitBridge and sending money (recommended, and what Meta's
   terms allow), or also general money questions?
4. **App links**: build the `/open/...` links now (they need new builds), or link to the
   website first?
