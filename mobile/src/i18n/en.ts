/**
 * English strings for the screens built since D72. Existing screens still have their
 * English inline; they move here with the open item "More languages".
 *
 * Placeholders are {name}, filled by fill() in ./index.ts. Every key here must exist in
 * hi.ts too (TypeScript checks that, and a test checks the placeholders match).
 */
export const en = {
  language: {
    label: 'Language',
    help: 'Used by the receipt scanner for now. The rest of the app is in English.',
    english: 'English',
    hindi: 'हिन्दी',
  },
  tools: {
    scanTitle: 'Scan a receipt',
    scanSubtitle: 'Read a receipt with your camera, with personal details covered first',
  },
  scan: {
    title: 'Scan a receipt',
    intro:
      'Take a photo of a transfer receipt. The app reads it on your phone and covers names, addresses, and phone and account numbers before anything is sent.',
    takePhoto: 'Take a photo',
    choosePhoto: 'Choose a photo',
    needsBuild: 'Scanning needs the full build of the app. It doesn’t work in Expo Go.',
    cameraDenied: 'To take a photo, allow camera access for RemitBridge in Settings.',
    photosDenied: 'To choose a photo, allow photo access for RemitBridge in Settings.',
    reading: 'Reading the receipt on your phone…',
    noText: 'No text found. Try again with the whole receipt flat, in good light.',
    misaligned: 'The text didn’t line up with the photo, so nothing was covered. Take the photo again.',
    failed: 'Something went wrong reading the photo. Try again.',
    previewTitle: 'Check what’s covered',
    previewHelp: 'Black boxes cover personal details. Tap any other word to cover it too, and tap it again to show it.',
    coveredOne: 'One item covered',
    coveredMany: '{count} items covered',
    tapWord: 'Word: {text}. Tap to cover it.',
    tapCovered: 'Covered by you. Tap to show it again.',
    consentLabel: 'Keep this receipt for research',
    consentHelp:
      'Off unless you turn it on. On: we keep the covered photo and the values, with nothing that says who you are, to study what people really pay. Off: the photo is never stored, and the values are deleted after 30 days.',
    send: 'Read my receipt',
    sending: 'Reading the values…',
    sendFailed: 'That didn’t go through. Check your connection and try again.',
    notConnected: 'The app isn’t connected yet.',
    retake: 'Use a different photo',
    readTitle: 'What the app read',
    readSummary: '{read} of {total} values read.',
    toCheck: 'Please check',
    notFound: 'Not found',
    deleteNow: 'Delete this receipt now',
    deleted: 'Deleted.',
    another: 'Scan another receipt',
    limits: [
      'Whether every value was read right. Check each one against your receipt.',
      'Anything printed only on the back of the receipt, or written by hand.',
      'Fees your family paid when the money arrived, unless the receipt shows them.',
    ],
  },
  fields: {
    provider: 'Provider',
    send_currency: 'Sent in',
    receive_currency: 'Received in',
    amount_sent: 'Amount sent',
    fee: 'Fee',
    tax: 'Transfer tax',
    total_paid: 'Total paid',
    exchange_rate: 'Exchange rate',
    amount_received: 'Amount received',
    pickup_charge: 'Pickup charge',
    transfer_date: 'Date sent',
    funding_method: 'Paid with',
    delivery_method: 'Delivery',
  },
  funding: {
    bank_account: 'Bank account',
    debit_card: 'Debit card',
    credit_card: 'Credit card',
    cash: 'Cash',
    money_order: 'Money order',
    cashiers_check: 'Cashier’s check',
  },
  delivery: {
    bank_deposit: 'Bank deposit',
    cash_pickup: 'Cash pickup',
    mobile_wallet: 'Mobile wallet',
    upi: 'UPI',
    debit_card: 'Debit card',
    home_delivery: 'Home delivery',
  },
  paths: {
    parser: 'Read from the text',
    model: 'Read by AI',
    user_corrected: 'You entered',
  },
  limitsTitle: 'What this does not tell you',
}

/** The shape every language must have: en's keys, with any string in each place. */
type Widen<T> = T extends string ? string : T extends readonly string[] ? readonly string[] : { [K in keyof T]: Widen<T[K]> }
export type Strings = Widen<typeof en>
