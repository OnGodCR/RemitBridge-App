# Providers for manual research

This file lists providers that get no adapter because their terms of service or
robots.txt forbid automated access (DECISIONS.md, D4). Angad researches these
by hand. Add a row when you find one; don't build around it.

| Provider | Site | What forbids it (quote the clause or robots rule) | Noted | Status |
|---|---|---|---|---|
| Wise | wise.com | US terms of use: "use any robot, spider, other automatic device, or manual process to monitor or copy our websites without our prior written permission". | 2026-09-28 | **Resolved 2026-09-30: automated, with permission.** Simon Bruins (Wise) allowed the Comparison API in writing; the `wise` adapter uses it for Wise's own quote only (DECISIONS.md D91). wise.com's pages are still never fetched. |
| Remitly | remitly.com | User agreement: "use any robot, spider, scraper, automatic device, or manual process to monitor or copy our website or app". | 2026-09-28 | Open |
| Ria | riamoneytransfer.com | US terms (d): no "automated program or mechanism, including without limitation any scraper, spider, or robot, to access, extract, download, scrape, display, transmit, publish, any materials, data, or information (including pricing information)". | 2026-10-01 | Open; permission asked 2026-09-28 |
| MoneyGram | moneygram.com | Terms of use: "Use any robot, spider or other automatic device, process or means to access the Sites for any purpose, including monitoring or copying". robots.txt: `Crawl-delay: 5`. A developer portal exists (developer.moneygram.com) for business partners. | 2026-10-01 | Open; permission asked 2026-09-28 |
| Xe | xe.com | Terms of use: no automatic or manual process to "systematically extract data or data fields, including without limitation any financial and/or currency data", and no scraping "except with express written permission from XE". | 2026-10-01 | Open; permission asked 2026-09-28 (ticket 26724746) |
| WorldRemit | worldremit.com | US terms (Zepz, PDF linked from the terms page): "use any robot, spider, scraper, or other automated device to access the Services". | 2026-10-01 | Open; permission asked 2026-09-28 |
| Sendwave | sendwave.com | Same company as WorldRemit (WorldRemit Corp. DBA Sendwave, Zepz); treated as forbidden until its own sender terms are read. | 2026-10-01 | Not asked |
| Xoom | xoom.com | A PayPal service under PayPal, Inc. PayPal's user agreement: "use any robot, spider, other automatic device, or manual process to monitor or copy our websites without our prior written permission". robots.txt disallows `/send/` and `/sendmoney`. | 2026-10-01 | Open; permission asked 2026-09-28 |
| Pangea | pangeamoneytransfer.com | Terms: "Using any automatic device or manual process to monitor or copy any elements on our Website or Mobile Applications". | 2026-10-01 | Not asked |
| Intermex | intermexonline.com | Online terms of service: "prohibited from using automated processes, such as scrapers or other programs ... without Intermex's prior express written permission". | 2026-10-01 | Not asked |
| Taptap Send | taptapsend.com | US user agreement: "use any robot, spider, scraper or other automated device to access the App or the Services". | 2026-10-01 | Not asked |

## Neither forbidden nor automated

| Provider | What we found (2026-10-01) |
|---|---|
| Western Union | Terms and conditions and the intellectual-property page have no automated-access clause, and robots.txt allows the currency-converter pages. But the rate and fee load through a call guarded by bot protection, and getting past that would break the scraper rules (PRD 9.12). Manual, or with permission (asked 2026-09-28). |
| Paysend | **Cleared, not built (2026-10-01).** No automated-access clause in its terms (paysend.com/rules); robots.txt allows the public route pages and disallows `/api/`, so only the pages may be read. Each route page carries its price data in the HTML: the rate, the fee for a default amount, and the fee tiers by amount (US to India: $1.49 to $250, then 0.561%, 0.531%, 0.472%). Two questions before an adapter: Paysend adds its fee on top of the amount sent (Wise and Instarem take it out of it), which needs a decision on how the two compare; and the page holds four fee lists, some zero, without saying which applies to which way of paying. |
| Instarem | **Cleared for an adapter (D115).** No automated-access clause in its terms or US customer agreement; robots.txt only disallows `/wp-admin/`. Its site's public quote endpoint answered one honest request. **Automated 2026-10-01 (D118).** |

## Checked 2026-10-01, nothing to automate

| Provider | Why |
|---|---|
| Félix Pago | No automated-access clause in its Spanish terms, but it quotes prices inside WhatsApp, with no public price page to read. |
| OFX | Its US terms are business terms; it isn't a consumer remittance provider on these routes. |
| Boss Revolution | Its terms page loaded only a short summary with no clause either way; read the full terms before anything else. |

## Not yet checked

Viamericas (terms are a PDF on corporate.viamericas.com), Remitbee (sends from Canada),
Revolut and the banks.

## Public datasets

The World Bank's Remittance Prices Worldwide (remittanceprices.worldbank.org): quarterly
prices by provider for 42 US routes, free to reuse with attribution. Newest survey Q3 2025,
so research only, never a current price (D115). The US rows are in `research/world-bank-rpw/` (D118).
