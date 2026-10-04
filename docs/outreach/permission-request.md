# Permission request: pricing data

The request Angad sent from remitbridgesystemlabs@gmail.com to each Tier 1 provider
(D52). Log every send and every reply in the table
at the bottom, and record any written permission in DECISIONS.md before building
an adapter.

## What was sent

Sent 2026-09-28 from remitbridgesystemlabs@gmail.com, one email per provider. Most
got the standard version below. Wise's asked about its Comparison API instead,
Western Union's noted that its US terms are silent on automated access, and Xoom's
went to PayPal's media desk with a line saying so.

**Subject:** Question about showing {Provider} prices in a free comparison app

```
Hi {Provider} team,

My name is Angad Kochar, and I'm building RemitBridge, a free app that helps people in the US compare the cost of sending money to family abroad. We're starting with India, Mexico, the Philippines and Vietnam.

For each provider the app shows the fee and the exchange rate, then sorts the list by how much the recipient ends up with. There are no ads, affiliate links or paid placements, and the app never handles anyone's money.

I went through your terms of use and saw that automated access to your website isn't permitted, so I wanted to ask before doing anything. Would you be open to us checking {Provider}'s public quotes for those four countries on a light schedule? It would be a handful of amounts a few times a day, with our contact email in every request. If you already share a rate feed or API with comparison sites, we'd be glad to use that instead.

In the meantime, any {Provider} prices in the app will be ones someone looked up by hand on your public site, shown with the date and time they were checked.

If this should go to someone else on your team, I'd appreciate a pointer. Thanks for taking a look.

Best,
Angad Kochar
RemitBridge
remitbridgesystemlabs@gmail.com
```

Wise's third paragraph:

```
I saw in your documentation that Wise offers a Comparison API for sites like ours. Your terms don't allow automated access to the website, so an official source is what we'd prefer anyway. Is the API open to a small free project, and if so, what does the process look like?
```

Western Union's third paragraph opened: "Your US terms don't say much about automated
access, but some of your other terms prohibit it, so I wanted to ask before doing anything."

## Where to send

Use each provider's own published contact. Don't guess addresses. Checked 2026-09-28;
"page" means the address was read on the company's own site, "release" means it
appears as the media contact on the company's own press releases.

| Provider | Send to | Where it's published | Sent | Reply |
|---|---|---|---|---|
| Wise | comparison@wise.com | Wise Platform Comparison API docs (the address for comparison sites) | 2026-09-28 | **Replied 2026-09-30** (Simon Bruins, simon.bruins@wise.com): the current Comparison API documentation is correct and we can use it, "if you are a considerate user it shouldn't be a problem". Later API versions will require authentication, so keep up with the docs. He also suggested partnerwise@wise.com for API questions and their affiliate program; the affiliate part doesn't apply (we never use affiliate links). Angad said to go ahead (2026-09-30): the `wise` adapter now uses the API for Wise's own quote only (D91). A thank-you reply is still Angad's to send. |
| Remitly | press@remitly.com | page: news.remitly.com, Contact | 2026-09-28 | waiting |
| MoneyGram | media@moneygram.com | page: corporate.moneygram.com/contact, "Media inquiries" | 2026-09-28 | waiting |
| Western Union | media@westernunion.com | page: corporate.westernunion.com/media-contacts.html (our fetch was blocked; confirmed through search of that page) | 2026-09-28 | waiting |
| Xoom (PayPal) | mediarelations@paypal.com | page: newsroom.paypal-corp.com/contact, "General and U.S. local media inquiries" (no Xoom-specific contact exists) | 2026-09-28 | waiting (2026-09-28: the media desk's standard auto-reply, no answer yet) |
| WorldRemit (Zepz) | corpcomms@worldremit.com | page: zepz.io, press contact | 2026-09-28 | waiting |
| Ria (Euronet) | comms@riafinancial.com | release: Euronet's Ria press releases (e.g. the Sikhona acquisition) | 2026-09-28 | waiting |
| Paysend | press@paysend.com | release: "Media enquiries" on Paysend's own press release (paysend.com/news/rebrand-launch, read 2026-10-01); no partnerships address is published | 2026-10-01, by Claude at Angad's request | waiting. Its terms don't forbid reading the pages, so this one asks for a feed or endpoint instead: the public pages show one amount and one price for several ways of receiving (docs/MANUAL_RESEARCH.md). |
| Xe (Euronet) | Xe Help Centre request form (help.xe.com/hc/en-gb/requests/new); no press or partnerships email is published | Xe's contact page lists only chat (needs an account) and phone | 2026-09-28 | waiting (2026-09-28: request received, reference 26724746, no answer yet) |

Follow-ups sent 2026-10-04 at Angad's request (earlier than the 2026-10-12 reminder), by Claude from the RemitBridge Gmail, as replies in each original thread: Remitly, MoneyGram, Ria, WorldRemit, Xoom (PayPal media desk), Western Union, and Xe by replying to ticket #26724746 as its auto-reply asks. Each restates the ask (light-schedule checks or a feed/API), says prices are entered by hand until then, asks for a pointer, and signs as RemitBridge Labs, hello@remitbridgelabs.org. Paysend (asked 2026-10-01) not followed up yet. Next nudge: 2026-10-12 if still silent. Ria and Xe are both Euronet companies. If neither answers, one
follow-up to Euronet corporate communications covers both.
