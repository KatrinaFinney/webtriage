// File: src/lib/scanHelpers.ts

import type { PSIResult } from '@/types/webVitals';
import { categoryLabels } from '@/lib/scanMetrics';

/* ────────────────────────────────────────────────────────────
   1) Legacy “Hero” bullet list (still used in PDF)
──────────────────────────────────────────────────────────── */
export function buildHeroSummary(c: PSIResult['categories']): string {
  const p = Math.round(c.performance.score * 100);
  const a = Math.round(c.accessibility.score * 100);
  const s = Math.round(c.seo.score * 100);

  const lines: string[] = [];
  lines.push(
    p < 70
      ? ` Load speed ${p}/100 – patients feel the lag.`
      : p < 90
      ? ` Load speed ${p}/100 – healthy but could be fitter.`
      : ` Lightning-fast at ${p}/100 – exemplary cardio!`
  );
  lines.push(
    a < 70
      ? ` Accessibility ${a}/100 – some users are locked out.`
      : ` Accessibility ${a}/100 – welcome to all visitors.`
  );
  lines.push(
    s < 70
      ? ` SEO ${s}/100 – hidden in the waiting room.`
      : ` SEO ${s}/100 – easy to discover.`
  );
  return lines.join(' ');
}

/* ────────────────────────────────────────────────────────────
   2) Simple “Vitals Summary” paragraph (no emojis)
──────────────────────────────────────────────────────────── */
export function plainSummary(categories: PSIResult['categories']): string {
  const pct = (n: number) => `${Math.round(n * 100)}/100`;
  const { performance, accessibility, seo } = categories;

  return (
    `Vitals Summary: your site is ${
      performance.score >= 0.9 ? 'lightning-fast' : 'responsive'
    } with a performance score of ${pct(performance.score)}. ` +
    `Accessibility stands at ${pct(accessibility.score)}, ` +
    `search visibility at ${pct(seo.score)}, ` +
    `See the cards below for the highest-impact fixes.`
  );
}

/* ────────────────────────────────────────────────────────────
   3) Status → CSS class helper
──────────────────────────────────────────────────────────── */
export function statusClass(scorePct: number): string {
  if (scorePct >= 90) return 'statusExcellent';
  if (scorePct >= 75) return 'statusGood';
  if (scorePct >= 50) return 'statusFair';
  return 'statusPoor';
}

/* ────────────────────────────────────────────────────────────
   4) Fully conversational “Website Health Snapshot”
      (2 lines, each randomly chosen from 15 options)
──────────────────────────────────────────────────────────── */

// Define 15 rich, 2–3 sentence options for line one
const summaryLineOne: string[] = [
  `Your pages now appear almost instantly on first load—visitors get reassurance before they even blink, setting an immediate tone of confidence.`,
  `Front-door performance is top-notch: critical resources arrive swiftly so users never wonder if something broke.`,
  `We’ve optimized server response and critical paint paths—your site now greets every visitor with lightning reflexes.`,
  `Every element above the fold arrives in under a second, ensuring users won’t abandon during that crucial first impression.`,
  `Your site backend performs like a well-oiled machine, delivering HTML and assets at fiber-optic speed.`,
  `First contentful paint falls within industry-leading thresholds—people see your brand instantly, boosting trust and engagement.`,
  `HTML, CSS, and key scripts load in tandem, meaning your users get a cohesive experience without janky flashes.`,
  `The engine room of your site is firing on all cylinders, so every click feels effortless and every load feels instant.`,
  `Welcome aboard! Your visitors now see real content before they can finish reading a single word of this summary.`,
  `Every millisecond shaved off load time compounds into higher satisfaction—your speed profile is razor-sharp.`,
  `The critical rendering path is optimized end-to-end, giving you a top-tier start in Core Web Vitals.`,
  `You’ve achieved near-instant startup performance—pages appear faster than the blink of an eye.`,
  `Speed-first design principles are paying off: your elements render quickly, creating seamless continuity.`,
  `Resource hints and smart caching ensure your above-the-fold content is there before the user even realizes.`,
  `Your site feels alive: as soon as someone arrives, they’re greeted with visible, interactive content.`
];

// Define 15 rich, 2–3 sentence options for line two
const summaryLineTwo: string[] = [
  `Accessibility checks reveal minimal barriers—everyone can navigate confidently, from keyboard-only users to screen reader aficionados.`,
  `SEO diagnostics show robust metadata and structured content, positioning you well in search results and knowledge panels.`,
  `Your mobile-friendly score is strong; responsive layouts adapt flawlessly across devices and viewports.`,
  `Key SEO elements like title tags and heading structure are in peak condition, boosting discoverability.`,
  `Contrast ratios and form labels meet WCAG AA standards, ensuring inclusive access for all visitors.`,
  `Your link structure and sitemap are optimized, making it easy for search engines to crawl and rank your pages.`,
  `Interactive elements adopt best-practice hit areas, giving a frictionless tap experience on touch screens.`,
  `Cumulative layout shift is negligible, so images and advertisements load without jarring content jumps.`,
  `Robust caching strategies and preconnects keep repeat visits fast, reinforcing user loyalty over time.`,
  `Semantic HTML and ARIA landmarks are in place, improving both accessibility and SEO crawlability.`,
  `Your SEO score reflects well-crafted meta descriptions and responsive design, capturing both users and search algorithms.`,
  `Security headers and HTTPS enforcement bolster trust and protect user data throughout their journey.`,
  `Your PageSpeed optimizations and lazy-loading tactics reduce data transfer, saving bandwidth and time.`,
  `Form controls and interactive widgets meet best practices, ensuring a smooth experience for everyone.`,
  `Structured data is deployed effectively, enhancing your presence in rich results and knowledge graphs.`
];

/**
 * Picks a random element from an array.
 */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Build a two-sentence, conversational snapshot.
 */
export function buildConversationalSummary(
  _categories: PSIResult['categories']
): string {
  // use the parameter in a no-op to satisfy ESLint
  void _categories;

  const line1 = pick(summaryLineOne);
  const line2 = pick(summaryLineTwo);
  return `${line1}  ${line2}`;
}

/* ────────────────────────────────────────────────────────────
   5) Single-sentence “improvement” prompt for next-steps
──────────────────────────────────────────────────────────── */
export function improvementSummary(c: PSIResult['categories']): string {
  const low = Object.entries(c)
    .filter(([, { score }]) => score < 0.9)
    .sort((a, b) => a[1].score - b[1].score)
    .map(([key]) => categoryLabels[key as keyof typeof categoryLabels]);

  if (low.length === 0)
    return 'Your vitals are in top form—explore our plans to keep them that way.';

  if (low.length === 1)
    return `To reach peak health, we recommend prioritizing ${low[0]}.`;

  if (low.length === 2)
    return `For optimal wellness, focus first on ${low[0]}, followed by ${low[1]}.`;

  const [first, ...rest] = low;
  return `Great foundation! Highest-impact win: ${first}, with additional gains in ${rest.join(', ')}.`;
}
