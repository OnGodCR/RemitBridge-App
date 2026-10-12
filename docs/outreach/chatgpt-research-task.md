# Research task for ChatGPT (2026-10-12)

Angad asked for a task ChatGPT could run to collect new data. Prices themselves can't come
from it: most providers' terms forbid automated access (`docs/MANUAL_RESEARCH.md`), and an
agent browsing their calculators is automated access; and a chat answer isn't an archived
source, so it couldn't be published anyway. What it can collect is the way to more prices:
who serves each route, public APIs and feeds, the exact terms, and official contacts.

Paste this into ChatGPT (agent mode or deep research). Bring the results back to Claude,
who checks them against their links and logs them in `docs/MANUAL_RESEARCH.md` and
`docs/outreach/permission-request.md`.

```
You're helping RemitBridge Labs, a Washington nonprofit that runs a free app comparing what it costs to send money from the US. We rank providers only by how much the family receives, take no affiliate money, and only publish prices we have permission or public data for.

Task: research which money-transfer providers serve our routes, and how we could get their prices legitimately. Do NOT use any provider's price calculator, quote form or send-money flow, do NOT create accounts or log in, and do NOT guess email addresses. Read only: terms of use / terms of service, robots.txt, help/FAQ pages, developer or API docs, press, partnership and contact pages.

Our 26 routes (sending from the US): India, Mexico, Philippines, Vietnam, China, Guatemala, Honduras, Dominican Republic, Ethiopia, Kenya, Nigeria, Pakistan, Bangladesh, South Korea, Ukraine, Colombia, Peru, Nicaragua, Jamaica, Haiti, Brazil, Ghana, Nepal, Sri Lanka, Egypt, Uganda.

Providers to cover (add any other licensed US provider with real volume on these routes, for example ones focused on Africa or Asia): Remitly, Western Union, MoneyGram, Ria, Xoom (PayPal), Xe, WorldRemit, Sendwave, Pangea, Intermex, Taptap Send, Paysend, Félix Pago, Viamericas, BOSS Money (BOSS Revolution), OFX, Lemfi, NALA, Afriex, Panda Remit. Skip Wise and Instarem; we already have them.

For each provider, give one row with:
1. Provider and website
2. Which of our 26 routes it serves from the US, and the ways money arrives (bank deposit, cash pickup, mobile wallet, card)
3. Public API or data feed for exchange rates and fees: yes/no, link, and whether it needs a business agreement
4. What its terms say about automated access, scraping or bots: quote the exact sentence and link the page; also say whether robots.txt blocks its pricing pages
5. A rate or price feed offered to comparison sites or partners: yes/no, link. Note if it requires affiliate links (we can't accept those)
6. The official contact for data partnerships, business development or press: only an address, form or page the provider itself publishes, with the link
7. Anything else useful (acquisitions, shutdowns, US licensing), with a link

Also, separately: PayPal's media inbox (mediarelations@paypal.com) now bounces through Asana. Find the official way to reach PayPal or Xoom about a nonprofit using Xoom's public prices: a newsroom contact form, a partnerships page, or a published business address. Links only, no guessed emails.

Output: a table (or CSV) with the columns above, then a short list of the 5 providers most likely to give us permission or a feed, with one sentence each on why. Mark anything you couldn't confirm as "unconfirmed". Every claim needs a source link.
```
