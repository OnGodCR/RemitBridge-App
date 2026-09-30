/**
 * Just enough of supabase-js for the scan-receipt function: tables in memory, the two RPCs
 * it calls (with the same cap logic as the migration), and storage.
 */
type Row = Record<string, unknown>

export const tables: Record<string, Row[]> = {}
export const storage: { bucket: string; path: string; bytes: number; contentType?: string }[] = []
export const rpcs: { name: string; args: unknown }[] = []
let modelCalls = 0

export function reset() {
  for (const k of Object.keys(tables)) delete tables[k]
  storage.length = 0
  rpcs.length = 0
  modelCalls = 0
}

export function createClient(_url: string, _key: string) {
  return {
    from: (table: string) => query(table),
    rpc: async (name: string, args?: Record<string, unknown>) => {
      rpcs.push({ name, args })
      if (name === 'take_receipt_model_call') {
        const cap = Number(args?.p_cap)
        if (cap > 0 && modelCalls < cap) {
          modelCalls++
          return { data: true, error: null }
        }
        return { data: false, error: null }
      }
      if (name === 'forget_expired_receipts') {
        const now = Date.now()
        const before = (tables.receipts ?? []).length
        tables.receipts = (tables.receipts ?? []).filter((r) => !r.expires_at || Date.parse(String(r.expires_at)) > now)
        return { data: before - tables.receipts.length, error: null }
      }
      return { data: null, error: { message: `no rpc ${name}` } }
    },
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, bytes: Uint8Array, opts?: { contentType?: string }) => {
          storage.push({ bucket, path, bytes: bytes.length, contentType: opts?.contentType })
          return { data: { path }, error: null }
        },
        remove: async (paths: string[]) => {
          for (const p of paths) {
            const i = storage.findIndex((s) => s.bucket === bucket && s.path === p)
            if (i >= 0) storage.splice(i, 1)
          }
          return { data: [], error: null }
        },
      }),
    },
  }
}

function query(table: string) {
  const filters: ((r: Row) => boolean)[] = []
  const rows = () => (tables[table] ??= [])
  const matching = () => rows().filter((r) => filters.every((f) => f(r)))
  const api = {
    select: () => api,
    eq: (col: string, val: unknown) => {
      filters.push((r) => r[col] === val)
      return api
    },
    gte: (col: string, val: string) => {
      filters.push((r) => String(r[col]) >= val)
      return api
    },
    lte: (col: string, val: string) => {
      filters.push((r) => String(r[col]) <= val)
      return api
    },
    then: (resolve: (v: { data: Row[]; error: null }) => void) => resolve({ data: matching(), error: null }),
    update: (patch: Row) => ({
      eq: async (col: string, val: unknown) => {
        for (const r of rows()) if (r[col] === val) Object.assign(r, patch)
        return { error: null }
      },
    }),
    upsert: async (row: Row) => {
      const i = rows().findIndex((r) => r.receipt_id === row.receipt_id)
      if (i >= 0) rows()[i] = { ...row }
      else rows().push({ ...row })
      return { error: null }
    },
    maybeSingle: async () => ({ data: matching()[0] ?? null, error: null }),
    insert: async (row: Row | Row[]) => {
      for (const r of Array.isArray(row) ? row : [row]) rows().push({ ...r })
      return { error: null }
    },
    delete: () => ({
      eq: async (col: string, val: unknown) => {
        tables[table] = rows().filter((r) => r[col] !== val)
        if (table === 'receipts') {
          for (const t of ['receipt_fields', 'receipt_comparisons']) tables[t] = (tables[t] ?? []).filter((r) => r.receipt_id !== val)
        }
        return { error: null }
      },
    }),
  }
  return api
}
