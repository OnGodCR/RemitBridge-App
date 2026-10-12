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
  { id: 'where-prices', kind: 'faq', title: 'Where prices come from', text: 'Wise prices come from its official comparison API, Instarem\'s from its public quote page, and some others are checked by hand. Every price passes our checks before it is shown, with the time it was checked.', link: APP, words: ['source', 'where', 'data', 'accurate', 'checked', 'how'] },
  { id: 'hidden-cost', kind: 'faq', title: 'The hidden cost in the rate', text: 'Besides the fee, most providers give you a worse exchange rate than the mid-market rate and keep the difference. That markup is a hidden cost; RemitBridge adds it to the fee to show the total cost.', link: `${SITE}/fair-rate`, words: ['hidden', 'markup', 'margin', 'why', 'less', 'difference'] },
  { id: 'privacy', kind: 'faq', title: 'Privacy', text: 'We keep a scrambled ID instead of your phone number. Receipt photos have your personal details covered before they are read. You can send FORGET at any time to delete what we keep.', link: `${APP}/privacy`, words: ['privacy', 'data', 'number', 'delete', 'forget', 'safe', 'store'] },
  { id: 'countries', kind: 'faq', title: 'Which countries', text: 'We check prices from the US to 26 countries, including India, Mexico, the Philippines, Vietnam, Kenya, Nigeria, Pakistan and Brazil. Ask for any other country and we count the request.', link: APP, words: ['countries', 'country', 'routes', 'which', 'where'] },
  { id: 'suggest', kind: 'faq', title: 'Suggestions', text: 'You can suggest a feature or a provider right here: just write it, and it goes to the team.', link: APP, words: ['suggest', 'idea', 'feature', 'feedback', 'improve'] },
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

export const ALL: Entry[] = [...FAQ, ...FEATURES, ...GLOSSARY, ...POSTS]

const STOP = new Set(['the', 'a', 'an', 'is', 'are', 'to', 'of', 'and', 'or', 'in', 'on', 'for', 'my', 'me', 'i', 'you', 'it', 'do', 'does', 'what', 'how', 'can', 'with', 'this', 'that', 'be', 'your', 'from', 'at', 'by', 'about', 'there'])
const tokens = (s: string) => s.toLowerCase().replace(/[^a-z0-9ऀ-ॿ\s-]/g, ' ').split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w))

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
    for (const w of e.words ?? []) if (q.has(w)) score += 3
    for (const w of new Set(tokens(e.text))) if (q.has(w)) score += 1
    // Features and short answers first when they tie with a post.
    if (e.kind === 'faq' || e.kind === 'feature') score += 0.5
    return { e, score }
  }).filter((x) => x.score >= 2)
  return scored.sort((a, b) => b.score - a.score).slice(0, max).map((x) => x.e)
}
