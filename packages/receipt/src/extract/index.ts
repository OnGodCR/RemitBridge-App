/** The extractors, keyed by field. parser.ts runs them in FIELD_NAMES order. */
import type { FieldName, ParsedField } from '../types.ts'
import {
  extractAmountReceived,
  extractAmountSent,
  extractDeliveryMethod,
  extractExchangeRate,
  extractFee,
  extractFundingMethod,
  extractPickupCharge,
  extractProvider,
  extractReceiveCurrency,
  extractSendCurrency,
  extractTax,
  extractTotalPaid,
  extractTransferDate,
  type ExtractionContext,
} from './fields.ts'

export type { ExtractionContext }

export type Extractor<K extends FieldName> = (ctx: ExtractionContext) => ParsedField<K> | null
export type Extractors = { [K in FieldName]: Extractor<K> }

export const EXTRACTORS: Extractors = {
  provider: extractProvider,
  send_currency: extractSendCurrency,
  receive_currency: extractReceiveCurrency,
  amount_sent: extractAmountSent,
  fee: extractFee,
  tax: extractTax,
  total_paid: extractTotalPaid,
  exchange_rate: extractExchangeRate,
  amount_received: extractAmountReceived,
  pickup_charge: extractPickupCharge,
  transfer_date: extractTransferDate,
  funding_method: extractFundingMethod,
  delivery_method: extractDeliveryMethod,
}
