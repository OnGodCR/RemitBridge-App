# CAC video: edit plan

The working project is in Descript: "RemitBridge CAC Video"
(https://web.descript.com/08590f5c-b240-4814-8f0f-3748d88cf45a). Versions:

- **Full combined** (3:08): the four clips in order, untouched.
- **Under 3 min v1** (3:06): pauses tightened.
- **Under 3 min v2** (2:55): v1 with the app demo and the technical part at 1.1x.
- **v3 with graphics** (2:56): v2 with the technical part and the closing rebuilt with
  graphics (below). Private preview: https://share.descript.com/view/jF7zRbwLuB0.
  The graphics' source is in `video-graphics/`.
- **v4 intro graphics** (2:57): v3 with the intro rebuilt with graphics too.
- **v5 editorial** (2:57): all three graphics sections redrawn in a less generic style,
  after Angad found v4's look template-like: a split screen with a camera move, serif
  headlines, ink line drawings, monochrome logos and film grain.

Times below are in v2.

## What Claude makes (graphics)

| Where | Graphic |
|---|---|
| Technical part, 1:59 to 2:40 | Angad moves into a frame on the right; the left side explains each sentence. A logo appears for every tool as it is named: React Native, TypeScript, iOS, Android, Supabase, PostgreSQL, Edge Functions, Python, GitHub Actions, Meta, WhatsApp, Groq, Cloudflare. |
| 1:59 Architecture | The phone (iOS, Android) talks to the Supabase backend (PostgreSQL, Edge Functions). |
| 2:07 Price pipeline | A clock for every 6 hours, then GitHub Actions running Python, then APIs and scraping, then fees and markups turning into one number: amount received. |
| 2:19 Validation | The price is checked against independent rates (Frankfurter) before it is published; anything that fails is held back. |
| 2:27 WhatsApp | Meta's Cloud API, then a Supabase webhook, then intent classification, which routes to Groq or Cloudflare. |
| 2:34 Size | A counter to about 38,000 lines, split into TypeScript, Python and SQL. |
| Closing, 2:40 to 2:55 | One paycheck splits into three households (the intro's line again), then a breakdown of where $500 goes (fee, markup, received), then an end card with the logo and remitbridgelabs.org/app. |

## What Angad can record (b-roll)

Screen recordings are the most useful b-roll in an app competition. Record them on the
phone (Control Center, Screen Recording) in light mode and with real data.

**Intro (0:00 to 0:53)**
- 0:17 "Last summer, I visited my grandparents in India": your own photos or videos from
  the trip. This is the most personal shot in the video.
- 0:25 rent, groceries, education: quick stock clips (Pexels and Pixabay are free).
- 0:46 "I'm Angad Kochar": a title showing your name, "Founder, RemitBridge Labs". Claude
  can make this.

**App demo (0:53 to 1:59).** One recording for each sentence:
- Onboarding: choosing a language, then signing in.
- Compare: $500 to India, scroll the ranked list, tap a result to open its details.
- TrueCost: scan a real receipt and show the redaction preview and the result.
- Remmy: ask him to open a calculator or run a comparison, and let it navigate.
- Learn: the path, one game, a scam check, then the blog.
- WhatsApp: "500 to India" and the reply, then a receipt photo and its answer.

Until those exist, Claude can put the screenshots already in `site/screens/` and
`docs/store/screenshots/` into a phone frame with callouts ("Ranked by amount
received", "No affiliate links").

**Technical part.** Scrolling through the code in VS Code and the GitHub repo (the Actions
tab with the Scrape runs is a good one). They can run behind the 38,000-lines counter or
replace a scene.

## Could also add (Claude can make these)

1. ~~Intro graphics~~ (done in v4): one paycheck splitting into three homes; a map with
   arcs from the US to Mexico and Argentina; 1 income, 3 households, 9 people; "$905B" in
   2024 (World Bank estimate); a "$0 fee" sticker beside an example of the markup it hides
   ($500 to India, labelled as an example); a name title.
2. **Captions** across the whole video, in the brand font, with the key words in green.
3. **Background music** at a low level (YouTube Audio Library or Pixabay, both free), plus
   soft whooshes when graphics appear.
4. **Punch-in zooms** on key lines ("No provider can pay for a higher ranking").
5. **A two-second title card** at the start: logo, "RemitBridge", "See what a transfer
   really costs".

## Lines to check before submitting

These lines in the recording don't match the project docs. Judges can check them, so
re-record or cut them:

- "four languages verified by native speakers": only Hindi has been reviewed; Spanish,
  Tagalog and Vietnamese are drafts.
- "over fifty providers across thirty different corridors": the docs show 23 routes live
  and about 9 providers on the busiest one.
- "three volunteers verify screenshots": the docs don't mention it.
- "You can find RemitBridge on iOS, Android": the store submissions are still pending
  (`docs/launch-checklist.md`). Is it live by the deadline?
- "Frankfurt Exchange Rates" is Frankfurter. The graphics spell it correctly.
