import { describe, expect, it } from 'vitest'
import { fitLimits, runIntake, type IntakeDeps } from './node/intake.ts'
import { loadFixtures } from './node/fixtures.ts'
import { pageFromLines } from './ocr.ts'
import type { OcrPage } from './types.ts'

const wu = loadFixtures().find((f) => f.id === 'western-union-cash-usd-mxn')!
const URL_ = 'https://example.supabase.co'

interface Call {
  url: string
  body: Record<string, unknown> | null
  headers: Record<string, string>
}

function world(opts: { jobs?: unknown[]; page?: OcrPage; toConfirm?: string[]; mime?: string; scanStatus?: number } = {}) {
  const calls: Call[] = []
  const fetch = (async (url: string, init: RequestInit = {}) => {
    const body = init.body ? JSON.parse(String(init.body)) : null
    calls.push({ url, body, headers: (init.headers ?? {}) as Record<string, string> })
    const json = (x: unknown, status = 200) => new Response(JSON.stringify(x), { status })
    if (url.endsWith('/rpc/claim_receipt_intake')) return json(opts.jobs ?? [{ id: 'job-1', media_id: 'm1', language: 'hi' }])
    if (url === 'https://graph.facebook.com/v23.0/m1') return json({ url: 'https://lookaside.example/m1', mime_type: opts.mime ?? 'image/jpeg', file_size: 3 })
    if (url === 'https://lookaside.example/m1') return new Response(new Uint8Array([1, 2, 3]))
    if (url.endsWith('/functions/v1/scan-receipt')) {
      if (opts.scanStatus) return json({ error: 'x' }, opts.scanStatus)
      return body.action === 'scan'
        ? json({ id: 'r-1', to_confirm: opts.toConfirm ?? [], fields: {} })
        : json({ id: 'r-1', to_confirm: [], fields: {}, comparison: { quote: null, gap: null, reason: 'no_quote' }, mid: null })
    }
    if (url.includes('/functions/v1/whatsapp?intake=done')) return json({})
    throw new Error(`unexpected ${url}`)
  }) as unknown as typeof globalThis.fetch
  const ocrSeen: Uint8Array[] = []
  const deps: IntakeDeps = {
    supabaseUrl: URL_,
    serviceKey: 'service-key',
    intakeSecret: 'intake-secret',
    whatsappToken: 'meta-token',
    fetch,
    ocr: async (b) => {
      ocrSeen.push(b)
      return opts.page ?? wu.page
    },
    today: () => '2026-09-30',
  }
  const reports = () => calls.filter((c) => c.url.includes('intake=done')).map((c) => c.body!)
  const scans = () => calls.filter((c) => c.url.endsWith('/scan-receipt')).map((c) => c.body!)
  return { deps, calls, reports, scans, ocrSeen }
}

describe('the receipt worker', () => {
  it('reads a photo, sends only redacted text as a WhatsApp scan, and reports the full result', async () => {
    const w = world()
    expect(await runIntake(w.deps)).toEqual({ read: 1, unreadable: 0, failed: 0 })
    expect(Array.from(w.ocrSeen[0])).toEqual([1, 2, 3])
    const [scan, confirm] = w.scans()
    expect(scan).toMatchObject({ action: 'scan', channel: 'whatsapp', research_consent: false, today: '2026-09-30' })
    expect(scan.image).toBeUndefined()
    const sent = JSON.stringify(scan)
    for (const p of wu.pii) expect(sent).not.toContain(p)
    expect(confirm).toMatchObject({ action: 'confirm', id: 'r-1', corrections: {} })
    expect(w.reports()).toEqual([expect.objectContaining({ job: 'job-1', outcome: 'read', result: expect.objectContaining({ id: 'r-1' }) })])
  })

  it('sends the worker secret to both functions, and Meta’s token only to Meta', async () => {
    const w = world()
    await runIntake(w.deps)
    for (const c of w.calls) {
      const isMeta = c.url.includes('facebook.com') || c.url.includes('lookaside')
      expect(c.headers.Authorization === 'Bearer meta-token', c.url).toBe(isMeta)
      if (c.url.includes('/functions/v1/')) expect(c.headers['x-intake-secret']).toBe('intake-secret')
    }
  })

  it('reports values to check without asking for the full result', async () => {
    const w = world({ toConfirm: ['fee'] })
    await runIntake(w.deps)
    expect(w.scans()).toHaveLength(1)
    expect(w.reports()[0]).toMatchObject({ outcome: 'read', scan: { to_confirm: ['fee'] } })
    expect(w.reports()[0].result).toBeUndefined()
  })

  it('calls a photo with too little text unreadable, and sends nothing to scan', async () => {
    const w = world({ page: pageFromLines(['a cat', 'on a mat']) })
    expect(await runIntake(w.deps)).toEqual({ read: 0, unreadable: 1, failed: 0 })
    expect(w.scans()).toHaveLength(0)
  })

  it('reports a failure when something along the way fails', async () => {
    for (const opts of [{ mime: 'video/mp4' }, { scanStatus: 500 }]) {
      const w = world(opts)
      expect(await runIntake(w.deps)).toEqual({ read: 0, unreadable: 0, failed: 1 })
      expect(w.reports()[0]).toEqual({ job: 'job-1', outcome: 'failed' })
    }
  })

  it('does nothing when the queue is empty', async () => {
    const w = world({ jobs: [] })
    expect(await runIntake(w.deps)).toEqual({ read: 0, unreadable: 0, failed: 0 })
    expect(w.calls).toHaveLength(1)
  })
})

describe('fitLimits', () => {
  it('drops overlong and empty words and caps lines', () => {
    const page = pageFromLines(['x'.repeat(65) + ' ok'])
    expect(fitLimits(page).lines[0].words.map((w) => w.text)).toEqual(['ok'])
    expect(fitLimits(pageFromLines(Array.from({ length: 400 }, () => 'line'))).lines).toHaveLength(300)
  })
})
