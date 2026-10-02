# Receipt reading benchmark

How well the receipt scanner reads receipts, field by field, in three modes (DECISIONS.md D85):

| Mode | What reads the receipt |
|---|---|
| `parser` | The rules alone: the extractors in `packages/receipt/src/extract/` |
| `model` | The model (D92) reads every field |
| `combined` | What the app does: the rules first, the model only for what they missed or weren't sure of |

The latest results are in [`results.md`](results.md).

## Running it

```sh
# The rules only. Free, and runs in CI.
npm run benchmark -w @remitbridge/receipt -- --modes parser

# All three modes, on Groq's free tier (D98). It shares the app's daily tokens, and waits
# whenever the per-minute limit is hit. The key goes in your shell, never in a file here.
GROQ_API_KEY=... npm run benchmark -w @remitbridge/receipt

# Also send each receipt's redacted photo to the model, as the app does.
GROQ_API_KEY=... npm run benchmark -w @remitbridge/receipt -- --images
```

Or on GitHub, without using your computer: Actions → **Receipt benchmark** → Run workflow.
It needs the `GROQ_API_KEY` Actions secret for the model modes, and puts the table in the
run's summary. The synthetic photos aren't committed, so there the model reads text only.

Other options: `--limit 20`, `--only real` or `--only synthetic`, `--out <file>`.
`RECEIPT_MODEL` picks the model, as in the Edge Function (the workflow's `model` input).

## Synthetic receipts (`synthetic/`)

Made-up receipts with fictional people in them, from `packages/receipt/src/synth.ts`. Each
one is drawn as a picture in Chromium, then read back with tesseract.js, so the benchmark
sees real OCR mistakes. The same seed always makes the same receipt.

```sh
npm run synthesize -w @remitbridge/receipt -- --count 60
```

The JSON files are committed. The pictures go to `synthetic/images/` and aren't, since the
command remakes them in about a minute and a half.

## Real receipts (`receipts/`)

Add one receipt as `receipts/<id>.json`, in the fixture format described at the top of
`packages/receipt/src/node/fixtures.ts`:

- `id`: the file name without `.json`, e.g. `real-2026-10-ria-cash-mxn-01`.
- `source`: `"real"`.
- `lines` (the receipt's text, one string per printed line) or `page` (the phone's OCR).
- `expected`: every value the receipt shows, typed as in `FieldValues`.
- `pii`: the personal details on it, so the benchmark can check redaction hid them. This
  file has personal details in it, so keep it off GitHub: list it in `.git/info/exclude`
  instead of committing it, unless every detail has been replaced with a made-up one.

Photos of real receipts stay out of git (`.gitignore`). The exception is a redacted copy
(`<id>.redacted.png`) that you have checked by eye (D85).

## What this does not tell you

- Synthetic receipts use the Regulation E wording and some common variants. Real providers
  word things their own way, so real receipts will score lower until the templates learn them.
- tesseract.js is not the phone's OCR (ML Kit), so OCR mistakes differ.
- The rules were written against the four fixtures, not these receipts, so the parser's score here
  is a fair test of them (D130). The templates' labels are still Regulation E's, which these
  receipts also use; real receipts will be harder.
