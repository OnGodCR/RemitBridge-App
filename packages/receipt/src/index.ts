/**
 * The receipt pipeline (DECISIONS.md D69-D83): OCR helpers, redaction, the rule-based
 * parser and its templates, the model fallback, merging and validation. Pure TypeScript
 * with no Deno, React Native or network code, so it runs in the app, in the scan-receipt
 * Edge Function and under Node (tests, benchmark) unchanged. Node-only helpers (fixture
 * loading) are in src/node/ and are not exported here.
 */
export * from './types.ts'
export * from './fields.ts'
export * from './ocr.ts'
export * from './redact.ts'
export * from './templates.ts'
export * from './parser.ts'
export * from './harness.ts'
export { EXTRACTORS, type ExtractionContext, type Extractor, type Extractors } from './extract/index.ts'
export * from './model.ts'
export * from './merge.ts'
export * from './validate.ts'
export * from './pipeline.ts'
export * from './api.ts'
export * from './result.ts'
