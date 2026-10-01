# Receipt reading benchmark

Run 2026-10-01, on 20 receipts: 0 real, 20 synthetic.
Model: `qwen/qwen3.8-27b` on Groq, with the redacted text only (no photo).

**Early results.** Synthetic receipts are made up, and they were read with tesseract.js, not
the phone’s ML Kit, so these numbers are a stand-in for real accuracy until there are
enough real receipts to score.

## Summary

| Mode | Accuracy | Precision | Read by the rules | Wrong values flagged for checking | Median time |
|---|---:|---:|---:|---:|---:|
| parser | 0.0% | – | – | – | 0.00 s |
| model | 82.3% | 93.0% | 0 of 200 (0.0%) | 1 of 14 (7.1%) | 33.15 s |
| combined | 68.1% | 93.9% | 0 of 164 (0.0%) | 1 of 10 (10.0%) | 63.45 s |

- **Accuracy:** of the values the receipts show, the share read correctly. A value not read counts against it.
- **Precision:** of the values read, the share that were right.
- **Read by the rules:** of the values read, the share the parser read without the model.
- **Wrong values flagged:** of the values read wrong, the share the receipt checks put on the
  “please check” list, so the person would see them before the result.

## The model in combined mode

- Asked about 20 of 20 (100.0%) receipts, 260 fields in all.
- Gave nothing on 6 (unavailable).

## By field (accuracy)

| Field | parser | model | combined |
|---|---:|---:|---:|
| provider | 0.0% | 70.0% | 65.0% |
| send_currency | 0.0% | 85.0% | 70.0% |
| receive_currency | 0.0% | 85.0% | 70.0% |
| amount_sent | 0.0% | 85.0% | 70.0% |
| fee | 0.0% | 85.0% | 70.0% |
| tax | 0.0% | 76.9% | 69.2% |
| total_paid | 0.0% | 83.3% | 66.7% |
| exchange_rate | 0.0% | 85.0% | 70.0% |
| amount_received | 0.0% | 80.0% | 65.0% |
| pickup_charge | – | – | – |
| transfer_date | 0.0% | 85.0% | 70.0% |
| funding_method | 0.0% | 85.0% | 70.0% |
| delivery_method | 0.0% | 80.0% | 60.0% |
| **All fields** | 0.0% | 82.3% | 68.1% |

## Disclosure check

On 20 receipts with their disclosures listed: how often the check said rightly whether each item is there. The synthetic receipts use wording the check looks for, so on them this mostly tests OCR, not the check.

| Item | Right |
|---|---:|
| date_available | 20 of 20 (100.0%) |
| error_rights | 20 of 20 (100.0%) |
| cancellation | 20 of 20 (100.0%) |
| provider_contact | 20 of 20 (100.0%) |
| cfpb_contact | 20 of 20 (100.0%) |

## Redaction

On 20 receipts: 0 personal details left readable, 0 values hidden by mistake.

## What this does not tell you

- How the scanner does on real receipts, until `benchmark/receipts/` has enough of them.
- How the phone’s OCR does: the benchmark reads photos with tesseract.js.
- Whether the person would catch a flagged value; only that it was put in front of them.
