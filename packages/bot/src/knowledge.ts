/**
 * What the bot's model may draw on to answer a question (docs/whatsapp-ai-scope.md): the
 * app's features, short answers about how RemitBridge works, the glossary and the blog.
 * Each entry has the one link it may give. The model only sees the few entries that match
 * a question, and its answer may only link to what it was shown (checkAnswer in ai.ts).
 *
 * Nothing here is a price: prices only ever come from the database, through the templates.
 */
import { TERMS } from '../../../mobile/src/data/glossary.ts'
import blog from '../../../mobile/src/data/blog.json' with { type: 'json' }

export const SITE = 'https://www.remitbridgelabs.org'
export const APP = 'https://app.remitbridgelabs.org'

export interface Entry {
  id: string
  kind: 'feature' | 'faq' | 'term' | 'post'
  title: string
  text: string
  link: string
  /** Extra words people use for it, for matching. */
  words?: string[]
}

/** The app's features, with where to find them. Links go to the website for now (scope Q4). */
export const FEATURES: Entry[] = [
  { id: 'compare', kind: 'feature', title: 'Compare', text: 'Compare checked prices from the US to 26 countries, ranked by how much your family receives. Type an amount and a country here, like "500 to India", or open Compare in the app.', link: APP, words: ['compare', 'cheapest', 'best', 'price', 'prices', 'rate', 'rates', 'provider'] },
  { id: 'scan', kind: 'feature', title: 'Scan a receipt', text: 'Scan a transfer receipt in the app, or send a photo of it here, to see what that transfer really cost: the fee plus the markup hidden in the exchange rate.', link: APP, words: ['receipt', 'scan', 'photo', 'paid', 'cost'] },
  { id: 'fair-rate', kind: 'feature', title: 'Fair rate', text: 'Fair rate shows what each point of exchange-rate markup costs you, against the mid-market rate.', link: `${SITE}/fair-rate`, words: ['fair', 'markup', 'margin', 'rate'] },
  { id: 'truecost', kind: 'feature', title: 'TrueCost', text: 'TrueCost works out the real cost of a transfer you already made, from the numbers on your receipt.', link: `${SITE}/truecost`, words: ['truecost', 'true', 'real', 'cost', 'receipt'] },
  { id: 'scam-check', kind: 'feature', title: 'Scam check', text: 'Scam check asks eight quick questions about a request for money and tells you how worried to be. Your answers stay on your phone.', link: `${SITE}/scam-check`, words: ['scam', 'fraud', 'stranger', 'safe', 'trust', 'suspicious'] },
  { id: 'rate-history', kind: 'feature', title: 'Rate history', text: 'Rate history shows the mid-market rate day by day, so you can see how the rate has moved.', link: `${SITE}/rate-history`, words: ['history', 'trend', 'yesterday', 'week', 'month', 'chart'] },
  { id: 'glossary', kind: 'feature', title: 'Glossary', text: 'The glossary explains 80 money-transfer words in plain language.', link: `${SITE}/glossary`, words: ['glossary', 'word', 'mean', 'meaning', 'define'] },
  { id: 'learn', kind: 'feature', title: 'Learn', text: 'The app\'s Learn tab teaches the words of sending money in short lessons, then suggests a blog post to read.', link: APP, words: ['learn', 'lesson', 'course', 'teach'] },
  { id: 'alerts', kind: 'feature', title: 'Rate alerts', text: 'In the app, a rate alert sends you a notification when a route\'s best price reaches the amount you set.', link: APP, words: ['alert', 'notify', 'notification', 'remind', 'watch'] },
  { id: 'request', kind: 'feature', title: 'Ask for a route', text: 'If we don\'t cover a country yet, ask for it: send "request" and the country here, or pick it on Compare in the app. Requests decide what we add next.', link: APP, words: ['request', 'add', 'country', 'cover', 'missing'] },
]

/** Short answers about how RemitBridge works. */
export const FAQ: Entry[] = [
  { id: 'what', kind: 'faq', title: 'What RemitBridge is', text: 'RemitBridge Labs is a Washington nonprofit corporation. Its free app compares what it costs to send money from the US, ranked by how much your family receives. It never sends, holds or touches money: you send with the provider you choose.', link: APP, words: ['what', 'who', 'remitbridge', 'about', 'nonprofit', 'free'] },
  { id: 'how-ranked', kind: 'faq', title: 'How prices are ranked', text: 'Providers are ranked only by the amount your family receives. Nobody pays to be listed or ranked higher, and there are no affiliate links or ads.', link: APP, words: ['rank', 'ranked', 'order', 'paid', 'affiliate', 'sponsor', 'ads'] },
  { id: 'where-prices', kind: 'faq', title: 'Where prices come from', text: 'Wise prices come from its official comparison API, Instarem\'s from its public quote page, and some others are checked by hand. Every price passes our checks before it is shown.', link: APP, words: ['source', 'where', 'data', 'accurate', 'checked', 'how'] },
  { id: 'hidden-cost', kind: 'faq', title: 'The hidden cost in the rate', text: 'Besides the fee, most providers give you a worse exchange rate than the mid-market rate and keep the difference. That markup is a hidden cost; RemitBridge adds it to the fee to show the total cost.', link: `${SITE}/fair-rate`, words: ['hidden', 'markup', 'margin', 'why', 'less', 'difference'] },
  { id: 'privacy', kind: 'faq', title: 'Privacy', text: 'We keep a scrambled ID instead of your phone number. Receipt photos have your personal details covered before they are read. You can send FORGET at any time to delete what we keep.', link: `${APP}/privacy`, words: ['privacy', 'data', 'number', 'delete', 'forget', 'safe', 'store'] },
  { id: 'countries', kind: 'faq', title: 'Which countries', text: 'We check prices from the US to 26 countries, including India, Mexico, the Philippines, Vietnam, Kenya, Nigeria, Pakistan and Brazil. Ask for any other country and we count the request.', link: APP, words: ['countries', 'country', 'routes', 'which', 'where'] },
  { id: 'suggest', kind: 'faq', title: 'Suggestions', text: 'You can suggest a feature or a provider right here: just write it, and it goes to the team.', link: APP, words: ['suggest', 'idea', 'feature', 'feedback', 'improve'] },
  { id: 'funding', kind: 'faq', title: 'How RemitBridge is paid for', text: 'RemitBridge doesn\'t make money. It has no ads, no affiliate fees and no paid placements. RemitBridge Labs is a nonprofit, and the app runs on free services.', link: APP, words: ['money', 'free', 'cost', 'pay', 'paid', 'business', 'funded', 'catch'] },
  { id: 'account', kind: 'faq', title: 'Accounts', text: 'You don\'t need an account to compare prices or use this bot. An account only keeps the comparisons, receipts and alerts you save, on any phone.', link: APP, words: ['account', 'sign', 'login', 'register', 'without'] },
  { id: 'download', kind: 'faq', title: 'Getting the app', text: 'The RemitBridge app is on its way to the App Store and Google Play. Until then, this WhatsApp bot gives the same checked prices.', link: APP, words: ['download', 'app', 'install', 'store', 'iphone', 'android', 'play'] },
  { id: 'languages', kind: 'faq', title: 'Languages', text: 'Send HINDI to get replies in Hindi, and ENGLISH to switch back. The app is in English, with Hindi, Spanish, Tagalog and Vietnamese on the way.', link: APP, words: ['hindi', 'language', 'spanish', 'english', 'tagalog', 'vietnamese'] },
  { id: 'delivery', kind: 'faq', title: 'Ways to receive money', text: 'Bank deposit puts the money in a bank account. UPI is India\'s instant payment system, paid to a UPI ID. Cash pickup is collected in person at an agent\'s shop. A mobile wallet is an account on a phone, like GCash or M-Pesa.', link: `${SITE}/glossary`, words: ['upi', 'cash', 'pickup', 'wallet', 'bank', 'deposit', 'receive', 'gcash', 'mpesa'] },
  { id: 'weekend', kind: 'faq', title: 'Rates on weekends', text: 'Mid-market reference rates are published on working days. Over a weekend the last weekday\'s rate stands, while providers can still change their own rates, so comparisons can look different.', link: `${SITE}/rate-history`, words: ['weekend', 'saturday', 'sunday', 'holiday', 'different', 'changed'] },
  { id: 'fx', kind: 'faq', title: 'FX', text: 'FX means foreign exchange: changing one currency into another, like dollars into rupees. The exchange rate is how many of one you get for the other.', link: `${SITE}/glossary`, words: ['fx', 'forex', 'foreign', 'exchange', 'currency'] },
  { id: 'advice', kind: 'faq', title: 'Advice', text: 'RemitBridge shows prices and explains costs. It isn\'t financial advice, and it can\'t help with a transfer you already sent: contact your provider for that.', link: `${APP}/support`, words: ['advice', 'should', 'help', 'problem', 'stuck', 'refund', 'cancel'] },
]

export const GLOSSARY: Entry[] = TERMS.map((t) => ({ id: `term:${t.id}`, kind: 'term', title: t.term, text: t.plain, link: `${SITE}/glossary` }))

type Post = { id: number; title: string; abstract: string; slug: string; body: unknown }
export const POSTS: Entry[] = (blog.posts as Post[]).map((p) => ({
  id: `post:${p.id}`,
  kind: 'post',
  title: p.title,
  text: p.abstract,
  link: `${SITE}/blog/${p.slug}`,
}))

/**
 * The basics, sent with every question so the model can always say who we are and where
 * things are, whatever the question matched ("give me your website" matches no feature).
 */
export const CORE: Entry[] = [
  { id: 'core:about', kind: 'faq', title: 'About RemitBridge', text: 'RemitBridge Labs, a Washington nonprofit corporation, makes a free app and this WhatsApp bot that compare what it costs to send money from the US to 26 countries, ranked by how much your family receives. It never sends or holds money.', link: SITE },
  { id: 'core:links', kind: 'faq', title: 'Where to find us', text: `Website: ${SITE}. The app's page: ${APP}. Blog: ${SITE}/blog. Privacy policy: ${APP}/privacy. Help and contact: ${APP}/support. Email: hello@remitbridgelabs.org.`, link: SITE },
  { id: 'core:bot', kind: 'faq', title: 'What this bot does', text: 'Send an amount and a country, like "500 to India", for checked prices. Send a receipt photo to see what a transfer really cost. Send WHY for the hidden cost, SCAM to check a request for money, HINDI for Hindi replies, or just ask a question or suggest something.', link: APP },
]

export const ALL: Entry[] = [...FAQ, ...FEATURES, ...GLOSSARY, ...POSTS]

/** Every link the bot may send: our two sites, and anything under them. */
export function isOurLink(url: string): boolean {
  return /^https:\/\/(www\.remitbridgelabs\.org|app\.remitbridgelabs\.org|remitbridgelabs\.org)(\/[\w\-./?=&#%]*)?$/.test(url)
}

const STOP = new Set(['the', 'a', 'an', 'is', 'are', 'to', 'of', 'and', 'or', 'in', 'on', 'for', 'my', 'me', 'i', 'you', 'it', 'do', 'does', 'what', 'how', 'can', 'with', 'this', 'that', 'be', 'your', 'from', 'at', 'by', 'about', 'there'])
/** Lowercase words, with a plural's "s" dropped so "stablecoins" finds "stablecoin". */
const tokens = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097f\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map((w) => (w.length > 4 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w))

/**
 * The entries most likely to answer a question: words in common, with a title or listed
 * word worth more than a word in the text. Plain keyword matching on purpose: it's
 * predictable, needs no extra service, and the model does the understanding.
 */
export function retrieve(question: string, max = 4): Entry[] {
  const q = new Set(tokens(question))
  if (!q.size) return []
  const scored = ALL.map((e) => {
    let score = 0
    for (const w of tokens(e.title)) if (q.has(w)) score += 3
    for (const w of new Set(tokens((e.words ?? []).join(' ')))) if (q.has(w)) score += 3
    for (const w of new Set(tokens(e.text))) if (q.has(w)) score += 1
    // Features and short answers first when they tie with a post.
    if (e.kind === 'faq' || e.kind === 'feature') score += 0.5
    return { e, score }
  }).filter((x) => x.score >= 2)
  return scored.sort((a, b) => b.score - a.score).slice(0, max).map((x) => x.e)
}
