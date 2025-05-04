/* lib/scanHelpers.ts */
import type { PSIResult } from '../../types/webVitals';

export function buildHeroSummary(c: PSIResult['categories']): string {
  const p = Math.round(c.performance.score * 100);
  const a = Math.round(c.accessibility.score * 100);
  const s = Math.round(c.seo.score * 100);

  const lines: string[] = [];
  lines.push(
    p < 70 ? `⚡️ Load speed ${p}/100 – patients feel the lag.` :
    p < 90 ? `🚀 Load speed ${p}/100 – healthy but could be fitter.` :
             `🚀 Lightning‑fast at ${p}/100 – exemplary cardio!`
  );
  lines.push(
    a < 70 ? `♿️ Accessibility ${a}/100 – some users are locked out.` :
             `♿️ Accessibility ${a}/100 – welcome to all visitors.`
  );
  lines.push(
    s < 70 ? `🔍 SEO ${s}/100 – hidden in the waiting room.` :
             `🔍 SEO ${s}/100 – easy to discover.`
  );
  return lines.join(' ');
}

export function statusClass(scorePct: number): string {
  if (scorePct >= 90) return 'statusExcellent';
  if (scorePct >= 75) return 'statusGood';
  if (scorePct >= 50) return 'statusFair';
  return 'statusPoor';
}
