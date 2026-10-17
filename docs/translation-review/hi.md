# Hindi review sheet

The app's Hindi is Claude's draft (DECISIONS.md D69). Since 2026-10-10 it ships in the store
versions marked "Draft" (D151). The label comes off once a fluent Hindi speaker has read
every line below and agreed in writing; their name and the date then go in
`mobile/src/i18n/languages.ts`.

## For the reviewer

Thank you for reading this. Each row is one piece of text in the RemitBridge app: the
English on the left, the Hindi draft beside it. Please check that the Hindi:

- says the same thing as the English, nothing more or less;
- sounds natural to someone sending money home, in आप, in plain everyday Hindi;
- keeps the money words people already use: फ़ीस, मिड-मार्केट रेट, UPI.

Write any change in the last column. If a row is fine, leave it blank. Words in braces, like
`{pct}` or `{provider}`, are filled in by the app (a number, a name, a date). Keep them, and
move them wherever Hindi grammar wants them.

Money stays in US format in every language ($1,234.56, ₹47,102), so please don't change
numbers.

When you're done, send it back with a line saying you've read it all and agree it's ready,
with your name and the date.

| Key | English | Hindi draft | Your change (blank if fine) |
|---|---|---|---|
| common.greeting | undefined, {name}! | undefined, {name}! | |
| common.back | Back | वापस | |
| common.close | Close | बंद करें | |
| common.cancel | Cancel | रद्द करें | |
| common.delete | Delete | मिटाएँ | |
| common.notNow | Not now | अभी नहीं | |
| common.signIn | Sign in | साइन इन करें | |
| common.tryAgain | Try again | फिर से कोशिश करें | |
| common.search | Search | खोजें | |
| common.from | From | कहाँ से | |
| common.to | To | कहाँ | |
| common.theUS | the US | अमेरिका | |
| common.notConnected | Not connected. | सर्वर से जुड़ा नहीं है। | |
| common.stepOf | Step {step} of {of} | चरण {step} / {of} | | CHANGED 2026-10-10: from your notes, please read again
| common.noMailTitle | Email us | हमें ईमेल करें | |
| common.noMailBody | No email app on this phone. Write to {address}. | इस फ़ोन में ईमेल ऐप नहीं है। {address} पर लिखें। | | CHANGED 2026-10-11: shorter, please read again
| tabs.scan | Scan | स्कैन | |
| tabs.compare | Compare | तुलना | |
| tabs.tools | Tools | टूल | |
| tabs.learn | Learn | जानें | |
| tabs.account | Account | खाता | | CHANGED 2026-10-09: now the round button at the top right, not a tab
| tabs.whatsapp | WhatsApp | WhatsApp | | NEW 2026-10-09
| titles.scan | Scan a receipt | रसीद स्कैन करें | |
| titles.fairRate | Fair rate | सही रेट | |
| titles.scamCheck | Scam check | धोखाधड़ी जाँच | |
| titles.trueCost | TrueCost | TrueCost | |
| titles.yearlyCost | Yearly cost | सालाना लागत | |
| titles.rateHistory | Rate history | रेट का इतिहास | |
| titles.glossary | Glossary | शब्दकोश | |
| titles.blog | Blog | ब्लॉग | |
| titles.saved | Saved | सेव किए गए | | CHANGED 2026-10-10: from your notes, please read again
| titles.alert | Rate alert | रेट अलर्ट | |
| titles.remitbench | RemitBench | RemitBench | |
| titles.quote | Quote | कीमत | |
| titles.routeBoard | Route board | रूट बोर्ड | |
| titles.askForRoute | Ask for a route | नया रूट माँगें | |
| titles.observatory | What people paid | लोगों ने कितना चुकाया | |
| delivery.bank_deposit | Bank deposit | बैंक खाते में | |
| delivery.cash_pickup | Cash pickup | नकद पिकअप | |
| delivery.mobile_wallet | Mobile wallet | मोबाइल वॉलेट | |
| delivery.upi | UPI | UPI | |
| delivery.debit_card | Debit card | डेबिट कार्ड | |
| delivery.home_delivery | Home delivery | घर पर डिलीवरी | |
| payment.bank_account | Bank account | बैंक खाता | |
| payment.debit_card | Debit card | डेबिट कार्ड | |
| payment.credit_card | Credit card | क्रेडिट कार्ड | |
| payment.cash | Cash | नकद | |
| payment.money_order | Money order | मनी ऑर्डर | |
| payment.cashiers_check | Cashier’s check | कैशियर चेक | |
| time.justNow | just now | अभी | |
| time.minutesAgo | {n}m ago | {n} मिनट पहले | |
| time.hoursAgo | {n}h ago | {n} घंटे पहले | |
| time.daysAgo | {n}d ago | {n} दिन पहले | |
| time.checked | Checked {ago} | {ago} जाँचा गया | |
| language.title | Language | भाषा | |
| language.pick | Choose a language | भाषा चुनें | |
| language.draft | Draft | ड्राफ़्ट | |
| language.draftNote | Not yet checked by a fluent speaker. | अभी किसी जानकार ने नहीं जाँचा। | | CHANGED 2026-10-10: from your notes, please read again CHANGED 2026-10-11: shorter, please read again
| language.improve | Something reads wrong? Tell us | कुछ ठीक नहीं लग रहा? हमें बताएँ | |
| language.volunteerTitle | We need volunteers | हमें वॉलंटियर चाहिए | | NEW 2026-10-10
| language.volunteerBody | Speak one of our languages well? Help us check the drafts. | हमारी कोई भाषा अच्छी तरह जानते हैं? ड्राफ़्ट जाँचने में मदद करें। | | NEW 2026-10-10 CHANGED 2026-10-11: shorter, please read again
| onboarding.welcome.lead | Sending money home | घर पैसे भेजना | |
| onboarding.welcome.accent | shouldn’t cost this much | इतना महँगा नहीं होना चाहिए | |
| onboarding.welcome.intro | See what a transfer really costs, and who gives your family the most. | देखें कि ट्रांसफ़र असल में कितने का पड़ता है, और कौन आपके परिवार को सबसे ज़्यादा देता है। | | CHANGED 2026-10-11: shorter, please read again
| onboarding.welcome.getStarted | Get started | शुरू करें | |
| onboarding.welcome.haveAccount | I already have an account | मेरा खाता पहले से है | |
| onboarding.why.eyebrow | Why it matters | यह क्यों ज़रूरी है | |
| onboarding.why.heading | The world takes a cut of every dollar sent home. | घर भेजे गए हर डॉलर में से दुनिया अपना हिस्सा काट लेती है। | |
| onboarding.why.flowsLabel | Sent home each year | हर साल घर भेजे जाते हैं | |
| onboarding.why.flowsNote | From workers abroad to their families. | विदेश में काम करने वालों से उनके परिवारों तक। | | CHANGED 2026-10-11: shorter, please read again
| onboarding.why.costLabel | Average cost to send | भेजने की औसत लागत | |
| onboarding.why.costNote | Global average on $200. | $200 पर दुनिया का औसत। | | CHANGED 2026-10-11: shorter, please read again
| onboarding.why.targetLabel | What it should be | लागत इतनी होनी चाहिए | | CHANGED 2026-10-10: from your notes, please read again
| onboarding.why.targetNote | The UN goal for 2030. | 2030 के लिए संयुक्त राष्ट्र का लक्ष्य। | | CHANGED 2026-10-11: shorter, please read again
| onboarding.why.sources | Sources: {list}. | स्रोत: {list}। | |
| onboarding.why.continue | Continue | आगे बढ़ें | |
| onboarding.route.eyebrow | Your route | आपका रूट | |
| onboarding.route.lead | Where do you | आप किस देश में | | CHANGED 2026-10-10: from your notes, please read again
| onboarding.route.accent | send money? | पैसे भेजते हैं? | | CHANGED 2026-10-10: from your notes, please read again
| onboarding.route.intro | You can change it anytime. | इसे कभी भी बदल सकते हैं। | | CHANGED 2026-10-11: shorter, please read again
| onboarding.route.paidIn | {country}. Paid out in {currency} | {country}। भुगतान {currency} में | |
| onboarding.route.elsewhere | Somewhere else? Ask for it on Compare. | कहीं और भेजते हैं? तुलना में उसे माँगें। | | CHANGED 2026-10-11: shorter, please read again
| signIn.titleOnboarding | Want to save your checks? | अपनी जाँचें सँभालकर रखना चाहेंगे? | | CHANGED 2026-10-07: please read again
| signIn.bodyOnboarding | Keep your checks for next time. Comparing works without one. | अपनी जाँचें अगली बार के लिए रखें। तुलना बिना खाते के भी होती है। | | CHANGED 2026-10-07: please read again CHANGED 2026-10-11: shorter, please read again
| signIn.titleAccount | Sign in | साइन इन करें | | CHANGED 2026-10-07: please read again
| signIn.bodyAccount | Keep your checks for next time. Delete them anytime. | अपनी जाँचें अगली बार के लिए रखें। जब चाहें मिटा दें। | | CHANGED 2026-10-07: please read again CHANGED 2026-10-11: shorter, please read again
| signIn.google | Continue with Google | Google से जारी रखें | |
| signIn.email | Continue with email | ईमेल से जारी रखें | |
| signIn.skip | Not now | अभी नहीं | | CHANGED 2026-10-07: please read again
| signIn.newsletterOptIn | Email me updates now and then | मुझे कभी-कभी ईमेल पर अपडेट भेजें | | NEW 2026-10-12: please read
| signIn.birthYear | Year you were born | आपके जन्म का साल | | NEW 2026-10-12
| signIn.continue | Continue | आगे बढ़ें | | NEW 2026-10-12
| signIn.tooYoung | Accounts are for people 13 and older. Comparing prices works without one. | खाता 13 साल या उससे ज़्यादा उम्र वालों के लिए है। दाम की तुलना बिना खाते के भी होती है। | | NEW 2026-10-12
| signIn.emailTitle | Your email | आपका ईमेल | |
| signIn.emailIntro | We’ll send a 6-digit code. | हम 6 अंकों का कोड भेजेंगे। | |
| signIn.emailLabel | Email address | ईमेल पता | |
| signIn.sendCode | Send code | कोड भेजें | |
| signIn.codeTitle | Enter the code | कोड डालें | |
| signIn.sentTo | Sent to {email} | {email} पर भेजा गया | |
| signIn.codeLabel | 6-digit code | 6 अंकों का कोड | |
| signIn.resendIn | Resend in {s}s | {s} सेकंड में फिर भेजें | |
| signIn.resend | Resend code | कोड फिर भेजें | |
| signIn.errors.notReady | This option isn’t ready yet. Try another. | यह तरीका अभी तैयार नहीं है। दूसरा आज़माएँ। | | CHANGED 2026-10-11: shorter, please read again
| signIn.errors.notOpen | Email sign-in isn’t open yet. Try another. | ईमेल से साइन इन अभी शुरू नहीं हुआ। दूसरा तरीका आज़माएँ। | | CHANGED 2026-10-11: shorter, please read again
| signIn.errors.rateLimit | Too many tries. Wait a minute. | बहुत बार कोशिश हुई। एक मिनट रुकें। | | CHANGED 2026-10-11: shorter, please read again
| signIn.errors.badCode | Wrong code. Try again or get a new one. | कोड गलत है। फिर कोशिश करें या नया मँगाएँ। | | CHANGED 2026-10-11: shorter, please read again
| signIn.errors.offline | No connection. Try again. | इंटरनेट नहीं है। फिर कोशिश करें। | | CHANGED 2026-10-11: shorter, please read again
| signIn.errors.notConnected | Not connected. | सर्वर से जुड़ा नहीं है। | |
| signIn.errors.generic | Something went wrong. Try again. | कुछ गड़बड़ हो गई। फिर से कोशिश करें। | |
| select.searchLabel | Search: {title} | खोजें: {title} | |
| select.nothingMatches | Nothing matches “{q}”. | “{q}” से कुछ नहीं मिला। | |
| select.notYet | Not yet | अभी नहीं | |
| select.notCovered | not covered yet | अभी उपलब्ध नहीं | |
| select.comingSoon | Coming soon | जल्द आ रहा है | |
| select.change | {label}: {value}. Change | {label}: {value}। बदलें | |
| compare.title | Compare | तुलना | |
| compare.sendFrom | Send from | कहाँ से भेजें | |
| compare.sendTo | Send to | कहाँ भेजें | |
| compare.youSend | You send | आप भेजते हैं | |
| compare.amountLabel | Amount you send, in US dollars | भेजी जाने वाली रकम, अमेरिकी डॉलर में | |
| compare.enterAmount | Enter an amount. | रकम लिखें। | |
| compare.limits[1] | Agent fees charged in person | एजेंट की ओर से आमने-सामने ली जाने वाली फ़ीस | |
| compare.limits[2] | Taxes where the money arrives | जहाँ पैसा पहुँचता है वहाँ के टैक्स | |
| compare.limits[3] | Rate moves since the last check | पिछली जाँच के बाद रेट में बदलाव | |
| compare.limits[4] | Exact fees between checked amounts | जाँची गई रकमों के बीच की सही फ़ीस | |
| compare.notConnectedTitle | Not connected | जुड़ा नहीं है | |
| compare.notConnectedBody | Set the Supabase env in mobile/.env.local. | mobile/.env.local में Supabase की सेटिंग डालें। | |
| compare.errorTitle | Prices didn’t load | कीमतें लोड नहीं हुईं | |
| compare.errorBody | Check your connection and try again. | अपना कनेक्शन जाँचकर फिर कोशिश करें। | |
| compare.noPricesTitle | No checked prices yet | अभी जाँची हुई कीमतें नहीं हैं | |
| compare.noPricesBody | This route is being set up. | यह रूट अभी तैयार हो रहा है। | | CHANGED 2026-10-11: shorter, please read again
| compare.whereRoutesStand | See where each route stands | हर रूट की स्थिति देखें | |
| compare.offlineTitle | You’re offline | आप ऑफ़लाइन हैं | |
| compare.offlineBody | Prices from your last visit, {ago}. | आपकी पिछली विज़िट की कीमतें, {ago}। | | CHANGED 2026-10-11: shorter, please read again
| compare.offlineNothing | You’re offline, and nothing is saved for this yet. | आप ऑफ़लाइन हैं, और इसके लिए अभी कुछ सेव नहीं है। | | CHANGED 2026-10-10: सहेज → सेव, as you asked CHANGED 2026-10-11: shorter, please read again
| compare.summary | {low} to {high} arrives, depending on the provider. | कंपनी के हिसाब से {low} से {high} तक पहुँचते हैं। | |
| compare.mostToFamily | Most to your family | परिवार को सबसे ज़्यादा पैसे | | CHANGED 2026-10-10: from your notes, please read again
| compare.promotion | Promotion | ऑफ़र | |
| compare.firstTransferOffers | First-transfer offers | पहली बार भेजने के ऑफ़र | |
| compare.olderPrices | Older prices | पुरानी कीमतें | | NEW 2026-10-07: please read
| compare.olderNote | Checked over 2 days ago. Confirm with the provider. | 2 दिन से ज़्यादा पहले जाँची गईं। कंपनी से पक्का कर लें। | | NEW 2026-10-07: please read CHANGED 2026-10-11: shorter, please read again
| compare.save | Save this comparison | यह तुलना सेव करें | | CHANGED 2026-10-10: सहेज → सेव, as you asked
| compare.saved | Saved. See your saved list | सेव हो गई। अपनी सूची देखें | | CHANGED 2026-10-10: सहेज → सेव, as you asked
| compare.alreadySaved | Already saved. See your saved list | पहले से सेव है। अपनी सूची देखें | | CHANGED 2026-10-10: सहेज → सेव, as you asked
| compare.saveFailed | Couldn’t save. Try again | सेव नहीं हो सकी। फिर कोशिश करें | | CHANGED 2026-10-10: सहेज → सेव, as you asked
| compare.savedSpoken | Saved to your account. | आपके खाते में सेव हो गई। | | CHANGED 2026-10-10: सहेज → सेव, as you asked
| compare.alreadySpoken | Already saved. | पहले से सेव है। | | CHANGED 2026-10-10: सहेज → सेव, as you asked
| compare.signInToSaveTitle | Sign in to save comparisons | तुलनाएँ सेव करने के लिए साइन इन करें | | CHANGED 2026-10-10: सहेज → सेव, as you asked
| compare.signInToSaveBody | Open them in one tap, on any phone. | किसी भी फ़ोन पर एक टैप में खोलें। | | CHANGED 2026-10-10: सहेज → सेव, as you asked CHANGED 2026-10-11: shorter, please read again
| quote.arrives | arrives | पहुँचेंगे | |
| quote.cost | cost | लागत | |
| quote.sources.scraper | Public calculator | सार्वजनिक कैलकुलेटर | |
| quote.sources.api | Official API | आधिकारिक API | |
| quote.sources.manual | Checked by hand | हाथ से जाँचा गया | |
| quote.sources.partner | Partner | साथी संस्था | |
| quote.stale | Stale | पुरानी | |
| quote.estimatedFrom | Estimated from the {amount} check | {amount} की जाँच से अनुमान | |
| quote.arrived | Arrived | पहुँचे | |
| quote.fee | Fee | फ़ीस | |
| quote.markup | Markup | मार्कअप | |
| quote.pickup | Pickup | पिकअप | |
| quote.whereMoneyWent | Where the money went: {parts} | पैसा कहाँ गया: {parts} | |
| quote.spokenArrive | {amount} arrive, {pct} percent total cost | {amount} पहुँचेंगे, कुल लागत {pct} प्रतिशत | |
| quote.spokenFreshness | Stale. {checked}. Source: {source}. Mid-market rate from {mid}. | पुरानी कीमत। {checked}। स्रोत: {source}। मिड-मार्केट रेट {mid} से। | |
| quote.opensDetail | Opens the full breakdown | पूरा हिसाब खोलता है | |
| quoteDetail.heading | {amount} to {country} · {method} | {country} के लिए {amount} · {method} | |
| quoteDetail.totalLine | arrives · {cost} total cost ({pct}) | पहुँचेंगे · कुल लागत {cost} ({pct}) | |
| quoteDetail.estimatedFull | Estimated from the {amount} price. | {amount} की कीमत से अनुमान। | | CHANGED 2026-10-11: shorter, please read again
| quoteDetail.promo | First-transfer offer. Later ones usually cost more. | पहले ट्रांसफ़र का ऑफ़र। बाद वाले आमतौर पर महँगे होते हैं। | | CHANGED 2026-10-11: shorter, please read again
| quoteDetail.whereMoneyGoes | Where the money goes | पैसा कहाँ जाता है | |
| quoteDetail.upfrontFee | Upfront fee | भेजने की फ़ीस | | CHANGED 2026-10-10: from your notes, please read again
| quoteDetail.markup | Exchange-rate markup | एक्सचेंज रेट में मार्कअप | |
| quoteDetail.rateNote | Their rate {theirs} vs. mid-market {mid} {pair} | उनका रेट {theirs}, मिड-मार्केट {mid} {pair} | |
| quoteDetail.betterThanMid | Better than the daily mid-market rate. | रोज़ के मिड-मार्केट रेट से बेहतर। | | CHANGED 2026-10-11: shorter, please read again
| quoteDetail.pickupCharge | Pickup charge | पिकअप शुल्क | |
| quoteDetail.pickupNote | Charged where the money is collected | पैसा लेने की जगह पर लिया जाता है | |
| quoteDetail.totalCost | Total cost | कुल लागत | |
| quoteDetail.withinTarget | Within the UN’s {pct}% target for 2030 | संयुक्त राष्ट्र के 2030 के {pct}% लक्ष्य के अंदर | |
| quoteDetail.overTarget | Over the UN’s {pct}% target for 2030 | संयुक्त राष्ट्र के 2030 के {pct}% लक्ष्य से ज़्यादा | |
| quoteDetail.whatsMarkup | What’s an exchange-rate markup? | एक्सचेंज रेट में मार्कअप क्या होता है? | |
| quoteDetail.delivery | Delivery | डिलीवरी | |
| quoteDetail.arrivesIn | Arrives | पहुँचने का समय | |
| quoteDetail.notStated | Not stated | नहीं बताया गया | |
| quoteDetail.howArrives | How it arrives | कैसे पहुँचता है | |
| quoteDetail.howPay | How you pay | आप कैसे भुगतान करते हैं | |
| quoteDetail.midFrom | Mid-market rate from | मिड-मार्केट रेट का स्रोत | |
| quoteDetail.recent | Recent prices | हाल की कीमतें | |
| quoteDetail.arrivingFrom | {currency} arriving from {amount} | {amount} भेजने पर पहुँचने वाले {currency} | |
| quoteDetail.oneCheck | One check of {provider} so far. | {provider} की अब तक एक ही जाँच। | | CHANGED 2026-10-11: shorter, please read again
| quoteDetail.recentFailed | Recent prices didn’t load. | हाल की कीमतें लोड नहीं हुईं। | |
| quoteDetail.isFair | Is this rate fair? | क्या यह रेट सही है? | |
| quoteDetail.isFairSub | See what the mid-market rate would give you | देखें कि मिड-मार्केट रेट पर कितना मिलता | |
| quoteDetail.looksWrong | This price looks wrong | यह कीमत गलत लग रही है | |
| quoteDetail.looksWrongSub | Tell us, and we’ll check it again | हमें बताएँ, हम इसे फिर जाँचेंगे | |
| quoteDetail.limits[1] | If it’s available where you live | क्या यह आपके इलाके में मिलता है | | CHANGED 2026-10-11: shorter, please read again
| quoteDetail.limits[2] | Card fees, if you pay by card | कार्ड से भरने पर उसकी फ़ीस | | CHANGED 2026-10-11: shorter, please read again
| quoteDetail.limits[3] | Prices at other amounts | दूसरी रकमों पर कीमत | | CHANGED 2026-10-11: shorter, please read again
| quoteDetail.limits[4] | Rate changes before you send | भेजने से पहले रेट में बदलाव | | CHANGED 2026-10-11: shorter, please read again
| quoteDetail.loadFailed | This price didn’t load. Try again. | यह कीमत लोड नहीं हुई। फिर कोशिश करें। | | CHANGED 2026-10-11: shorter, please read again
| quoteDetail.gone | This price is no longer published. | यह कीमत अब प्रकाशित नहीं है। | |
| request.eyebrow | Not covered yet | अभी उपलब्ध नहीं | |
| request.lead | {from} to {to} | {from} से {to} | |
| request.accent | isn’t a route we check yet. | का रूट हम अभी नहीं जाँचते। | |
| request.lede | Requests decide which routes we add next. | अगला कौन-सा रूट जुड़ेगा, यह माँगों से तय होता है। | | CHANGED 2026-10-11: shorter, please read again
| request.nobody | Nobody has asked for it yet. | अभी तक किसी ने यह नहीं माँगा है। | |
| request.asked | {n} people have asked for it. | {n} लोगों ने यह माँगा है। | |
| request.howArrive | How should the money arrive? | पैसा कैसे पहुँचना चाहिए? | |
| request.anyWay | Any way | किसी भी तरह | |
| request.bank | Bank | बैंक | |
| request.cashPickup | Cash pickup | नकद पिकअप | |
| request.wallet | Wallet | वॉलेट | |
| request.emailMe | Email me when it’s live (optional) | शुरू होने पर मुझे ईमेल करें (ज़रूरी नहीं) | |
| request.emailLabel | Email address, optional | ईमेल पता, ज़रूरी नहीं | |
| request.emailHelp | One email at launch. Then we delete it. | शुरू होने पर एक ईमेल। फिर पता मिटा देंगे। | | CHANGED 2026-10-11: shorter, please read again
| request.emailBad | That doesn’t look like an email address. | यह ईमेल पता सही नहीं लग रहा। | |
| request.failed | That didn’t go through. Try again. | यह नहीं हो पाया। फिर कोशिश करें। | | CHANGED 2026-10-11: shorter, please read again
| request.ask | Ask for this route | यह रूट माँगें | |
| request.counted | Thanks. Your request is counted. | धन्यवाद। आपकी माँग गिन ली गई है। | |
| request.already | You’ve asked for this route already. It’s counted. | आप यह रूट पहले ही माँग चुके हैं। वह गिनी जा चुकी है। | |
| request.willEmail | We’ll email you once when it’s live. | शुरू होने पर हम आपको एक बार ईमेल करेंगे। | |
| request.seeAll | See every requested route | माँगे गए सभी रूट देखें | |
| request.alreadyChecked | We already check this route. | यह रूट हम पहले से जाँचते हैं। | |
| request.compareIt | Compare it | तुलना करें | |
| board.lede | Routes we check, and routes people asked for. | जिन रूट की हम जाँच करते हैं, और जो लोगों ने माँगे हैं। | | CHANGED 2026-10-11: shorter, please read again
| board.failed | The board didn’t load. Pull down to try again. | बोर्ड लोड नहीं हुआ। फिर कोशिश करने के लिए नीचे खींचें। | |
| board.countsFailed | Request counts didn’t load. | माँगों की गिनती लोड नहीं हुई। | | CHANGED 2026-10-11: shorter, please read again
| board.stages.live.title | Live | उपलब्ध | | CHANGED 2026-10-10: from your notes, please read again
| board.stages.live.about | Prices checked and published. | कीमतें जाँचकर प्रकाशित की गईं। | |
| board.stages.building.title | Being built | तैयार हो रहा है | |
| board.stages.building.about | We’re setting up price checks. | हम कीमतों की जाँच तैयार कर रहे हैं। | |
| board.stages.under_review.title | Under review | विचार चल रहा है | |
| board.stages.under_review.about | We’re checking whether we can cover it. | हम देख रहे हैं कि क्या हम इसे जोड़ सकते हैं। | |
| board.stages.requested.title | Requested | माँगा गया | |
| board.stages.requested.about | Asked for by people using RemitBridge. | RemitBridge इस्तेमाल करने वालों ने इसे माँगा है। | |
| board.stages.not_feasible.title | Not feasible | संभव नहीं | |
| board.stages.not_feasible.about | We looked, and can’t cover it for now. | हमने देखा, और अभी हम इसे नहीं जोड़ सकते। | |
| board.noRequests | No requests yet. | अभी कोई माँग नहीं। | | CHANGED 2026-10-11: shorter, please read again
| board.fromCountry | From {country} | {country} से | |
| board.requests | {n} requests | {n} माँगें | |
| board.opensCompare | Opens Compare on this route | इस रूट पर तुलना खोलता है | |
| board.ask | Ask for a route | नया रूट माँगें | |
| account.yourName | Your name | आपका नाम | |
| account.namePlaceholder | What should we call you? | हम आपको क्या कहें? | |
| account.nameSaved | Name saved. | नाम सेव हो गया। | | CHANGED 2026-10-10: सहेज → सेव, as you asked
| account.title | Account | खाता | |
| account.signedInApple | Signed in with Apple | Apple से साइन इन किया गया | |
| account.optional | Optional. Keeps what you save on any phone. | ज़रूरी नहीं। आपकी सेव की हुई चीज़ें हर फ़ोन पर रहती हैं। | | CHANGED 2026-10-10: सहेज → सेव, as you asked CHANGED 2026-10-11: shorter, please read again
| account.createOrSignIn | Create account or sign in | खाता बनाएँ या साइन इन करें | |
| account.signOut | Sign out | साइन आउट करें | |
| account.deleteAccount | Delete account | खाता मिटाएँ | |
| account.deleteTitle | Delete your account? | क्या आप अपना खाता मिटाना चाहते हैं? | |
| account.deleteBody | Your saved comparisons and receipts go with it. | आपकी सेव की हुई तुलनाएँ और रसीदें भी इसके साथ मिट जाएँगी। | | CHANGED 2026-10-10: सहेज → सेव, as you asked
| account.deleteFailedTitle | Couldn’t delete your account | आपका खाता नहीं मिटाया जा सका | |
| account.deleteFailedBody | Try again in a moment. | थोड़ी देर बाद फिर कोशिश करें। | |
| account.about | About | जानकारी | |
| account.routeBoard | Route board | रूट बोर्ड | |
| account.routeBoardSub | Routes we check, and ones people want | हम कौन से रूट जाँचते हैं, और लोग कौन से चाहते हैं | |
| account.privacy | Privacy policy | निजता नीति | |
| account.privacySub | What we keep, and what we never do | हम क्या रखते हैं, और क्या कभी नहीं करते | |
| account.support | Support | मदद | |
| account.supportSub | Questions, and how to reach us | सवाल, और हमसे संपर्क कैसे करें | |
| account.terms | Terms of use | इस्तेमाल की शर्तें | |
| account.termsSub | The rules for using RemitBridge | RemitBridge इस्तेमाल करने के नियम | |
| account.copyright | © 2026 {name}, a Washington nonprofit corporation | © 2026 {name}, वॉशिंगटन का एक गैर-लाभकारी निगम | |
| account.admin | Admin | एडमिन | |
| account.addPrice | Add a price | कीमत जोड़ें | |
| account.addPriceSub | Enter a price read from a provider’s site | किसी कंपनी की साइट पर देखी कीमत दर्ज करें | |
| account.metrics | Metrics | आँकड़े | |
| account.metricsSub | Usage, funnel and impact, with definitions | इस्तेमाल, फ़नल और असर, परिभाषाओं के साथ | |
| account.suggestions | Suggestions | सुझाव | | NEW 2026-10-12 (admin only)
| account.suggestionsSub | What people asked for on WhatsApp | WhatsApp पर लोगों ने क्या माँगा | | NEW 2026-10-12 (admin only)
| account.newsletter | Newsletter | न्यूज़लेटर | | NEW 2026-10-12, approved by the reviewer the same day
| account.newsletterSub | New countries and price news by email, now and then. | नए देशों और कीमतों की खबर, कभी-कभी ईमेल पर। | | NEW 2026-10-12, approved by the reviewer the same day
| account.newsletterOn | Newsletter on. | न्यूज़लेटर चालू। | | NEW 2026-10-12, approved by the reviewer the same day
| account.newsletterOff | Newsletter off. | न्यूज़लेटर बंद। | | NEW 2026-10-12, approved by the reviewer the same day
| account.writeNewsletter | Write a newsletter | न्यूज़लेटर लिखें | | NEW 2026-10-12, approved by the reviewer the same day (admin only)
| account.writeNewsletterSub | To everyone who turned it on | उन सबको जिन्होंने इसे चालू किया | | NEW 2026-10-12, approved by the reviewer the same day (admin only)
| account.replay | Replay onboarding (dev only) | शुरुआत फिर से देखें (सिर्फ़ डेवलपमेंट में) | |
| saved.rowSub | Comparisons and receipt checks | तुलनाएँ और रसीद जाँचें | |
| saved.signedOut | Sign in to keep comparisons and receipts. | तुलनाएँ और रसीदें रखने के लिए साइन इन करें। | | CHANGED 2026-10-10: सहेज → सेव, as you asked CHANGED 2026-10-11: shorter, please read again
| saved.seeAll | Your saved comparisons | आपकी सेव की हुई तुलनाएँ | | CHANGED 2026-10-10: सहेज → सेव, as you asked
| saved.comparisons | Your comparisons | आपकी तुलनाएँ | |
| saved.comparisonsEmpty | Save one on Compare to see it here. | तुलना में एक सेव करें, वह यहाँ दिखेगी। | | CHANGED 2026-10-10: सहेज → सेव, as you asked CHANGED 2026-10-11: shorter, please read again
| saved.comparePrices | Compare prices | कीमतों की तुलना करें | |
| saved.opensToday | Opens Compare with today’s prices | आज की कीमतों के साथ तुलना खोलता है | |
| saved.deleteNamed | Delete {name} | {name} मिटाएँ | |
| saved.deleteComparisonTitle | Delete this comparison? | क्या यह तुलना मिटानी है? | |
| saved.comparisonDeleted | Comparison deleted. | तुलना मिटा दी गई। | |
| saved.amountTo | {amount} to {country} | {country} के लिए {amount} | |
| saved.checks | Your checks | आपकी जाँचें | |
| saved.checksEmpty | Receipts you save show up here. | सेव की गई रसीदें यहाँ दिखती हैं। | | CHANGED 2026-10-10: सहेज → सेव, as you asked CHANGED 2026-10-11: shorter, please read again
| saved.checkReceipt | Check a receipt | रसीद जाँचें | |
| saved.deleteCheckTitle | Delete this check? | क्या यह जाँच मिटानी है? | |
| saved.checkDeleted | Check deleted. | जाँच मिटा दी गई। | |
| saved.offersDelete | Offers to delete this check | यह जाँच मिटाने का विकल्प देता है | |
| saved.checkTitle | {provider} · {amount} to {currency} | {provider} · {amount}, {currency} में | |
| tools.title | Tools | टूल | |
| tools.before | Before you send | भेजने से पहले | |
| tools.after | After you send | भेजने के बाद | |
| tools.rates | Rates | रेट | |
| tools.fairRateSub | Is your rate fair? | क्या आपका रेट सही है? | |
| tools.scamCheckSub | Before you pay a stranger | किसी अजनबी को भेजने से पहले | |
| tools.trueCostSub | Check a receipt by hand | रसीद खुद भरकर जाँचें | |
| tools.yearlyCostSub | A year of sending | साल भर का खर्च | |
| tools.rateHistorySub | The rate, day by day | रेट, दिन-ब-दिन | |
| learn.title | Learn | जानें | |
| learn.library | Library | लाइब्रेरी | |
| learn.modulesTitle | Modules | मॉड्यूल | |
| learn.terms | {n} terms | {n} शब्द | |
| learn.tryIt | Try it: {tool} | आज़माएँ: {tool} | |
| learn.modules.basics.title | The basics | बुनियादी बातें | |
| learn.modules.basics.line | Who sends, who receives, and who’s in between | कौन भेजता है, किसे मिलता है, और बीच में कौन है | |
| learn.modules.cost.title | What a transfer really costs | ट्रांसफ़र का असली खर्च | |
| learn.modules.cost.line | The fee, the rate, and the markup hidden in it | फ़ीस, रेट, और उसमें छिपा मार्कअप | |
| learn.modules.arrival.title | How money arrives | पैसा कैसे पहुँचता है | |
| learn.modules.arrival.line | Bank, cash pickup, or a phone wallet | बैंक, नकद पिकअप, या फ़ोन वॉलेट | |
| learn.modules.safety.title | Staying safe | सुरक्षित रहें | |
| learn.modules.safety.line | Scams, ID checks, and why some transfers stop | धोखाधड़ी, पहचान की जाँच, और कुछ ट्रांसफ़र क्यों रुकते हैं | |
| learn.modules.bigger.title | Why remittances matter | घर पैसा भेजना क्यों मायने रखता है | |
| learn.modules.bigger.line | What money sent home does for families | घर भेजा पैसा परिवारों के लिए क्या करता है | |
| learn.modules.banks.title | How money moves between banks | बैंकों के बीच पैसा कैसे चलता है | |
| learn.modules.banks.line | The networks a transfer travels on | वे नेटवर्क जिन पर ट्रांसफ़र चलता है | |
| learn.modules.provider.title | Inside a provider | एक कंपनी के अंदर | |
| learn.modules.provider.line | How a transfer company runs | पैसे भेजने वाली कंपनी कैसे चलती है | |
| learn.modules.crypto.title | Crypto and stablecoins | क्रिप्टो और स्टेबलकॉइन | |
| learn.modules.crypto.line | Words you’ll meet if you send with crypto | क्रिप्टो से भेजने पर मिलने वाले शब्द | |
| learn.progress | {n} of {total} terms learned | {total} में से {n} शब्द सीखे | |
| learn.continue | Continue | जारी रखें | |
| learn.start | Start | शुरू करें | |
| learn.allDone | You’ve learned every term. | आपने सारे शब्द सीख लिए हैं। | |
| learn.moduleCount | {n} of {total} | {total} में से {n} | |
| learn.moduleDone | Module complete | मॉड्यूल पूरा हुआ | |
| learn.nextModule | Next: {title} | अगला: {title} | |
| learn.nodeLabel | Module {n}: {title}. {read} of {total} learned. | मॉड्यूल {n}: {title}। {total} में से {read} सीखे। | |
| learn.moduleN | Module {n} | मॉड्यूल {n} | | NEW 2026-10-10
| learn.learned | Learned | सीख लिया | |
| learn.upNext | Up next | आगे | |
| learn.howItWorks | How it works | यह कैसे काम करता है | |
| learn.feeMarkup | Fee + hidden markup | फ़ीस + छिपा मार्कअप | |
| learn.feeMarkupBody | The fee, plus what’s hidden in the rate. | फ़ीस, और रेट में छिपा खर्च। | |
| learn.checkedOnly | Checked prices only | सिर्फ़ जाँची हुई कीमतें | |
| learn.checkedOnlyBody | Every price passes our checks, or it isn’t shown. | हर कीमत हमारी जाँच से गुज़रती है, वरना दिखती नहीं। | | CHANGED 2026-10-11: shorter, please read again
| learn.noAffiliate | No affiliate deals | किसी कंपनी से कोई सौदा नहीं | |
| learn.noAffiliateBody | Nobody pays to rank. We never touch your money. | ऊपर दिखने के लिए कोई पैसे नहीं देता। हम आपके पैसे को कभी हाथ नहीं लगाते। | |
| learn.wrongPrice | Wrong price? | कीमत गलत है? | |
| learn.deeper | Go deeper | और गहराई से | |
| learn.glossarySub | {n} terms, in plain English | {n} शब्दों के मतलब, आसान भाषा में | | CHANGED 2026-10-10: from your notes, please read again
| learn.routeBoardSub | Routes we check, and ones people want | हम कौन से रूट जाँचते हैं, और लोग कौन से चाहते हैं | |
| learn.remitbenchSub | Our research testbed, still being built | हमारा रिसर्च टेस्टबेड, अभी बन रहा है | |
| learn.observatorySub | Early results from receipts people shared | लोगों की साझा की गई रसीदों से शुरुआती नतीजे | |
| learn.website | On the website | वेबसाइट पर | |
| learn.blog | Blog | ब्लॉग | |
| learn.blogSub | Stories and explainers | कहानियाँ और समझाने वाले लेख | |
| learn.latestPost | Latest post | नई पोस्ट | | REMOVED 2026-10-12: replaced by learn.startHere, no need to read
| learn.allPosts | All posts | सभी पोस्ट | | NEW 2026-10-10
| learn.assignmentTitle | Now put it to use | अब इसे काम में लाएँ | | NEW 2026-10-11
| learn.assignmentBody | Read a post that uses the words you just learned. | एक पोस्ट पढ़ें जिसमें आपके अभी सीखे शब्द हैं। | | NEW 2026-10-11
| learn.usesWords | Uses 1 word you know / Uses {n} words you know | आपका जाना 1 शब्द इसमें है / आपके जाने {n} शब्द इसमें हैं | | NEW 2026-10-11
| learn.papers | Research papers | रिसर्च पेपर | |
| learn.papersSub | The lab’s published work | लैब का प्रकाशित काम | |
| learn.workshops | Workshops | वर्कशॉप | |
| learn.workshopsSub | Sessions for communities and schools | समुदायों और स्कूलों के लिए सत्र | |
| learn.opensWebsite | Opens on the website | वेबसाइट पर खुलता है | |
| learn.lesson.start | Start lesson: {n} new words | पाठ शुरू करें: {n} नए शब्द | |
| learn.lesson.practice | Practice these words | इन शब्दों का अभ्यास करें | |
| learn.lesson.close | Close the lesson | पाठ बंद करें | |
| learn.lesson.newWord | New word | नया शब्द | |
| learn.lesson.gotIt | Got it | ठीक है | |
| learn.lesson.whichWord | Which word means this? | यह किस शब्द का मतलब है? | |
| learn.lesson.whatMeans | What does “{term}” mean? | “{term}” का मतलब क्या है? | |
| learn.lesson.again | One more try | एक और कोशिश | |
| learn.lesson.right[1] | Nice! | बहुत बढ़िया! | |
| learn.lesson.right[2] | Exactly right. | बिलकुल सही! | |
| learn.lesson.right[3] | You got it. | सही जवाब! | |
| learn.lesson.right[4] | Spot on. | शाबाश! | |
| learn.lesson.wrong | Not quite. | पूरी तरह सही नहीं। | |
| learn.lesson.answerWas | The answer: {answer} | सही जवाब: {answer} | |
| learn.lesson.continue | Continue | आगे बढ़ें | |
| learn.lesson.inARow | {n} in a row | लगातार {n} सही | |
| learn.lesson.xp | +{n} XP | +{n} XP | |
| learn.lesson.done | Lesson complete! | पाठ पूरा हुआ! | |
| learn.lesson.practiceDone | Practice complete! | अभ्यास पूरा हुआ! | |
| learn.lesson.xpLabel | XP earned | कमाए गए XP | | CHANGED 2026-10-10: from your notes, please read again
| learn.lesson.accuracyLabel | Accuracy | सटीकता | |
| learn.lesson.streakLabel | Day streak | लगातार दिन | |
| learn.lesson.streakDays | {n} days | {n} दिन | |
| learn.lesson.wordsLearned | You learned {n} words. | आपने {n} शब्द सीखे। | |
| learn.lesson.progressLabel | Step {n} of {total} | चरण {n} / {total} | |
| learn.lesson.words | Words in this module | इस मॉड्यूल के शब्द | |
| learn.lesson.lookUp | {term}. Look it up in the glossary. | {term}. शब्दकोश में देखें। | |
| learn.lesson.streakLine | {days}-day streak · {xp} XP | लगातार {days} दिन · {xp} XP | |
| whatsapp.title | WhatsApp | WhatsApp | |
| whatsapp.chat | Chat on WhatsApp | WhatsApp पर बात करें | |
| whatsapp.hello | Hi | नमस्ते | |
| whatsapp.openFailed | Couldn't open WhatsApp. Message {number} on WhatsApp instead. | WhatsApp नहीं खुल सका। WhatsApp पर {number} को मैसेज करें। | | NEW 2026-10-12
| whatsapp.link | Link to your account | अपने खाते से जोड़ें | | CHANGED 2026-10-12: clearer wording, please read again
| whatsapp.linkSub | Then comparisons you SAVE in WhatsApp show up here | फिर WhatsApp में SAVE की गई तुलनाएं यहां दिखेंगी | | CHANGED 2026-10-12: clearer wording, please read again
| whatsapp.linkSent | WhatsApp is open with a code typed in. Press send there, then come back here. | WhatsApp में एक कोड लिखा हुआ है। वहां भेजें दबाएं, फिर यहां लौट आएं। | | CHANGED 2026-10-12: clearer wording, please read again
| whatsapp.linked | WhatsApp linked | WhatsApp जुड़ा है | |
| whatsapp.linkedSub | Since {since}. Tap to unlink. | {since} से। हटाने के लिए टैप करें। | |
| whatsapp.unlinkTitle | Unlink WhatsApp? | WhatsApp हटाएँ? | |
| whatsapp.unlinkBody | SAVE in WhatsApp will stop adding to this account. | WhatsApp में SAVE इस खाते में जोड़ना बंद कर देगा। | | CHANGED 2026-10-11: shorter, please read again
| whatsapp.unlink | Unlink | हटाएँ | |
| whatsapp.unlinked | WhatsApp unlinked. | WhatsApp हटा दिया गया। | |
| whatsapp.cancel | Cancel | रद्द करें | |
| whatsapp.failed | That didn’t work. Try again. | यह नहीं हुआ। फिर कोशिश करें। | | CHANGED 2026-10-11: shorter, please read again
| whatsapp.linkNote | We keep a scrambled ID, never your number. | हम एक बदला हुआ ID रखते हैं, आपका नंबर कभी नहीं। | | CHANGED 2026-10-09: please read again CHANGED 2026-10-11: shorter, please read again
| whatsapp.devOnly | Development builds only, until the WhatsApp bot can reply to everyone. | सिर्फ़ डेवलपमेंट बिल्ड में, जब तक WhatsApp बॉट सबको जवाब नहीं दे सकता। | |
| whatsappTab.lead | Compare prices in a chat | चैट में कीमतों की तुलना करें | | NEW 2026-10-09
| whatsappTab.sub | Text our bot. Get today’s prices in seconds. No app needed. | हमारे बॉट को मैसेज करें। सेकंडों में आज की कीमतें पाएँ। कोई ऐप नहीं चाहिए। | | NEW 2026-10-09 CHANGED 2026-10-11: shorter, please read again
| whatsappTab.tryTitle | Things to send | क्या भेजें | | NEW 2026-10-09
| whatsappTab.linkTitle | Link it to your account | इसे अपने खाते से जोड़ें | | NEW 2026-10-09
| whatsappTab.linkWhy | Then SAVE 500 to India adds it to Saved. | फिर SAVE 500 to India उसे "सेव किए गए" में जोड़ देगा। | | NEW 2026-10-09 CHANGED 2026-10-10: सहेज → सेव, as you asked CHANGED 2026-10-11: shorter, please read again
| whatsappTab.signInToLink | Sign in to link WhatsApp | WhatsApp जोड़ने के लिए साइन इन करें | | NEW 2026-10-09
| whatsappTab.soon | Coming soon. | जल्द आ रहा है। | | NEW 2026-10-09 CHANGED 2026-10-11: shorter, please read again
| whatsappTab.privacy | We keep a scrambled ID, never your number. | हम एक बदला हुआ ID रखते हैं, आपका नंबर कभी नहीं। | | NEW 2026-10-09 CHANGED 2026-10-11: shorter, please read again
| whatsappTab.tries[1].send | 500 to India | 500 to India | | NEW 2026-10-09
| whatsappTab.tries[1].does | What each provider gives your family today | आज हर कंपनी से आपके परिवार को कितना मिलेगा | | NEW 2026-10-09
| whatsappTab.tries[2].send | A receipt photo | रसीद की फ़ोटो | | NEW 2026-10-09
| whatsappTab.tries[2].does | What a transfer you made really cost | आपके किए गए ट्रांसफ़र की असली लागत | | NEW 2026-10-09
| whatsappTab.tries[3].send | WHY | WHY | | NEW 2026-10-09
| whatsappTab.tries[3].does | Where the hidden cost is | छिपी हुई लागत कहाँ है | | NEW 2026-10-09
| whatsappTab.tries[4].send | SCAM | SCAM | | NEW 2026-10-09
| whatsappTab.tries[4].does | Check a message asking for money | पैसे माँगने वाले मैसेज की जाँच करें | | NEW 2026-10-09
| whatsappTab.tries[5].send | HINDI | HINDI | | NEW 2026-10-09
| whatsappTab.tries[5].does | Replies in Hindi | जवाब हिंदी में | | NEW 2026-10-09
| alerts.link | Tell me when it’s better | बेहतर होने पर बताएँ | |
| alerts.intro | Alert me when {amount} to {country} gets at least | तब बताएँ जब {country} को {amount} पर कम से कम इतना मिले | |
| alerts.today | Today’s best: {amount} from {provider} | आज सबसे अच्छा: {provider} से {amount} | |
| alerts.often | One alert when it hits, then at most once a day. | पहुँचने पर एक अलर्ट, फिर दिन में ज़्यादा से ज़्यादा एक। | | CHANGED 2026-10-11: shorter, please read again
| alerts.less | Lower target | लक्ष्य कम करें | |
| alerts.more | Higher target | लक्ष्य बढ़ाएँ | |
| alerts.turnOn | Turn on alert | अलर्ट चालू करें | |
| alerts.on | Alert on. You’ll find it in Saved. | अलर्ट चालू है। यह "सेव किए गए" में मिलेगा। | | CHANGED 2026-10-10: सहेज → सेव, as you asked
| alerts.signInTitle | Sign in for alerts | अलर्ट के लिए साइन इन करें | |
| alerts.signInBody | Alerts need a free account. | अलर्ट के लिए मुफ़्त खाता चाहिए। | | CHANGED 2026-10-11: shorter, please read again
| alerts.denied | Turn on notifications in Settings to get alerts. | अलर्ट पाने के लिए सेटिंग्स में नोटिफ़िकेशन चालू करें। | | CHANGED 2026-10-11: shorter, please read again
| alerts.unavailable | Notifications need the full app on a phone. | सूचनाओं के लिए फ़ोन पर पूरा ऐप चाहिए। | |
| alerts.limit | You have 10 alerts, the most. Delete one in Saved. | आपके 10 अलर्ट हैं, जो अधिकतम है। "सेव किए गए" में से एक मिटाएँ। | | CHANGED 2026-10-10: सहेज → सेव, as you asked CHANGED 2026-10-11: shorter, please read again
| alerts.failed | That didn’t go through. Try again. | यह नहीं हो पाया। फिर कोशिश करें। | | CHANGED 2026-10-11: shorter, please read again
| alerts.byWhatsApp | by WhatsApp | WhatsApp पर | |
| alerts.yours | Your alerts | आपके अलर्ट | |
| alerts.row | {amount} to {country}: {target} or more | {country} को {amount}: {target} या ज़्यादा | |
| alerts.deleteNamed | Delete alert: {name} | अलर्ट मिटाएँ: {name} | |
| alerts.deleted | Alert deleted. | अलर्ट मिटा दिया गया। | |
| alerts.none | No prices for this amount yet. | इस रकम के लिए अभी कोई कीमत नहीं। | | CHANGED 2026-10-11: shorter, please read again
| blog.written | {n} of {total} written in full so far | {total} में से {n} पूरे लिखे जा चुके हैं | |
| blog.shown | {n} of {total} posts | {total} में से {n} लेख | |
| blog.all | All | सभी | |
| blog.series.series1 | Why people send money | लोग पैसे क्यों भेजते हैं | |
| blog.series.series2 | How banks move it | बैंक इसे कैसे भेजते हैं | |
| blog.series.series3 | Blockchain scaling | ब्लॉकचेन स्केलिंग | |
| blog.series.series4 | Cost, speed, failure | लागत, रफ़्तार, गड़बड़ी | |
| blog.series.series5 | Connecting it up | सब कुछ जोड़ना | |
| blog.summaryOnly | Summary only | सिर्फ़ सारांश | |
| blog.notYet | Full post coming. Here’s the summary. | पूरी पोस्ट जल्द आएगी। अभी सारांश पढ़ें। | | CHANGED 2026-10-11: shorter, please read again
| blog.keepReading | Keep reading | आगे पढ़ें | |
| blog.englishOnly | Posts are in English. | लेख अंग्रेज़ी में हैं। | |
| glossary.searchPlaceholder | Search {n} terms | {n} शब्दों में खोजें | |
| glossary.searchLabel | Search the glossary | शब्दकोश में खोजें | |
| glossary.noMatch | No term matches “{q}”. | “{q}” से कोई शब्द नहीं मिला। | |
| glossary.englishOnly | Definitions are in English for now. | परिभाषाएँ अभी अंग्रेज़ी में हैं। | | CHANGED 2026-10-11: shorter, please read again
| remitbench.englishOnly | This research page is only in English for now. | रिसर्च का यह पेज अभी सिर्फ़ अंग्रेज़ी में है। | |
| limitsBlock.heading | What this does not tell you | यह आपको क्या नहीं बताता | |
| tool.inUnit | {label}, in {unit} | {label}, {unit} में | |
| tool.sliderValue | {v} percent | {v} प्रतिशत | |
| fairRate.intro | Each point of markup comes out of your transfer. | मार्कअप का हर पॉइंट आपके ट्रांसफ़र से कटता है। | | CHANGED 2026-10-11: shorter, please read again
| fairRate.yourTransfer | Your transfer | आपका ट्रांसफ़र | | ENDED HERE
| fairRate.amountToSend | Amount to send | भेजने की रकम | |
| fairRate.markup | Exchange-rate markup | एक्सचेंज रेट में मार्कअप | |
| fairRate.drag | Drag to see the cost. Fees are extra. | खर्च देखने के लिए खिसकाएँ। फ़ीस अलग है। | | CHANGED 2026-10-11: shorter, please read again
| fairRate.rateFailed | Couldn’t get the rate. Try again. | रेट नहीं मिला। फिर कोशिश करें। | | CHANGED 2026-10-11: shorter, please read again
| fairRate.theyReceive | With a {pct} markup, they’d receive | {pct} मार्कअप पर उन्हें मिलेंगे | |
| fairRate.atMid | At the mid-market rate: {amount} | मिड-मार्केट रेट पर: {amount} | |
| fairRate.midRate | Mid-market rate | मिड-मार्केट रेट | |
| fairRate.withMarkup | Rate with this markup | इस मार्कअप के साथ रेट | |
| fairRate.lost | Lost to the markup | मार्कअप में गए | |
| fairRate.worth | Worth, in what you sent | आपकी भेजी रकम में इसकी कीमत | |
| fairRate.source | Mid-market rate: {source}, {day}. | मिड-मार्केट रेट: {source}, {day}। | | CHANGED 2026-10-11: shorter, please read again
| trueCost.intro | Type in your receipt to see the hidden cost. | छिपा खर्च देखने के लिए अपनी रसीद भरें। | | CHANGED 2026-10-11: shorter, please read again
| trueCost.currencies | Currencies | मुद्राएँ | |
| trueCost.sent | Sent | भेजी | |
| trueCost.received | Received | पहुँची | |
| trueCost.fromReceipt | From your receipt | आपकी रसीद से | |
| trueCost.amountSent | Amount sent | भेजी गई रकम | |
| trueCost.beforeFee | Before any fee | किसी भी फ़ीस से पहले | |
| trueCost.fee | Fee | फ़ीस | |
| trueCost.feeHint | 0 if there was none | अगर नहीं लगी तो 0 | |
| trueCost.rateYouGot | Rate you got | आपको मिला रेट | |
| trueCost.perOne | {to} per 1 {from} | 1 {from} पर {to} | |
| trueCost.pickup | Pickup charge | पिकअप शुल्क | |
| trueCost.pickupHint | Only for cash pickup | सिर्फ़ नकद पिकअप के लिए | |
| trueCost.dateSent | Date sent | भेजने की तारीख़ | |
| trueCost.dateHint | Optional. Blank means today. | ज़रूरी नहीं। खाली छोड़ें तो आज की तारीख़। | |
| trueCost.datePlaceholder | MM/DD/YYYY | MM/DD/YYYY | |
| trueCost.badDate | Enter a past date, like 9/28/2026. | पिछली तारीख डालें, जैसे 9/28/2026। | | CHANGED 2026-10-11: shorter, please read again
| trueCost.feeTooBig | The fee can’t be more than the amount sent. | फ़ीस भेजी गई रकम से ज़्यादा नहीं हो सकती। | |
| trueCost.rateFailed | Couldn’t get that day’s rate. Try again. | उस दिन का रेट नहीं मिला। फिर कोशिश करें। | | CHANGED 2026-10-11: shorter, please read again
| trueCost.reallyCost | This transfer really cost | इस ट्रांसफ़र की असली लागत | |
| trueCost.costNote | {pct} of what you sent. World average {world}%, UN target {target}%. | भेजी रकम का {pct}। दुनिया का औसत {world}%, संयुक्त राष्ट्र का लक्ष्य {target}%। | | CHANGED 2026-10-11: shorter, please read again
| trueCost.feeSeen | Fee you could see | दिखने वाली फ़ीस | |
| trueCost.hidden | Hidden in the rate ({pct} markup) | रेट में छिपा ({pct} मार्कअप) | |
| trueCost.atPickup | Charged at pickup | पिकअप पर लिया गया | |
| trueCost.theyReceived | They received | उन्हें मिले | |
| trueCost.atMid | At mid-market, with no fee | मिड-मार्केट रेट पर, बिना फ़ीस के | |
| trueCost.better | Better than mid-market. Often a first-transfer offer. | मिड-मार्केट से बेहतर। अक्सर पहले ट्रांसफ़र का ऑफ़र। | | CHANGED 2026-10-11: shorter, please read again
| trueCost.source | Mid-market rate: {rate} ({source}, {day}). | मिड-मार्केट रेट: {rate} ({source}, {day})। | | CHANGED 2026-10-11: shorter, please read again
| trueCost.compareToday | Compare what {amount} gets today | आज {amount} पर कितना मिलता है, तुलना करें | |
| trueCost.keep | Keep this check | यह जाँच सेव करें | | CHANGED 2026-10-10: सहेज → सेव, as you asked
| trueCost.provider | Provider | कंपनी | |
| trueCost.optional | Optional | ज़रूरी नहीं | |
| trueCost.providerPlaceholder | e.g. Remitly | जैसे Remitly | |
| trueCost.notNamed | Not named | नाम नहीं दिया | |
| trueCost.saveToAccount | Save to my account | मेरे खाते में सेव करें | | CHANGED 2026-10-10: सहेज → सेव, as you asked
| trueCost.savedToAccount | Saved to your account. | आपके खाते में सेव हो गई। | | CHANGED 2026-10-10: सहेज → सेव, as you asked
| trueCost.createToSave | Create an account to save checks | जाँचें सेव करने के लिए खाता बनाएँ | | CHANGED 2026-10-10: सहेज → सेव, as you asked
| trueCost.errors.notConnected | Not connected. | सर्वर से जुड़ा नहीं है। | |
| trueCost.errors.signedOut | Sign in to save checks. | जाँचें सेव करने के लिए साइन इन करें। | | CHANGED 2026-10-10: सहेज → सेव, as you asked
| trueCost.errors.failed | Couldn’t save. Try again. | सेव नहीं हो सकी। फिर कोशिश करें। | | CHANGED 2026-10-10: सहेज → सेव, as you asked
| yearlyCost.intro | The same transfer, all year. What does it add up to? | वही ट्रांसफ़र, पूरे साल। कुल कितना बनता है? | |
| yearlyCost.yourTransfers | Your transfers | आपके ट्रांसफ़र | |
| yearlyCost.amountEach | Amount each time | हर बार की रकम | |
| yearlyCost.yourCost | Your total cost | आपकी कुल लागत | |
| yearlyCost.yourCostHint | Fee plus markup, as a %. TrueCost can work it out. | फ़ीस और मार्कअप, % में। TrueCost इसे निकाल सकता है। | | CHANGED 2026-10-11: shorter, please read again
| yearlyCost.optional | Optional | ज़रूरी नहीं | |
| yearlyCost.weekly | Weekly | हर हफ़्ते | |
| yearlyCost.fortnightly | 2 weeks | हर 2 हफ़्ते | |
| yearlyCost.monthly | Monthly | हर महीने | |
| yearlyCost.quarterly | Quarterly | हर तीन महीने | |
| yearlyCost.atYours | At {pct}, a year of sending costs | {pct} पर, साल भर भेजने की लागत | |
| yearlyCost.moreThanTarget | {amount} more than at the UN’s {target}% target. | संयुक्त राष्ट्र के {target}% लक्ष्य से {amount} ज़्यादा। | |
| yearlyCost.underTarget | At or under the UN’s {target}% target. | संयुक्त राष्ट्र के {target}% लक्ष्य के बराबर या उससे कम। | |
| yearlyCost.atAverage | At the global average, a year of sending costs | दुनिया के औसत पर, साल भर भेजने की लागत | |
| yearlyCost.addYours | Add your own cost above to compare. | तुलना के लिए ऊपर अपनी लागत डालें। | |
| yearlyCost.sentYear | Sent in a year | साल भर में भेजा | |
| yearlyCost.atYourCost | At your cost ({pct}) | आपकी लागत पर ({pct}) | |
| yearlyCost.atGlobal | At the global average ({pct}) | दुनिया के औसत पर ({pct}) | |
| yearlyCost.atTarget | At the UN target ({target}%) | संयुक्त राष्ट्र के लक्ष्य पर ({target}%) | |
| yearlyCost.source | Global average {global} on $200. UN target {target}. | $200 पर दुनिया का औसत {global}। संयुक्त राष्ट्र का लक्ष्य {target}। | | CHANGED 2026-10-11: shorter, please read again
| rateHistory.intro | The mid-market rate, day by day. | मिड-मार्केट रेट, दिन-ब-दिन। | | CHANGED 2026-10-11: shorter, please read again
| rateHistory.pair | Pair | मुद्राएँ | |
| rateHistory.failed | Couldn’t load. Try again. | लोड नहीं हुआ। फिर कोशिश करें। | | CHANGED 2026-10-11: shorter, please read again
| rateHistory.notEnough | Not enough days published for this pair yet. | इन मुद्राओं के लिए अभी पर्याप्त दिनों के रेट प्रकाशित नहीं हुए हैं। | |
| rateHistory.perOne | {to} per 1 {from} | 1 {from} पर {to} | |
| rateHistory.latest | Latest ({day}) | सबसे नया ({day}) | |
| rateHistory.change | Change since {day} | {day} से बदलाव | |
| rateHistory.highest | Highest | सबसे ज़्यादा | |
| rateHistory.lowest | Lowest | सबसे कम | |
| rateHistory.source | {n} daily rates from {source}. Providers pay out less, by their markup. | {source} से {n} दिन के रेट। कंपनियाँ अपने मार्कअप जितना कम देती हैं। | | CHANGED 2026-10-11: shorter, please read again
| chart.label | {unit}, {n} days from {first} to {last}. Low {low}, high {high}. | {unit}, {first} से {last} तक {n} दिन। सबसे कम {low}, सबसे ज़्यादा {high}। | |
| scamCheck.intro | Eight quick questions. Your answers stay on your phone. | आठ छोटे सवाल। आपके जवाब आपके फ़ोन पर ही रहते हैं। | |
| scamCheck.questions.payment-method.ask | Were you asked to pay with a gift card, crypto, or a wire to someone you’ve never met? | क्या आपसे गिफ़्ट कार्ड, क्रिप्टो, या किसी अनजान को वायर से भुगतान करने को कहा गया? | | CHANGED 2026-10-11: shorter, please read again
| scamCheck.questions.payment-method.why | These can’t be reversed or traced. Real businesses never ask for them. | ये वापस नहीं होते और इनका पता नहीं चलता। असली कंपनियाँ ऐसा कभी नहीं माँगतीं। | | CHANGED 2026-10-11: shorter, please read again
| scamCheck.questions.urgency.ask | Are you being rushed, or told to keep it secret? | क्या आपको जल्दी करने या बात छिपाने को कहा जा रहा है? | | CHANGED 2026-10-11: shorter, please read again
| scamCheck.questions.urgency.why | Pressure and secrecy stop you from asking someone you trust. | दबाव और राज़ इसलिए होते हैं ताकि आप किसी भरोसेमंद से न पूछें। | | CHANGED 2026-10-11: shorter, please read again
| scamCheck.questions.prize.ask | Do you have to pay first to get a prize, lottery win, or inheritance? | क्या इनाम, लॉटरी या विरासत पाने के लिए पहले पैसे भरने हैं? | | CHANGED 2026-10-11: shorter, please read again
| scamCheck.questions.prize.why | A real prize never costs money. The fee is the scam. | असली इनाम के लिए कभी पैसे नहीं देने पड़ते। फ़ीस ही धोखा है। | | CHANGED 2026-10-11: shorter, please read again
| scamCheck.questions.romance.ask | Have you only ever met this person online? | क्या आप इस व्यक्ति से सिर्फ़ ऑनलाइन ही मिले हैं? | | CHANGED 2026-10-11: shorter, please read again
| scamCheck.questions.romance.why | Online-only contacts asking for money is one of the most common scams. | सिर्फ़ ऑनलाइन जान-पहचान वाले का पैसे माँगना सबसे आम धोखों में है। | | CHANGED 2026-10-11: shorter, please read again
| scamCheck.questions.imposter.ask | Did someone claiming to be the government, your bank, or a company say money must move now? | क्या सरकार, बैंक या किसी कंपनी के नाम पर किसी ने कहा कि पैसे अभी भेजने हैं? | | CHANGED 2026-10-11: shorter, please read again
| scamCheck.questions.imposter.why | Hang up. Call back on a number you look up yourself. | फ़ोन काटें। खुद ढूँढे नंबर पर वापस कॉल करें। | | CHANGED 2026-10-11: shorter, please read again
| scamCheck.questions.overpayment.ask | Did someone overpay you and ask for the difference back? | क्या किसी ने ज़्यादा भुगतान करके बाकी लौटाने को कहा? | | CHANGED 2026-10-11: shorter, please read again
| scamCheck.questions.overpayment.why | Their payment bounces later. The money you sent is gone. | उनका भुगतान बाद में लौट जाता है। आपका भेजा पैसा चला जाता है। | | CHANGED 2026-10-11: shorter, please read again
| scamCheck.questions.emergency.ask | Did a sudden message say a relative needs money fast and quietly? | क्या अचानक मैसेज आया कि किसी रिश्तेदार को जल्दी और चुपचाप पैसे चाहिए? | | CHANGED 2026-10-11: shorter, please read again
| scamCheck.questions.emergency.why | Call the person or your family before you send. | भेजने से पहले उस व्यक्ति या परिवार को फ़ोन करें। | | CHANGED 2026-10-11: shorter, please read again
| scamCheck.questions.mule.ask | Are you being asked to receive money and pass it on? | क्या आपसे पैसे लेकर आगे भेजने को कहा जा रहा है? | | CHANGED 2026-10-11: shorter, please read again
| scamCheck.questions.mule.why | That makes you a money mule, which can mean legal trouble. | इससे आप "मनी म्यूल" बन जाते हैं, जिससे कानूनी मुसीबत हो सकती है। | | CHANGED 2026-10-11: shorter, please read again
| scamCheck.yes | Yes | हाँ | |
| scamCheck.unsure | I’m not sure | पक्का नहीं पता | |
| scamCheck.no | No | नहीं | |
| scamCheck.back | Back | वापस | |
| scamCheck.allAnswered | All eight answered | आठों सवालों के जवाब हो गए | |
| scamCheck.questionOf | Question {n} of {of} | सवाल {n}, कुल {of} | |
| scamCheck.risk.veryHigh | Very high risk | बहुत ज़्यादा खतरा | |
| scamCheck.risk.high | High risk | ज़्यादा खतरा | |
| scamCheck.risk.moderate | Moderate risk | मध्यम खतरा | |
| scamCheck.risk.lower | Lower risk on its own | अकेले में कम खतरा | |
| scamCheck.stop | Stop. Don’t send anything yet. | रुकिए। अभी कुछ न भेजें। | |
| scamCheck.slowDown | Slow down and check this properly. | धीरे चलें और इसे ठीक से जाँचें। | |
| scamCheck.worthChecking | Worth checking before you send | भेजने से पहले जाँच लेना अच्छा रहेगा | |
| scamCheck.noSigns | None of the common warning signs | आम खतरे के कोई संकेत नहीं | |
| scamCheck.flaggedBody | Your most serious answer scores {top}/10. Money sent this way is rarely recovered. (Or, for a less serious one: It’s a warning, not proof.) Talk to someone you trust first. | आपके सबसे गंभीर जवाब का स्कोर {top}/10 है। ऐसे भेजा पैसा शायद ही वापस मिलता है। (कम गंभीर होने पर: यह चेतावनी है, सबूत नहीं।) पहले किसी भरोसेमंद से बात करें। | | CHANGED 2026-10-11: shorter, please read again
| scamCheck.unsureBody | You weren’t sure about {n}. Find out for certain first. | आप {n} के बारे में पक्के नहीं थे। पहले पक्का पता करें। | | CHANGED 2026-10-11: shorter, please read again
| scamCheck.clearBody | No common warning signs. If it still feels wrong, wait a day and ask someone you trust. | कोई आम चेतावनी संकेत नहीं। फिर भी गड़बड़ लगे तो एक दिन रुकें और किसी भरोसेमंद से पूछें। | | CHANGED 2026-10-11: shorter, please read again
| scamCheck.saidYes | You said yes | आपने हाँ कहा | |
| scamCheck.wasUnsure | You weren’t sure | आप पक्के नहीं थे | |
| scamCheck.ifSent | If money already went | अगर पैसा जा चुका है | |
| scamCheck.step1 | 1. Call your transfer provider now. Ask them to stop it. | 1. अभी अपनी ट्रांसफ़र कंपनी को फ़ोन करें। उसे रोकने को कहें। | | CHANGED 2026-10-11: shorter, please read again
| scamCheck.step2Before | 2. Report it to the FTC at  | 2. FTC को यहाँ शिकायत करें:  | |
| scamCheck.step2After | . | । | |
| scamCheck.step3Before | 3. File a complaint with the  | 3.  | |
| scamCheck.step3After | , which takes money-transfer complaints. |  के पास शिकायत दर्ज करें, जो पैसे भेजने से जुड़ी शिकायतें लेता है। | |
| scamCheck.note | Risk scores are our own reading of FTC and CFPB guidance. Not legal advice. We can’t recover money. | जोखिम स्कोर FTC और CFPB की सलाह पर हमारी अपनी समझ है। यह कानूनी सलाह नहीं है। हम पैसे वापस नहीं दिला सकते। | | CHANGED 2026-10-11: shorter, please read again
| scamCheck.again | Start again | फिर से शुरू करें | |
| scan.heroTitle | What did your transfer really cost? | आपके ट्रांसफ़र पर असल में कितना खर्च हुआ? | |
| scan.heroSub | Snap your receipt. See the hidden cost. | रसीद की फ़ोटो लें। छिपा खर्च देखें। | | CHANGED 2026-10-11: shorter, please read again
| scan.steps[1] | Snap the receipt | रसीद की फ़ोटो लें | |
| scan.steps[2] | Your details get covered | आपकी जानकारी ढक दी जाती है | |
| scan.steps[3] | See the real cost | असली खर्च देखें | |
| scan.privacy | Your name and numbers are covered on your phone. | आपका नाम और नंबर आपके फ़ोन पर ही ढक दिए जाते हैं। | | CHANGED 2026-10-11: shorter, please read again
| scan.takePhoto | Take a photo | फ़ोटो लें | |
| scan.choosePhoto | Choose a photo | फ़ोटो चुनें | |
| scan.needsBuild | Scanning needs the full build of the app. It doesn’t work in Expo Go. | स्कैन करने के लिए ऐप का पूरा वर्ज़न चाहिए। यह Expo Go में काम नहीं करता। | |
| scan.cameraDenied | Allow camera access in Settings. | सेटिंग्स में कैमरा की अनुमति दें। | | CHANGED 2026-10-11: shorter, please read again
| scan.photosDenied | Allow photo access in Settings. | सेटिंग्स में फ़ोटो की अनुमति दें। | | CHANGED 2026-10-11: shorter, please read again
| scan.reading | Reading the receipt on your phone… | रसीद आपके फ़ोन पर पढ़ी जा रही है… | |
| scan.noText | No text found. Try again in good light. | कोई लिखावट नहीं मिली। अच्छी रोशनी में फिर कोशिश करें। | | CHANGED 2026-10-11: shorter, please read again
| scan.tooBlurry | Too blurry. Hold steady and try again. | बहुत धुंधली है। फ़ोन स्थिर रखकर फिर कोशिश करें। | | CHANGED 2026-10-11: shorter, please read again
| scan.bitBlurry | A bit blurry. Some numbers may be wrong. | थोड़ी धुंधली है। कुछ अंक गलत हो सकते हैं। | | CHANGED 2026-10-11: shorter, please read again
| scan.unreadable | Couldn’t read the amounts. Show the whole receipt. | रकम पढ़ी नहीं जा सकीं। पूरी रसीद दिखाएँ। | | CHANGED 2026-10-11: shorter, please read again
| scan.misaligned | Something went wrong. Take the photo again. | कुछ गड़बड़ हुई। फ़ोटो फिर से लें। | | CHANGED 2026-10-11: shorter, please read again
| scan.failed | Something went wrong reading the photo. Try again. | फ़ोटो पढ़ने में कुछ गड़बड़ हुई। फिर से कोशिश करें। | |
| scan.previewTitle | Check what’s covered | देखें कि क्या ढका गया है | |
| scan.previewHelp | Black boxes hide your details. Tap a word to hide or show it. | काले डिब्बे आपकी जानकारी छिपाते हैं। किसी शब्द को छिपाने या दिखाने के लिए टैप करें। | | CHANGED 2026-10-11: shorter, please read again
| scan.covered | {n} items covered | {n} चीज़ें ढकी गईं | |
| scan.tapWord | Word: {text}. Tap to cover it. | शब्द: {text}। ढकने के लिए टैप करें। | |
| scan.tapCovered | Covered by you. Tap to show it again. | आपने ढका है। फिर से दिखाने के लिए टैप करें। | |
| scan.consentLabel | Keep this receipt for research | यह रसीद रिसर्च के लिए रखें | |
| scan.consentHelp | Off: we never keep the photo. On: we keep the covered photo for 24 months, for research. | बंद: फ़ोटो कभी नहीं रखी जाती। चालू: ढकी हुई फ़ोटो 24 महीने रिसर्च के लिए रखी जाती है। | | CHANGED 2026-10-11: shorter, please read again
| scan.send | Read my receipt | मेरी रसीद पढ़ें | |
| scan.savingsAcross | From 1 receipt on this phone. / From {n} receipts on this phone. | इस फ़ोन की 1 रसीद से। / इस फ़ोन की {n} रसीदों से। | | NEW 2026-10-09 (one receipt / several) CHANGED 2026-10-11: shorter, please read again
| scan.savingsNone | Your receipt was already the cheapest. / All {n} receipts were already the cheapest. | आपकी रसीद पहले से सबसे सस्ती थी। / सभी {n} रसीदें पहले से सबसे सस्ती थीं। | | NEW 2026-10-09 (one receipt / several) CHANGED 2026-10-11: shorter, please read again
| scan.aiTitle | An AI may read it | इसे AI पढ़ सकता है | | NEW 2026-10-08
| scan.aiBody | If our rules can’t read a number, we send the covered receipt to Groq, an AI service. Groq doesn’t keep it. | अगर हमारे नियम कोई अंक नहीं पढ़ पाते, तो हम ढकी हुई रसीद Groq नाम की AI सेवा को भेजते हैं। Groq उसे नहीं रखता। | | NEW 2026-10-08 CHANGED 2026-10-11: shorter, please read again
| scan.aiAskTitle | Send to an AI service? | AI सेवा को भेजें? | | NEW 2026-10-08
| scan.aiAllow | Allow | अनुमति दें | | NEW 2026-10-08
| scan.aiDecline | Not now | अभी नहीं | | NEW 2026-10-08
| scan.sendFailed | That didn’t go through. Try again. | यह नहीं हो पाया। फिर कोशिश करें। | | CHANGED 2026-10-11: shorter, please read again
| scan.notConnected | The app isn’t connected yet. | ऐप अभी जुड़ा नहीं है। | |
| scan.limitHour | Too many scans from this network. Try again in an hour. | इस नेटवर्क से बहुत स्कैन हुए। एक घंटे बाद कोशिश करें। | | CHANGED 2026-10-11: shorter, please read again
| scan.limitDay | That’s today’s limit. Try again tomorrow. | आज की सीमा पूरी हुई। कल फिर कोशिश करें। | | CHANGED 2026-10-11: shorter, please read again
| scan.retake | Use a different photo | दूसरी फ़ोटो इस्तेमाल करें | |
| scan.toCheck | Please check | कृपया जाँचें | |
| scan.notFound | Not found | नहीं मिला | |
| scan.deleteNow | Delete this receipt now | यह रसीद अभी मिटाएँ | |
| scan.deleted | Deleted. | मिटा दी गई। | |
| scan.another | Scan another receipt | दूसरी रसीद स्कैन करें | |
| scan.limits[1] | Whether every value was read right | क्या हर रकम सही पढ़ी गई | | CHANGED 2026-10-11: shorter, please read again
| scan.limits[2] | Anything on the back, or handwritten | रसीद के पीछे या हाथ से लिखा कुछ | | CHANGED 2026-10-11: shorter, please read again
| scan.limits[3] | Fees your family paid on arrival | पैसा पहुँचने पर परिवार की दी फ़ीस | | CHANGED 2026-10-11: shorter, please read again
| confirm.title | Check each value | हर रकम जाँचें | |
| confirm.help | Tap a value to fix it. | ठीक करने के लिए किसी रकम पर टैप करें। | | CHANGED 2026-10-11: shorter, please read again
| confirm.left | {n} to check | {n} जाँचनी बाकी हैं | |
| confirm.ready | See what it cost | देखें कितना खर्च हुआ | |
| confirm.failed | That didn’t go through. Try again. | यह नहीं हो पाया। फिर कोशिश करें। | | CHANGED 2026-10-11: shorter, please read again
| confirm.expired | This receipt was deleted. Scan it again. | यह रसीद मिट चुकी है। इसे फिर स्कैन करें। | | CHANGED 2026-10-11: shorter, please read again
| confirm.looksRight | This is right | यह सही है | |
| confirm.save | Save | सेव करें | |
| confirm.useSuggestion | Use {value} | {value} इस्तेमाल करें | |
| confirm.suggestion | The other numbers suggest {value}. | बाकी रकमों के हिसाब से यह {value} होना चाहिए। | |
| confirm.invalid | Check {field} and try again. | {field} जाँचें और फिर कोशिश करें। | | CHANGED 2026-10-11: shorter, please read again
| confirm.datePlaceholder | MM/DD/YYYY | MM/DD/YYYY | |
| confirm.currencyPlaceholder | e.g. USD | जैसे USD | |
| confirm.editing | Change: {field} | बदलें: {field} | |
| result.title | What this transfer really cost | इस ट्रांसफ़र पर असल में कितना खर्च हुआ | |
| result.costLabel | This transfer cost you | इस ट्रांसफ़र में आपका खर्च | | NEW 2026-10-11
| result.verdictLow | Low: {pct} of what you sent | कम: भेजी रकम का {pct} | | NEW 2026-10-11
| result.verdictAverage | About average: {pct} of what you sent | औसत के आसपास: भेजी रकम का {pct} | | NEW 2026-10-11
| result.verdictHigh | High: {pct} of what you sent | ज़्यादा: भेजी रकम का {pct} | | NEW 2026-10-11
| result.savedLabel | With {provider}, you could have saved | {provider} से आप इतना बचा सकते थे | | NEW 2026-10-11
| result.bestShort | You got the best price we found. | आपको हमारी देखी सबसे अच्छी कीमत मिली। | | NEW 2026-10-11
| result.showDetails | Show the details | पूरी जानकारी देखें | | NEW 2026-10-11
| result.hideDetails | Hide the details | जानकारी छिपाएँ | | NEW 2026-10-11
| result.fee | Fee you could see | दिखने वाली फ़ीस | |
| result.tax | Federal remittance tax | संघीय रेमिटेंस टैक्स | |
| result.markup | Hidden in the rate ({pct} markup) | रेट में छिपा ({pct} मार्कअप) | |
| result.pickup | Charged at pickup | पिकअप पर लिया गया | |
| result.betterThanMid | Better than mid-market. Often a first-transfer offer. | मिड-मार्केट से बेहतर। अक्सर पहले ट्रांसफ़र का ऑफ़र। | | CHANGED 2026-10-11: shorter, please read again
| result.source | Mid-market rate: {rate} ({source}, {day}). | मिड-मार्केट रेट: {rate} ({source}, {day})। | | CHANGED 2026-10-11: shorter, please read again
| result.noMid | Couldn’t load that day’s mid-market rate. | उस दिन का मिड-मार्केट रेट लोड नहीं हुआ। | | CHANGED 2026-10-11: shorter, please read again
| result.missing | Some values are missing. | कुछ रकमें नहीं मिलीं। | | CHANGED 2026-10-11: shorter, please read again
| result.advertisedTitle | Advertised vs. paid | दिखाया गया रेट बनाम चुकाया गया | |
| result.gapMore | Your rate cost {gap} more than advertised. | आपका रेट विज्ञापन से {gap} महँगा पड़ा। | | CHANGED 2026-10-11: shorter, please read again
| result.gapLess | Your rate beat the advertised one by {gap}. | आपका रेट विज्ञापन से {gap} बेहतर था। | | CHANGED 2026-10-11: shorter, please read again
| result.gapSame | Your rate matches the advertised one. | आपका रेट विज्ञापन वाले जैसा ही है। | | CHANGED 2026-10-11: shorter, please read again
| result.notTracked | We don’t check this provider yet. | हम अभी इस कंपनी की जाँच नहीं करते। | | CHANGED 2026-10-11: shorter, please read again
| result.noRoute | We don’t check this route yet. | हम अभी इस रूट की जाँच नहीं करते। | | CHANGED 2026-10-11: shorter, please read again
| result.noQuote | No price from this provider that day. | उस दिन इस कंपनी की कोई कीमत नहीं। | | CHANGED 2026-10-11: shorter, please read again
| result.missingValues | The date, amount or rate is missing. | तारीख, रकम या रेट नहीं मिला। | | CHANGED 2026-10-11: shorter, please read again
| result.pctOfSent | {pct} of what you sent | भेजी गई रकम का {pct} | |
| result.scaleLabel | This cost {pct}. World average {world}%, UN target {target}%. | खर्च {pct}। दुनिया का औसत {world}%, संयुक्त राष्ट्र का लक्ष्य {target}%। | | CHANGED 2026-10-11: shorter, please read again
| result.scaleYou | This one {pct} | यह {pct} | |
| result.scaleWorld | World {n}% | दुनिया {n}% | |
| result.scaleTarget | UN target {n}% | UN लक्ष्य {n}% | |
| result.costTitle | Where the cost came from | खर्च कहाँ से आया | |
| result.arrivedTitle | What arrived | क्या पहुँचा | |
| result.arrivedGot | {got} of {possible} | {possible} में से {got} | |
| result.arrivedLost | {lost} lost | {lost} गए | |
| result.arrivedLabel | {got} arrived, of {possible} possible. {lost} lost. | {possible} में से {got} पहुँचे। {lost} कटे। | | CHANGED 2026-10-11: shorter, please read again
| result.keptYou | Your cost | आपका खर्च | |
| result.keptBarsLabel | Your cost {you}. {provider}: {theirs}. | आपका खर्च {you}। {provider}: {theirs}। | |
| result.rateMid | Mid-market | मिड-मार्केट | |
| result.rateAdvertised | {provider} advertised | {provider} का विज्ञापित | |
| result.rateYours | Your receipt | आपकी रसीद | |
| result.rateChecked | Advertised price checked {time}. | विज्ञापित दाम {time} जाँचा गया। | |
| result.rateLabel | Mid-market rate {mid}. Advertised {advertised}. Your receipt {yours}. | मिड-मार्केट रेट {mid}। विज्ञापित {advertised}। आपकी रसीद {yours}। | |
| result.notFound | Not found on this receipt | इस रसीद पर नहीं मिला | |
| result.keptTitle | What you could have kept | आप कितना बचा सकते थे | |
| result.keptLabel | With {provider}, you could have kept | {provider} से भेजने पर आप बचा सकते थे | |
| result.keptNote | Your family would have received {received}. | आपके परिवार को {received} मिलते। | | CHANGED 2026-10-11: shorter, please read again
| result.keptBest | {provider} was already the best price we found. | {provider} पहले से हमारी देखी सबसे अच्छी कीमत थी। | | CHANGED 2026-10-11: shorter, please read again
| result.keptAsGood | No cheaper price found. | इससे सस्ती कीमत नहीं मिली। | | CHANGED 2026-10-11: shorter, please read again
| result.keptThatDay | Prices checked {time}. | कीमतें {time} को जाँची गईं। | | CHANGED 2026-10-11: shorter, please read again
| result.keptToday | No prices from {day}, so these are today’s ({time}). | {day} की कीमतें नहीं हैं, इसलिए ये आज की हैं ({time})। | | CHANGED 2026-10-11: shorter, please read again
| result.keptEstimated | Estimated from the {amount} price. | {amount} की कीमत से अनुमान। | | CHANGED 2026-10-11: shorter, please read again
| result.keptBank | Paying from a bank account usually costs less than a card. | बैंक खाते से भरना आमतौर पर कार्ड से सस्ता पड़ता है। | | CHANGED 2026-10-11: shorter, please read again
| result.keptCompared | Compared with: {names}. | इनसे तुलना की: {names}। | | CHANGED 2026-10-11: shorter, please read again
| result.keptNoPrices | No prices yet for this kind of transfer. | इस तरह के ट्रांसफ़र की अभी कोई कीमत नहीं। | | CHANGED 2026-10-11: shorter, please read again
| result.keptNoRoute | We don’t check this route yet. | हम अभी इस रूट की जाँच नहीं करते। | | CHANGED 2026-10-11: shorter, please read again
| result.keptMissing | The amount or rate is missing. | रकम या रेट नहीं मिला। | | CHANGED 2026-10-11: shorter, please read again
| result.keptNoMid | Couldn’t compare without that day’s rate. | उस दिन के रेट के बिना तुलना नहीं हो सकी। | | CHANGED 2026-10-11: shorter, please read again
| result.taxTitle | Federal remittance tax | संघीय रेमिटेंस टैक्स | |
| result.taxMatches | Paid by {funding}. 1% of {amount} is {expected}. The receipt shows {found}. | {funding} से भुगतान। {amount} का 1% {expected} है। रसीद में {found} है। | | CHANGED 2026-10-11: shorter, please read again
| result.taxNotFound | Paid by {funding}. 1% of {amount} is {expected}. No tax line found. | {funding} से भुगतान। {amount} का 1% {expected} है। टैक्स की लाइन नहीं मिली। | | CHANGED 2026-10-11: shorter, please read again
| result.taxDiffers | Paid by {funding}. 1% of {amount} is {expected}, but the receipt shows {found}. | {funding} से भुगतान। {amount} का 1% {expected} है, पर रसीद में {found} है। | | CHANGED 2026-10-11: shorter, please read again
| result.taxNotTaxed | Paid by {funding}, so no tax applies. | {funding} से भुगतान, इसलिए टैक्स नहीं लगता। | | CHANGED 2026-10-11: shorter, please read again
| result.taxBefore | Sent before the tax started. | टैक्स शुरू होने से पहले भेजा गया। | | CHANGED 2026-10-11: shorter, please read again
| result.taxUnknown | Payment method unknown, so the tax can’t be checked. | भुगतान का तरीका पता नहीं, इसलिए टैक्स जाँचा नहीं जा सकता। | | CHANGED 2026-10-11: shorter, please read again
| result.taxPaidBy | Paid by {funding} | {funding} से भुगतान | |
| result.taxFromBank | From a bank account | बैंक खाते से | |
| result.taxBank | From a bank account: {total} total, {tax} less. | बैंक खाते से: कुल {total}, {tax} कम। | | CHANGED 2026-10-11: shorter, please read again
| result.taxAssumption | 1% of the amount sent, per the IRS’s proposed rules. | भेजी रकम का 1%, IRS के प्रस्तावित नियमों के हिसाब से। | | CHANGED 2026-10-11: shorter, please read again
| result.taxSmall | $15 or less, so no tax applies. | $15 या कम, इसलिए टैक्स नहीं लगता। | | CHANGED 2026-10-11: shorter, please read again
| result.nextTitle | Next time | अगली बार | |
| result.compare | Compare this route today | आज यह रूट मिलाएँ | |
| result.notCovered | We don’t check this route yet. | हम अभी यह रूट नहीं जाँचते। | |
| result.routeBoard | See which routes we check | देखें हम कौन से रूट जाँचते हैं | |
| result.disclosuresTitle | Standard disclosures | ज़रूरी जानकारियाँ | |
| result.disclosuresAll | Every standard item was found. | हर ज़रूरी जानकारी मिली। | | CHANGED 2026-10-11: shorter, please read again
| result.disclosuresNote | A photo can miss small print, so this isn’t proof. | फ़ोटो में छोटे अक्षर छूट सकते हैं, इसलिए यह सबूत नहीं है। | | CHANGED 2026-10-11: shorter, please read again
| result.disclosureItems.transfer_amount | transfer amount | भेजी गई रकम | |
| result.disclosureItems.fees | fees | फ़ीस | |
| result.disclosureItems.taxes | taxes | टैक्स | |
| result.disclosureItems.total | total | कुल | |
| result.disclosureItems.exchange_rate | exchange rate | एक्सचेंज रेट | |
| result.disclosureItems.amount_received | amount received | मिली रकम | |
| result.disclosureItems.date_available | date the money is available | पैसा मिलने की तारीख | |
| result.disclosureItems.recipient | recipient | पाने वाला | |
| result.disclosureItems.error_rights | your rights if there’s an error | गलती होने पर आपके अधिकार | |
| result.disclosureItems.cancellation | how to cancel | रद्द करने का तरीका | |
| result.disclosureItems.provider_contact | the provider’s contact details | कंपनी से संपर्क की जानकारी | |
| result.disclosureItems.cfpb_contact | the CFPB’s contact details | CFPB से संपर्क की जानकारी | |
| result.limits[1] | Whether each value was read right | क्या हर रकम सही पढ़ी गई | | CHANGED 2026-10-11: shorter, please read again
| result.limits[2] | Fees charged at your family’s end | परिवार की तरफ़ ली गई फ़ीस | | CHANGED 2026-10-11: shorter, please read again
| result.limits[3] | Rate moves during the day | दिन में रेट का बदलना | | CHANGED 2026-10-11: shorter, please read again
| result.limits[4] | Whether an item was missing, or just cut off | कुछ छूटा था या बस फ़ोटो में कटा | | CHANGED 2026-10-11: shorter, please read again
| observatory.intro | What people really paid, from receipts they chose to share. | लोगों ने असल में कितना चुकाया, उन रसीदों से जो उन्होंने साझा कीं। | |
| observatory.early | Early results | शुरुआती नतीजे | |
| observatory.sample | {n} shared receipts since {since} | {n} साझा रसीदें, {since} से | |
| observatory.tooFew | Not enough receipts yet. Numbers show at {min}. | अभी काफ़ी रसीदें नहीं हैं। {min} होने पर आँकड़े दिखेंगे। | | CHANGED 2026-10-11: shorter, please read again
| observatory.groupsTitle | By provider and route | कंपनी और रूट के हिसाब से | |
| observatory.noGroups | No provider and route has {min} shared receipts yet. | अभी किसी कंपनी और रूट की {min} साझा रसीदें नहीं हैं। | |
| observatory.receipts | {n} receipts | {n} रसीदें | |
| observatory.medianCost | Typical total cost | आम कुल लागत | |
| observatory.medianMarkup | Typical exchange-rate markup | आम एक्सचेंज-रेट मार्कअप | |
| observatory.paidMore | {k} of {of} compared got a worse rate than advertised that day | तुलना की गई {of} में से {k} को उस दिन के विज्ञापित रेट से खराब रेट मिला | |
| observatory.taxTitle | Federal remittance tax | संघीय रेमिटेंस टैक्स | |
| observatory.taxLine | {taxed} paid in cash or similar. Tax matched on {matches}, missing on {notFound}. | {taxed} नकद या ऐसे ही भरे गए। टैक्स {matches} पर मिला, {notFound} पर नहीं मिला। | | CHANGED 2026-10-11: shorter, please read again
| observatory.disclosuresTitle | Standard disclosures not found | ज़रूरी जानकारियाँ जो नहीं मिलीं | |
| observatory.disclosureLine | {item}: {n} of {total} | {item}: {total} में से {n} | |
| observatory.noneMissing | Every standard item was found on every shared receipt. | हर साझा रसीद पर हर ज़रूरी जानकारी मिली। | |
| observatory.method | Shared receipts only, shown at {min} or more. “Typical” is the median. | सिर्फ़ साझा रसीदें, {min} या ज़्यादा होने पर। "आम" यानी मीडियन। | | CHANGED 2026-10-11: shorter, please read again
| observatory.loadFailed | The results couldn’t load. | नतीजे लोड नहीं हो सके। | |
| observatory.limits[1] | What most people pay: people who scan and share receipts aren’t a random sample. | ज़्यादातर लोग कितना चुकाते हैं: रसीद स्कैन और साझा करने वाले लोग कोई रैंडम नमूना नहीं हैं। | |
| observatory.limits[2] | Anything about one person or one transfer. Only totals are shown. | किसी एक व्यक्ति या एक ट्रांसफ़र के बारे में कुछ भी। सिर्फ़ कुल आँकड़े दिखाए जाते हैं। | |
| observatory.limits[3] | Whether a disclosure was missing from the receipt, or only from the photo. | कोई जानकारी रसीद से गायब थी या सिर्फ़ फ़ोटो से। | |
| receiptFields.provider | Provider | कंपनी | |
| receiptFields.send_currency | Sent in | भेजने की मुद्रा | |
| receiptFields.receive_currency | Received in | पाने की मुद्रा | |
| receiptFields.amount_sent | Amount sent | भेजी गई रकम | |
| receiptFields.fee | Fee | फ़ीस | |
| receiptFields.tax | Transfer tax | ट्रांसफ़र टैक्स | |
| receiptFields.total_paid | Total paid | कुल भुगतान | |
| receiptFields.exchange_rate | Exchange rate | एक्सचेंज रेट | |
| receiptFields.amount_received | Amount received | मिलने वाली रकम | |
| receiptFields.pickup_charge | Pickup charge | पिकअप शुल्क | |
| receiptFields.transfer_date | Date sent | भेजने की तारीख | |
| receiptFields.funding_method | Paid with | भुगतान का तरीका | |
| receiptFields.delivery_method | Delivery | पैसा कैसे पहुँचा | |
| receiptPaths.user_corrected | You entered | आपने भरा | |
| funding.compareLabel | You pay with | आप भुगतान करेंगे | |
| funding.compareTaxLine | Paying by {funding} adds the 1% tax: {tax}. | {funding} से भरने पर 1% टैक्स जुड़ता है: {tax}। | | CHANGED 2026-10-11: shorter, please read again
| funding.compareNone | No prices checked yet for paying this way. | इस तरह भुगतान के लिए अभी कोई जाँची हुई कीमत नहीं है। | |
| funding.trueCostLabel | You paid with | आपने भुगतान किया | |
| funding.trueCostTaxLine | Paid by {funding}, so the 1% tax ({tax}) is included. | {funding} से भुगतान, इसलिए 1% टैक्स ({tax}) शामिल है। | | CHANGED 2026-10-11: shorter, please read again
| glossary.remittance.term | Remittance | रेमिटेंस (घर भेजा गया पैसा) | |
| glossary.remittance.plain | Money a person working in one country sends to family or friends in another. Usually regular, usually small amounts, usually spent on essentials like food, rent, school and medicine. | एक देश में काम करने वाला व्यक्ति दूसरे देश में अपने परिवार या दोस्तों को जो पैसा भेजता है। आम तौर पर नियमित, आम तौर पर छोटी रकम, और आम तौर पर खाने, किराए, पढ़ाई और दवा जैसी ज़रूरतों पर खर्च होता है। | |
| glossary.corridor.term | Corridor | कॉरिडोर | |
| glossary.corridor.plain | A sending country and a receiving country, taken as a pair. United States to Mexico is one corridor, United States to India is another. Costs are measured per corridor because they differ enormously between them. | भेजने वाला देश और पाने वाला देश, एक जोड़ी के रूप में। अमेरिका से मेक्सिको एक कॉरिडोर है, अमेरिका से भारत दूसरा। खर्च हर कॉरिडोर के हिसाब से मापा जाता है, क्योंकि उनके बीच बहुत बड़ा फ़र्क होता है। | |
| glossary.mid-market-rate.term | Mid-market rate | मिड-मार्केट रेट | |
| glossary.mid-market-rate.plain | The midpoint between what banks pay to buy a currency and what they charge to sell it, published daily. It is the fairest available yardstick for an exchange rate, and no provider offers it to customers exactly. | बैंक किसी मुद्रा को जिस दाम पर खरीदते हैं और जिस दाम पर बेचते हैं, उनके बीच का बिंदु, जो रोज़ छपता है। एक्सचेंज रेट को परखने का यह सबसे निष्पक्ष पैमाना है, और कोई भी कंपनी ग्राहकों को ठीक यही रेट नहीं देती। | |
| glossary.exchange-rate-markup.term | Exchange-rate markup | एक्सचेंज रेट मार्कअप | |
| glossary.exchange-rate-markup.plain | The gap between the mid-market rate and the rate a provider actually gives you. Also called the margin or spread. It is a real cost of the transfer, but it does not appear as a fee on the receipt, which is why it is where most of the cost hides. | मिड-मार्केट रेट और कंपनी जो रेट असल में आपको देती है, उनके बीच का अंतर। इसे मार्जिन या स्प्रेड भी कहते हैं। यह ट्रांसफ़र का असली खर्च है, पर रसीद पर फ़ीस की तरह नहीं दिखता, इसीलिए ज़्यादातर खर्च यहीं छिपा होता है। | |
| glossary.transfer-fee.term | Transfer fee | ट्रांसफ़र फ़ीस | |
| glossary.transfer-fee.plain | The charge a provider states openly for sending money. It is the number in the advertisement, and it is usually the smaller part of what a transfer really costs. | पैसा भेजने के लिए कंपनी जो फ़ीस खुलकर बताती है। विज्ञापन में यही रकम होती है, और आम तौर पर यह ट्रांसफ़र के असली खर्च का छोटा हिस्सा होती है। | |
| glossary.total-cost.term | Total cost | कुल खर्च | |
| glossary.total-cost.plain | The fee plus the exchange-rate markup plus anything charged at pickup, taken together as a share of the amount sent. The only honest way to compare two providers. | फ़ीस, एक्सचेंज रेट मार्कअप और पैसा लेते समय लिया गया कोई भी चार्ज, सब मिलाकर, भेजी गई रकम के हिस्से के रूप में। दो कंपनियों की तुलना करने का यही एकमात्र ईमानदार तरीका है। | |
| glossary.provider.term | Provider | कंपनी (प्रदाता) | |
| glossary.provider.plain | Any business that moves the money: a bank, a money-transfer company, a mobile money service, or a post office. Also called an MTO, for money transfer operator, when it is not a bank. | कोई भी कारोबार जो पैसा पहुँचाता है: बैंक, मनी ट्रांसफ़र कंपनी, मोबाइल मनी सेवा या डाकघर। जब वह बैंक न हो, तो उसे MTO यानी मनी ट्रांसफ़र ऑपरेटर भी कहते हैं। | |
| glossary.sender.term | Sender | भेजने वाला | |
| glossary.sender.plain | The person paying for the transfer, in the country the money leaves. | वह व्यक्ति जो ट्रांसफ़र के पैसे देता है, उस देश में जहाँ से पैसा जाता है। | |
| glossary.recipient.term | Recipient | पाने वाला | |
| glossary.recipient.plain | The person the money is for, in the country it arrives. Some paperwork calls this person the beneficiary. | वह व्यक्ति जिसके लिए पैसा है, उस देश में जहाँ पैसा पहुँचता है। कुछ कागज़ों में इन्हें लाभार्थी (बेनिफ़िशियरी) कहा जाता है। | |
| glossary.cash-pickup.term | Cash pickup | कैश पिकअप | |
| glossary.cash-pickup.plain | Collecting the transfer as physical cash at an agent, a shop or a branch in the receiving country. Common where the recipient has no bank account, and sometimes carries its own extra charge at the counter. | पाने वाले देश में किसी एजेंट, दुकान या शाखा से ट्रांसफ़र नकद में लेना। जहाँ पाने वाले का बैंक खाता नहीं होता, वहाँ यह आम है, और कभी-कभी काउंटर पर इसका अलग चार्ज भी लगता है। | |
| glossary.bank-deposit.term | Bank deposit | बैंक डिपॉज़िट | |
| glossary.bank-deposit.plain | The transfer arrives directly into the recipient’s bank account. | ट्रांसफ़र सीधे पाने वाले के बैंक खाते में पहुँचता है। | |
| glossary.mobile-money.term | Mobile money | मोबाइल मनी | |
| glossary.mobile-money.plain | An account that lives on a phone number rather than at a bank, common across Africa and Asia. Transfers can arrive into it like a deposit, and it can be spent or cashed out at agents. | ऐसा खाता जो बैंक में नहीं, एक फ़ोन नंबर पर चलता है; अफ़्रीका और एशिया में आम है। ट्रांसफ़र इसमें जमा की तरह आ सकता है, और इसे खर्च किया जा सकता है या एजेंट से नकद निकाला जा सकता है। | |
| glossary.settlement.term | Settlement | सेटलमेंट | |
| glossary.settlement.plain | The moment money actually and finally moves between the institutions involved. A transfer can look instant to the sender while settlement between the banks behind it takes days. | वह पल जब शामिल संस्थाओं के बीच पैसा सच में और आख़िरी तौर पर चलता है। भेजने वाले को ट्रांसफ़र तुरंत लग सकता है, जबकि उसके पीछे के बैंकों के बीच सेटलमेंट में कई दिन लगते हैं। | |
| glossary.payment-rails.term | Payment rails | पेमेंट रेल्स | |
| glossary.payment-rails.plain | The underlying systems money travels on, the way trains travel on tracks. Bank wires, card networks, mobile money systems and blockchains are all different rails with different speeds and costs. | वे बुनियादी सिस्टम जिन पर पैसा चलता है, जैसे रेलगाड़ी पटरी पर चलती है। बैंक वायर, कार्ड नेटवर्क, मोबाइल मनी सिस्टम और ब्लॉकचेन, सब अलग-अलग रेल हैं, अलग रफ़्तार और अलग खर्च के साथ। | |
| glossary.swift.term | SWIFT | SWIFT | |
| glossary.swift.plain | The messaging network banks use to instruct each other across borders. It moves instructions, not money: the money follows by settlement between the banks, which is part of why bank transfers take days. | वह मैसेज नेटवर्क जिससे बैंक सीमा पार एक-दूसरे को निर्देश भेजते हैं। यह निर्देश भेजता है, पैसा नहीं: पैसा बाद में बैंकों के बीच सेटलमेंट से जाता है, और यही एक वजह है कि बैंक ट्रांसफ़र में कई दिन लगते हैं। | |
| glossary.correspondent-bank.term | Correspondent bank | कॉरेस्पॉन्डेंट बैंक | |
| glossary.correspondent-bank.plain | A bank in the middle, used because the sending bank and the receiving bank have no direct relationship with each other. It passes the payment along and can take a cut for doing so. One transfer may go through several, and the sender is rarely told how many. | बीच का बैंक, जिसका इस्तेमाल इसलिए होता है क्योंकि भेजने वाले और पाने वाले बैंक का आपस में सीधा रिश्ता नहीं होता। यह पेमेंट आगे बढ़ाता है और इसके लिए अपना हिस्सा काट सकता है। एक ट्रांसफ़र कई ऐसे बैंकों से गुज़र सकता है, और भेजने वाले को शायद ही बताया जाता है कि कितनों से। | |
| glossary.nostro-vostro.term | Nostro and Vostro accounts | नॉस्ट्रो और वॉस्ट्रो खाते | |
| glossary.nostro-vostro.plain | Two names for one account, depending on who is speaking. A bank holding money at another bank calls it a Nostro, meaning ours; the bank holding it calls the same account a Vostro, meaning yours. They are what lets two banks pay each other without any cash moving. | एक ही खाते के दो नाम, इस पर निर्भर कि कौन बोल रहा है। जो बैंक दूसरे बैंक में पैसा रखता है, वह इसे नॉस्ट्रो यानी 'हमारा' कहता है; जिस बैंक में पैसा रखा है, वह उसी खाते को वॉस्ट्रो यानी 'आपका' कहता है। इन्हीं से दो बैंक बिना नकद हिलाए एक-दूसरे को भुगतान कर पाते हैं। | |
| glossary.rtgs.term | RTGS | RTGS | |
| glossary.rtgs.plain | Real-Time Gross Settlement, the system a country’s banks use to make payments final between themselves, one at a time. It runs during business hours, which is why a transfer handed over on a Friday evening can sit until the next working day. | रियल-टाइम ग्रॉस सेटलमेंट: वह सिस्टम जिससे किसी देश के बैंक आपस में भुगतान एक-एक करके पक्के करते हैं। यह कामकाजी घंटों में चलता है, इसीलिए शुक्रवार शाम दिया गया ट्रांसफ़र अगले कामकाजी दिन तक रुक सकता है। | |
| glossary.money-transfer-operator.term | Money transfer operator (MTO) | मनी ट्रांसफ़र ऑपरेटर (MTO) | |
| glossary.money-transfer-operator.plain | A company whose actual business is moving money between people across borders, rather than a bank that offers it alongside everything else. Payout is often cash collected from a local agent instead of a deposit into an account. | ऐसी कंपनी जिसका असली काम सीमा पार लोगों के बीच पैसा पहुँचाना है, उस बैंक से अलग जो बाकी सेवाओं के साथ यह भी देता है। पैसा अक्सर खाते में जमा होने की जगह किसी स्थानीय एजेंट से नकद लिया जाता है। | |
| glossary.kyc.term | KYC | KYC | |
| glossary.kyc.plain | Know Your Customer: the identity checks a provider runs before it will move money for someone. It is why a transfer can ask for a passport, and why one can be held while the people involved are checked against sanctions lists. | नो योर कस्टमर: पैसा भेजने से पहले कंपनी जो पहचान जाँच करती है। इसीलिए ट्रांसफ़र में पासपोर्ट माँगा जा सकता है, और इसीलिए शामिल लोगों को प्रतिबंध सूचियों से मिलाते समय ट्रांसफ़र रोका जा सकता है। | |
| glossary.pre-funded-pool.term | Pre-funded pool | पहले से जमा पूल | |
| glossary.pre-funded-pool.plain | Money a provider keeps waiting in both countries in advance, so a transfer can be paid out on one side without anything arriving from the other. It is why some transfers land in minutes. Nothing crossed a border; the provider squares up with itself later, in bulk. | वह पैसा जो कंपनी दोनों देशों में पहले से तैयार रखती है, ताकि एक तरफ़ भुगतान हो सके, भले दूसरी तरफ़ से अभी कुछ न आया हो। इसीलिए कुछ ट्रांसफ़र मिनटों में पहुँच जाते हैं। कोई पैसा सीमा पार नहीं हुआ; कंपनी बाद में थोक में अपना हिसाब बराबर करती है। | |
| glossary.throughput.term | Throughput | थ्रूपुट | |
| glossary.throughput.plain | How much a system can handle in a given time, usually counted in transactions per second. It says nothing about how long any one transfer takes, which is a separate measure. | कोई सिस्टम तय समय में कितना संभाल सकता है, आम तौर पर हर सेकंड लेन-देन की गिनती में। इससे यह पता नहीं चलता कि एक ट्रांसफ़र में कितना समय लगता है; वह अलग माप है। | |
| glossary.latency.term | Latency | लेटेंसी | |
| glossary.latency.plain | How long a single transfer takes from being sent to being finished. A system can have high throughput and bad latency at once: plenty of work getting done, and your payment still waiting. | एक ट्रांसफ़र भेजे जाने से पूरा होने तक कितना समय लेता है। किसी सिस्टम का थ्रूपुट ज़्यादा और लेटेंसी ख़राब, दोनों एक साथ हो सकते हैं: बहुत सारा काम हो रहा है, फिर भी आपका भुगतान इंतज़ार में है। | |
| glossary.finality.term | Finality | फ़ाइनैलिटी (अंतिमता) | |
| glossary.finality.plain | The point after which a payment can no longer be reversed or undone. Different systems mean different things by the word, which is why one system being final is not the same claim as another being final. | वह बिंदु जिसके बाद भुगतान को पलटा या रद्द नहीं किया जा सकता। अलग-अलग सिस्टम इस शब्द से अलग चीज़ें मतलब लेते हैं, इसीलिए एक सिस्टम का 'पक्का' होना दूसरे के 'पक्के' होने जैसा दावा नहीं है। | |
| glossary.atomicity.term | Atomicity | एटॉमिसिटी | |
| glossary.atomicity.plain | The requirement that a transfer touching several places either completes in all of them or is undone in all of them, with nothing left half done. It is the guarantee that money cannot leave one account without arriving in another. | यह शर्त कि कई जगहों को छूने वाला ट्रांसफ़र या तो सब जगह पूरा हो या सब जगह रद्द हो, कुछ भी आधा-अधूरा न रहे। यही गारंटी है कि पैसा एक खाते से निकले तो दूसरे में ज़रूर पहुँचे। | |
| glossary.validator.term | Validator | वैलिडेटर | |
| glossary.validator.plain | A participant that checks transactions and agrees with the other participants on which ones count. How many there are, and how far apart they sit, changes both how quickly a network settles and how hard it is to attack. | ऐसा भागीदार जो लेन-देन जाँचता है और बाकी भागीदारों के साथ तय करता है कि कौन-से मान्य हैं। ये कितने हैं और कितनी दूर-दूर हैं, इससे नेटवर्क के सेटल होने की रफ़्तार और उस पर हमले की मुश्किल, दोनों बदलती हैं। | |
| glossary.sharding.term | Sharding | शार्डिंग | |
| glossary.sharding.plain | Splitting a network’s accounts, and the validators that check them, into separate groups so each group works at the same time as the others. Capacity grows with the number of groups, as long as a transfer only has to touch one of them. | नेटवर्क के खातों और उन्हें जाँचने वाले वैलिडेटरों को अलग-अलग समूहों में बाँटना, ताकि हर समूह बाकी के साथ एक ही समय काम करे। क्षमता समूहों की संख्या के साथ बढ़ती है, बशर्ते ट्रांसफ़र को सिर्फ़ एक समूह छूना पड़े। | |
| glossary.sidechain.term | Sidechain | साइडचेन | |
| glossary.sidechain.plain | A separate chain with its own validators and its own rules, joined to a main chain by a bridge that value crosses in both directions. Its security is its own rather than the main chain’s, which is the part people forget. | अपने वैलिडेटरों और अपने नियमों वाली एक अलग चेन, जो मुख्य चेन से एक ब्रिज से जुड़ी होती है, जिससे मूल्य दोनों तरफ़ जाता है। इसकी सुरक्षा अपनी होती है, मुख्य चेन की नहीं, और लोग यही बात भूल जाते हैं। | |
| glossary.payment-channel.term | Payment channel | पेमेंट चैनल | |
| glossary.payment-channel.plain | A direct link between two parties who lock funds up front, settle any number of payments between themselves off the chain, and record only the opening and closing balances on it. Fast, but the locked money cannot be used for anything else meanwhile. | दो पक्षों के बीच सीधा जुड़ाव, जो पहले से पैसा लॉक करते हैं, आपस में चेन के बाहर कितने भी भुगतान निपटाते हैं, और चेन पर सिर्फ़ शुरुआती और आख़िरी बैलेंस दर्ज करते हैं। तेज़ है, पर लॉक किया पैसा इस बीच किसी और काम नहीं आ सकता। | |
| glossary.fixed-fee.term | Fixed fee | तय फ़ीस | |
| glossary.fixed-fee.plain | A flat charge that is the same whatever the amount sent. It pays for the parts of a transfer that cost the provider about the same every time, which is why it weighs heaviest on the smallest transfers. | एक जैसी फ़ीस, भेजी गई रकम चाहे जो हो। यह ट्रांसफ़र के उन हिस्सों का खर्च चुकाती है जो कंपनी को हर बार लगभग बराबर पड़ते हैं, इसीलिए सबसे छोटे ट्रांसफ़र पर इसका बोझ सबसे भारी होता है। | |
| glossary.percentage-fee.term | Percentage fee | प्रतिशत फ़ीस | |
| glossary.percentage-fee.plain | A charge that grows with the amount sent, taken as a share of it. Many providers blend one into a fixed fee and publish the sum, so the receipt never says which part is which. | ऐसी फ़ीस जो भेजी गई रकम के साथ बढ़ती है, उसके हिस्से के रूप में ली जाती है। कई कंपनियाँ इसे तय फ़ीस में मिलाकर जोड़ बता देती हैं, इसलिए रसीद कभी नहीं बताती कि कौन-सा हिस्सा कौन-सा है। | |
| glossary.recipient-side-charges.term | Recipient-side charges | पाने वाले की तरफ़ के चार्ज | |
| glossary.recipient-side-charges.plain | Anything taken out at the receiving end: a commission at the pickup counter, or a deduction by the recipient's own bank for accepting an incoming transfer. The sender is rarely shown it, and often only learns of it when less money arrives than was sent. | पाने वाली तरफ़ जो कुछ भी काटा जाता है: पिकअप काउंटर पर कमीशन, या आने वाला ट्रांसफ़र लेने के लिए पाने वाले के अपने बैंक की कटौती। भेजने वाले को यह शायद ही दिखाया जाता है, और अक्सर तभी पता चलता है जब भेजे गए से कम पैसा पहुँचता है। | |
| glossary.compliance-checks.term | Compliance checks | कंप्लायंस जाँच | |
| glossary.compliance-checks.plain | The screening a provider runs before it moves money: confirming who the sender is and checking both names against sanctions lists. The work costs about the same whatever the amount, which is one reason fixed fees exist. | पैसा भेजने से पहले कंपनी जो जाँच करती है: भेजने वाले की पहचान पक्की करना और दोनों नामों को प्रतिबंध सूचियों से मिलाना। इस काम का खर्च रकम चाहे जो हो, लगभग बराबर होता है, और तय फ़ीस होने की यह एक वजह है। | |
| glossary.de-risking.term | De-risking | डी-रिस्किंग | |
| glossary.de-risking.plain | A large bank ending its correspondent relationships with smaller banks in markets it judges risky or not worth the compliance cost, rather than screening each one. Payments to those markets then need more hops, and each hop can add a fee. | जब कोई बड़ा बैंक उन बाज़ारों के छोटे बैंकों से अपने कॉरेस्पॉन्डेंट रिश्ते ख़त्म कर देता है जिन्हें वह जोखिम भरा या कंप्लायंस के खर्च के लायक नहीं मानता, बजाय हर एक की जाँच करने के। तब उन बाज़ारों तक भुगतान को ज़्यादा पड़ाव लगते हैं, और हर पड़ाव फ़ीस जोड़ सकता है। | |
| glossary.aml.term | Anti-money-laundering (AML) | एंटी-मनी-लॉन्ड्रिंग (AML) | |
| glossary.aml.plain | The rules that require a provider to check who is sending money, where it came from and where it is going, and to report anything suspicious. The cost of doing it is roughly fixed per relationship, whatever flows through it. | वे नियम जिनके तहत कंपनी को जाँचना होता है कि पैसा कौन भेज रहा है, कहाँ से आया और कहाँ जा रहा है, और कुछ भी संदिग्ध हो तो रिपोर्ट करना होता है। इसका खर्च हर रिश्ते पर लगभग तय होता है, उससे चाहे जितना पैसा गुज़रे। | |
| glossary.currency-liquidity.term | Currency liquidity | मुद्रा की लिक्विडिटी | |
| glossary.currency-liquidity.plain | How easily a currency can be bought and sold in volume without moving its price. A heavily traded currency is cheap to convert into; a thinly traded one is harder to source, harder to hedge, and the difficulty ends up in the exchange rate. | कोई मुद्रा बड़ी मात्रा में उसका दाम हिलाए बिना कितनी आसानी से खरीदी-बेची जा सकती है। ज़्यादा कारोबार वाली मुद्रा में बदलना सस्ता होता है; कम कारोबार वाली मुद्रा जुटाना और उसका जोखिम ढकना मुश्किल होता है, और वह मुश्किल एक्सचेंज रेट में आ जाती है। | |
| glossary.capital-controls.term | Capital controls | पूंजी नियंत्रण | |
| glossary.capital-controls.plain | Government limits on how freely money can enter or leave a country: caps, approvals, or restrictions on holding foreign currency. Every transfer across that border carries the friction they add. | किसी देश में पैसा कितनी आज़ादी से आ-जा सकता है, इस पर सरकारी रोक: सीमाएँ, मंज़ूरियाँ, या विदेशी मुद्रा रखने पर पाबंदी। उस सीमा के पार हर ट्रांसफ़र पर इनसे बढ़ी रुकावट का बोझ होता है। | |
| glossary.last-mile.term | Last mile | आख़िरी मील | |
| glossary.last-mile.plain | The final step of getting money into the recipient's hands, after it has arrived in the country: the trip to a pickup agent, the agent's own cut, the cash that has to be physically there. Where the recipient lives far from town, this step alone can be a large share of the cost. | देश में पैसा पहुँचने के बाद उसे पाने वाले के हाथ तक पहुँचाने का आख़िरी कदम: पिकअप एजेंट तक जाना, एजेंट का अपना हिस्सा, और वहाँ नकद का मौजूद होना। जहाँ पाने वाला शहर से दूर रहता है, वहाँ सिर्फ़ यही कदम खर्च का बड़ा हिस्सा हो सकता है। | |
| glossary.diaspora.term | Diaspora | प्रवासी समुदाय (डायस्पोरा) | |
| glossary.diaspora.plain | The people from one country living in another. A large diaspora on a corridor means a large market for sending money along it, which is what draws providers in and pushes the price down. | एक देश के वे लोग जो दूसरे देश में रहते हैं। किसी कॉरिडोर पर बड़ा प्रवासी समुदाय मतलब उस पर पैसा भेजने का बड़ा बाज़ार, जो कंपनियों को खींचता है और दाम नीचे लाता है। | |
| glossary.remittance-channel.term | Remittance channel | रेमिटेंस चैनल | |
| glossary.remittance-channel.plain | The route the money takes: a bank transfer, a money transfer operator, mobile money, or an informal carrier. Which one a family uses tends to follow the amount, and the fee structure of each is different. | पैसा किस रास्ते जाता है: बैंक ट्रांसफ़र, मनी ट्रांसफ़र ऑपरेटर, मोबाइल मनी, या कोई अनौपचारिक वाहक। परिवार कौन-सा इस्तेमाल करता है, यह अक्सर रकम पर निर्भर करता है, और हर एक का फ़ीस ढाँचा अलग होता है। | |
| glossary.shock.term | Shock | झटका (शॉक) | |
| glossary.shock.plain | An unexpected event that cuts a household's income or raises its costs: an illness, a lost job, a flood, a failed harvest, a conflict. The word researchers use for the thing insurance exists to cover. | कोई अचानक घटना जो घर की आमदनी घटा दे या खर्च बढ़ा दे: बीमारी, नौकरी जाना, बाढ़, फ़सल ख़राब होना, कोई संघर्ष। शोधकर्ता यह शब्द उस चीज़ के लिए इस्तेमाल करते हैं जिससे बचाने के लिए बीमा होता है। | |
| glossary.countercyclical.term | Countercyclical | काउंटरसाइक्लिकल | |
| glossary.countercyclical.plain | Rising when conditions at home get worse, and easing when they improve. Procyclical is the reverse. Whether remittances behave one way or the other turns out to depend on the country and the kind of shock. | घर के हालात बिगड़ने पर बढ़ना, और सुधरने पर घटना। प्रोसाइक्लिकल इसका उल्टा है। रेमिटेंस किस तरह बर्ताव करते हैं, यह देश और झटके के प्रकार पर निर्भर करता है। | |
| glossary.coping-strategy.term | Coping strategy | संभलने का तरीका | |
| glossary.coping-strategy.plain | What a household does to get through a shock: sell something, eat less, borrow, send a member to work elsewhere. Some cost more later than they raise now; selling the animals that earn next year's income is the expensive kind. | झटके से निकलने के लिए घर जो करता है: कुछ बेचना, कम खाना, उधार लेना, किसी सदस्य को कहीं और काम पर भेजना। कुछ तरीके अभी जितना देते हैं उससे ज़्यादा बाद में महँगे पड़ते हैं; अगले साल की कमाई देने वाले जानवर बेचना महँगा तरीका है। | |
| glossary.capital-flows.term | Capital flows | पूंजी प्रवाह | |
| glossary.capital-flows.plain | Money crossing borders in any form: investment in businesses, loans, purchases of shares and bonds, aid, remittances. In a crisis the private, profit-seeking kinds tend to reverse fast. Remittances tend not to. | किसी भी रूप में सीमा पार करता पैसा: कारोबार में निवेश, कर्ज़, शेयर और बॉन्ड की खरीद, सहायता, रेमिटेंस। संकट में मुनाफ़ा चाहने वाले निजी प्रवाह जल्दी पलट जाते हैं। रेमिटेंस आम तौर पर नहीं पलटते। | |
| glossary.originator-bank.term | Originator bank | भेजने वाले का बैंक | |
| glossary.originator-bank.plain | The bank where a payment starts: the sender's own. The only bank in the chain the sender deals with, and the only fee the sender is shown for certain. | वह बैंक जहाँ भुगतान शुरू होता है: भेजने वाले का अपना। सिलसिले में यही एकमात्र बैंक है जिससे भेजने वाले का वास्ता होता है, और यही एकमात्र फ़ीस है जो उसे पक्की दिखाई जाती है। | |
| glossary.intermediary-bank.term | Intermediary bank | बीच का बैंक | |
| glossary.intermediary-bank.plain | A bank in the middle of the chain that neither the sender nor the recipient chose or can see. It forwards the payment to the next link, and may take its own fee out of it on the way. | सिलसिले के बीच का वह बैंक जिसे न भेजने वाले ने चुना, न पाने वाले ने, और न कोई उसे देख सकता है। यह भुगतान अगली कड़ी तक भेजता है, और रास्ते में उसमें से अपनी फ़ीस काट सकता है। | |
| glossary.beneficiary-bank.term | Beneficiary bank | पाने वाले का बैंक | |
| glossary.beneficiary-bank.plain | The last bank in the chain, the recipient's own, which credits whatever arrives to their account. It sees only what reached it, not what left. | सिलसिले का आख़िरी बैंक, पाने वाले का अपना, जो जो कुछ पहुँचा उसे उनके खाते में जमा करता है। इसे सिर्फ़ वही दिखता है जो उस तक पहुँचा, वह नहीं जो चला था। | |
| glossary.charge-codes.term | SHA, OUR and BEN | SHA, OUR और BEN | |
| glossary.charge-codes.plain | A three-letter code on every SWIFT payment saying who pays the banks in the middle. SHA: shared, each intermediary takes its fee from the money in transit. OUR: the sender pays every fee up front. BEN: the recipient pays all of them, out of what arrives. | हर SWIFT भुगतान पर तीन अक्षरों का कोड जो बताता है कि बीच के बैंकों को कौन चुकाएगा। SHA: साझा, हर बीच का बैंक रास्ते के पैसे से अपनी फ़ीस लेता है। OUR: भेजने वाला सारी फ़ीस पहले ही चुकाता है। BEN: पाने वाला सब चुकाता है, पहुँचे पैसे में से। | |
| glossary.clearing.term | Clearing | क्लियरिंग | |
| glossary.clearing.plain | The checking stage of a payment: the instruction is sent, both sides reconcile the details, and each confirms what it now owes the other. No money moves. A SWIFT message is a clearing event. | भुगतान की जाँच वाला चरण: निर्देश भेजा जाता है, दोनों पक्ष ब्योरे मिलाते हैं, और हर पक्ष पक्का करता है कि अब उसे दूसरे को कितना देना है। कोई पैसा नहीं चलता। SWIFT मैसेज एक क्लियरिंग घटना है। | |
| glossary.ach.term | ACH | ACH | |
| glossary.ach.plain | The Automated Clearing House, the network behind most everyday bank-to-bank payments in the United States, direct deposits and bill payments included. Cheap and batch-processed, and a credit sent through it can be reversed for days afterwards. | ऑटोमेटेड क्लियरिंग हाउस: अमेरिका में ज़्यादातर रोज़मर्रा के बैंक-से-बैंक भुगतानों के पीछे का नेटवर्क, जिसमें सीधी तनख़्वाह जमा और बिल भुगतान भी शामिल हैं। सस्ता है और खेपों में चलता है, और इससे भेजा गया पैसा कई दिनों बाद तक वापस लिया जा सकता है। | |
| glossary.provisional-credit.term | Provisional credit | अस्थायी क्रेडिट | |
| glossary.provisional-credit.plain | Money that shows in an account before the payment behind it is final. It can be spent, and it can also be taken back if settlement does not go through. The word is in the account agreement, not on the screen. | वह पैसा जो खाते में तब दिखता है जब उसके पीछे का भुगतान अभी पक्का नहीं हुआ। इसे खर्च किया जा सकता है, और अगर सेटलमेंट न हो तो वापस भी लिया जा सकता है। यह शब्द खाते के समझौते में होता है, स्क्रीन पर नहीं। | |
| glossary.cutoff-time.term | Cutoff time | कटऑफ़ समय | |
| glossary.cutoff-time.plain | The time of day after which a bank stops counting new instructions as today's. Miss it by a minute and the transfer starts tomorrow; miss it on a Friday and it starts Monday. | दिन का वह समय जिसके बाद बैंक नए निर्देशों को आज का नहीं गिनता। एक मिनट चूके तो ट्रांसफ़र कल शुरू होगा; शुक्रवार को चूके तो सोमवार। | |
| glossary.batch-processing.term | Batch processing | बैच प्रोसेसिंग | |
| glossary.batch-processing.plain | Collecting payments and processing them together at set times rather than one by one as they arrive. Cheaper for the system, and every payment waits for the next window. | भुगतानों को आते ही एक-एक करके निपटाने के बजाय इकट्ठा करके तय समय पर एक साथ निपटाना। सिस्टम के लिए सस्ता है, और हर भुगतान अगली खिड़की का इंतज़ार करता है। | |
| glossary.sanctions-screening.term | Sanctions screening | प्रतिबंध जाँच | |
| glossary.sanctions-screening.plain | Checking the names on a payment against government lists of people and organizations banks may not deal with, such as the US Treasury's OFAC list. Most matches are a similar name, not the person, and clearing them takes a human. | भुगतान पर लिखे नामों को उन लोगों और संगठनों की सरकारी सूचियों से मिलाना जिनसे बैंक लेन-देन नहीं कर सकते, जैसे अमेरिकी ट्रेज़री की OFAC सूची। ज़्यादातर मेल बस मिलता-जुलता नाम होते हैं, वही व्यक्ति नहीं, और उन्हें साफ़ करने के लिए किसी इंसान की ज़रूरत होती है। | |
| glossary.fx-desk.term | Forex desk | फ़ॉरेक्स डेस्क | |
| glossary.fx-desk.plain | The part of a bank that buys and sells currency. It keeps its own hours, which are not the branch's, so a payment that needs converting can be held for the desk's next window. | बैंक का वह हिस्सा जो मुद्रा खरीदता-बेचता है। इसके अपने घंटे होते हैं, शाखा के नहीं, इसलिए जिस भुगतान में मुद्रा बदलनी हो वह डेस्क की अगली खिड़की तक रुक सकता है। | |
| glossary.swift-mt.term | SWIFT MT messages | SWIFT MT मैसेज | |
| glossary.swift-mt.plain | The older family of SWIFT message formats, numbered by type; an MT103 carries a customer payment. Much of each message is free text, which is why an address can arrive as one unbroken line. | SWIFT मैसेज फ़ॉर्मैट का पुराना परिवार, प्रकार के हिसाब से नंबर वाला; MT103 ग्राहक का भुगतान ले जाता है। हर मैसेज का बड़ा हिस्सा खुला टेक्स्ट होता है, इसीलिए पता एक लंबी लाइन बनकर पहुँच सकता है। | |
| glossary.straight-through-processing.term | Straight-through processing | स्ट्रेट-थ्रू प्रोसेसिंग | |
| glossary.straight-through-processing.plain | A payment handled end to end by software, with no person reading it. Anything a machine cannot parse, a truncated address, a name in the wrong field, drops out of that flow into a queue for someone to fix. | ऐसा भुगतान जो शुरू से अंत तक सॉफ़्टवेयर से निपटता है, कोई इंसान उसे नहीं पढ़ता। जो कुछ मशीन न समझ पाए, जैसे कटा हुआ पता या ग़लत खाने में लिखा नाम, वह इस धारा से निकलकर किसी के ठीक करने की कतार में चला जाता है। | |
| glossary.api.term | API | API | |
| glossary.api.plain | A way for one piece of software to ask another for information or an action directly, without a message file in between. Each bank tends to build its own, which is the message-format problem again in newer clothes. | एक सॉफ़्टवेयर का दूसरे से सीधे जानकारी या कोई काम माँगने का तरीका, बीच में कोई मैसेज फ़ाइल नहीं। हर बैंक अक्सर अपना अलग बनाता है, जो नए रूप में वही मैसेज फ़ॉर्मैट वाली समस्या है। | |
| glossary.iso-20022.term | ISO 20022 | ISO 20022 | |
| glossary.iso-20022.plain | The newer standard for financial messages, replacing SWIFT MT. It puts each piece of information in its own labelled field, street, building, postcode, city, country, so that software at the other end can read it without guessing. | वित्तीय मैसेज का नया मानक, जो SWIFT MT की जगह ले रहा है। यह हर जानकारी को उसके अपने नाम वाले खाने में रखता है, जैसे गली, इमारत, पिनकोड, शहर, देश, ताकि दूसरी तरफ़ का सॉफ़्टवेयर बिना अंदाज़ा लगाए उसे पढ़ सके। | |
| glossary.uetr.term | UETR | UETR | |
| glossary.uetr.plain | Unique end-to-end transaction reference: one identifier attached to a payment at the start that every bank along the chain keeps and can look up, instead of each bank knowing the payment only by its own internal number. | यूनिक एंड-टू-एंड ट्रांज़ैक्शन रेफ़रेंस: शुरू में भुगतान से जुड़ी एक पहचान, जिसे रास्ते का हर बैंक रखता है और खोज सकता है, बजाय इसके कि हर बैंक भुगतान को सिर्फ़ अपने अंदरूनी नंबर से जाने। | |
| glossary.sepa.term | SEPA | SEPA | |
| glossary.sepa.plain | The Single Euro Payments Area: the European countries that agreed to run euro payments on one set of rules and formats, so a transfer between two of them works like a domestic one. | सिंगल यूरो पेमेंट्स एरिया: वे यूरोपीय देश जिन्होंने यूरो भुगतान एक ही नियम और फ़ॉर्मैट पर चलाने पर सहमति दी, ताकि उनमें से किन्हीं दो के बीच ट्रांसफ़र घरेलू ट्रांसफ़र जैसा चले। | |
| glossary.rpw.term | Remittance Prices Worldwide (RPW) | रेमिटेंस प्राइसेज़ वर्ल्डवाइड (RPW) | |
| glossary.rpw.plain | The World Bank's quarterly survey of what it costs to send money, corridor by corridor and provider by provider. Every provider is priced on the same fixed benchmark amount, so a fee in one quarter can be set against a fee in another. | विश्व बैंक का तिमाही सर्वे कि पैसा भेजने में कितना खर्च होता है, हर कॉरिडोर और हर कंपनी के हिसाब से। हर कंपनी का दाम एक ही तय रकम पर लिया जाता है, ताकि एक तिमाही की फ़ीस की दूसरी से तुलना हो सके। | |
| glossary.reference-rate.term | Reference rate | संदर्भ रेट | |
| glossary.reference-rate.plain | A published daily snapshot of an exchange rate, from a central bank or a data service, used as a yardstick. It is a measuring stick, not a price anyone is offering you. | किसी केंद्रीय बैंक या डेटा सेवा से रोज़ छपने वाली एक्सचेंज रेट की तस्वीर, जिसे पैमाने की तरह इस्तेमाल किया जाता है। यह मापने का पैमाना है, कोई आपको इस दाम की पेशकश नहीं कर रहा। | |
| glossary.informal-channel.term | Informal channel | अनौपचारिक चैनल | |
| glossary.informal-channel.plain | Sending money outside licensed providers, through a courier, a shopkeeper network or a trusted intermediary. Often cheaper or the only option, but unprotected: if it goes missing there is no complaint to file. | लाइसेंस वाली कंपनियों के बाहर पैसा भेजना, किसी कूरियर, दुकानदारों के नेटवर्क या भरोसेमंद बिचौलिए के ज़रिए। अक्सर सस्ता या अकेला विकल्प होता है, पर इसमें सुरक्षा नहीं: पैसा गुम हो जाए तो शिकायत करने की कोई जगह नहीं। | |
| glossary.money-mule.term | Money mule | मनी म्यूल | |
| glossary.money-mule.plain | A person recruited, often through a job offer or a friendship, to receive money and forward it on. The money is usually someone else’s fraud proceeds, and moving it is a crime even when the mule did not know. | वह व्यक्ति जिसे, अक्सर नौकरी के ऑफ़र या दोस्ती के बहाने, पैसा लेकर आगे भेजने के लिए फँसाया जाता है। पैसा आम तौर पर किसी और की धोखाधड़ी की कमाई होता है, और उसे आगे भेजना अपराध है, भले म्यूल को पता न हो। | |
| glossary.stablecoin.term | Stablecoin | स्टेबलकॉइन | |
| glossary.stablecoin.plain | A token that moves on a blockchain and is meant to hold the value of one ordinary currency, usually a dollar, by being backed by reserves held somewhere off the chain. | ब्लॉकचेन पर चलने वाला टोकन जो किसी आम मुद्रा, आम तौर पर डॉलर, की कीमत बनाए रखने के लिए बना है, चेन के बाहर कहीं रखे भंडार के सहारे। | |
| glossary.on-ramp.term | On-ramp | ऑन-रैंप | |
| glossary.on-ramp.plain | The regulated point where ordinary money is handed over and turned into a token on a blockchain. Almost always a bank or a licensed institution, because it is the point where the money is real. | नियमों के दायरे वाली वह जगह जहाँ आम पैसा दिया जाता है और ब्लॉकचेन पर टोकन में बदला जाता है। लगभग हमेशा कोई बैंक या लाइसेंस वाली संस्था, क्योंकि यहीं पैसा असली होता है। | |
| glossary.off-ramp.term | Off-ramp | ऑफ़-रैंप | |
| glossary.off-ramp.plain | The reverse: the regulated point where a token is turned back into ordinary local currency the recipient can spend. Every transfer that starts on a blockchain still has to come out of one. | उल्टा काम: नियमों के दायरे वाली वह जगह जहाँ टोकन को फिर से ऐसी स्थानीय मुद्रा में बदला जाता है जिसे पाने वाला खर्च कर सके। ब्लॉकचेन पर शुरू होने वाले हर ट्रांसफ़र को आख़िर किसी ऑफ़-रैंप से निकलना पड़ता है। | |
| glossary.central-bank-money.term | Central bank money | केंद्रीय बैंक का पैसा | |
| glossary.central-bank-money.plain | Money held as a balance at a country's own central bank. It cannot fail the way a claim on a commercial bank can, which is why final settlement between banks happens there. | देश के अपने केंद्रीय बैंक में बैलेंस के रूप में रखा पैसा। यह उस तरह डूब नहीं सकता जैसे किसी व्यावसायिक बैंक पर दावा डूब सकता है, इसीलिए बैंकों के बीच आख़िरी सेटलमेंट वहीं होता है। | |
| glossary.legal-tender.term | Legal tender | वैध मुद्रा (लीगल टेंडर) | |
| glossary.legal-tender.plain | The money a country recognizes for settling a debt: the notes and balances a local shop, landlord or clinic will actually accept. Roughly 200 countries means roughly 200 of them. | वह पैसा जिसे कोई देश कर्ज़ चुकाने के लिए मान्यता देता है: वे नोट और बैलेंस जिन्हें स्थानीय दुकान, मकान मालिक या क्लिनिक सच में लेंगे। लगभग 200 देश, यानी लगभग 200 ऐसी मुद्राएँ। | |
| glossary.trust-account.term | Trust account | ट्रस्ट खाता | |
| glossary.trust-account.plain | An account where a company holds money that belongs to its customers, kept apart from its own funds so it cannot be spent on the business or lost if the business fails. | ऐसा खाता जिसमें कंपनी अपने ग्राहकों का पैसा रखती है, अपने पैसे से अलग, ताकि उसे कारोबार पर खर्च न किया जा सके और कारोबार डूबने पर वह न डूबे। | |
| glossary.base-layer.term | Base layer | बेस लेयर | |
| glossary.base-layer.plain | The main blockchain itself, such as Bitcoin or Ethereum, as opposed to systems built on top of it. Every transaction it carries competes for the same limited room in each block. | मुख्य ब्लॉकचेन ख़ुद, जैसे बिटकॉइन या इथीरियम, उसके ऊपर बने सिस्टमों से अलग। इस पर हर लेन-देन हर ब्लॉक की उसी सीमित जगह के लिए होड़ करता है। | |
| glossary.block.term | Block | ब्लॉक | |
| glossary.block.plain | A batch of transactions a blockchain adds to its record in one go. Each chain caps how much a block can hold and how often a new one arrives, which sets how many transactions it can carry at all. | लेन-देन की एक खेप जिसे ब्लॉकचेन एक बार में अपने रिकॉर्ड में जोड़ती है। हर चेन तय करती है कि एक ब्लॉक कितना रख सकता है और नया कितनी बार आता है, और इसी से तय होता है कि वह कुल कितने लेन-देन ले जा सकती है। | |
| glossary.gas-limit.term | Gas limit | गैस लिमिट | |
| glossary.gas-limit.plain | Ethereum's cap on how much computing work a single block may contain. It does the job a fixed block size does on Bitcoin: raising it lets more transactions in, at the cost of heavier blocks for every node to process. | इथीरियम की यह सीमा कि एक ब्लॉक में कितना कंप्यूटिंग काम हो सकता है। यह वही काम करती है जो बिटकॉइन पर तय ब्लॉक साइज़ करता है: इसे बढ़ाने से ज़्यादा लेन-देन आते हैं, पर हर नोड के लिए ब्लॉक भारी हो जाते हैं। | |
| glossary.fee-auction.term | Fee auction | फ़ीस की नीलामी | |
| glossary.fee-auction.plain | How a busy blockchain decides what goes in the next block: senders attach a fee, and the highest bids are included first. Nothing is rejected outright; a low bid simply waits, or never gets in. | व्यस्त ब्लॉकचेन यह कैसे तय करती है कि अगले ब्लॉक में क्या जाएगा: भेजने वाले फ़ीस लगाते हैं, और सबसे ऊँची बोलियाँ पहले शामिल होती हैं। कुछ भी सीधे ठुकराया नहीं जाता; कम बोली बस इंतज़ार करती है, या कभी अंदर नहीं आती। | |
| glossary.confirmation.term | Confirmation | कन्फ़र्मेशन | |
| glossary.confirmation.plain | One more block added on top of the block holding your transaction. Each one makes the transaction harder to undo, which is why a recipient may wait for several before treating it as done. | आपके लेन-देन वाले ब्लॉक के ऊपर जुड़ा एक और ब्लॉक। हर एक लेन-देन को पलटना और मुश्किल बनाता है, इसीलिए पाने वाला उसे पूरा मानने से पहले कई कन्फ़र्मेशन का इंतज़ार कर सकता है। | |
| glossary.chain-reorg.term | Chain reorganization | चेन रीऑर्गनाइज़ेशन | |
| glossary.chain-reorg.plain | When a blockchain swaps its most recent blocks for a competing, longer set, dropping transactions that looked confirmed. Rare, but the reason waiting for more confirmations exists. | जब कोई ब्लॉकचेन अपने सबसे नए ब्लॉक हटाकर उनकी जगह किसी प्रतिद्वंद्वी, लंबे सेट को रख लेती है, और पक्के दिख रहे लेन-देन गिर जाते हैं। ऐसा कम होता है, पर ज़्यादा कन्फ़र्मेशन का इंतज़ार इसी वजह से किया जाता है। | |
| glossary.staking.term | Staking | स्टेकिंग | |
| glossary.staking.plain | Locking up a blockchain's own currency as a deposit in order to help run the network. On Ethereum it is what an attacker would have to destroy to reverse a finalised transaction. | नेटवर्क चलाने में मदद के लिए ब्लॉकचेन की अपनी मुद्रा को जमा के रूप में लॉक करना। इथीरियम पर किसी पक्के लेन-देन को पलटने के लिए हमलावर को यही जमा नष्ट करनी पड़ेगी। | |
| glossary.defi.term | DeFi | DeFi | |
| glossary.defi.plain | Decentralised finance: lending, trading and other financial services run as programs on a blockchain. Busy periods of it compete for the same block space as everything else on the chain. | डीसेंट्रलाइज़्ड फ़ाइनेंस: ब्लॉकचेन पर प्रोग्राम के रूप में चलने वाली उधार, ट्रेडिंग और दूसरी वित्तीय सेवाएँ। इसके व्यस्त दौर चेन पर बाकी सब के साथ उसी ब्लॉक की जगह के लिए होड़ करते हैं। | |
| glossary.nft.term | NFT mint | NFT मिंट | |
| glossary.nft.plain | Creating new unique tokens, often a collectible series released all at once. A popular release floods the chain with transactions willing to pay high fees. | नए अनोखे टोकन बनाना, अक्सर एक साथ जारी की गई कलेक्टिबल सीरीज़। कोई लोकप्रिय रिलीज़ चेन को ऐसे लेन-देन से भर देती है जो ऊँची फ़ीस देने को तैयार होते हैं। | |


The WhatsApp bot's Hindi replies (packages/bot) need the same read. They're built from
pieces in code, so ask Claude for a separate sheet of example replies.

## Learn game modes (2026-10-12)

| Key | English | Hindi draft | Your change (blank if fine) |
|---|---|---|---|
| learn.startHere | Start here | यहाँ से शुरू करें | | NEW 2026-10-12
| learn.games.choose | Pick a game | एक गेम चुनें | | NEW 2026-10-12
| learn.games.check | Check | जाँचें | | NEW 2026-10-12
| learn.games.playAgain | Play again | फिर से खेलें | | NEW 2026-10-12
| learn.games.routeWord | Route | रूट | | NEW 2026-10-12
| learn.games.example | Example | उदाहरण | | NEW 2026-10-12
| learn.games.modes.match | Match | जोड़ी मिलाएँ | | NEW 2026-10-12
| learn.games.modes.quick | True or false | सही या गलत | | NEW 2026-10-12
| learn.games.modes.cost | Who sends more? | कौन ज़्यादा भेजता है? | | NEW 2026-10-12
| learn.games.modes.receipt | Read a receipt | रसीद पढ़ें | | NEW 2026-10-12
| learn.games.modes.safety | Spot the scam | धोखा पहचानें | | NEW 2026-10-12
| learn.games.modes.final | Final round | आखिरी राउंड | | NEW 2026-10-12
| learn.games.matchPrompt | Match the pairs | जोड़ियाँ मिलाएँ | | NEW 2026-10-12
| learn.games.allMatched | All matched! | सब मिल गए! | | NEW 2026-10-12
| learn.games.quickPrompt | True or false? | सही या गलत? | | NEW 2026-10-12
| learn.games.true | True | सही | | NEW 2026-10-12
| learn.games.false | False | गलत | | NEW 2026-10-12
| learn.games.costPrompt | Which sends more home? | कौन घर ज़्यादा भेजता है? | | NEW 2026-10-12
| learn.games.fee | Fee | फ़ीस | | NEW 2026-10-12
| learn.games.rate | Rate | रेट | | NEW 2026-10-12
| learn.games.arrives | Arrives | पहुँचता है | | NEW 2026-10-12
| learn.games.hidden | {amount} hidden in the rate | {amount} रेट में छिपे | | NEW 2026-10-12
| learn.games.receiptTitle | Receipt | रसीद | | NEW 2026-10-12
| learn.games.receiptPrompt.fee | Tap the fee | फ़ीस पर टैप करें | | NEW 2026-10-12
| learn.games.receiptPrompt.rate | Tap the exchange rate | एक्सचेंज रेट पर टैप करें | | NEW 2026-10-12
| learn.games.receiptPrompt.received | Tap what arrives | जो पहुँचता है उस पर टैप करें | | NEW 2026-10-12
| learn.games.receiptLines.fee | Service charge | सर्विस चार्ज (a provider's wording on purpose) | | NEW 2026-10-12
| learn.games.receiptLines.rate | FX rate applied | लागू FX रेट (a provider's wording on purpose) | | NEW 2026-10-12
| learn.games.receiptLines.received | Payout amount | पेआउट राशि (a provider's wording on purpose) | | NEW 2026-10-12
| learn.games.safetyPrompt | Scam or not? | धोखा है या नहीं? | | NEW 2026-10-12
| learn.games.safetyChoices.flag | Red flag | खतरे का संकेत | | NEW 2026-10-12
| learn.games.safetyChoices.fine | Looks fine | ठीक लगता है | | NEW 2026-10-12
| learn.games.safetyChoices.unsure | Can’t tell | कह नहीं सकते | | NEW 2026-10-12
| learn.games.scenarios.stranger.text | A stranger will pay you to receive money and pass it on. | कोई अनजान व्यक्ति पैसे लेकर आगे भेजने के लिए आपको पैसे देगा। | | NEW 2026-10-12
| learn.games.scenarios.stranger.why | That’s how money mules start. | मनी म्यूल ऐसे ही शुरू होते हैं। | | NEW 2026-10-12
| learn.games.scenarios.urgent.text | “It’s your cousin. Send money now. Don’t call me.” | “मैं तुम्हारा कज़िन हूँ। अभी पैसे भेजो। फ़ोन मत करना।” | | NEW 2026-10-12
| learn.games.scenarios.urgent.why | Rushing you and avoiding a call are classic signs. | जल्दबाज़ी और फ़ोन से बचना आम संकेत हैं। | | NEW 2026-10-12
| learn.games.scenarios.code.text | Someone in a chat asks for your sign-in code. | चैट में कोई आपका साइन-इन कोड माँगता है। | | NEW 2026-10-12
| learn.games.scenarios.code.why | Your code opens your account. Never share it. | कोड से आपका खाता खुलता है। इसे कभी न बताएँ। | | NEW 2026-10-12
| learn.games.scenarios.fakeRate.text | A website offers a rate far better than everyone else’s. | एक वेबसाइट सबसे कहीं बेहतर रेट देती है। | | NEW 2026-10-12
| learn.games.scenarios.fakeRate.why | A rate that looks too good usually is. | जो रेट बहुत अच्छा लगे, वह अक्सर धोखा होता है। | | NEW 2026-10-12
| learn.games.scenarios.idCheck.text | A transfer app asks for your ID. | एक ट्रांसफ़र ऐप आपका पहचान पत्र माँगता है। | | NEW 2026-10-12
| learn.games.scenarios.idCheck.why | Real apps ask too. On its own, it proves nothing. | असली ऐप भी माँगते हैं। अकेले इससे कुछ साबित नहीं होता। | | NEW 2026-10-12
| learn.games.scenarios.usual.text | Your usual app shows the fee and rate before you pay. | आपका रोज़ का ऐप पैसे देने से पहले फ़ीस और रेट दिखाता है। | | NEW 2026-10-12
| learn.games.scenarios.usual.why | Showing the full cost up front is a good sign. | पहले ही पूरा खर्च दिखाना अच्छा संकेत है। | | NEW 2026-10-12
| learn.games.answerIs | Answer: {answer} | जवाब: {answer} | | NEW 2026-10-12

## Remmy (2026-10-13)

| Key | English | Hindi draft | Your change (blank if fine) |
|---|---|---|---|
| remmy.open | Ask Remmy | Remmy से पूछें | | NEW 2026-10-13
| remmy.subtitle | Prices, fees and help with the app | कीमतें, फ़ीस और ऐप में मदद | | NEW 2026-10-13
| remmy.hello | Hi, I’m Remmy | नमस्ते, मैं Remmy हूँ | | NEW 2026-10-13
| remmy.intro | Ask what a transfer really costs, or tell me where to take you. | पूछें कि ट्रांसफ़र असल में कितने का पड़ता है, या बताएँ कि कहाँ ले चलूँ। | | NEW 2026-10-13
| remmy.suggestions.0 | What does $500 to India cost? | भारत $500 भेजने में कितना लगेगा? | | NEW 2026-10-13
| remmy.suggestions.1 | What’s a hidden exchange-rate fee? | एक्सचेंज रेट में छिपी फ़ीस क्या है? | | NEW 2026-10-13
| remmy.suggestions.2 | Take me to the receipt scanner | मुझे रसीद स्कैनर पर ले चलो | | NEW 2026-10-13
| remmy.suggestions.3 | Teach me to spot scams | धोखा पहचानना सिखाओ | | NEW 2026-10-13
| remmy.placeholder | Ask Remmy | Remmy से पूछें | | NEW 2026-10-13
| remmy.send | Send | भेजें | | NEW 2026-10-13
| remmy.newChat | New chat | नई चैट | | NEW 2026-10-13
| remmy.close | Close | बंद करें | | NEW 2026-10-13
| remmy.thinking.0 | Thinking | सोच रहा हूँ | | NEW 2026-10-13
| remmy.thinking.1 | Checking prices | कीमतें देख रहा हूँ | | NEW 2026-10-13
| remmy.thinking.2 | Looking it up | ढूँढ रहा हूँ | | NEW 2026-10-13
| remmy.steps.get_prices | Checked today’s prices | आज की कीमतें देखीं | | NEW 2026-10-13
| remmy.steps.get_routes | Looked at our routes | हमारे रूट देखे | | NEW 2026-10-13
| remmy.steps.search_knowledge | Looked up our notes | हमारे नोट्स देखे | | NEW 2026-10-13
| remmy.steps.request_route | Counted your request | आपकी माँग गिनी | | NEW 2026-10-13
| remmy.steps.save_suggestion | Passed your idea on | आपका सुझाव टीम तक पहुँचाया | | NEW 2026-10-13
| remmy.steps.action | Got it ready | तैयार कर दिया | | NEW 2026-10-13
| remmy.compareCard | Compare | तुलना | | NEW 2026-10-13
| remmy.lessonCard | Lesson | पाठ | | NEW 2026-10-13
| remmy.go | Open | खोलें | | NEW 2026-10-13
| remmy.start | Start | शुरू करें | | NEW 2026-10-13
| remmy.save | Save | सेव करें | | NEW 2026-10-13
| remmy.saved | Saved | सेव हो गया | | NEW 2026-10-13
| remmy.already | Already saved | पहले से सेव है | | NEW 2026-10-13
| remmy.signIn | Sign in to save | सेव करने के लिए साइन इन करें | | NEW 2026-10-13
| remmy.saveFailed | Couldn’t save. Try again. | सेव नहीं हुआ। फिर से कोशिश करें। | | NEW 2026-10-13
| remmy.opening | Opening | खोल रहा हूँ | | NEW 2026-10-13
| remmy.limited | I’m taking a short break. You can still compare prices yourself. | मैं थोड़ी देर आराम कर रहा हूँ। आप खुद कीमतों की तुलना कर सकते हैं। | | NEW 2026-10-13
| remmy.offline | I couldn’t connect. Check your internet and try again. | कनेक्ट नहीं हो पाया। इंटरनेट देखकर फिर से कोशिश करें। | | NEW 2026-10-13
| remmy.retry | Try again | फिर से कोशिश करें | | NEW 2026-10-13
| remmy.privacy | Remmy uses an AI model. It doesn’t keep your messages. | Remmy एक AI मॉडल इस्तेमाल करता है। यह आपके मैसेज नहीं रखता। | | NEW 2026-10-13
| remmy.aiTitle | Send to an AI service? | AI सेवा को भेजें? | | NEW 2026-10-13
| remmy.aiBody | Remmy sends what you type to an AI model run by Cloudflare or Groq. Neither keeps it or trains on it. | Remmy आपका लिखा हुआ Cloudflare या Groq के AI मॉडल को भेजता है। कोई भी इसे नहीं रखता, न इससे सीखता है। | | NEW 2026-10-13
| remmy.aiAllow | Allow | अनुमति दें | | NEW 2026-10-13
| remmy.aiDecline | Not now | अभी नहीं | | NEW 2026-10-13
| remmy.slow | You’re sending messages quickly. Wait a minute, then try again. | आप बहुत जल्दी-जल्दी मैसेज भेज रहे हैं। एक मिनट रुककर फिर कोशिश करें। | | NEW 2026-10-13
| remmy.here | Here you go. | यह रहा। | | NEW 2026-10-13
| remmy.noAnswer | I don’t have an answer for that yet. | इसका जवाब अभी मेरे पास नहीं है। | | NEW 2026-10-13
| remmy.couldNot | I couldn’t work that one out. Try asking another way. | यह मैं समझ नहीं पाया। किसी और तरह से पूछकर देखें। | | NEW 2026-10-13
| remmy.pricesHere | Here are today’s checked prices. | ये आज की जाँची हुई कीमतें हैं। | | NEW 2026-10-13
| remmy.totalCost | {p}% cost | {p}% लागत | | NEW 2026-10-13

Review confirmation, 2026-10-13: Angad confirmed in writing that his mother reviewed everything and it looks good, including the Learn games and Remmy rows above. No translation changes requested.

| compare.mostToFamily | RemitBridge choice | RemitBridge की पसंद | | CHANGED 2026-10-14 |


## Publication disclosure and reporting additions, 2026-10-14

Prior approval is preserved. Angad confirmed review and approval of the added rows and choice label on 2026-10-14; no wording changes requested.

| Key | English | Hindi | Reviewer notes | Status |
|---|---|---|---|---|
| remmy.privacy | AI answers can be wrong. Don’t share personal or bank details. | AI के जवाब गलत हो सकते हैं। निजी या बैंक की जानकारी न लिखें। | | NEW/CHANGED 2026-10-14 |
| remmy.aiBody | Your message, recent chat history and relevant RemitBridge data go through our server to Cloudflare or Groq to answer you. We do not store chats or use them to train models. Our server also receives an install ID, language and platform for operation and limits. Suggestions and reports you submit are kept separately. Do not include private details. | जवाब देने के लिए आपका संदेश, हाल की बातचीत और RemitBridge की संबंधित जानकारी हमारे सर्वर से Cloudflare या Groq को जाती है। हम चैट सहेजते नहीं हैं और मॉडल को प्रशिक्षित करने के लिए इस्तेमाल नहीं करते। सेवा और सीमा के लिए हमारे सर्वर को इंस्टॉल ID, भाषा और प्लेटफ़ॉर्म भी मिलता है। आपके भेजे सुझाव और रिपोर्ट अलग रखे जाते हैं। निजी जानकारी न लिखें। | | NEW/CHANGED 2026-10-14 |
| remmy.report | Report reply | जवाब की रिपोर्ट करें | | NEW/CHANGED 2026-10-14 |
| remmy.reportBody | Send this reply to RemitBridge for review? Only the selected reply is sent, without your question or chat history. Reports are kept separately from chats. | यह जवाब समीक्षा के लिए RemitBridge को भेजें? केवल चुना हुआ जवाब भेजा जाएगा, आपका सवाल या बातचीत नहीं। रिपोर्ट चैट से अलग रखी जाती हैं। | | NEW/CHANGED 2026-10-14 |
| remmy.reportSend | Send report | रिपोर्ट भेजें | | NEW/CHANGED 2026-10-14 |
| remmy.reportCancel | Cancel | रद्द करें | | NEW/CHANGED 2026-10-14 |
| remmy.reported | Report sent | रिपोर्ट भेज दी गई | | NEW/CHANGED 2026-10-14 |
| remmy.reportFailed | Could not send report. Try again later. | रिपोर्ट नहीं भेज सके। बाद में फिर कोशिश करें। | | NEW/CHANGED 2026-10-14 |

Review confirmation, 2026-10-14: Angad confirmed item #4 complete, covering the new consent/reporting strings and RemitBridge choice label. Earlier dated row markers are retained as change history.


## Remmy advice disclaimer, 2026-10-15

| Key | English | Hindi | Reviewer notes | Status |
|---|---|---|---|---|
| remmy.privacy | Not financial advice. AI answers can be wrong. Don’t share personal or bank details. | यह वित्तीय सलाह नहीं है। AI के जवाब गलत हो सकते हैं। निजी या बैंक की जानकारी न लिखें। | | CHANGED 2026-10-15; review pending |

Prior approvals are preserved; only the added disclaimer needs fresh review.


## Remmy no longer says "today's", 2026-10-17 (D182)

| Key | English | Hindi | Reviewer notes | Status |
|---|---|---|---|---|
| remmy.steps.get_prices | Checked the prices | कीमतें देखीं | | CHANGED 2026-10-17; review pending ("आज की" removed) |
| remmy.pricesHere | Here are the checked prices. | ये जाँची हुई कीमतें हैं। | | CHANGED 2026-10-17; review pending ("आज की" removed) |

Only the word for "today's" was removed; the rest is the approved wording.


## App Review sign-in, 2026-10-17 (D184)

Shown only when someone types the review account's address. Reviewers will see English.

| Key | English | Hindi | Reviewer notes | Status |
|---|---|---|---|---|
| signIn.passwordLabel | Password | पासवर्ड | | APPROVED 2026-10-17 (Angad's mother, relayed by Angad) |
| signIn.signInWithPassword | Sign in | साइन इन करें | | APPROVED 2026-10-17 (Angad's mother, relayed by Angad) |
| signIn.errors.badPassword | Wrong password. Try again. | पासवर्ड गलत है। फिर कोशिश करें। | | APPROVED 2026-10-17 (Angad's mother, relayed by Angad) |


## Onboarding questions step, 2026-10-17 (D186)

The year of birth and the newsletter switch moved to their own step before sign-up.

| Key | English | Hindi | Reviewer notes | Status |
|---|---|---|---|---|
| onboarding.about.eyebrow | About you | आपके बारे में | | APPROVED 2026-10-17 (Angad's mother, relayed by Angad) |
| onboarding.about.lead | Two quick | दो छोटे | | APPROVED 2026-10-17 (Angad's mother, relayed by Angad) |
| onboarding.about.accent | questions | सवाल | | APPROVED 2026-10-17 (Angad's mother, relayed by Angad) |
| onboarding.about.intro | Your birth year never leaves this phone. | आपका जन्म वर्ष इस फ़ोन से बाहर नहीं जाता। | | APPROVED 2026-10-17 (Angad's mother, relayed by Angad) |
