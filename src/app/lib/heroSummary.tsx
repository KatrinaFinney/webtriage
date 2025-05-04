/* ---------------------------------------------------------------
   src/app/lib/heroSummary.ts          – rich “doctor’s note” copy
---------------------------------------------------------------- */
import React from 'react';
import type { PSIResult } from '@/types/webVitals';      // ✅ alias path
import styles        from '../styles/ScanPage.module.css';

/* quick helper – randomise phrasing so repeat scans feel fresh */
const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

/* ----------------------------------------------------------------
   Copy pools for each category (Poor ⇢ Fair)
---------------------------------------------------------------- */
const perfPoor = [
  '⏱ Pages take far too long to appear, driving visitors to bail out.',
  '⏱ Severe latency is eroding trust and conversion rates.',
  '⏱ Slow loads are quietly costing you leads and revenue.',
  '⏱ Speed scores indicate a critical need for performance therapy.',
];
const perfFair = [
  '⚡ A modest speed tune‑up will deliver a noticeably snappier feel.',
  '⚡ Shaving a second off load time could lift conversions by double‑digits.',
  '⚡ Minor optimisation will put you in the fastest 10 % of sites.',
  '⚡ Quick performance therapy will delight impatient users.',
];

const a11yPoor = [
  '♿ Accessibility barriers are locking out part of your audience and posing compliance risk.',
  '♿ Key interactions are unusable for visitors with assistive tech.',
  '♿ Site fails several WCAG success criteria—urgent rehab advised.',
  '♿ Digital doors are closed to some visitors; let’s open them.',
];
const a11yFair = [
  '♿ A few targeted tweaks will make navigation smooth for every user.',
  '♿ Minor WCAG fixes will create an inclusive, worry‑free experience.',
  '♿ Improving contrast and focus states will boost overall usability.',
  '♿ Addressing small issues now avoids costly lawsuits later.',
];

const seoPoor = [
  '🔍 Search engines struggle to surface your pages—visibility is being left on the table.',
  '🔍 Missing metadata and crawl issues are throttling organic reach.',
  '🔍 Low SEO vitals mean customers may never find you in results.',
  '🔍 Search bots can’t properly index key content—rankings suffer.',
];
const seoFair = [
  '🔍 Metadata refinements can nudge you higher on results pages.',
  '🔍 Structured data will help Google present rich snippets.',
  '🔍 A quick SEO boost can compound traffic over time.',
  '🔍 Indexing tweaks will widen your discovery funnel.',
];

const mobPoor = [
  '📱 Mobile experience is frustrating—on‑the‑go visitors likely abandon quickly.',
  '📱 Layout shifts and tap targets make phones a pain point.',
  '📱 Non‑responsive design hampers half your traffic.',
  '📱 Critical elements overflow on small screens—needs urgent care.',
];
const mobFair = [
  '📱 Mobile‑first tweaks will delight users on smaller screens.',
  '📱 Fine‑tuning touch targets and breakpoints boosts engagement.',
  '📱 Minor responsive fixes can lift mobile conversions.',
  '📱 Optimising images and fonts will speed up 4G browsing.',
];

/* ----------------------------------------------------------------
   Public helper – returns the JSX hero narrative
---------------------------------------------------------------- */
export function buildHeroSummary(
  categories: PSIResult['categories'],
): React.ReactElement {
  /* grab scores (default mobile to perfect if undefined) */
  const perf = categories.performance.score;
  const a11y = categories.accessibility.score;
  const seo  = categories.seo.score;
  const mob  = categories['mobile-friendly']?.score ?? 1;

  /* ─ headline ─────────────────────────────────────────────── */
  const average = (perf + a11y + seo + mob) / 4;
  const headline =
    average >= 0.9
      ? 'Your digital vitals are in excellent shape—only minor tuning required for peak performance.'
      : 'Your site is generally stable, but several vitals need attention to reach optimal health.';

  /* ─ dynamic bullet list ──────────────────────────────────── */
  const bullets: string[] = [];

  if (perf < 0.75) bullets.push(perf < 0.5 ? pick(perfPoor) : pick(perfFair));
  if (a11y < 0.75) bullets.push(a11y < 0.5 ? pick(a11yPoor) : pick(a11yFair));
  if (seo  < 0.75) bullets.push(seo  < 0.5 ? pick(seoPoor)  : pick(seoFair));
  if (mob  < 0.75) bullets.push(mob  < 0.5 ? pick(mobPoor)  : pick(mobFair));

  /* ─ closing line ─────────────────────────────────────────── */
  const closing =
    'Below, we’ve prioritised your personalised care plan. Address the highest‑impact fixes first—or let our team handle treatment for you.';

  /* ─ render ───────────────────────────────────────────────── */
  return (
    <div className={styles.heroSummary}>
      <p>{headline}</p>

      {bullets.length > 0 && (
        <ul className={styles.heroList}>
          {bullets.map((text, idx) => (
            <li key={idx}>{text}</li>
          ))}
        </ul>
      )}

      <p>{closing}</p>
    </div>
  );
}
