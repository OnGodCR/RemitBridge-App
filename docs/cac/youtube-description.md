# CAC video: YouTube title, description and thumbnail

Thumbnail: `youtube-thumbnail.png` (1280x720), also in Downloads as
"RemitBridge CAC thumbnail.png".

## Title

RemitBridge: See What Sending Money Home Really Costs | Congressional App Challenge 2026

## Description

A $0 fee doesn't mean a transfer is free. Most of what people lose when they send money
home is hidden in the exchange rate. RemitBridge is a free app that shows what a transfer
really costs, and how much your family actually receives.

I built RemitBridge for the 2026 Congressional App Challenge. My family sends money to my
grandparents in India. For many families, those same transfers decide whether they can
pay rent, buy groceries or afford school.

What the app does:
- Compare: ranks providers by how much money your family receives, not by the fee. No
  provider can pay for a higher spot, and there are no affiliate links.
- TrueCost: scan an old receipt. The text is read on your phone, private details are
  covered before anything leaves it, and the app shows the hidden exchange-rate markup and
  what you could have kept.
- Remmy: an assistant that answers questions, runs comparisons and moves around the app
  for you.
- Learn: short lessons, games and a scam check.
- WhatsApp: text "500 to India" and get today's prices, no app needed. Works in English
  and Hindi.

How it's built: React Native and TypeScript for iOS and Android, with Supabase
(PostgreSQL and Edge Functions) as the backend. Python workflows on GitHub Actions collect
prices every six hours, and every price is checked against independent exchange rates
before anyone sees it.

Timestamps
0:00 Why it matters
0:53 The app
1:59 How it's built
2:40 What's next

Try it: https://remitbridgelabs.org/app
Questions or a wrong price: hello@remitbridgelabs.org

RemitBridge gives information only. It never sends or holds money.

I used AI tools to help build parts of RemitBridge and to edit this video.

#CongressionalAppChallenge #CAC2026 #Remittances #FinancialLiteracy #ReactNative

## Before posting

- Whether the app is live in the App Store and Google Play by then. If it is, add the
  store links under "Try it".
- That the four spoken claims flagged in `video-edit-plan.md` still match the
  description. The description avoids them on purpose.
