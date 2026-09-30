/**
 * Just enough of supabase-js for the webhook test: tables in memory, the query calls the
 * function makes, and a record of which key each client used.
 */
type Row = Record<string, unknown>

export const tables: Record<string, Row[]> = {}
export const clients: string[] = []

export function reset(seed: Record<string, Row[]> = {}) {
  for (const k of Object.keys(tables)) delete tables[k]
  for (const [k, v] of Object.entries(seed)) tables[k] = v.map((r) => ({ ...r }))
  clients.length = 0
}

export function createClient(_url: string, key: string) {
  clients.push(key)
  return { from: (table: string) => query(table) }
}

function query(table: string) {
  const filters: [string, unknown][] = []
  const rows = () => (tables[table] ??= [])
  const matching = () => rows().filter((r) => filters.every(([c, v]) => r[c] === v))
  const api = {
    select: () => api,
    eq: (col: string, val: unknown) => {
      filters.push([col, val])
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
    insert: async (row: Row) => {
      rows().push({ ...row })
      return { error: null }
    },
    delete: () => ({
      eq: async (col: string, val: unknown) => {
        tables[table] = rows().filter((r) => r[col] !== val)
        return { error: null }
      },
    }),
  }
  return api
}
