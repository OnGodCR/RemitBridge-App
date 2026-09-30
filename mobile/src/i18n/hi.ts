/**
 * Hindi strings. The Hindi is Claude's and hasn't been read by a native speaker yet
 * (DECISIONS.md D72, like the bot's in D68): Angad reads it before launch. It uses the
 * bot's words for the same things (फ़ीस, एक्सचेंज रेट, नकद पिकअप), so the app and the bot
 * say them the same way.
 */
import type { Strings } from './en'

export const hi: Strings = {
  language: {
    label: 'भाषा',
    help: 'अभी सिर्फ़ रसीद स्कैनर के लिए। बाकी ऐप अंग्रेज़ी में है।',
    english: 'English',
    hindi: 'हिन्दी',
  },
  tools: {
    scanTitle: 'रसीद स्कैन करें',
    scanSubtitle: 'कैमरे से रसीद पढ़ें, निजी जानकारी पहले ढक दी जाती है',
  },
  scan: {
    title: 'रसीद स्कैन करें',
    intro:
      'पैसे भेजने की रसीद की फ़ोटो लें। ऐप उसे आपके फ़ोन पर ही पढ़ता है और कुछ भी भेजने से पहले नाम, पते, फ़ोन नंबर और खाता नंबर ढक देता है।',
    takePhoto: 'फ़ोटो लें',
    choosePhoto: 'फ़ोटो चुनें',
    needsBuild: 'स्कैन करने के लिए ऐप का पूरा वर्ज़न चाहिए। यह Expo Go में काम नहीं करता।',
    cameraDenied: 'फ़ोटो लेने के लिए Settings में RemitBridge को कैमरे की इजाज़त दें।',
    photosDenied: 'फ़ोटो चुनने के लिए Settings में RemitBridge को फ़ोटो की इजाज़त दें।',
    reading: 'रसीद आपके फ़ोन पर पढ़ी जा रही है…',
    noText: 'कोई लिखावट नहीं मिली। पूरी रसीद को सीधा रखकर, अच्छी रोशनी में फिर से कोशिश करें।',
    misaligned: 'लिखावट फ़ोटो से मेल नहीं खाई, इसलिए कुछ भी ढका नहीं गया। फ़ोटो फिर से लें।',
    failed: 'फ़ोटो पढ़ने में कुछ गड़बड़ हुई। फिर से कोशिश करें।',
    previewTitle: 'देखें कि क्या ढका गया है',
    previewHelp: 'काले डिब्बे निजी जानकारी ढकते हैं। किसी और शब्द को ढकने के लिए उस पर टैप करें, और दोबारा दिखाने के लिए फिर टैप करें।',
    coveredOne: 'एक चीज़ ढकी गई',
    coveredMany: '{count} चीज़ें ढकी गईं',
    tapWord: 'शब्द: {text}। ढकने के लिए टैप करें।',
    tapCovered: 'आपने ढका है। फिर से दिखाने के लिए टैप करें।',
    consentLabel: 'यह रसीद रिसर्च के लिए रखें',
    consentHelp:
      'जब तक आप इसे चालू न करें, यह बंद रहता है। चालू: हम ढकी हुई फ़ोटो और रकमें रखते हैं, आपकी पहचान बताने वाली कोई चीज़ नहीं, ताकि पता चले कि लोग असल में कितना चुकाते हैं। बंद: फ़ोटो कभी नहीं रखी जाती, और रकमें 30 दिन बाद मिटा दी जाती हैं।',
    send: 'मेरी रसीद पढ़ें',
    sending: 'रकमें पढ़ी जा रही हैं…',
    sendFailed: 'यह नहीं हो पाया। इंटरनेट देखें और फिर से कोशिश करें।',
    notConnected: 'ऐप अभी जुड़ा नहीं है।',
    retake: 'दूसरी फ़ोटो इस्तेमाल करें',
    readTitle: 'ऐप ने क्या पढ़ा',
    readSummary: '{total} में से {read} चीज़ें पढ़ी गईं।',
    toCheck: 'कृपया जाँचें',
    notFound: 'नहीं मिला',
    deleteNow: 'यह रसीद अभी मिटाएँ',
    deleted: 'मिटा दी गई।',
    another: 'दूसरी रसीद स्कैन करें',
    limits: [
      'क्या हर रकम सही पढ़ी गई। हर एक को अपनी रसीद से मिलाकर देखें।',
      'जो सिर्फ़ रसीद के पीछे छपा हो, या हाथ से लिखा हो।',
      'पैसा पहुँचने पर आपके परिवार ने जो फ़ीस दी, जब तक वह रसीद पर न लिखी हो।',
    ],
  },
  fields: {
    provider: 'कंपनी',
    send_currency: 'भेजने की मुद्रा',
    receive_currency: 'पाने की मुद्रा',
    amount_sent: 'भेजी गई रकम',
    fee: 'फ़ीस',
    tax: 'ट्रांसफ़र टैक्स',
    total_paid: 'कुल भुगतान',
    exchange_rate: 'एक्सचेंज रेट',
    amount_received: 'मिलने वाली रकम',
    pickup_charge: 'पिकअप शुल्क',
    transfer_date: 'भेजने की तारीख',
    funding_method: 'भुगतान का तरीका',
    delivery_method: 'पैसा कैसे पहुँचा',
  },
  funding: {
    bank_account: 'बैंक खाता',
    debit_card: 'डेबिट कार्ड',
    credit_card: 'क्रेडिट कार्ड',
    cash: 'नकद',
    money_order: 'मनी ऑर्डर',
    cashiers_check: 'कैशियर चेक',
  },
  delivery: {
    bank_deposit: 'बैंक खाते में',
    cash_pickup: 'नकद पिकअप',
    mobile_wallet: 'मोबाइल वॉलेट',
    upi: 'UPI',
    debit_card: 'डेबिट कार्ड',
    home_delivery: 'घर पर डिलीवरी',
  },
  paths: {
    parser: 'टेक्स्ट से पढ़ा गया',
    model: 'AI ने पढ़ा',
    user_corrected: 'आपने भरा',
  },
  limitsTitle: 'यह क्या नहीं बताता',
}
