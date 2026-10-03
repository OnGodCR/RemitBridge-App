# Hindi review sheet

The app's Hindi is Claude's draft (DECISIONS.md D69). It ships to the App Store only after a
fluent Hindi speaker has read every line below and agreed in writing. Their name and the
date then go in `mobile/src/i18n/languages.ts`.

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
| common.stepOf | Step {step} of {of} | चरण {step}, कुल {of} | |
| common.noMailTitle | Email us | हमें ईमेल करें | |
| common.noMailBody | This phone has no email app set up. Write to us at {address} from any email. | इस फ़ोन में कोई ईमेल ऐप सेट नहीं है। किसी भी ईमेल से {address} पर लिखें। | |
| tabs.scan | Scan | स्कैन | |
| tabs.compare | Compare | तुलना | |
| tabs.tools | Tools | टूल | |
| tabs.learn | Learn | जानें | |
| tabs.account | Account | खाता | |
| titles.scan | Scan a receipt | रसीद स्कैन करें | |
| titles.fairRate | Fair rate | सही रेट | |
| titles.scamCheck | Scam check | धोखाधड़ी जाँच | |
| titles.trueCost | TrueCost | TrueCost | |
| titles.yearlyCost | Yearly cost | सालाना लागत | |
| titles.rateHistory | Rate history | रेट का इतिहास | |
| titles.glossary | Glossary | शब्दकोश | |
| titles.blog | Blog | ब्लॉग | |
| titles.saved | Saved | सहेजा गया | |
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
| language.draftNote | Draft translations show only in test builds, until a speaker of the language has checked them and agreed to stand behind them. | ड्राफ़्ट अनुवाद सिर्फ़ टेस्ट वाले ऐप में दिखते हैं, जब तक उस भाषा को बोलने वाला कोई व्यक्ति उन्हें जाँचकर उनकी ज़िम्मेदारी लेने को तैयार न हो। | |
| language.improve | Something reads wrong? Tell us | कुछ ठीक नहीं लग रहा? हमें बताएँ | |
| onboarding.welcome.lead | Sending money home | घर पैसे भेजना | |
| onboarding.welcome.accent | shouldn’t cost this much | इतना महँगा नहीं होना चाहिए | |
| onboarding.welcome.intro | RemitBridge shows what a transfer really costs, and which provider leaves your family the most. | RemitBridge दिखाता है कि पैसे भेजने में असल में कितना खर्च होता है, और किस कंपनी से आपके परिवार को सबसे ज़्यादा पैसा मिलता है। | |
| onboarding.welcome.getStarted | Get started | शुरू करें | |
| onboarding.welcome.haveAccount | I already have an account | मेरा खाता पहले से है | |
| onboarding.why.eyebrow | Why it matters | यह क्यों ज़रूरी है | |
| onboarding.why.heading | The world takes a cut of every dollar sent home. | घर भेजे गए हर डॉलर में से दुनिया अपना हिस्सा काट लेती है। | |
| onboarding.why.flowsLabel | Sent home each year | हर साल घर भेजे जाते हैं | |
| onboarding.why.flowsNote | Money migrant workers send to family in other countries. | प्रवासी मज़दूर दूसरे देशों में अपने परिवार को जो पैसा भेजते हैं। | |
| onboarding.why.costLabel | Average cost to send | भेजने की औसत लागत | |
| onboarding.why.costNote | The global average on a $200 transfer. | $200 भेजने पर दुनिया भर का औसत। | |
| onboarding.why.targetLabel | What it should be | इतनी होनी चाहिए | |
| onboarding.why.targetNote | The UN target the world agreed to hit by 2030. | संयुक्त राष्ट्र का लक्ष्य, जिसे दुनिया ने 2030 तक पाने पर सहमति दी है। | |
| onboarding.why.sources | Sources: {list}. | स्रोत: {list}। | |
| onboarding.why.continue | Continue | आगे बढ़ें | |
| onboarding.route.eyebrow | Your route | आपका रूट | |
| onboarding.route.lead | Where do you | आप पैसे | |
| onboarding.route.accent | send money? | कहाँ भेजते हैं? | |
| onboarding.route.intro | Compare opens on this route. You can change it anytime. | तुलना इसी रूट पर खुलेगी। आप इसे कभी भी बदल सकते हैं। | |
| onboarding.route.paidIn | {country}. Paid out in {currency} | {country}। भुगतान {currency} में | |
| onboarding.route.elsewhere | Sending somewhere else? Pick any country on Compare to ask us to add it. | कहीं और भेजते हैं? तुलना में कोई भी देश चुनें और हमसे उसे जोड़ने को कहें। | |
| signIn.eyebrowOnboarding | Optional | ज़रूरी नहीं | |
| signIn.eyebrowAccount | Your account | आपका खाता | |
| signIn.leadOnboarding | Keep what you check. | जो जाँचें, उसे सँभालकर रखें। | |
| signIn.accentOnboarding | Or skip it for now. | या अभी छोड़ दें। | |
| signIn.leadAccount | Sign in | साइन इन करें | |
| signIn.accentAccount | to keep your checks. | ताकि आपकी जाँचें सुरक्षित रहें। | |
| signIn.benefits[1].title | Your comparisons, saved | आपकी तुलनाएँ, सुरक्षित | |
| signIn.benefits[1].body | Reopen a route and amount in one tap, or a receipt you checked. | एक टैप में कोई रूट और रकम फिर से खोलें, या कोई रसीद जो आपने जाँची थी। | |
| signIn.benefits[2].title | Private, and yours to delete | निजी, और मिटाना आपके हाथ में | |
| signIn.benefits[2].body | Nobody else can read them. One tap in Account removes everything. | इन्हें कोई और नहीं देख सकता। खाता में एक टैप से सब मिट जाता है। | |
| signIn.promise | We never sell data, show ads, or touch your money. | हम कभी डेटा नहीं बेचते, विज्ञापन नहीं दिखाते, और आपके पैसे को हाथ नहीं लगाते। | |
| signIn.google | Continue with Google | Google से जारी रखें | |
| signIn.email | Continue with email | ईमेल से जारी रखें | |
| signIn.skip | Skip for now | अभी छोड़ें | |
| signIn.emailTitle | Your email | आपका ईमेल | |
| signIn.emailIntro | We’ll send a 6-digit code. | हम 6 अंकों का कोड भेजेंगे। | |
| signIn.emailLabel | Email address | ईमेल पता | |
| signIn.sendCode | Send code | कोड भेजें | |
| signIn.codeTitle | Enter the code | कोड डालें | |
| signIn.sentTo | Sent to {email} | {email} पर भेजा गया | |
| signIn.codeLabel | 6-digit code | 6 अंकों का कोड | |
| signIn.resendIn | Resend in {s}s | {s} सेकंड में फिर भेजें | |
| signIn.resend | Resend code | कोड फिर भेजें | |
| signIn.errors.notReady | This sign-in option isn’t set up yet. Try another, or skip for now. | साइन इन का यह तरीका अभी तैयार नहीं है। कोई दूसरा तरीका आज़माएँ, या अभी छोड़ दें। | |
| signIn.errors.notOpen | Email sign-in isn’t open yet. Try another option, or skip for now. | ईमेल से साइन इन अभी शुरू नहीं हुआ है। कोई दूसरा तरीका आज़माएँ, या अभी छोड़ दें। | |
| signIn.errors.rateLimit | Too many tries. Wait a minute and try again. | बहुत ज़्यादा कोशिशें हो गईं। एक मिनट रुककर फिर कोशिश करें। | |
| signIn.errors.badCode | That code didn’t work. Check it or send a new one. | यह कोड काम नहीं किया। इसे जाँचें या नया कोड मँगाएँ। | |
| signIn.errors.offline | No connection. Check your internet and try again. | इंटरनेट नहीं है। अपना कनेक्शन जाँचकर फिर कोशिश करें। | |
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
| compare.noPricesBody | This route is still being set up. Prices show here once they pass our checks, and never before. | यह रूट अभी तैयार हो रहा है। कीमतें हमारी जाँच पास करने के बाद ही यहाँ दिखती हैं, उससे पहले कभी नहीं। | |
| compare.whereRoutesStand | See where each route stands | हर रूट की स्थिति देखें | |
| compare.offlineTitle | You’re offline | आप ऑफ़लाइन हैं | |
| compare.offlineBody | These are the prices from your last visit, loaded {ago}. Pull down to try again. | ये आपकी पिछली बार की कीमतें हैं, {ago} लोड की गई थीं। फिर कोशिश करने के लिए नीचे खींचें। | |
| compare.offlineNothing | You seem to be offline, and there are no saved prices for this choice yet. | लगता है आप ऑफ़लाइन हैं, और इस चुनाव के लिए अभी कोई सहेजी हुई कीमत नहीं है। | |
| compare.summary | {low} to {high} arrives, depending on the provider. | कंपनी के हिसाब से {low} से {high} तक पहुँचते हैं। | |
| compare.mostToFamily | Most to your family | परिवार को सबसे ज़्यादा | |
| compare.promotion | Promotion | ऑफ़र | |
| compare.firstTransferOffers | First-transfer offers | पहली बार भेजने के ऑफ़र | |
| compare.save | Save this comparison | यह तुलना सहेजें | |
| compare.saved | Saved. See your saved list | सहेज ली गई। अपनी सूची देखें | |
| compare.alreadySaved | Already saved. See your saved list | पहले से सहेजी हुई है। अपनी सूची देखें | |
| compare.saveFailed | Couldn’t save. Try again | सहेजी नहीं जा सकी। फिर कोशिश करें | |
| compare.savedSpoken | Saved to your account. | आपके खाते में सहेज ली गई। | |
| compare.alreadySpoken | Already saved. | पहले से सहेजी हुई है। | |
| compare.signInToSaveTitle | Sign in to save comparisons | तुलनाएँ सहेजने के लिए साइन इन करें | |
| compare.signInToSaveBody | Saved comparisons open in one tap, on any phone you sign in on. | सहेजी हुई तुलनाएँ एक टैप में खुलती हैं, किसी भी फ़ोन पर जहाँ आप साइन इन करें। | |
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
| quoteDetail.estimatedFull | Estimated from the {amount} check, with the same fee and rate. | {amount} की जाँच से अनुमान, वही फ़ीस और वही रेट लेकर। | |
| quoteDetail.promo | A first-transfer offer. Later transfers usually cost more, so it’s ranked apart from standing prices. | पहली बार भेजने का ऑफ़र। बाद में भेजना आमतौर पर महँगा पड़ता है, इसलिए इसे आम कीमतों से अलग दिखाया गया है। | |
| quoteDetail.whereMoneyGoes | Where the money goes | पैसा कहाँ जाता है | |
| quoteDetail.upfrontFee | Upfront fee | दिखने वाली फ़ीस | |
| quoteDetail.markup | Exchange-rate markup | एक्सचेंज रेट में मार्कअप | |
| quoteDetail.rateNote | Their rate {theirs} vs. mid-market {mid} {pair} | उनका रेट {theirs}, मिड-मार्केट {mid} {pair} | |
| quoteDetail.betterThanMid | Better than the reference rate. That is a daily rate, and live rates move during the day. | संदर्भ रेट से बेहतर। वह रोज़ का रेट है, और लाइव रेट दिन भर बदलते रहते हैं। | |
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
| quoteDetail.oneCheck | One check so far. The line fills in as {provider} is checked on more days. | अभी तक एक ही जाँच हुई है। जैसे-जैसे {provider} को और दिनों जाँचा जाएगा, रेखा भरती जाएगी। | |
| quoteDetail.recentFailed | Recent prices didn’t load. | हाल की कीमतें लोड नहीं हुईं। | |
| quoteDetail.isFair | Is this rate fair? | क्या यह रेट सही है? | |
| quoteDetail.isFairSub | See what the mid-market rate would give you | देखें कि मिड-मार्केट रेट पर कितना मिलता | |
| quoteDetail.looksWrong | This price looks wrong | यह कीमत गलत लग रही है | |
| quoteDetail.looksWrongSub | Tell us, and we’ll check it again | हमें बताएँ, हम इसे फिर जाँचेंगे | |
| quoteDetail.limits[1] | Whether this provider is available where you live | यह कंपनी आपके इलाके में काम करती है या नहीं | |
| quoteDetail.limits[2] | Fees for paying by card, if you do | कार्ड से भुगतान करने पर लगने वाली फ़ीस | |
| quoteDetail.limits[3] | What the provider charges at other amounts | दूसरी रकमों पर कंपनी कितना लेती है | |
| quoteDetail.limits[4] | How the rate moves before you send | भेजने से पहले रेट कैसे बदलता है | |
| quoteDetail.loadFailed | This price didn’t load. Check your connection and try again. | यह कीमत लोड नहीं हुई। अपना कनेक्शन जाँचकर फिर कोशिश करें। | |
| quoteDetail.gone | This price is no longer published. | यह कीमत अब प्रकाशित नहीं है। | |
| request.eyebrow | Not covered yet | अभी उपलब्ध नहीं | |
| request.lead | {from} to {to} | {from} से {to} | |
| request.accent | isn’t a route we check yet. | का रूट हम अभी नहीं जाँचते। | |
| request.lede | We only show prices we’ve checked ourselves. Requests decide which routes we add next. | हम सिर्फ़ वही कीमतें दिखाते हैं जो हमने खुद जाँची हैं। माँगों से तय होता है कि आगे कौन से रूट जुड़ेंगे। | |
| request.nobody | Nobody has asked for it yet. | अभी तक किसी ने यह नहीं माँगा है। | |
| request.asked | {n} people have asked for it. | {n} लोगों ने यह माँगा है। | |
| request.howArrive | How should the money arrive? | पैसा कैसे पहुँचना चाहिए? | |
| request.anyWay | Any way | किसी भी तरह | |
| request.bank | Bank | बैंक | |
| request.cashPickup | Cash pickup | नकद पिकअप | |
| request.wallet | Wallet | वॉलेट | |
| request.emailMe | Email me when it’s live (optional) | शुरू होने पर मुझे ईमेल करें (ज़रूरी नहीं) | |
| request.emailLabel | Email address, optional | ईमेल पता, ज़रूरी नहीं | |
| request.emailHelp | One email when the route launches. Then we delete your address. | रूट शुरू होने पर सिर्फ़ एक ईमेल। उसके बाद हम आपका पता मिटा देंगे। | |
| request.emailBad | That doesn’t look like an email address. | यह ईमेल पता सही नहीं लग रहा। | |
| request.failed | That didn’t go through. Try again in a moment. | यह नहीं भेजा जा सका। थोड़ी देर बाद फिर कोशिश करें। | |
| request.ask | Ask for this route | यह रूट माँगें | |
| request.counted | Thanks. Your request is counted. | धन्यवाद। आपकी माँग गिन ली गई है। | |
| request.already | You’ve asked for this route already. It’s counted. | आप यह रूट पहले ही माँग चुके हैं। वह गिनी जा चुकी है। | |
| request.willEmail | We’ll email you once when it’s live. | शुरू होने पर हम आपको एक बार ईमेल करेंगे। | |
| request.seeAll | See every requested route | माँगे गए सभी रूट देखें | |
| request.alreadyChecked | We already check this route. | यह रूट हम पहले से जाँचते हैं। | |
| request.compareIt | Compare it | तुलना करें | |
| board.lede | Where RemitBridge checks prices, and where people have asked us to. Requests decide what we add next. | RemitBridge कहाँ-कहाँ कीमतें जाँचता है, और लोगों ने हमसे कहाँ के लिए कहा है। माँगों से तय होता है कि आगे क्या जुड़ेगा। | |
| board.failed | The board didn’t load. Pull down to try again. | बोर्ड लोड नहीं हुआ। फिर कोशिश करने के लिए नीचे खींचें। | |
| board.countsFailed | Request counts didn’t load, so requested routes aren’t shown. | माँगों की गिनती लोड नहीं हुई, इसलिए माँगे गए रूट नहीं दिख रहे। | |
| board.stages.live.title | Live | चालू | |
| board.stages.live.about | Prices checked and published. | कीमतें जाँचकर प्रकाशित की गईं। | |
| board.stages.building.title | Being built | तैयार हो रहा है | |
| board.stages.building.about | We’re setting up price checks. | हम कीमतों की जाँच तैयार कर रहे हैं। | |
| board.stages.under_review.title | Under review | विचार चल रहा है | |
| board.stages.under_review.about | We’re checking whether we can cover it. | हम देख रहे हैं कि क्या हम इसे जोड़ सकते हैं। | |
| board.stages.requested.title | Requested | माँगा गया | |
| board.stages.requested.about | Asked for by people using RemitBridge. | RemitBridge इस्तेमाल करने वालों ने इसे माँगा है। | |
| board.stages.not_feasible.title | Not feasible | संभव नहीं | |
| board.stages.not_feasible.about | We looked, and can’t cover it for now. | हमने देखा, और अभी हम इसे नहीं जोड़ सकते। | |
| board.noRequests | No requests yet. Pick any country on Compare to ask for it. | अभी कोई माँग नहीं है। तुलना में कोई भी देश चुनकर उसे माँगें। | |
| board.fromCountry | From {country} | {country} से | |
| board.requests | {n} requests | {n} माँगें | |
| board.opensCompare | Opens Compare on this route | इस रूट पर तुलना खोलता है | |
| board.ask | Ask for a route | नया रूट माँगें | |
| account.yourName | Your name | आपका नाम | |
| account.namePlaceholder | What should we call you? | हम आपको क्या कहें? | |
| account.nameSaved | Name saved. | नाम सहेज लिया गया। | |
| account.title | Account | खाता | |
| account.signedInApple | Signed in with Apple | Apple से साइन इन किया गया | |
| account.optional | An account is optional. It keeps what you save, on any phone you use. | खाता बनाना ज़रूरी नहीं है। इसमें आपका सहेजा हुआ सब रहता है, किसी भी फ़ोन पर। | |
| account.createOrSignIn | Create account or sign in | खाता बनाएँ या साइन इन करें | |
| account.signOut | Sign out | साइन आउट करें | |
| account.deleteAccount | Delete account | खाता मिटाएँ | |
| account.deleteTitle | Delete your account? | क्या आप अपना खाता मिटाना चाहते हैं? | |
| account.deleteBody | Your saved comparisons and receipts go with it. | आपकी सहेजी हुई तुलनाएँ और रसीदें भी इसके साथ मिट जाएँगी। | |
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
| account.replay | Replay onboarding (dev only) | शुरुआत फिर से देखें (सिर्फ़ डेवलपमेंट में) | |
| saved.rowSub | Comparisons and receipt checks | तुलनाएँ और रसीद जाँचें | |
| saved.signedOut | Sign in to save comparisons and receipt checks, and open them again on any phone. | तुलनाएँ और रसीद जाँचें सहेजने के लिए साइन इन करें, और उन्हें किसी भी फ़ोन पर फिर खोलें। | |
| saved.seeAll | Your saved comparisons | आपकी सहेजी तुलनाएँ | |
| saved.comparisons | Your comparisons | आपकी तुलनाएँ | |
| saved.comparisonsEmpty | Save a comparison on Compare to reopen it here in one tap. | तुलना में कोई तुलना सहेजें, ताकि उसे यहाँ से एक टैप में फिर खोल सकें। | |
| saved.comparePrices | Compare prices | कीमतों की तुलना करें | |
| saved.opensToday | Opens Compare with today’s prices | आज की कीमतों के साथ तुलना खोलता है | |
| saved.deleteNamed | Delete {name} | {name} मिटाएँ | |
| saved.deleteComparisonTitle | Delete this comparison? | क्या यह तुलना मिटानी है? | |
| saved.comparisonDeleted | Comparison deleted. | तुलना मिटा दी गई। | |
| saved.amountTo | {amount} to {country} | {country} के लिए {amount} | |
| saved.checks | Your checks | आपकी जाँचें | |
| saved.checksEmpty | Receipts you check with TrueCost and save show up here. | TrueCost से जाँचकर सहेजी गई रसीदें यहाँ दिखती हैं। | |
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
| learn.learned | Learned | सीख लिया | |
| learn.upNext | Up next | आगे | |
| learn.howItWorks | How it works | यह कैसे काम करता है | |
| learn.feeMarkup | Fee + hidden markup | फ़ीस + छिपा मार्कअप | |
| learn.feeMarkupBody | The fee, plus what’s hidden in the rate. | फ़ीस, और रेट में छिपा खर्च। | |
| learn.checkedOnly | Checked prices only | सिर्फ़ जाँची हुई कीमतें | |
| learn.checkedOnlyBody | Every price passes our checks, or it isn’t shown. Mid-market rates from Frankfurter. | हर कीमत हमारी जाँच पास करती है, नहीं तो दिखाई नहीं जाती। मिड-मार्केट रेट Frankfurter से। | |
| learn.noAffiliate | No affiliate deals | किसी कंपनी से कोई सौदा नहीं | |
| learn.noAffiliateBody | Nobody pays to rank. We never touch your money. | ऊपर दिखने के लिए कोई पैसे नहीं देता। हम आपके पैसे को कभी हाथ नहीं लगाते। | |
| learn.wrongPrice | Wrong price? | कीमत गलत है? | |
| learn.deeper | Go deeper | और गहराई से | |
| learn.glossarySub | {n} terms, in plain English | {n} शब्द, आसान भाषा में | |
| learn.routeBoardSub | Routes we check, and ones people want | हम कौन से रूट जाँचते हैं, और लोग कौन से चाहते हैं | |
| learn.remitbenchSub | Our research testbed, still being built | हमारा रिसर्च टेस्टबेड, अभी बन रहा है | |
| learn.observatorySub | Early results from receipts people shared | लोगों की साझा की गई रसीदों से शुरुआती नतीजे | |
| learn.website | On the website | वेबसाइट पर | |
| learn.blog | Blog | ब्लॉग | |
| learn.blogSub | Stories and explainers | कहानियाँ और समझाने वाले लेख | |
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
| learn.lesson.xpLabel | XP earned | मिले XP | |
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
| whatsapp.link | Link WhatsApp | WhatsApp जोड़ें | |
| whatsapp.linkSub | Save comparisons from WhatsApp to this account | WhatsApp की तुलनाएँ इस खाते में रखें | |
| whatsapp.linkSent | WhatsApp is open with your code typed in. Press send, then come back here. | WhatsApp आपके कोड के साथ खुला है। भेजें दबाएँ, फिर यहाँ वापस आएँ। | |
| whatsapp.linked | WhatsApp linked | WhatsApp जुड़ा है | |
| whatsapp.linkedSub | Since {since}. Tap to unlink. | {since} से। हटाने के लिए टैप करें। | |
| whatsapp.unlinkTitle | Unlink WhatsApp? | WhatsApp हटाएँ? | |
| whatsapp.unlinkBody | Your WhatsApp chat stays as it is, but SAVE there will stop adding to this account. | आपकी WhatsApp चैट वैसी ही रहेगी, पर वहाँ SAVE से इस खाते में कुछ नहीं जुड़ेगा। | |
| whatsapp.unlink | Unlink | हटाएँ | |
| whatsapp.unlinked | WhatsApp unlinked. | WhatsApp हटा दिया गया। | |
| whatsapp.cancel | Cancel | रद्द करें | |
| whatsapp.failed | That didn’t work. Check your connection and try again. | यह नहीं हुआ। अपना कनेक्शन देखें और फिर कोशिश करें। | |
| whatsapp.linkNote | Linking keeps your WhatsApp number encrypted, only to send alerts you turn on. Unlink and it’s deleted. | जोड़ने पर आपका WhatsApp नंबर एन्क्रिप्ट करके रखा जाता है, सिर्फ़ आपके चालू किए अलर्ट भेजने के लिए। हटाते ही वह मिट जाता है। | |
| whatsapp.devOnly | Development builds only, until the WhatsApp bot can reply to everyone. | सिर्फ़ डेवलपमेंट बिल्ड में, जब तक WhatsApp बॉट सबको जवाब नहीं दे सकता। | |
| alerts.link | Tell me when it’s better | बेहतर होने पर बताएँ | |
| alerts.intro | Alert me when {amount} to {country} gets at least | तब बताएँ जब {country} को {amount} पर कम से कम इतना मिले | |
| alerts.today | Today’s best: {amount} from {provider} | आज सबसे अच्छा: {provider} से {amount} | |
| alerts.often | One notification when a price reaches this, then at most once a day while it stays there. | कीमत यहाँ पहुँचने पर एक सूचना, फिर जब तक वैसी रहे, दिन में ज़्यादा से ज़्यादा एक। | |
| alerts.less | Lower target | लक्ष्य कम करें | |
| alerts.more | Higher target | लक्ष्य बढ़ाएँ | |
| alerts.turnOn | Turn on alert | अलर्ट चालू करें | |
| alerts.on | Alert on. You’ll find it in Saved. | अलर्ट चालू है। यह सहेजा गया में मिलेगा। | |
| alerts.signInTitle | Sign in for alerts | अलर्ट के लिए साइन इन करें | |
| alerts.signInBody | Alerts are kept with your free account, so they reach this phone. | अलर्ट आपके मुफ़्त खाते के साथ रखे जाते हैं, ताकि वे इस फ़ोन तक पहुँचें। | |
| alerts.denied | Notifications are off for RemitBridge. Turn them on in Settings to get alerts. | RemitBridge की सूचनाएँ बंद हैं। अलर्ट पाने के लिए सेटिंग्स में चालू करें। | |
| alerts.unavailable | Notifications need the full app on a phone. | सूचनाओं के लिए फ़ोन पर पूरा ऐप चाहिए। | |
| alerts.limit | You have 10 alerts, the most there can be. Delete one in Saved first. | आपके 10 अलर्ट हैं, जो अधिकतम है। पहले सहेजा गया में एक मिटाएँ। | |
| alerts.failed | That didn’t go through. Check your connection and try again. | यह नहीं हो पाया। अपना कनेक्शन जाँचें और फिर कोशिश करें। | |
| alerts.via | Tell me by | मुझे बताएँ | |
| alerts.viaPush | Notification | सूचना | |
| alerts.viaWhatsApp | WhatsApp | WhatsApp | |
| alerts.byWhatsApp | by WhatsApp | WhatsApp पर | |
| alerts.notLinked | Link WhatsApp in Account first, then choose it here. | पहले Account में WhatsApp जोड़ें, फिर यहाँ चुनें। | |
| alerts.yours | Your alerts | आपके अलर्ट | |
| alerts.row | {amount} to {country}: {target} or more | {country} को {amount}: {target} या ज़्यादा | |
| alerts.deleteNamed | Delete alert: {name} | अलर्ट मिटाएँ: {name} | |
| alerts.deleted | Alert deleted. | अलर्ट मिटा दिया गया। | |
| alerts.none | No prices yet for this amount, so there’s nothing to compare an alert against. | इस रकम के लिए अभी कोई कीमत नहीं है, इसलिए अलर्ट की तुलना के लिए कुछ नहीं है। | |
| blog.written | {n} of {total} written in full so far | {total} में से {n} पूरे लिखे जा चुके हैं | |
| blog.shown | {n} of {total} posts | {total} में से {n} लेख | |
| blog.all | All | सभी | |
| blog.series.series1 | Why people send money | लोग पैसे क्यों भेजते हैं | |
| blog.series.series2 | How banks move it | बैंक इसे कैसे भेजते हैं | |
| blog.series.series3 | Blockchain scaling | ब्लॉकचेन स्केलिंग | |
| blog.series.series4 | Cost, speed, failure | लागत, रफ़्तार, गड़बड़ी | |
| blog.series.series5 | Connecting it up | सब कुछ जोड़ना | |
| blog.summaryOnly | Summary only | सिर्फ़ सारांश | |
| blog.notYet | The full post is still being written. This is its summary. | पूरा लेख अभी लिखा जा रहा है। यह उसका सारांश है। | |
| blog.keepReading | Keep reading | आगे पढ़ें | |
| blog.englishOnly | Posts are in English. | लेख अंग्रेज़ी में हैं। | |
| glossary.searchPlaceholder | Search {n} terms | {n} शब्दों में खोजें | |
| glossary.searchLabel | Search the glossary | शब्दकोश में खोजें | |
| glossary.noMatch | No term matches “{q}”. | “{q}” से कोई शब्द नहीं मिला। | |
| glossary.englishOnly | Definitions are in English until a translation is checked. | अनुवाद जाँचे जाने तक परिभाषाएँ अंग्रेज़ी में हैं। | |
| remitbench.englishOnly | This research page is only in English for now. | रिसर्च का यह पेज अभी सिर्फ़ अंग्रेज़ी में है। | |
| limitsBlock.heading | What this does not tell you | यह आपको क्या नहीं बताता | |
| tool.inUnit | {label}, in {unit} | {label}, {unit} में | |
| tool.sliderValue | {v} percent | {v} प्रतिशत | |
| fairRate.intro | Every point below the mid-market rate comes out of your transfer. | मिड-मार्केट रेट से हर पॉइंट नीचे का पैसा आपके ट्रांसफ़र से कटता है। | |
| fairRate.yourTransfer | Your transfer | आपका ट्रांसफ़र | |
| fairRate.amountToSend | Amount to send | भेजने की रकम | |
| fairRate.markup | Exchange-rate markup | एक्सचेंज रेट में मार्कअप | |
| fairRate.drag | Drag to see what each point costs. Fees come on top. | खिसकाकर देखें कि हर पॉइंट की कीमत क्या है। फ़ीस इसके ऊपर लगती है। | |
| fairRate.rateFailed | Couldn’t get the mid-market rate. Check your connection and try again. | मिड-मार्केट रेट नहीं मिल सका। अपना कनेक्शन जाँचकर फिर कोशिश करें। | |
| fairRate.theyReceive | With a {pct} markup, they’d receive | {pct} मार्कअप पर उन्हें मिलेंगे | |
| fairRate.atMid | At the mid-market rate: {amount} | मिड-मार्केट रेट पर: {amount} | |
| fairRate.midRate | Mid-market rate | मिड-मार्केट रेट | |
| fairRate.withMarkup | Rate with this markup | इस मार्कअप के साथ रेट | |
| fairRate.lost | Lost to the markup | मार्कअप में गए | |
| fairRate.worth | Worth, in what you sent | आपकी भेजी रकम में इसकी कीमत | |
| fairRate.source | Mid-market rate from {source}, for {day}. It’s a daily reference, not a live rate, and no provider offers it exactly. | मिड-मार्केट रेट {source} से, {day} का। यह रोज़ का संदर्भ है, लाइव रेट नहीं, और कोई कंपनी ठीक यही रेट नहीं देती। | |
| trueCost.intro | Type in your receipt. See the cost hidden in the rate. | अपनी रसीद भरें। रेट में छिपी लागत देखें। | |
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
| trueCost.badDate | Enter a date like 9/28/2026, not in the future. | 9/28/2026 जैसी तारीख़ लिखें, जो आगे की न हो। | |
| trueCost.feeTooBig | The fee can’t be more than the amount sent. | फ़ीस भेजी गई रकम से ज़्यादा नहीं हो सकती। | |
| trueCost.rateFailed | Couldn’t get the mid-market rate for that day. Check your connection and try again. | उस दिन का मिड-मार्केट रेट नहीं मिल सका। अपना कनेक्शन जाँचकर फिर कोशिश करें। | |
| trueCost.reallyCost | This transfer really cost | इस ट्रांसफ़र की असली लागत | |
| trueCost.costNote | {pct} of what you sent. The world average is {world}%; the UN target is {target}%. | आपकी भेजी रकम का {pct}। दुनिया का औसत {world}% है; संयुक्त राष्ट्र का लक्ष्य {target}% है। | |
| trueCost.feeSeen | Fee you could see | दिखने वाली फ़ीस | |
| trueCost.hidden | Hidden in the rate ({pct} markup) | रेट में छिपा ({pct} मार्कअप) | |
| trueCost.atPickup | Charged at pickup | पिकअप पर लिया गया | |
| trueCost.theyReceived | They received | उन्हें मिले | |
| trueCost.atMid | At mid-market, with no fee | मिड-मार्केट रेट पर, बिना फ़ीस के | |
| trueCost.better | Your rate was better than mid-market. That usually means a first-transfer promotion. | आपका रेट मिड-मार्केट से बेहतर था। आमतौर पर इसका मतलब पहली बार भेजने का ऑफ़र होता है। | |
| trueCost.source | Mid-market rate from {source}: {rate}, for {day}. It’s a daily reference, so rates on the day may have moved. | मिड-मार्केट रेट {source} से: {rate}, {day} का। यह रोज़ का संदर्भ है, इसलिए उस दिन रेट बदला भी हो सकता है। | |
| trueCost.compareToday | Compare what {amount} gets today | आज {amount} पर कितना मिलता है, तुलना करें | |
| trueCost.keep | Keep this check | यह जाँच सहेजें | |
| trueCost.provider | Provider | कंपनी | |
| trueCost.optional | Optional | ज़रूरी नहीं | |
| trueCost.providerPlaceholder | e.g. Remitly | जैसे Remitly | |
| trueCost.notNamed | Not named | नाम नहीं दिया | |
| trueCost.saveToAccount | Save to my account | मेरे खाते में सहेजें | |
| trueCost.savedToAccount | Saved to your account. | आपके खाते में सहेज ली गई। | |
| trueCost.createToSave | Create an account to save checks | जाँचें सहेजने के लिए खाता बनाएँ | |
| trueCost.errors.notConnected | Not connected. | सर्वर से जुड़ा नहीं है। | |
| trueCost.errors.signedOut | Sign in to save checks. | जाँचें सहेजने के लिए साइन इन करें। | |
| trueCost.errors.failed | Couldn’t save. Try again. | सहेजी नहीं जा सकी। फिर कोशिश करें। | |
| yearlyCost.intro | The same transfer, all year. What does it add up to? | वही ट्रांसफ़र, पूरे साल। कुल कितना बनता है? | |
| yearlyCost.yourTransfers | Your transfers | आपके ट्रांसफ़र | |
| yearlyCost.amountEach | Amount each time | हर बार की रकम | |
| yearlyCost.yourCost | Your total cost | आपकी कुल लागत | |
| yearlyCost.yourCostHint | Fee plus markup, as a % of what you send. TrueCost can work it out. | फ़ीस और मार्कअप, भेजी रकम के % में। TrueCost इसे निकाल सकता है। | |
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
| yearlyCost.source | Global average: {global}, for sending $200. Target: {target}. Your own figure is multiplied as entered; costs vary with the amount and the provider. | दुनिया का औसत: {global}, $200 भेजने पर। लक्ष्य: {target}। आपका अपना आँकड़ा जैसा लिखा वैसा ही गुणा किया गया है; लागत रकम और कंपनी के हिसाब से बदलती है। | |
| rateHistory.intro | The mid-market rate, day by day. Up means each dollar buys more. | मिड-मार्केट रेट, दिन-ब-दिन। ऊपर जाए तो हर डॉलर में ज़्यादा मिलता है। | |
| rateHistory.pair | Pair | मुद्राएँ | |
| rateHistory.failed | Couldn’t load the history. Check your connection and try again. | इतिहास लोड नहीं हुआ। अपना कनेक्शन जाँचकर फिर कोशिश करें। | |
| rateHistory.notEnough | Not enough days published for this pair yet. | इन मुद्राओं के लिए अभी पर्याप्त दिनों के रेट प्रकाशित नहीं हुए हैं। | |
| rateHistory.perOne | {to} per 1 {from} | 1 {from} पर {to} | |
| rateHistory.latest | Latest ({day}) | सबसे नया ({day}) | |
| rateHistory.change | Change since {day} | {day} से बदलाव | |
| rateHistory.highest | Highest | सबसे ज़्यादा | |
| rateHistory.lowest | Lowest | सबसे कम | |
| rateHistory.source | {n} daily reference rates from {source}, which aggregates central bank publications. Providers’ rates sit below these by their markup. | {source} से {n} दिनों के संदर्भ रेट, जो केंद्रीय बैंकों के प्रकाशनों को जोड़ता है। कंपनियों के रेट इनसे उनके मार्कअप जितने नीचे होते हैं। | |
| chart.label | {unit}, {n} days from {first} to {last}. Low {low}, high {high}. | {unit}, {first} से {last} तक {n} दिन। सबसे कम {low}, सबसे ज़्यादा {high}। | |
| scamCheck.intro | Eight quick questions. Your answers stay on your phone. | आठ छोटे सवाल। आपके जवाब आपके फ़ोन पर ही रहते हैं। | |
| scamCheck.questions.payment-method.ask | Have you been asked to pay with a gift card, cryptocurrency, a crypto ATM, or a wire to someone you have never met in person? | क्या आपसे गिफ़्ट कार्ड, क्रिप्टोकरेंसी, क्रिप्टो ATM, या किसी ऐसे व्यक्ति को वायर ट्रांसफ़र से पैसे माँगे गए हैं जिनसे आप कभी आमने-सामने नहीं मिले? | |
| scamCheck.questions.payment-method.why | These are hard to reverse and hard to trace, which is exactly why scammers ask for them. No legitimate business or government agency demands payment this way. | ऐसे भुगतान वापस लेना और उनका पता लगाना मुश्किल होता है, इसीलिए धोखेबाज़ इन्हें माँगते हैं। कोई भी असली कंपनी या सरकारी विभाग इस तरह भुगतान नहीं माँगता। | |
| scamCheck.questions.urgency.ask | Are you being rushed, or told to keep this transfer to yourself? | क्या आप पर जल्दी करने का दबाव है, या कहा जा रहा है कि इस ट्रांसफ़र के बारे में किसी को न बताएँ? | |
| scamCheck.questions.urgency.why | Pressure and secrecy exist to stop you asking someone you trust. Real institutions give you time and put things in writing. | दबाव और राज़दारी इसलिए होती है ताकि आप किसी भरोसेमंद से न पूछें। असली संस्थाएँ आपको समय देती हैं और सब कुछ लिखकर देती हैं। | |
| scamCheck.questions.prize.ask | Do you have to send money first in order to receive a prize, a lottery win, or an inheritance? | क्या इनाम, लॉटरी या विरासत पाने के लिए आपको पहले पैसे भेजने हैं? | |
| scamCheck.questions.prize.why | A real prize never costs money to collect. The fee is the scam. | असली इनाम लेने के लिए कभी पैसे नहीं देने पड़ते। वह फ़ीस ही धोखा है। | |
| scamCheck.questions.romance.ask | Is the person asking for money someone you have only ever met online? | क्या पैसे माँगने वाला व्यक्ति कोई ऐसा है जिसे आप सिर्फ़ ऑनलाइन जानते हैं? | |
| scamCheck.questions.romance.why | Someone you have never met in person asking for a transfer is among the most common patterns the FTC records, however long you have been talking and however well you feel you know them. | जिससे आप कभी आमने-सामने नहीं मिले, उसका पैसे माँगना FTC के दर्ज किए सबसे आम मामलों में से है, चाहे आप कितने भी समय से बात कर रहे हों और उसे कितना भी अच्छी तरह जानते हों। | |
| scamCheck.questions.imposter.ask | Did someone contact you saying they are from the government, your bank, or a company, and that money has to move right now? | क्या किसी ने खुद को सरकार, आपके बैंक या किसी कंपनी का बताकर कहा कि पैसा अभी भेजना होगा? | |
| scamCheck.questions.imposter.why | Agencies do not demand transfers by phone. Hang up and call the organization back on a number you looked up yourself, not one they gave you. | सरकारी विभाग फ़ोन पर पैसे नहीं माँगते। फ़ोन काट दें और उस संस्था को खुद ढूँढे हुए नंबर पर फ़ोन करें, उनके दिए नंबर पर नहीं। | |
| scamCheck.questions.overpayment.ask | Did someone pay you too much and ask you to send the difference back? | क्या किसी ने आपको ज़्यादा पैसे दिए और बाकी रकम वापस भेजने को कहा? | |
| scamCheck.questions.overpayment.why | The original payment reverses later and the money you sent back is gone. This is classic overpayment fraud. | असली भुगतान बाद में वापस हो जाता है और आपका लौटाया पैसा चला जाता है। यह ज़्यादा भुगतान वाला आम धोखा है। | |
| scamCheck.questions.emergency.ask | Did you get a sudden message that a relative is in trouble somewhere and needs money quickly and quietly? | क्या अचानक कोई संदेश आया कि कोई रिश्तेदार कहीं मुसीबत में है और उसे चुपचाप, जल्दी पैसे चाहिए? | |
| scamCheck.questions.emergency.why | The family emergency is scripted, and the "tell nobody" is part of the script. Verify with the person directly, or with other family, before anything moves. | परिवार की यह मुसीबत गढ़ी हुई कहानी होती है, और "किसी को मत बताना" भी उसी का हिस्सा है। पैसे भेजने से पहले सीधे उस व्यक्ति से, या परिवार के दूसरे लोगों से पक्का कर लें। | |
| scamCheck.questions.mule.ask | Does a job, a prize, or a new friend involve you receiving money and passing it on to someone else? | क्या किसी नौकरी, इनाम या नए दोस्त के ज़रिए आपसे पैसे लेकर किसी और को आगे भेजने को कहा जा रहा है? | |
| scamCheck.questions.mule.why | Moving money for someone else is how money mules are recruited. It can make you part of laundering somebody else’s fraud, with real legal consequences, even if you did not know. | किसी और के लिए पैसा आगे भेजना "मनी म्यूल" बनाने का तरीका है। इससे आप किसी और के धोखे की रकम छिपाने में शामिल हो सकते हैं, और इसके असली कानूनी नतीजे होते हैं, भले ही आपको पता न हो। | |
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
| scamCheck.flaggedBody | The most serious thing you said yes to scores {top}/10. A sign that serious is close to proof on its own, and money sent this way is rarely recoverable. Talk to someone you trust first. | जिस सबसे गंभीर बात पर आपने हाँ कहा, उसका स्कोर {top}/10 है। इतना गंभीर संकेत अपने आप में लगभग सबूत है, और इस तरह भेजा गया पैसा शायद ही कभी वापस मिलता है। पहले किसी भरोसेमंद व्यक्ति से बात करें। | |
| scamCheck.unsureBody | Nothing here is a definite warning sign, but you weren’t sure about {n}. Being unsure is a reason to slow down. Find out for certain first. | यहाँ कुछ भी पक्का खतरे का संकेत नहीं है, लेकिन {n} सवालों पर आप पक्के नहीं थे। शक होना धीरे चलने की वजह है। पहले पूरी तरह पता कर लें। | |
| scamCheck.clearBody | You said no to all eight. That’s not a guarantee: this list isn’t everything, and new scams appear all the time. If something still feels wrong, wait a day and ask someone you trust. | आपने आठों पर नहीं कहा। यह कोई गारंटी नहीं है: यह सूची सब कुछ नहीं बताती, और नए धोखे आते रहते हैं। अगर फिर भी कुछ ठीक न लगे, तो एक दिन रुकें और किसी भरोसेमंद से पूछें। | |
| scamCheck.saidYes | You said yes | आपने हाँ कहा | |
| scamCheck.wasUnsure | You weren’t sure | आप पक्के नहीं थे | |
| scamCheck.ifSent | If money already went | अगर पैसा जा चुका है | |
| scamCheck.step1 | 1. Contact your transfer provider now and ask them to stop or reverse it. | 1. अभी अपनी ट्रांसफ़र कंपनी से संपर्क करें और उसे रोकने या वापस करने को कहें। | |
| scamCheck.step2Before | 2. Report it to the FTC at  | 2. FTC को यहाँ शिकायत करें:  | |
| scamCheck.step2After | . | । | |
| scamCheck.step3Before | 3. File a complaint with the  | 3.  | |
| scamCheck.step3After | , which takes money-transfer complaints. |  के पास शिकायत दर्ज करें, जो पैसे भेजने से जुड़ी शिकायतें लेता है। | |
| scamCheck.note | The risk numbers are our own reading of how strongly each sign points to fraud on its own, drawn from FTC and CFPB guidance. They aren’t a published statistic or your odds of being defrauded. This is education, not legal or financial advice, and we can’t recover money or step in with a company. | खतरे के ये अंक हमारी अपनी समझ हैं कि हर संकेत अपने आप में धोखे की ओर कितना इशारा करता है, जो FTC और CFPB की सलाह पर आधारित है। ये कोई प्रकाशित आँकड़ा या आपके साथ धोखा होने की संभावना नहीं हैं। यह जानकारी है, कानूनी या वित्तीय सलाह नहीं, और हम पैसा वापस नहीं दिला सकते या किसी कंपनी के साथ दखल नहीं दे सकते। | |
| scamCheck.again | Start again | फिर से शुरू करें | |
| scan.heroTitle | What did your transfer really cost? | आपके ट्रांसफ़र पर असल में कितना खर्च हुआ? | |
| scan.heroSub | Scan the receipt. See the fee and the hidden markup. | रसीद स्कैन करें। फ़ीस और रेट में छिपा मार्कअप देखें। | |
| scan.steps[1] | Snap the receipt | रसीद की फ़ोटो लें | |
| scan.steps[2] | Your details get covered | आपकी जानकारी ढक दी जाती है | |
| scan.steps[3] | See the real cost | असली खर्च देखें | |
| scan.privacy | Read on your phone. Names and numbers are covered before anything is sent to our database. | रसीद आपके फ़ोन पर ही पढ़ी जाती है। हमारे डेटाबेस में कुछ भी भेजने से पहले नाम और नंबर ढक दिए जाते हैं। | |
| scan.takePhoto | Take a photo | फ़ोटो लें | |
| scan.choosePhoto | Choose a photo | फ़ोटो चुनें | |
| scan.needsBuild | Scanning needs the full build of the app. It doesn’t work in Expo Go. | स्कैन करने के लिए ऐप का पूरा वर्ज़न चाहिए। यह Expo Go में काम नहीं करता। | |
| scan.cameraDenied | To take a photo, allow camera access for RemitBridge in Settings. | फ़ोटो लेने के लिए Settings में RemitBridge को कैमरे की इजाज़त दें। | |
| scan.photosDenied | To choose a photo, allow photo access for RemitBridge in Settings. | फ़ोटो चुनने के लिए Settings में RemitBridge को फ़ोटो की इजाज़त दें। | |
| scan.reading | Reading the receipt on your phone… | रसीद आपके फ़ोन पर पढ़ी जा रही है… | |
| scan.noText | No text found. The photo may be blurry. Hold the phone steady, with the whole receipt flat and in good light. | कोई लिखावट नहीं मिली। फ़ोटो धुंधली हो सकती है। फ़ोन को स्थिर रखें, पूरी रसीद को सीधा रखें और अच्छी रोशनी में फ़ोटो लें। | |
| scan.tooBlurry | This photo is too blurry to read. Take it again: hold the phone steady, tap the receipt to focus, and use good light. | यह फ़ोटो पढ़ने के लिए बहुत धुंधली है। फिर से लें: फ़ोन स्थिर रखें, फ़ोकस के लिए रसीद पर टैप करें और अच्छी रोशनी रखें। | |
| scan.bitBlurry | This photo is a little blurry, so some numbers may be read wrong. A sharper photo gives a better reading. | यह फ़ोटो थोड़ी धुंधली है, इसलिए कुछ अंक गलत पढ़े जा सकते हैं। साफ़ फ़ोटो से बेहतर पढ़ाई होती है। | |
| scan.unreadable | We couldn’t read the amounts on this receipt. The photo may be blurry or cut off. Take it again with the whole receipt in view. | हम इस रसीद की रकम नहीं पढ़ पाए। फ़ोटो धुंधली या कटी हुई हो सकती है। पूरी रसीद दिखाते हुए फिर से फ़ोटो लें। | |
| scan.misaligned | The text didn’t line up with the photo, so nothing was covered. Take the photo again. | लिखावट फ़ोटो से मेल नहीं खाई, इसलिए कुछ भी ढका नहीं गया। फ़ोटो फिर से लें। | |
| scan.failed | Something went wrong reading the photo. Try again. | फ़ोटो पढ़ने में कुछ गड़बड़ हुई। फिर से कोशिश करें। | |
| scan.previewTitle | Check what’s covered | देखें कि क्या ढका गया है | |
| scan.previewHelp | Black boxes cover personal details. Tap any other word to cover it too, and tap it again to show it. | काले डिब्बे निजी जानकारी ढकते हैं। किसी और शब्द को ढकने के लिए उस पर टैप करें, और दोबारा दिखाने के लिए फिर टैप करें। | |
| scan.covered | {n} items covered | {n} चीज़ें ढकी गईं | |
| scan.tapWord | Word: {text}. Tap to cover it. | शब्द: {text}। ढकने के लिए टैप करें। | |
| scan.tapCovered | Covered by you. Tap to show it again. | आपने ढका है। फिर से दिखाने के लिए टैप करें। | |
| scan.consentLabel | Keep this receipt for research | यह रसीद रिसर्च के लिए रखें | |
| scan.consentHelp | Off unless you turn it on. On: we keep the covered photo and the values for 24 months, with nothing that says who you are, to study what people really pay. Off: the photo is never stored, and the values are deleted after 30 days. | जब तक आप इसे चालू न करें, यह बंद रहता है। चालू: हम ढकी हुई फ़ोटो और रकमें 24 महीने तक रखते हैं, आपकी पहचान बताने वाली कोई चीज़ नहीं, ताकि पता चले कि लोग असल में कितना चुकाते हैं। बंद: फ़ोटो कभी नहीं रखी जाती, और रकमें 30 दिन बाद मिटा दी जाती हैं। | |
| scan.send | Read my receipt | मेरी रसीद पढ़ें | |
| scan.sendFailed | That didn’t go through. Check your connection and try again. | यह नहीं हो पाया। इंटरनेट देखें और फिर से कोशिश करें। | |
| scan.notConnected | The app isn’t connected yet. | ऐप अभी जुड़ा नहीं है। | |
| scan.limitHour | A lot of receipts were checked from this network in the last hour. Try again in an hour. | पिछले एक घंटे में इस नेटवर्क से बहुत सारी रसीदें जाँची गई हैं। एक घंटे बाद फिर कोशिश करें। | |
| scan.limitDay | That’s the limit for checking receipts today. You can check more tomorrow. | आज रसीदें जाँचने की सीमा पूरी हो गई है। कल और जाँच सकते हैं। | |
| scan.retake | Use a different photo | दूसरी फ़ोटो इस्तेमाल करें | |
| scan.toCheck | Please check | कृपया जाँचें | |
| scan.notFound | Not found | नहीं मिला | |
| scan.deleteNow | Delete this receipt now | यह रसीद अभी मिटाएँ | |
| scan.deleted | Deleted. | मिटा दी गई। | |
| scan.another | Scan another receipt | दूसरी रसीद स्कैन करें | |
| scan.limits[1] | Whether every value was read right. Check each one against your receipt. | क्या हर रकम सही पढ़ी गई। हर एक को अपनी रसीद से मिलाकर देखें। | |
| scan.limits[2] | Anything printed only on the back of the receipt, or written by hand. | जो सिर्फ़ रसीद के पीछे छपा हो, या हाथ से लिखा हो। | |
| scan.limits[3] | Fees your family paid when the money arrived, unless the receipt shows them. | पैसा पहुँचने पर आपके परिवार ने जो फ़ीस दी, जब तक वह रसीद पर न लिखी हो। | |
| confirm.title | Check each value | हर रकम जाँचें | |
| confirm.help | Tap a value, on the photo or in the list, to change it. Values marked “Please check” need your answer. | किसी रकम को बदलने के लिए उस पर टैप करें, फ़ोटो पर या सूची में। जिन पर “कृपया जाँचें” लिखा है, उनका जवाब आपसे चाहिए। | |
| confirm.left | {n} to check | {n} जाँचनी बाकी हैं | |
| confirm.ready | See what it cost | देखें कितना खर्च हुआ | |
| confirm.failed | That didn’t go through. Check your connection and try again. | यह नहीं हो पाया। इंटरनेट देखें और फिर से कोशिश करें। | |
| confirm.expired | This receipt has been deleted, so it can’t be checked. Scan it again. | यह रसीद मिटा दी गई है, इसलिए जाँची नहीं जा सकती। इसे फिर से स्कैन करें। | |
| confirm.looksRight | This is right | यह सही है | |
| confirm.save | Save | सेव करें | |
| confirm.useSuggestion | Use {value} | {value} इस्तेमाल करें | |
| confirm.suggestion | The other numbers suggest {value}. | बाकी रकमों के हिसाब से यह {value} होना चाहिए। | |
| confirm.invalid | That doesn’t look right for {field}. Check it and try again. | {field} के लिए यह सही नहीं लगता। जाँचकर फिर से कोशिश करें। | |
| confirm.datePlaceholder | MM/DD/YYYY | MM/DD/YYYY | |
| confirm.currencyPlaceholder | e.g. USD | जैसे USD | |
| confirm.editing | Change: {field} | बदलें: {field} | |
| result.title | What this transfer really cost | इस ट्रांसफ़र पर असल में कितना खर्च हुआ | |
| result.fee | Fee you could see | दिखने वाली फ़ीस | |
| result.tax | Federal remittance tax | संघीय रेमिटेंस टैक्स | |
| result.markup | Hidden in the rate ({pct} markup) | रेट में छिपा ({pct} मार्कअप) | |
| result.pickup | Charged at pickup | पिकअप पर लिया गया | |
| result.betterThanMid | The rate was better than mid-market. That usually means a first-transfer promotion. | रेट मिड-मार्केट से बेहतर था। अक्सर इसका मतलब पहले ट्रांसफ़र का ऑफ़र होता है। | |
| result.source | Mid-market rate from {source}: {rate}, for {day}. It’s a daily reference, so rates on the day may have moved. | मिड-मार्केट रेट {source} से: {rate}, {day} के लिए। यह दिन का एक संदर्भ रेट है, इसलिए उस दिन रेट बदल सकता है। | |
| result.noMid | The mid-market rate for that day couldn’t be loaded, so the cost hidden in the rate can’t be worked out. | उस दिन का मिड-मार्केट रेट नहीं मिल पाया, इसलिए रेट में छिपी लागत का हिसाब नहीं हो सकता। | |
| result.missing | Some values are missing, so the total cost can’t be worked out. | कुछ रकमें नहीं मिलीं, इसलिए कुल लागत का हिसाब नहीं हो सकता। | |
| result.advertisedTitle | Advertised vs. paid | दिखाया गया रेट बनाम चुकाया गया | |
| result.gapMore | The rate you got cost {gap} more than the advertised one. | आपको मिले रेट की वजह से दिखाए गए रेट से {gap} ज़्यादा खर्च हुआ। | |
| result.gapLess | The rate you got was better than the advertised one, by {gap}. | आपको मिला रेट दिखाए गए रेट से {gap} बेहतर था। | |
| result.gapSame | The rate you got matches the advertised one. | आपको मिला रेट दिखाए गए रेट जैसा ही है। | |
| result.notTracked | We don’t check this provider’s prices, so there’s no advertised price to compare with. | हम इस कंपनी की कीमतें नहीं जाँचते, इसलिए मिलाने के लिए कोई दिखाया गया रेट नहीं है। | |
| result.noRoute | We don’t check prices on this route yet, so there’s no advertised price to compare with. | हम अभी इस रूट की कीमतें नहीं जाँचते, इसलिए मिलाने के लिए कोई दिखाया गया रेट नहीं है। | |
| result.noQuote | We have no price from this provider checked within a day of this transfer, so there’s nothing to compare with. | इस ट्रांसफ़र के एक दिन के अंदर इस कंपनी की कोई जाँची हुई कीमत हमारे पास नहीं है, इसलिए मिलाने को कुछ नहीं है। | |
| result.missingValues | The receipt’s date, amount or rate is missing, so it can’t be compared. | रसीद की तारीख, रकम या रेट नहीं मिला, इसलिए मिलाया नहीं जा सकता। | |
| result.pctOfSent | {pct} of what you sent | भेजी गई रकम का {pct} | |
| result.scaleLabel | This transfer cost {pct} of what was sent. The world average is {world}%; the UN target is {target}%. | इस ट्रांसफ़र का खर्च भेजी गई रकम का {pct} रहा। दुनिया का औसत {world}% है; UN का लक्ष्य {target}% है। | |
| result.scaleYou | This one {pct} | यह {pct} | |
| result.scaleWorld | World {n}% | दुनिया {n}% | |
| result.scaleTarget | UN target {n}% | UN लक्ष्य {n}% | |
| result.costTitle | Where the cost came from | खर्च कहाँ से आया | |
| result.arrivedTitle | What arrived | क्या पहुँचा | |
| result.arrivedGot | {got} of {possible} | {possible} में से {got} | |
| result.arrivedLost | {lost} lost | {lost} गए | |
| result.arrivedLabel | {got} arrived. At the mid-market rate with no fee, {possible} would have. {lost} was lost. | {got} पहुँचे। मिड-मार्केट रेट पर, बिना फ़ीस के, {possible} पहुँचते। {lost} गए। | |
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
| result.keptNote | Sending the same amount, your family would have received {received}. | उतनी ही रकम भेजने पर आपके परिवार को {received} मिलते। | |
| result.keptBest | You already had the best price we found: {provider}. | आपको पहले से ही हमारा पाया सबसे अच्छा दाम मिला: {provider}। | |
| result.keptAsGood | Your price was as good as or better than every price we had for the same kind of transfer. | उसी तरह के ट्रांसफ़र के लिए हमारे पास जितने दाम थे, आपका दाम उन सब जितना या उनसे बेहतर था। | |
| result.keptThatDay | Prices checked {time}, within a day of your transfer. | दाम {time} जाँचे गए, आपके ट्रांसफ़र के एक दिन के अंदर। | |
| result.keptToday | We don’t have prices from {day}, so these are today’s, checked {time}. Rates move, so treat this as a guide to next time. | हमारे पास {day} के दाम नहीं हैं, इसलिए ये आज के हैं, {time} जाँचे गए। रेट बदलते रहते हैं, इसे अगली बार के लिए एक अंदाज़ा समझें। | |
| result.keptEstimated | Worked out from the price for {amount}, the nearest amount we check. | {amount} के दाम से निकाला गया, जो हमारी जाँची गई सबसे नज़दीकी रकम है। | |
| result.keptBank | That’s paying from a bank account. You paid by card, and paying from your bank account usually costs less. | यह बैंक खाते से भुगतान करने पर है। आपने कार्ड से भुगतान किया, और बैंक खाते से भुगतान आम तौर पर सस्ता पड़ता है। | |
| result.keptCompared | Compared with: {names}. We don’t have prices from every provider yet. | इनसे तुलना की गई: {names}। हमारे पास अभी हर प्रदाता के दाम नहीं हैं। | |
| result.keptNoPrices | We have no prices yet for the same kind of transfer on this route (the same way of paying and of receiving), so there’s nothing fair to compare with. | इस रूट पर उसी तरह के ट्रांसफ़र (भुगतान और पैसे पाने का वही तरीका) के दाम अभी हमारे पास नहीं हैं, इसलिए सही तुलना करने को कुछ नहीं है। | |
| result.keptNoRoute | We don’t check prices on this route yet, so there’s nothing to compare with. | हम अभी इस रूट के दाम नहीं जाँचते, इसलिए तुलना करने को कुछ नहीं है। | |
| result.keptMissing | The receipt’s amount or rate is missing, so it can’t be compared. | रसीद की रकम या रेट नहीं मिला, इसलिए तुलना नहीं हो सकती। | |
| result.keptNoMid | Without that day’s mid-market rate, the costs can’t be measured the same way, so there’s no comparison. | उस दिन के मिड-मार्केट रेट के बिना खर्च एक जैसे नहीं मापे जा सकते, इसलिए तुलना नहीं है। | |
| result.taxTitle | Federal remittance tax | संघीय रेमिटेंस टैक्स | |
| result.taxMatches | This one was paid by {funding}. 1% of {amount} is {expected}, and the receipt shows {found}. | यह {funding} से भेजा गया। {amount} का 1% {expected} है, और रसीद पर {found} लिखा है। | |
| result.taxNotFound | This one was paid by {funding}. 1% of {amount} is {expected}. No tax line was found on this receipt. | यह {funding} से भेजा गया। {amount} का 1% {expected} है। इस रसीद पर टैक्स की कोई लाइन नहीं मिली। | |
| result.taxDiffers | This one was paid by {funding}. 1% of {amount} is {expected}. The receipt shows {found}. | यह {funding} से भेजा गया। {amount} का 1% {expected} है। रसीद पर {found} लिखा है। | |
| result.taxNotTaxed | This one was paid by {funding}, so the tax doesn’t apply. | यह {funding} से भेजा गया, इसलिए यह टैक्स नहीं लगता। | |
| result.taxBefore | This transfer was made before the tax started. | यह ट्रांसफ़र टैक्स शुरू होने से पहले हुआ था। | |
| result.taxUnknown | The receipt doesn’t say how it was paid for, so the tax can’t be checked. | रसीद पर नहीं लिखा कि भुगतान कैसे हुआ, इसलिए टैक्स जाँचा नहीं जा सकता। | |
| result.taxPaidBy | Paid by {funding} | {funding} से भुगतान | |
| result.taxFromBank | From a bank account | बैंक खाते से | |
| result.taxBank | Paid from a bank account instead, the same transfer would have cost {total} in total, {tax} less. | अगर यही पैसा बैंक खाते से भेजा जाता, तो कुल खर्च {total} होता, यानी {tax} कम। | |
| result.taxAssumption | We take 1% of the transfer amount, before fees, as the IRS’s proposed rules do. Those rules aren’t final yet. | हम फ़ीस से पहले की ट्रांसफ़र रकम का 1% लेते हैं, जैसा IRS के प्रस्तावित नियम कहते हैं। ये नियम अभी अंतिम नहीं हैं। | |
| result.taxSmall | This was a transfer of $15 or less, so the tax doesn’t apply. | यह $15 या उससे कम का ट्रांसफ़र था, इसलिए टैक्स नहीं लगता। | |
| result.nextTitle | Next time | अगली बार | |
| result.compare | Compare this route today | आज यह रूट मिलाएँ | |
| result.notCovered | We don’t check this route yet. | हम अभी यह रूट नहीं जाँचते। | |
| result.routeBoard | See which routes we check | देखें हम कौन से रूट जाँचते हैं | |
| result.disclosuresTitle | Standard disclosures | ज़रूरी जानकारियाँ | |
| result.disclosuresAll | Every standard item was found on this receipt. | इस रसीद पर हर ज़रूरी जानकारी मिली। | |
| result.disclosuresNote | A photo can cut off part of a receipt, and small print can be hard to read, so this doesn’t mean the provider left anything out. | फ़ोटो में रसीद का कुछ हिस्सा छूट सकता है और छोटे अक्षर पढ़ना मुश्किल हो सकता है, इसलिए इसका मतलब यह नहीं कि कंपनी ने कुछ छोड़ा। | |
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
| result.limits[1] | Whether each value was read right, unless you checked it. | हर वैल्यू सही पढ़ी गई या नहीं, जब तक आपने उसे जाँचा न हो। | |
| result.limits[2] | What your family was charged at their end, beyond what the receipt shows. | आपके परिवार से उनकी तरफ़ क्या लिया गया, रसीद में जो दिखता है उसके अलावा। | |
| result.limits[3] | The rate at the minute you sent: the mid-market rate is a daily reference. | भेजने के समय का रेट: मिड-मार्केट रेट दिन भर का संदर्भ है। | |
| result.limits[4] | Whether a disclosure was missing from the receipt, or only from the photo. | कोई जानकारी रसीद से गायब थी या सिर्फ़ फ़ोटो से। | |
| devPreview.title | Receipt preview | रसीद का पूर्वावलोकन | |
| devPreview.row | Preview the receipt screens | रसीद वाली स्क्रीन देखें | |
| devPreview.intro | Made-up receipts, to check these screens before the full build can scan. Development builds only. | बनावटी रसीदें, ताकि पूरा बिल्ड स्कैन कर सके उससे पहले ये स्क्रीन जाँची जा सकें। सिर्फ़ डेवलपमेंट बिल्ड में। | |
| devPreview.check | Check | जाँच | |
| devPreview.result | Result | नतीजा | |
| devPreview.today | Today | आज | |
| devPreview.none | No match | कोई मेल नहीं | |
| observatory.intro | What people really paid, from receipts they chose to share. | लोगों ने असल में कितना चुकाया, उन रसीदों से जो उन्होंने साझा कीं। | |
| observatory.early | Early results | शुरुआती नतीजे | |
| observatory.sample | {n} shared receipts since {since} | {n} साझा रसीदें, {since} से | |
| observatory.tooFew | Not enough receipts have been shared yet. Numbers show once there are at least {min}, so no single receipt can be picked out. | अभी काफ़ी रसीदें साझा नहीं हुईं। कम से कम {min} होने पर ही आँकड़े दिखते हैं, ताकि कोई एक रसीद पहचानी न जा सके। | |
| observatory.groupsTitle | By provider and route | कंपनी और रूट के हिसाब से | |
| observatory.noGroups | No provider and route has {min} shared receipts yet. | अभी किसी कंपनी और रूट की {min} साझा रसीदें नहीं हैं। | |
| observatory.receipts | {n} receipts | {n} रसीदें | |
| observatory.medianCost | Typical total cost | आम कुल लागत | |
| observatory.medianMarkup | Typical exchange-rate markup | आम एक्सचेंज-रेट मार्कअप | |
| observatory.paidMore | {k} of {of} compared got a worse rate than advertised that day | तुलना की गई {of} में से {k} को उस दिन के विज्ञापित रेट से खराब रेट मिला | |
| observatory.taxTitle | Federal remittance tax | संघीय रेमिटेंस टैक्स | |
| observatory.taxLine | {taxed} were paid in cash or similar. The 1% tax matched on {matches}; no tax line was found on {notFound}. | {taxed} का भुगतान नकद या उस जैसे तरीके से हुआ। {matches} पर 1% टैक्स मेल खाया; {notFound} पर टैक्स की लाइन नहीं मिली। | |
| observatory.disclosuresTitle | Standard disclosures not found | ज़रूरी जानकारियाँ जो नहीं मिलीं | |
| observatory.disclosureLine | {item}: {n} of {total} | {item}: {total} में से {n} | |
| observatory.noneMissing | Every standard item was found on every shared receipt. | हर साझा रसीद पर हर ज़रूरी जानकारी मिली। | |
| observatory.method | Only receipts people chose to share for research count. A provider and route shows once it has {min}. “Typical” is the median. | सिर्फ़ वही रसीदें गिनी जाती हैं जो लोगों ने रिसर्च के लिए साझा कीं। कोई कंपनी और रूट {min} रसीदें होने पर दिखता है। “आम” का मतलब माध्यिका (median) है। | |
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
| funding.compareTaxLine | Paying by {funding} adds the 1% federal tax, {tax} here. It’s in the total cost. | {funding} से भुगतान पर 1% संघीय टैक्स लगता है, यहाँ {tax}। यह कुल लागत में शामिल है। | |
| funding.compareNone | No prices checked yet for paying this way. | इस तरह भुगतान के लिए अभी कोई जाँची हुई कीमत नहीं है। | |
| funding.trueCostLabel | You paid with | आपने भुगतान किया | |
| funding.trueCostTaxLine | Paid by {funding}, so a 1% federal tax of {tax} is added. It’s in the total cost. | {funding} से भुगतान हुआ, इसलिए {tax} का 1% संघीय टैक्स जुड़ता है। यह कुल लागत में शामिल है। | |
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
