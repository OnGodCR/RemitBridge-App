/** A stand-in for the Groq client: records each request and answers from a script. */
import type { ChatRequest, ChatResponse, ModelClient } from '../model.ts'

type Reply = { finish_reason?: string; text: string; refusal?: string } | { error: string } | Error

export function fakeModel(replies: Reply[]) {
  const requests: ChatRequest[] = []
  const client: ModelClient = {
    complete: async (request) => {
      requests.push(request)
      const reply = replies.shift()
      if (!reply) throw new Error('fake model: no reply scripted')
      if (reply instanceof Error) throw reply
      return chatReply(reply)
    },
  }
  return { client, requests }
}

export function chatReply(reply: Exclude<Reply, Error>): ChatResponse {
  if ('error' in reply) return { error: { message: reply.error, code: 502 } }
  return {
    choices: [{ finish_reason: reply.finish_reason ?? 'stop', message: { content: reply.text, refusal: reply.refusal ?? null } }],
  }
}

/** An answer in the schema's shape: { field: { value, confidence, line } }. */
export function answer(fields: Record<string, [value: unknown, confidence?: number, line?: number | null]>): string {
  return JSON.stringify(
    Object.fromEntries(Object.entries(fields).map(([k, [value, confidence = 0.9, line = null]]) => [k, { value, confidence, line }])),
  )
}
