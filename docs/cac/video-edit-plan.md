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
  headlines, ink line drawings, monochrome logos and film grain. Angad preferred v4's
  look, which fits the app, so v6 goes back to it.
- **v6** (2:58): v4's style with its alignment fixed, the generic kicker labels replaced
  by a progress bar in the technical part, a different transition for each scene change,
  varied entrances (drop, slide, spin, stamp, typing), every element on screen for at
  least 1.4 seconds, and the end card held 1.5 seconds longer. A full copy is in
  Downloads as `RemitBridge CAC v6.mp4`. Its graphics source is `video-graphics/graphics.html`;
  `audit.js` lists anything on screen for under 1.4 seconds.
  In Descript it is the composition "v6 green (final file)"
  (https://share.descript.com/view/jQuNTwelL6A). The composition named "v6" is a
  half-finished edit (Descript's AI credits ran out): its intro and technical part are
  still v5, so don't use it.

- **v7** (2:58): v6 with Angad's two screen recordings as full-screen inserts in the
  technical part: VS Code scrolling the total-cost formula over its first 2.7 seconds,
  and the GitHub Actions Scrape runs at "Python workflows on GitHub Actions" (3 seconds),
  each with a small label. Kept: the first 8 seconds of the VS Code recording and the
  first 6 of the GitHub one, sped up 3x and 2x. Cut: the empty end of the file, the
  folder clicking, the YAML part with an extension popup, and the page flipping. Full
  copy in Downloads as `RemitBridge CAC v7.mp4`.

**Current choice (Angad, 2026-10-17):** keep v6 as it is. The demo sounds sped up at
1.1x, but at 1x the video runs about 3:05, and the lines that would have to go ("cute
little guy", the blog posts, "let's dive into the app") give it personality, so none are
cut. Next: Angad records the stage 2 clips below; a few smaller fixes come after that.

Times below are in v2, except the stage 2 list, which uses v6.

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

## Stage 2: what to record (times in v6)

Phone screen recordings: Control Center, Screen Recording, microphone off. Light mode,
Do Not Disturb on, real data, and two seconds of stillness before and after each action
so the clip can be cut cleanly. Hold each screen a beat longer than feels natural.

**App demo, one clip per line**
1. 0:54 "let's dive into the app": tapping the app icon on the home screen, the app opening.
2. 0:55 "Onboarding is simple": the language picker, choosing one of the four.
3. 0:58 "sign in with Apple or Google": the sign-in step and the Apple sheet (the
   email hidden).
4. 1:00 "greeted by our remittance database": Compare with $500 to India, scrolling the
   ranked list slowly.
5. 1:04 "across ... corridors": changing the To country two or three times.
6. 1:07 "ranked by how much ... receives": a slow pan or zoom on the top result's
   amount received.
7. 1:09 "Tap any result": tapping a result and the details opening (fee, markup,
   delivery time).
8. 1:12 "No provider can pay for a higher ranking": the How it works screen.
9. 1:15 "That's where TrueCost comes in": opening TrueCost and choosing to scan.
10. 1:17 "scan an old receipt": the camera on a real paper receipt. Also film this from
    over your shoulder with a second phone, to show it happening in real life.
11. 1:20 "A redaction preview": the preview with the black boxes over personal details.
12. 1:23 "TrueCost then calculates": the result and "what you could have kept".
13. 1:29 "meet Remmy": tapping the floating button and the chat opening.
14. 1:33 "open calculators, run comparisons, and navigate": asking Remmy for "500 to
    Mexico" and letting him move the app to Compare.
15. 1:38 "Learn tab": the path, opening one game, then a scam check.
16. 1:45 "blog posts": scrolling the blog list.
17. 1:47 "WhatsApp bot": sending "500 to India" and the reply arriving, then a receipt
    photo and its answer. A Hindi reply, if you have one, shows off the second language.

**Technical part**
18. 2:00 to 2:40: scrolling through the code in VS Code, slowly. The formula
    (`packages/`) and a price adapter (`engine/`) read well.
19. The GitHub repo, then the Actions tab with green Scrape runs. Hide the secrets page
    and anything with keys in it.

**Intro**
20. 0:17 "I visited my grandparents in India": three or four photos or short videos
    from the trip.
21. 0:25 rent, groceries, education: stock clips (Pexels, Pixabay) or your own short shots.

**Anywhere**
22. Five seconds of you using the app on your phone, filmed from the side: hands,
    screen and face. It works at the start of the demo or under the closing.

**Voice re-records** (same spot, light, outfit and time of day as the original, so the
cut doesn't show): the four lines under "Lines to check before submitting" below, said
in a way that's true, for example "four languages, with Hindi reviewed by a native
speaker" and the real provider and route counts from the app.

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
