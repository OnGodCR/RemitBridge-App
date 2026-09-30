/**
 * What to do with a command, given the little the bot remembers about a number (PRD 5.8:
 * "a hashed phone number for rate limiting and language preference. No names, no amounts
 * tied to identities"). So it keeps the language, the last route and delivery method, and
 * a route waiting for a YES, and never an amount.
 */
import {
  checkedAmountFor,
  routeFor,
  ROUTES,
  type DeliveryMethod,
  type Route,
} from '../../../mobile/src/lib/routes.ts'
import type { Command, Language } from './parse.ts'

/** The app's limit too (Compare's MAX_AMOUNT). */
export const MAX_AMOUNT = 50000

export interface State {
  language: Language
  lastRoute: string | null
  lastMethod: DeliveryMethod | null
  /** "US-NP": a route someone asked about that we don't cover, waiting for YES. */
  pendingRequest: string | null
}

export const NEW_STATE: State = { language: 'en', lastRoute: null, lastMethod: null, pendingRequest: null }

/** A reply that needs no data. */
export type Say =
  | { key: 'help' }
  | { key: 'askAmount'; to: string }
  | { key: 'askCountry'; amount: number }
  | { key: 'askBoth' }
  | { key: 'askRequestCountry' }
  | { key: 'tooMuch' }
  | { key: 'notCovered'; from: string; to: string }
  | { key: 'methodUnavailable'; method: DeliveryMethod; route: Route }
  | { key: 'language'; language: Language }
  | { key: 'scam' }
  | { key: 'check' }
  | { key: 'nothingPending' }
  | { key: 'unknown' }

export type Action =
  | { type: 'say'; say: Say }
  /** Look up prices, then reply with the top three. */
  | { type: 'compare'; route: Route; amount: number; checked: number; method: DeliveryMethod }
  /** Explain the markup, with the last route's prices if there are any. */
  | { type: 'why'; route: Route | null; method: DeliveryMethod | null }
  /** Count a request for a route we don't cover (PRD 6.7, source 'whatsapp'). */
  | { type: 'request'; from: string; to: string }
  /** Delete this number's row: its hash, language and last route. */
  | { type: 'forget' }

export function plan(cmd: Command, state: State): { action: Action; state: Partial<State> } {
  const say = (s: Say, update: Partial<State> = {}) => ({ action: { type: 'say' as const, say: s }, state: update })

  switch (cmd.kind) {
    case 'help':
      return say({ key: 'help' })
    case 'language':
      return say({ key: 'language', language: cmd.language }, { language: cmd.language })
    case 'scam':
      return say({ key: 'scam' })
    case 'check':
      return say({ key: 'check' })
    case 'unknown':
      return say({ key: 'unknown' })
    case 'forget':
      return { action: { type: 'forget' }, state: {} }
    case 'why': {
      const route = ROUTES.find((r) => r.id === state.lastRoute) ?? null
      return { action: { type: 'why', route, method: route ? state.lastMethod : null }, state: {} }
    }
    case 'yes': {
      if (!state.pendingRequest) return say({ key: 'nothingPending' })
      const [from, to] = state.pendingRequest.split('-')
      return { action: { type: 'request', from, to }, state: { pendingRequest: null } }
    }
    case 'request': {
      const from = cmd.from ?? 'US'
      if (!cmd.to) return say({ key: 'askRequestCountry' })
      const covered = routeFor(from, cmd.to)
      if (covered) return say({ key: 'askAmount', to: cmd.to }, { lastRoute: covered.id })
      return { action: { type: 'request', from, to: cmd.to }, state: { pendingRequest: null } }
    }
    case 'compare': {
      const from = cmd.from ?? 'US'
      // Where to: said now; or implied by UPI, which only India has; or the last route.
      let to = cmd.to
      if (!to && cmd.method === 'upi') to = 'IN'
      const last = ROUTES.find((r) => r.id === state.lastRoute)
      if (!to && last && last.id.startsWith(`${from.toLowerCase()}-`)) to = last.id.split('-')[1].toUpperCase()
      if (!to) return say(cmd.amount ? { key: 'askCountry', amount: cmd.amount } : { key: 'askBoth' })

      const route = routeFor(from, to)
      if (!route) return say({ key: 'notCovered', from, to }, { pendingRequest: `${from}-${to}` })
      if (cmd.method && !route.deliveryMethods.includes(cmd.method)) {
        return say({ key: 'methodUnavailable', method: cmd.method, route }, { lastRoute: route.id })
      }
      if (!cmd.amount) {
        return say({ key: 'askAmount', to }, { lastRoute: route.id, lastMethod: cmd.method ?? null })
      }
      if (cmd.amount > MAX_AMOUNT) return say({ key: 'tooMuch' })

      const kept = state.lastRoute === route.id && state.lastMethod && route.deliveryMethods.includes(state.lastMethod)
      const method = cmd.method ?? (kept ? state.lastMethod! : route.deliveryMethods[0])
      return {
        action: { type: 'compare', route, amount: cmd.amount, checked: checkedAmountFor(cmd.amount), method },
        state: { lastRoute: route.id, lastMethod: method, pendingRequest: null },
      }
    }
  }
}
