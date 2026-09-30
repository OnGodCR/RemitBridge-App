/**
 * Putting the parser's and the model's readings together, and the person's corrections on
 * top. Every value keeps its extraction path (parser / model / user_corrected), which is
 * stored per field and reported by the benchmark.
 */
import { checkValue } from './fields.ts'
import { sameValue } from './harness.ts'
import {
  FIELD_NAMES,
  LOW_CONFIDENCE,
  type ExtractedField,
  type ExtractedFields,
  type FieldName,
  type ParsedField,
  type ParsedFields,
} from './types.ts'

/** The fields the model should read: those the parser missed or read below the threshold. */
export function fieldsForModel(parsed: ParsedFields, threshold = LOW_CONFIDENCE): FieldName[] {
  return FIELD_NAMES.filter((f) => {
    const p = parsed[f]
    return !p || p.confidence < threshold
  })
}

/** When the parser and the model disagree, the one kept is trusted this much less. */
const DISAGREEMENT_PENALTY = 0.75

/**
 * One value per field. A confident parser value stands. Otherwise the model's is compared
 * with it: if they agree, the parser's value stands with the higher confidence; if they
 * disagree, the more confident one wins but at a lower confidence, so the person is asked.
 */
export function mergeFields(parsed: ParsedFields, model: ParsedFields | null, threshold = LOW_CONFIDENCE): ExtractedFields {
  const out: ExtractedFields = {}
  const set = (f: FieldName, v: ParsedField, path: ExtractedField['path'], confidence = v.confidence) => {
    ;(out as Record<FieldName, ExtractedField>)[f] = { ...v, confidence, path, validated: false }
  }
  for (const f of FIELD_NAMES) {
    const p = parsed[f]
    const m = model?.[f]
    if (p && (p.confidence >= threshold || !m)) set(f, p, 'parser')
    else if (m && !p) set(f, m, 'model')
    else if (p && m) {
      if (sameValue(f, p.value, m.value)) set(f, p, 'parser', Math.max(p.confidence, m.confidence))
      else if (m.confidence > p.confidence) set(f, m, 'model', m.confidence * DISAGREEMENT_PENALTY)
      else set(f, p, 'parser', p.confidence * DISAGREEMENT_PENALTY)
    }
  }
  return out
}

/**
 * The person's value for a field, from the confirmation screen or a WhatsApp reply:
 * checked like any other, then trusted fully. Returns the error instead if it's invalid.
 */
export function applyCorrection<K extends FieldName>(
  fields: ExtractedFields,
  name: K,
  value: unknown,
  today: string,
): { ok: true; fields: ExtractedFields } | { ok: false; error: string } {
  const checked = checkValue(name, value, today)
  if (!checked.ok) return checked
  const previous = fields[name]
  return {
    ok: true,
    fields: {
      ...fields,
      [name]: { value: checked.value, confidence: 1, path: 'user_corrected', validated: true, source: previous?.source },
    },
  }
}
