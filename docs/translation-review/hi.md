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
| compare.saved | Saved. Find it on Account | सहेज ली गई। खाता में देखें | |
| compare.alreadySaved | Already saved. Find it on Account | पहले से सहेजी हुई है। खाता में देखें | |
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
| account.admin | Admin | एडमिन | |
| account.addPrice | Add a price | कीमत जोड़ें | |
| account.addPriceSub | Enter a price read from a provider’s site | किसी कंपनी की साइट पर देखी कीमत दर्ज करें | |
| account.metrics | Metrics | आँकड़े | |
| account.metricsSub | Usage, funnel and impact, with definitions | इस्तेमाल, फ़नल और असर, परिभाषाओं के साथ | |
| account.replay | Replay onboarding (dev only) | शुरुआत फिर से देखें (सिर्फ़ डेवलपमेंट में) | |
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
| scan.privacy | Read on your phone. Names and numbers are covered before anything is sent. | रसीद आपके फ़ोन पर ही पढ़ी जाती है। कुछ भी भेजने से पहले नाम और नंबर ढक दिए जाते हैं। | |
| scan.takePhoto | Take a photo | फ़ोटो लें | |
| scan.choosePhoto | Choose a photo | फ़ोटो चुनें | |
| scan.needsBuild | Scanning needs the full build of the app. It doesn’t work in Expo Go. | स्कैन करने के लिए ऐप का पूरा वर्ज़न चाहिए। यह Expo Go में काम नहीं करता। | |
| scan.cameraDenied | To take a photo, allow camera access for RemitBridge in Settings. | फ़ोटो लेने के लिए Settings में RemitBridge को कैमरे की इजाज़त दें। | |
| scan.photosDenied | To choose a photo, allow photo access for RemitBridge in Settings. | फ़ोटो चुनने के लिए Settings में RemitBridge को फ़ोटो की इजाज़त दें। | |
| scan.reading | Reading the receipt on your phone… | रसीद आपके फ़ोन पर पढ़ी जा रही है… | |
| scan.noText | No text found. Try again with the whole receipt flat, in good light. | कोई लिखावट नहीं मिली। पूरी रसीद को सीधा रखकर, अच्छी रोशनी में फिर से कोशिश करें। | |
| scan.misaligned | The text didn’t line up with the photo, so nothing was covered. Take the photo again. | लिखावट फ़ोटो से मेल नहीं खाई, इसलिए कुछ भी ढका नहीं गया। फ़ोटो फिर से लें। | |
| scan.failed | Something went wrong reading the photo. Try again. | फ़ोटो पढ़ने में कुछ गड़बड़ हुई। फिर से कोशिश करें। | |
| scan.previewTitle | Check what’s covered | देखें कि क्या ढका गया है | |
| scan.previewHelp | Black boxes cover personal details. Tap any other word to cover it too, and tap it again to show it. | काले डिब्बे निजी जानकारी ढकते हैं। किसी और शब्द को ढकने के लिए उस पर टैप करें, और दोबारा दिखाने के लिए फिर टैप करें। | |
| scan.covered | {n} items covered | {n} चीज़ें ढकी गईं | |
| scan.tapWord | Word: {text}. Tap to cover it. | शब्द: {text}। ढकने के लिए टैप करें। | |
| scan.tapCovered | Covered by you. Tap to show it again. | आपने ढका है। फिर से दिखाने के लिए टैप करें। | |
| scan.consentLabel | Keep this receipt for research | यह रसीद रिसर्च के लिए रखें | |
| scan.consentHelp | Off unless you turn it on. On: we keep the covered photo and the values, with nothing that says who you are, to study what people really pay. Off: the photo is never stored, and the values are deleted after 30 days. | जब तक आप इसे चालू न करें, यह बंद रहता है। चालू: हम ढकी हुई फ़ोटो और रकमें रखते हैं, आपकी पहचान बताने वाली कोई चीज़ नहीं, ताकि पता चले कि लोग असल में कितना चुकाते हैं। बंद: फ़ोटो कभी नहीं रखी जाती, और रकमें 30 दिन बाद मिटा दी जाती हैं। | |
| scan.send | Read my receipt | मेरी रसीद पढ़ें | |
| scan.sendFailed | That didn’t go through. Check your connection and try again. | यह नहीं हो पाया। इंटरनेट देखें और फिर से कोशिश करें। | |
| scan.notConnected | The app isn’t connected yet. | ऐप अभी जुड़ा नहीं है। | |
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
| result.costNote | {pct} of what you sent. The world average is {world}%; the UN target is {target}%. | आपकी भेजी रकम का {pct}। दुनिया का औसत {world}% है; संयुक्त राष्ट्र का लक्ष्य {target}% है। | |
| result.fee | Fee you could see | दिखने वाली फ़ीस | |
| result.tax | Federal remittance tax | संघीय रेमिटेंस टैक्स | |
| result.markup | Hidden in the rate ({pct} markup) | रेट में छिपा ({pct} मार्कअप) | |
| result.pickup | Charged at pickup | पिकअप पर लिया गया | |
| result.received | They received | उन्हें मिला | |
| result.benchmark | At mid-market, with no fee | मिड-मार्केट रेट पर, बिना फ़ीस | |
| result.betterThanMid | The rate was better than mid-market. That usually means a first-transfer promotion. | रेट मिड-मार्केट से बेहतर था। अक्सर इसका मतलब पहले ट्रांसफ़र का ऑफ़र होता है। | |
| result.source | Mid-market rate from {source}: {rate}, for {day}. It’s a daily reference, so rates on the day may have moved. | मिड-मार्केट रेट {source} से: {rate}, {day} के लिए। यह दिन का एक संदर्भ रेट है, इसलिए उस दिन रेट बदल सकता है। | |
| result.noMid | The mid-market rate for that day couldn’t be loaded, so the cost hidden in the rate can’t be worked out. | उस दिन का मिड-मार्केट रेट नहीं मिल पाया, इसलिए रेट में छिपी लागत का हिसाब नहीं हो सकता। | |
| result.missing | Some values are missing, so the total cost can’t be worked out. | कुछ रकमें नहीं मिलीं, इसलिए कुल लागत का हिसाब नहीं हो सकता। | |
| result.advertisedTitle | Advertised vs. paid | दिखाया गया रेट बनाम चुकाया गया | |
| result.advertised | On {day}, {provider} showed {rate} for this route at {amount}, checked {time}. | {day} को {provider} इस रूट पर {amount} के लिए {rate} दिखा रहा था, {time} जाँचा गया। | |
| result.yourRate | Your receipt: {rate}. | आपकी रसीद: {rate}। | |
| result.gapMore | The rate you got cost {gap} more than the advertised one. | आपको मिले रेट की वजह से दिखाए गए रेट से {gap} ज़्यादा खर्च हुआ। | |
| result.gapLess | The rate you got was better than the advertised one, by {gap}. | आपको मिला रेट दिखाए गए रेट से {gap} बेहतर था। | |
| result.gapSame | The rate you got matches the advertised one. | आपको मिला रेट दिखाए गए रेट जैसा ही है। | |
| result.notTracked | We don’t check this provider’s prices, so there’s no advertised price to compare with. | हम इस कंपनी की कीमतें नहीं जाँचते, इसलिए मिलाने के लिए कोई दिखाया गया रेट नहीं है। | |
| result.noRoute | We don’t check prices on this route yet, so there’s no advertised price to compare with. | हम अभी इस रूट की कीमतें नहीं जाँचते, इसलिए मिलाने के लिए कोई दिखाया गया रेट नहीं है। | |
| result.noQuote | We have no price from this provider checked within a day of this transfer, so there’s nothing to compare with. | इस ट्रांसफ़र के एक दिन के अंदर इस कंपनी की कोई जाँची हुई कीमत हमारे पास नहीं है, इसलिए मिलाने को कुछ नहीं है। | |
| result.missingValues | The receipt’s date, amount or rate is missing, so it can’t be compared. | रसीद की तारीख, रकम या रेट नहीं मिला, इसलिए मिलाया नहीं जा सकता। | |
| result.taxTitle | Federal remittance tax | संघीय रेमिटेंस टैक्स | |
| result.taxRule | Since January 1, 2026, transfers paid in cash, by money order or by cashier’s check carry a 1% federal tax. Transfers paid from a bank account or by card don’t. | 1 जनवरी 2026 से, नकद, मनी ऑर्डर या कैशियर चेक से भेजे गए पैसे पर 1% संघीय टैक्स लगता है। बैंक खाते या कार्ड से भेजे गए पैसे पर नहीं। | |
| result.taxMatches | This one was paid by {funding}. 1% of {amount} is {expected}, and the receipt shows {found}. | यह {funding} से भेजा गया। {amount} का 1% {expected} है, और रसीद पर {found} लिखा है। | |
| result.taxNotFound | This one was paid by {funding}. 1% of {amount} is {expected}. No tax line was found on this receipt. | यह {funding} से भेजा गया। {amount} का 1% {expected} है। इस रसीद पर टैक्स की कोई लाइन नहीं मिली। | |
| result.taxDiffers | This one was paid by {funding}. 1% of {amount} is {expected}. The receipt shows {found}. | यह {funding} से भेजा गया। {amount} का 1% {expected} है। रसीद पर {found} लिखा है। | |
| result.taxNotTaxed | This one was paid by {funding}, so the tax doesn’t apply. | यह {funding} से भेजा गया, इसलिए यह टैक्स नहीं लगता। | |
| result.taxBefore | This transfer was made before the tax started. | यह ट्रांसफ़र टैक्स शुरू होने से पहले हुआ था। | |
| result.taxUnknown | The receipt doesn’t say how it was paid for, so the tax can’t be checked. | रसीद पर नहीं लिखा कि भुगतान कैसे हुआ, इसलिए टैक्स जाँचा नहीं जा सकता। | |
| result.taxBank | Paid from a bank account instead, the same transfer would have cost {total} in total, {tax} less. | अगर यही पैसा बैंक खाते से भेजा जाता, तो कुल खर्च {total} होता, यानी {tax} कम। | |
| result.taxAssumption | We take 1% of the transfer amount, before fees, as the IRS’s proposed rules do. Those rules aren’t final yet. | हम फ़ीस से पहले की ट्रांसफ़र रकम का 1% लेते हैं, जैसा IRS के प्रस्तावित नियम कहते हैं। ये नियम अभी अंतिम नहीं हैं। | |
| result.taxSmall | This was a transfer of $15 or less, so the tax doesn’t apply. | यह $15 या उससे कम का ट्रांसफ़र था, इसलिए टैक्स नहीं लगता। | |
| result.nextTitle | Next time | अगली बार | |
| result.compare | Compare this route today | आज यह रूट मिलाएँ | |
| result.notCovered | We don’t check this route yet. | हम अभी यह रूट नहीं जाँचते। | |
| result.routeBoard | See which routes we check | देखें हम कौन से रूट जाँचते हैं | |
| result.disclosuresTitle | Standard disclosures | ज़रूरी जानकारियाँ | |
| result.disclosuresAll | Every standard item was found on this receipt. | इस रसीद पर हर ज़रूरी जानकारी मिली। | |
| result.disclosuresMissing | Not found on this receipt: {items}. | इस रसीद पर नहीं मिला: {items}। | |
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
| receiptPaths.parser | Read from the text | टेक्स्ट से पढ़ा गया | |
| receiptPaths.model | Read by AI | AI ने पढ़ा | |
| receiptPaths.user_corrected | You entered | आपने भरा | |
| funding.compareLabel | You pay with | आप भुगतान करेंगे | |
| funding.compareTaxLine | Paying by {funding} adds the 1% federal tax, {tax} here. It’s in the total cost. | {funding} से भुगतान पर 1% संघीय टैक्स लगता है, यहाँ {tax}। यह कुल लागत में शामिल है। | |
| funding.compareNone | No prices checked yet for paying this way. | इस तरह भुगतान के लिए अभी कोई जाँची हुई कीमत नहीं है। | |
| funding.trueCostLabel | You paid with | आपने भुगतान किया | |
| funding.trueCostTaxLine | Paid by {funding}, so a 1% federal tax of {tax} is added. It’s in the total cost. | {funding} से भुगतान हुआ, इसलिए {tax} का 1% संघीय टैक्स जुड़ता है। यह कुल लागत में शामिल है। | |


The WhatsApp bot's Hindi replies (packages/bot) need the same read. They're built from
pieces in code, so ask Claude for a separate sheet of example replies.
