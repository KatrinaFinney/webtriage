/* ------------------------------------------------------------------
   lib/scanHelpers.ts
   – shared helpers for ScanResults + PDF
-------------------------------------------------------------------*/
import type { PSIResult } from '../types/webVitals';

/* ──────────────────────────────────────────────────────────
   1) “Hero” bullet list (legacy, still used in the PDF)
---------------------------------------------------------------- */
export function buildHeroSummary(c: PSIResult['categories']): string {
  const p = Math.round(c.performance.score * 100);
  const a = Math.round(c.accessibility.score * 100);
  const s = Math.round(c.seo.score * 100);

  const lines: string[] = [];
  lines.push(
    p < 70 ? ` Load speed ${p}/100 – patients feel the lag.` :
    p < 90 ? ` Load speed ${p}/100 – healthy but could be fitter.` :
             ` Lightning‑fast at ${p}/100 – exemplary cardio!`
  );
  lines.push(
    a < 70 ? ` Accessibility ${a}/100 – some users are locked out.` :
             ` Accessibility ${a}/100 – welcome to all visitors.`
  );
  lines.push(
    s < 70 ? ` SEO ${s}/100 – hidden in the waiting room.` :
             ` SEO ${s}/100 – easy to discover.`
  );
  return lines.join(' ');
}

/* ──────────────────────────────────────────────────────────
   2) “Vitals Summary” plain‑English paragraph (no emojis)
---------------------------------------------------------------- */
export function plainSummary(categories: PSIResult['categories']): string {
  const pct = (n: number) => `${Math.round(n * 100)}/100`;

  const { performance, accessibility, seo, 'mobile-friendly': mobile } =
    categories;

  return (
    `Vitals Summary: ` +
    `your site is ${performance.score >= 0.9 ? 'lightning‑fast' : 'responsive'} `
      + `with a performance score of ${pct(performance.score)}. `
      + `Accessibility stands at ${pct(accessibility.score)}, `
      + `search visibility at ${pct(seo.score)}, `
      + `and mobile ease at ${pct(mobile?.score ?? 1)}. `
      + `See the cards below for the highest‑impact fixes.`
  );
}

/* ──────────────────────────────────────────────────────────
   3) Utility to convert a % score into a CSS status class
---------------------------------------------------------------- */
export function statusClass(scorePct: number): string {
  if (scorePct >= 90) return 'statusExcellent';
  if (scorePct >= 75) return 'statusGood';
  if (scorePct >= 50) return 'statusFair';
  return 'statusPoor';
}
/* ––––– after buildHeroSummary … ––––– */

import { categoryLabels } from '@/lib/scanMetrics';

/* ------------------------------------------------------------------
   Single‑sentence opportunity blurb
------------------------------------------------------------------*/
export function improvementSummary(
  c: PSIResult['categories'],
): string {
  const low = Object
    .entries(c)
    .filter(([, { score }]) => score < 0.90)
    .sort((a, b) => a[1].score - b[1].score)
    .map(([key]) => categoryLabels[key as keyof typeof categoryLabels]);

  /* no issues */
  if (low.length === 0)
    return 'Your vitals are in top form – explore our plans to keep them that way.';

  /* one clear opportunity */
  if (low.length === 1)
    return `To reach peak health, we recommend prioritising **${low[0]}**.`;

  /* two moderate opportunities */
  if (low.length === 2)
    return `For optimal wellness, focus first on **${low[0]}**, followed closely by **${low[1]}**.`;

  /* three or more */
  const [first, ...rest] = low;
  return `Great foundation in place. Highest‑impact win: **${first}** – with additional gains in ${rest.join(', ')}.`;
}
