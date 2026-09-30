import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// The webhook test loads supabase/functions/whatsapp as it is, with its Deno-style
// "npm:" import pointed at an in-memory fake.
export default defineConfig({
  resolve: {
    alias: {
      'npm:@supabase/supabase-js@2': fileURLToPath(new URL('./src/test/fake-supabase.ts', import.meta.url)),
    },
  },
})
