import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// The scan-receipt function test loads supabase/functions/scan-receipt as it is, with its
// Deno-style "npm:" import of supabase-js pointed at an in-memory fake.
export default defineConfig({
  resolve: {
    alias: {
      'npm:@supabase/supabase-js@2': fileURLToPath(new URL('./src/test/fake-supabase.ts', import.meta.url)),
    },
  },
})
