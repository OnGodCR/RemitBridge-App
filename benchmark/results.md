# Receipt reading benchmark

Run 2026-09-30, on 60 receipts: 0 real, 60 synthetic.
Model: not run (no `OPENROUTER_API_KEY`).

**Early results.** Synthetic receipts are made up, and they were read with tesseract.js, not
the phone’s ML Kit, so these numbers are a stand-in for real accuracy until there are
enough real receipts to score.

## Summary

| Mode | Accuracy | Precision | Read by the rules | Wrong values flagged for checking | Median time |
|---|---:|---:|---:|---:|---:|
| parser | 0.0% | – | – | – | 0.00 s |

- **Accuracy:** of the values the receipts show, the share read correctly. A value not read counts against it.
- **Precision:** of the values read, the share that were right.
- **Read by the rules:** of the values read, the share the parser read without the model.
- **Wrong values flagged:** of the values read wrong, the share the receipt checks put on the
  “please check” list, so the person would see them before the result.

## By field (accuracy)

| Field | parser |
|---|---:|
| provider | 0.0% |
| send_currency | 0.0% |
| receive_currency | 0.0% |
| amount_sent | 0.0% |
| fee | 0.0% |
| tax | 0.0% |
| total_paid | 0.0% |
| exchange_rate | 0.0% |
| amount_received | 0.0% |
| pickup_charge | 0.0% |
| transfer_date | 0.0% |
| funding_method | 0.0% |
| delivery_method | 0.0% |
| **All fields** | 0.0% |

## Redaction

On 60 receipts: 0 personal details left readable, 0 values hidden by mistake.

## What this does not tell you

- How the scanner does on real receipts, until `benchmark/receipts/` has enough of them.
- How the phone’s OCR does: the benchmark reads photos with tesseract.js.
- Whether the person would catch a flagged value; only that it was put in front of them.
