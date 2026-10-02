# WhatsApp message templates

A message the person didn't just ask for (anything sent more than 24 hours after their last
message) has to use a template Meta has approved. RemitBridge has one, for rate alerts
(DECISIONS.md D139). Create it in **WhatsApp Manager > Message templates > Create template**
once Meta has lifted the account's restriction.

## rate_alert

- **Name:** `rate_alert` (the `WHATSAPP_ALERT_TEMPLATE` secret can name another)
- **Category:** Utility (it's an update the person asked for, not marketing)
- **Languages:** English (US) and Hindi. Alerts set in the app in Spanish, Tagalog or
  Vietnamese arrive in English, as the bot speaks English and Hindi only.
- **Body, English (US):**

  ```
  RemitBridge rate alert: {{1}} now gives {{2}} for {{3}} to {{4}}, above your {{5}} target. Open the app to compare. Reply STOP to stop all messages.
  ```

- **Body, Hindi:**

  ```
  RemitBridge रेट अलर्ट: {{1}} अब {{4}} के लिए {{3}} पर {{2}} दे रहा है, आपके {{5}} के लक्ष्य से ज़्यादा। तुलना के लिए ऐप खोलें। सभी संदेश रोकने के लिए STOP लिखें।
  ```

- **Sample values** (Meta asks for them): {{1}} Wise, {{2}} ₹47,818, {{3}} $500,
  {{4}} India, {{5}} ₹47,600.

The values come from `.github/scripts/send-rate-alerts.mjs` in exactly this order:
provider, amount received, amount sent, country, target. Change the order there and here
together, or the message reads wrong.
