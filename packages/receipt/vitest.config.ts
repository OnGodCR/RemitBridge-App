import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// The scan-receipt function test loads supabase/functions/scan-receipt as it is, with its
// Deno-style "npm:" imports pointed at in-memory fakes.
export default defineConfig({
  resolve: {
    alias: {
      'npm:@supabase/supabase-js@2': fileURLToPath(new URL('./src/test/fake-supabase.ts', import.meta.url)),
      'npm:@anthropic-ai/sdk@0.129.0': fileURLToPath(new URL('./src/test/fake-anthropic.ts', import.meta.url)),
    },
  },
})
