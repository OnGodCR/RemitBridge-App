/** A stand-in for the Anthropic client: records each request and answers from a script. */
import type { ModelClient } from '../model.ts'

type Reply = { stop_reason?: string; text: string } | Error

export function fakeModel(replies: Reply[]) {
  const requests: Parameters<ModelClient['beta']['messages']['create']>[0][] = []
  const client: ModelClient = {
    beta: {
      messages: {
        create: async (params) => {
          requests.push(params)
          const reply = replies.shift()
          if (!reply) throw new Error('fake model: no reply scripted')
          if (reply instanceof Error) throw reply
          return {
            id: 'msg_fake',
            type: 'message',
            role: 'assistant',
            model: params.model,
            stop_reason: reply.stop_reason ?? 'end_turn',
            content: [{ type: 'text', text: reply.text }],
          } as unknown as Awaited<ReturnType<ModelClient['beta']['messages']['create']>>
        },
      },
    },
  }
  return { client, requests }
}

/** An answer in the schema's shape: { field: { value, confidence, line } }. */
export function answer(fields: Record<string, [value: unknown, confidence?: number, line?: number | null]>): string {
  return JSON.stringify(
    Object.fromEntries(Object.entries(fields).map(([k, [value, confidence = 0.9, line = null]]) => [k, { value, confidence, line }])),
  )
}
