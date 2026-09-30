/**
 * Stands in for `npm:@anthropic-ai/sdk` in the Edge Function test: the default export is a
 * client class whose beta.messages.create answers from `replies` and records `requests`.
 */
export const requests: Record<string, unknown>[] = []
export const replies: string[] = []
export const keys: string[] = []

export default class Anthropic {
  beta = {
    messages: {
      create: async (params: Record<string, unknown>) => {
        requests.push(params)
        const text = replies.shift()
        if (text === undefined) throw new Error('fake anthropic: no reply scripted')
        return { id: 'msg_fake', type: 'message', role: 'assistant', model: params.model, stop_reason: 'end_turn', content: [{ type: 'text', text }] }
      },
    },
  }
  constructor(opts: { apiKey: string }) {
    keys.push(opts.apiKey)
  }
}
