import type { Href } from 'expo-router';

import { TERMS, type Term } from '@/data/glossary';

/**
 * Learn's modules (DECISIONS.md D104): the glossary's 80 terms, grouped into short topics
 * read in order, from the basics a sender needs to the plumbing and crypto words most
 * people never will. Every term is in exactly one module (a test checks), so the modules
 * and the A to Z glossary always hold the same words.
 *
 * A module can end with a tool that puts it to use.
 */
export type ModuleId = 'basics' | 'cost' | 'arrival' | 'safety' | 'bigger' | 'banks' | 'provider' | 'crypto';

export interface Module {
  id: ModuleId;
  terms: string[];
  /** The tool to try after reading, and where its name comes from in the strings. */
  tool?: { href: Href; title: 'fairRate' | 'scamCheck' | 'observatory' | 'compare' };
}

export const MODULES: Module[] = [
  {
    id: 'basics',
    terms: ['remittance', 'sender', 'recipient', 'provider', 'corridor', 'money-transfer-operator', 'remittance-channel', 'informal-channel'],
  },
  {
    id: 'cost',
    terms: [
      'transfer-fee',
      'mid-market-rate',
      'exchange-rate-markup',
      'total-cost',
      'fixed-fee',
      'percentage-fee',
      'recipient-side-charges',
      'reference-rate',
      'charge-codes',
      'rpw',
    ],
    tool: { href: '/fair-rate', title: 'fairRate' },
  },
  {
    id: 'arrival',
    terms: ['bank-deposit', 'cash-pickup', 'mobile-money', 'last-mile', 'cutoff-time', 'provisional-credit', 'batch-processing'],
    tool: { href: '/', title: 'compare' },
  },
  {
    id: 'safety',
    terms: ['money-mule', 'kyc', 'aml', 'compliance-checks', 'sanctions-screening', 'de-risking', 'capital-controls'],
    tool: { href: '/scam-check', title: 'scamCheck' },
  },
  {
    id: 'bigger',
    terms: ['diaspora', 'shock', 'countercyclical', 'coping-strategy', 'capital-flows'],
    tool: { href: '/observatory', title: 'observatory' },
  },
  {
    id: 'banks',
    terms: [
      'payment-rails',
      'settlement',
      'clearing',
      'originator-bank',
      'intermediary-bank',
      'beneficiary-bank',
      'correspondent-bank',
      'nostro-vostro',
      'swift',
      'swift-mt',
      'iso-20022',
      'uetr',
      'rtgs',
      'ach',
      'sepa',
      'straight-through-processing',
    ],
  },
  {
    id: 'provider',
    terms: ['pre-funded-pool', 'fx-desk', 'currency-liquidity', 'trust-account', 'api', 'throughput', 'latency', 'central-bank-money', 'legal-tender'],
  },
  {
    id: 'crypto',
    terms: [
      'stablecoin',
      'on-ramp',
      'off-ramp',
      'base-layer',
      'block',
      'confirmation',
      'finality',
      'atomicity',
      'validator',
      'staking',
      'gas-limit',
      'fee-auction',
      'chain-reorg',
      'sharding',
      'sidechain',
      'payment-channel',
      'defi',
      'nft',
    ],
  },
];

const BY_ID = new Map(TERMS.map((t) => [t.id, t]));

/** A module's terms, in the module's order. */
export function moduleTerms(m: Module): Term[] {
  return m.terms.map((id) => BY_ID.get(id)).filter((t): t is Term => !!t);
}

export function moduleFor(id: string | undefined): Module | undefined {
  return MODULES.find((m) => m.id === id);
}
