# Congressional App Challenge 2026: draft entry

Drafted by Claude on 2026-10-01 for Angad to rewrite in his own words. The official
deadline is **October 26, 2026**, and our internal one is October 23. Check every answer against the
form at congressionalappchallenge.us once you register; the questions below are the usual
ones, not copied from this year's form.

What the entry needs:
- a demo video of **3 minutes at most** that says your name, the app's name and what it is for;
- the application form (profile, eligibility quiz, questions about the app);
- the app itself, or a way for judges to see it (TestFlight or the video, depending on the form).

---

## App name

RemitBridge

## One-line description

RemitBridge shows people who send money abroad what a transfer really costs, including the
cost hidden in the exchange rate, and checks the receipts of transfers they've already made.

## What problem does it solve?

Families who send money home often pay two prices. One is the fee they see. The other is
hidden in the exchange rate: the provider gives a worse rate than the real one and keeps the
difference. Across the world that hidden part costs senders billions of dollars a year, and
most people never see it. Since January 2026, transfers paid in cash also carry a 1% federal
tax, and many senders don't know whether they were charged it correctly.

## How does it work?

- **Compare:** pick where you're sending and how much. RemitBridge ranks providers by how
  much your family actually receives, and splits the total cost into the fee and the
  exchange-rate markup. It ranks by what arrives, never by fee, and no provider can pay to
  rank higher.
- **Scan a receipt:** take a photo of a transfer receipt. The phone reads it and hides
  names, addresses, phone numbers and account numbers before anything leaves the phone.
  The app then works out the true cost, compares the rate with what the provider advertised
  that day, checks the federal tax, and lists any standard disclosures it couldn't find.
- **WhatsApp:** the same comparisons by text message, in English or Hindi, for people who
  don't install apps.
- **Research:** with permission, scanned receipts feed anonymous totals about what people
  really pay, shown only for groups of five or more.

## Who is it for?

Immigrant families who send money home, starting with routes from the US to India, Mexico,
the Philippines and Vietnam, and community organizations in the Seattle area that help them.

## Technologies

- **App:** TypeScript, React Native with Expo, for iOS and Android.
- **Backend:** Supabase (Postgres with row-level security, Edge Functions on Deno).
- **Price checker:** Python, run on GitHub Actions.
- **Receipt reading:** on-device text recognition (Google ML Kit) and redaction (Skia); a
  rule-based parser; a vision model (Qwen3.8, on Groq) only for values the rules
  couldn't read, and only ever on the redacted receipt.
- **WhatsApp bot:** fixed commands and a parser first; for other messages, an open AI model
  (OpenAI's gpt-oss, on Cloudflare Workers AI or Groq) works out what the person is asking
  and answers from RemitBridge's own content. It never writes a number: prices come only
  from checked data, and any reply with a number in it is refused.
- **One formula:** a single total-cost formula, written once in TypeScript and once in
  Python, both held to the same test cases so no two screens can disagree.

## What was hardest?

*(Angad: answer this from your own experience. Some true candidates:)*
- Keeping a person's details private while still reading their receipt: redaction runs on
  the phone first, the server checks again, and nothing personal is stored.
- Making the rule-based parser read receipts printed by different companies in different
  layouts, and through OCR's mistakes. *(Claude wrote the extractors, D130; only use this
  if you can speak to it, e.g. the choices you reviewed.)*
- Measuring accuracy honestly: a benchmark of 60 synthetic receipts plus real ones, scored
  field by field, reporting how much the rules read without the AI model.
- Never showing a number we can't check: every price goes through a publish gate first.

## What did you learn? / What would you do next?

*(Angad: in your own words.)*

## Use of AI tools (disclose this)

RemitBridge was built with heavy help from Claude, an AI coding assistant. Be specific and
honest here. `docs/AI_USAGE.md` lists, file by file, what Claude wrote for the receipt
scanner. Short version for the form:

- Angad defined the product and made the decisions recorded in DECISIONS.md.
- Claude wrote the code under Angad's direction and review, including the app screens, the
  database, the redaction, the receipt parser's field-extraction rules (D130), the
  benchmark and the WhatsApp bot.
- The app itself uses an AI model (Qwen3.8) to read receipt values the rules miss. It only
  ever sees a redacted receipt.
- The WhatsApp bot uses an AI model (gpt-oss) to understand messages its rules can't. It
  gets only the message text, never the phone number, and it isn't allowed to write prices.

*(Check the form for its exact AI-use rules before submitting.)*

---

## Demo video script (about 2 minutes 45 seconds)

Record on the iPhone with the development build. Keep it calm and real: no music over the
talking, and no claims the app can't back up.

| Time | On screen | Say |
|---|---|---|
| 0:00 | You, on camera | "Hi, I'm Angad, and this is RemitBridge. It shows families who send money abroad what their transfers really cost." |
| 0:12 | Compare tab, $500 to India | "When you send $500 home, there's the fee you see, and a cost hidden in the exchange rate. RemitBridge ranks providers by what your family actually receives, and splits the cost into both parts." |
| 0:35 | Tap the top quote, the breakdown | "Every number says where it came from and when it was checked. If we can't check a price, we don't show it." |
| 0:50 | Tools, then Scan a receipt; photograph a receipt | "You can also scan a receipt from a transfer you already made." |
| 1:00 | The redacted preview | "Before anything leaves the phone, it covers names, addresses and account numbers. This is exactly what gets sent." |
| 1:15 | The confirm screen; tap a highlighted value | "It shows where it read each value, and asks you to check anything it isn't sure of." |
| 1:30 | The result: total cost, advertised versus paid | "Then it works out what the transfer really cost, and compares your rate with what the company advertised that day." |
| 1:50 | Tax check and disclosures | "It checks the new 1% federal tax on cash transfers, and lists any standard disclosures it couldn't find on the receipt." |
| 2:05 | WhatsApp chat (if live) or the Learn tab | "It also works by WhatsApp, in English and Hindi, and receipts people choose to share become anonymous research on what senders really pay." |
| 2:25 | You, on camera | "RemitBridge is free, it never touches your money, and no company can pay to rank higher. I built it so families keep more of what they send." |
| 2:40 | App icon and name | "RemitBridge." |

Before recording, check:
- [ ] The scanner reads a real receipt end to end on the phone (needs GROQ_API_KEY).
- [ ] Compare shows live prices (Wise is automated; add a few others with Add a price).
- [ ] No real personal details appear anywhere on screen. Use your own receipt, or one made
      up for the demo.
- [ ] The video is under 3:00 and says your name, the app name and its purpose.
