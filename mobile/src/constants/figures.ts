/**
 * Published benchmarks the tools compare against. Copied from the website's figures.js
 * (the single place every number there comes from) on 2026-09-29, with the same sources.
 * Every figure names where it came from wherever it is shown (PRD 14.3).
 */
export const FIGURES = {
  /** Global remittance flows, 2024. */
  flowsUsdBn: 905,
  flowsSource: 'World Bank / KNOMAD, Migration and Development Brief, 2024',
  /** Global average total cost of sending $200, World Bank RPW Issue 54 (Q3 2025 data). */
  globalCostPct: 6.36,
  globalCostSource: 'World Bank, Remittance Prices Worldwide, Q3 2025',
  /** UN Sustainable Development Goal 10.c: 3% by 2030. */
  targetPct: 3,
  targetSource: 'UN Sustainable Development Goal 10.c, by 2030',
} as const;
