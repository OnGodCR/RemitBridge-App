/**
 * Just enough of supabase-js for the webhook test: tables in memory, the query calls the
 * function makes, and a record of which key each client used.
 */
type Row = Record<string, unknown>

export const tables: Record<string, Row[]> = {}
export const clients: string[] = []
/** Database functions the test scripts: name → what it returns. */
export const rpcs: Record<string, (args: Row) => unknown> = {}
export const rpcCalls: { name: string; args: Row }[] = []
/** Who auth.getUser() says the caller is (the newsletter test). */
export const caller: { user: Row | null } = { user: null }

export function reset(seed: Record<string, Row[]> = {}) {
  for (const k of Object.keys(tables)) delete tables[k]
  for (const [k, v] of Object.entries(seed)) tables[k] = v.map((r) => ({ ...r }))
  clients.length = 0
  rpcCalls.length = 0
  for (const k of Object.keys(rpcs)) delete rpcs[k]
  caller.user = null
}

export function createClient(_url: string, key: string) {
  clients.push(key)
  return {
    from: (table: string) => query(table),
    rpc: async (name: string, args: Row = {}) => {
      rpcCalls.push({ name, args })
      return { data: rpcs[name] ? rpcs[name](args) : null, error: null }
    },
    auth: { getUser: async () => ({ data: { user: caller.user }, error: null }) },
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
    gte: (col: string, val: string | number) => {
      filters.push((r) => typeof val === 'number' ? Number(r[col]) >= val : String(r[col] ?? '') >= val)
      return api
    },
    lt: (col: string, val: number) => {
      filters.push((r) => Number(r[col]) < val)
      return api
    },
    maybeSingle: async () => ({ data: matching()[0] ?? null, error: null }),
    then: (resolve: (v: { data: Row[]; error: null }) => void) => resolve({ data: matching(), error: null }),
    upsert: async (row: Row) => {
      const i = rows().findIndex((r) => r.phone_hash === row.phone_hash)
      if (i >= 0) rows()[i] = { ...rows()[i], ...row }
      else rows().push({ ...row })
      return { error: null }
    },
    insert: (row: Row) => {
      const stored = { id: `id-${rows().length + 1}`, ...row }
      rows().push(stored)
      // Awaited as it is, or followed by .select().single() for the new row.
      return {
        then: (resolve: (v: { error: null }) => void) => resolve({ error: null }),
        select: () => ({ single: async () => ({ data: stored, error: null }) }),
      }
    },
    update: (patch: Row) => ({
      eq: async (col: string, val: unknown) => {
        for (const r of rows()) if (r[col] === val) Object.assign(r, patch)
        return { error: null }
      },
    }),
    delete: () => ({
      eq: async (col: string, val: unknown) => {
        tables[table] = rows().filter((r) => r[col] !== val)
        return { error: null }
      },
    }),
  }
  return api
}
