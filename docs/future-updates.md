# Future updates

Features taken out of the first store release because we have no data behind them yet
(D190, Angad 2026-10-18: "Apple and Google want the full app, so get rid of features we
dont have data for"). Nothing here shows in the app today. Most come back by themselves:
Compare and onboarding offer a route or a way of receiving as soon as it has a published
price (`mobile/src/lib/availability.ts`), so no app update is needed for those.

## Ways of receiving

Each needs prices from at least one provider, by an adapter or Add a price. Once one is
published, the method appears on Compare for that route by itself. Add it back to the route's
list in `mobile/src/lib/routes.ts` too, so Remmy and the WhatsApp bot offer it.

- [ ] **UPI (India).** Wise and Instarem quote bank deposit only; the UPI providers (Remitly,
      Xoom, Western Union) forbid automation, so this starts with hand prices.
- [ ] **Mobile wallet (the Philippines: GCash, Maya; Kenya: M-Pesa).**
- [ ] **Debit card deposit (Mexico).**
- [ ] **Home delivery (Vietnam).**
- [ ] **Cash pickup on its own schedule.** Live today only from hand prices, which last 7
      days, so it comes and goes with each round of hand checks. An automated source would
      keep it on.

## Routes

- [ ] **Uganda.** Built (D158), but nothing published: its three rate sources disagree by
      2.6% (D166), so the gate rightly holds every quote. Needs a rule for thin currencies,
      or a better rate source. It appears as soon as a price publishes.
- [ ] **El Salvador and Ecuador** (both use US dollars, so there's no exchange rate to
      compare; a different kind of comparison, fees only).
- [ ] **Somalia, Eritrea, Cuba, Afghanistan, Venezuela** (PRD 6.4, special handling: sanctions,
      informal channels). People can already ask for these on the route board.

## Sending countries

- [ ] **Canada, the United Kingdom, the United Arab Emirates, Saudi Arabia, Australia**
      (PRD 6.5). Each needs its own adapters, rate sources and remittance rules.

## Learn

- [ ] **13 blog posts that are only a summary so far** (posts 16, 18 and 20 to 30, including
      the whole "Connecting it up" series). They show once `scripts/port-blog.mjs` brings
      their full text over from the website; the series toggle comes back with its first
      written post.

## Stores and languages

- [ ] **The App Store** (waits on Apple's organization conversion, D141).
- [ ] **15 Hindi rows** for the terms step and the legal checklist (D188, D189).
- [ ] **Spanish, Tagalog and Vietnamese reviews** (D69).

## RemitBridge 2.0 (Angad, 2026-10-18)

New features, not data gaps. More ideas are in `docs/roadmap-2.0.md`.

- [ ] **Stablecoin routes next to traditional providers.** Estimate the whole path from
      dollars paid to local currency received: buying a stablecoin such as USDC, the network
      fee, the exchange back and the cash-out fee, from live quotes. A routing step keeps only
      exchanges, networks and cash-out providers that actually work together, then ranks them
      with traditional providers by amount received. Show how long each takes, and flag
      changing network fees, limited withdrawal options and the risk of a stablecoin losing
      its peg. RemitBridge still never holds or moves money.
- [ ] **A personal remittance history.** Keep redacted receipts with the account and build a
      yearly report: total upfront fees and exchange-rate markups, measured against
      historical rates and provider prices, so families see the cost over a year and not
      one transfer at a time.
- [ ] **Wider reach.** More API partnerships with providers, more sending and receiving
      routes, and Arabic, Bengali and Portuguese, each reviewed by a fluent speaker.
