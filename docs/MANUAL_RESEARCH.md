# Providers for manual research

This file lists providers that get no adapter because their terms of service or
robots.txt forbid automated access (DECISIONS.md, D4). Angad researches these
by hand. Add a row when you find one; don't build around it.

| Provider | Site | What forbids it (quote the clause or robots rule) | Noted | Status |
|---|---|---|---|---|
| Wise | wise.com | US terms of use: "use any robot, spider, other automatic device, or manual process to monitor or copy our websites without our prior written permission". (robots.txt *allows* `*gateway*sourceCurrency=*`, but the terms win under D4.) | 2026-09-28 | Open. A partner API exists (Wise Platform Comparison API), but it needs credentials, and its figures for other providers are Wise's own estimates. |
| Remitly | remitly.com | User agreement: "use any robot, spider, scraper, automatic device, or manual process to monitor or copy our website or app". | 2026-09-28 | Open |

## Not yet checked

A plain request couldn't read these providers' terms on 2026-09-28, so they're
neither cleared nor blocked. Check them in a real browser before writing any adapter.

| Provider | What happened |
|---|---|
| Western Union | Terms page returned HTTP 403 (bot protection) |
| Ria | Terms page returned HTTP 403 |
| Xoom | User agreement loaded but had no automated-access clause in its text; PayPal's acceptable-use policy may carry one |
| MoneyGram, Xe, WorldRemit | Terms pages render with JavaScript; the plain request got no text |

robots.txt notes from the same day: MoneyGram asks for `Crawl-delay: 5`; Xoom disallows `/send/` and `/sendmoney`.
