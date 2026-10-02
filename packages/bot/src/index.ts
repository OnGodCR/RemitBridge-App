/**
 * The WhatsApp bot's logic (PRD 5.8, DECISIONS.md D68), kept free of Deno and network code
 * so it runs under vitest here and inside the Edge Function (supabase/functions/whatsapp)
 * unchanged. The function does the I/O: verify, look up, send.
 */
export { normalize, parse, type Command, type Language } from './parse.ts'
export { MAX_AMOUNT, NEW_STATE, plan, type Action, type Say, type State } from './plan.ts'
export {
  formatCompare,
  formatForgotten,
  formatLinked,
  formatNotText,
  formatRateLimited,
  formatRequested,
  formatSaveNote,
  formatSay,
  formatUnlinked,
  formatWhy,
  LINK,
  rankFor,
  type QuoteRow,
} from './messages.ts'
export {
  formatReceiptAck,
  formatReceiptFailed,
  formatReceiptQuestion,
  formatReceiptResult,
  formatReceiptsOff,
  formatReceiptUnreadable,
  MAX_QUESTIONS,
  readReceiptReply,
  type ReceiptReply,
} from './receipt.ts'
