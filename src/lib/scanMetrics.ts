// File: src/lib/scanMetrics.ts

import type { MetricKey, CategoryKey } from '@/types/webVitals';
import { vitalLabels }                from '@/lib/vitalLabels';

/**
 * ── Labels for your four high‑level categories
 */
export const categoryLabels: Record<CategoryKey, string> = {
  performance      : 'Vital Speed',
  accessibility    : 'Inclusive Access',
  seo              : 'Search Visibility',
  'mobile-friendly': 'Mobile Ease',
};

/**
 * ── One‑line summaries to explain each category
 */
export const categorySummaries: Record<CategoryKey, string> = {
  performance:
    'How quickly key resources load and render—critical for user satisfaction.',
  accessibility:
    'How easily all users, regardless of ability, can navigate and interact.',
  seo:
    'How well search engines can discover and rank your pages for organic traffic.',
  'mobile-friendly':
    'How smoothly your site works on phones and tablets for on‑the‑go visitors.',
};

/**
 * ── Which metrics to show under “Key Vitals” and how to render them
 */
export interface MetricConfig {
  id:    MetricKey;
  title: string;
  blurb: string;
  unit:  string;
}

// only these five in the Key Vitals grid
const vitalIds: MetricKey[] = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'speed-index',
  'total-blocking-time',
  'cumulative-layout-shift',
];

export const metricConfigs: MetricConfig[] = vitalIds.map((id) => ({
  id,
  title: vitalLabels[id].title,
  blurb: vitalLabels[id].blurb,
  unit:  id === 'cumulative-layout-shift' ? '' : 'ms',
}));

/**
 * ── Pretty‑print a raw number for UI or PDF
 */
export function formatValue(id: MetricKey, raw: number): string {
  switch (id) {
    case 'cumulative-layout-shift':
      return raw.toFixed(2);
    case 'total-blocking-time':
    case 'time-to-first-byte':
      return `${Math.round(raw)} ms`;
    default:
      return `${(raw / 1000).toFixed(2)} s`;
  }
}

/**
 * ── Two‑sentence narratives per metric & score bucket
 */
const narratives: Record<
  MetricKey,
  { excellent: string[]; good: string[]; fair: string[]; poor: string[] }
> = {
  'first-contentful-paint': {
    excellent: [
      'Your site greets users almost instantly—trust is established before they even blink.',
      'FCP is in the green; the digital vitals show healthy page startup performance.',
    ],
    good: [
      'First content appears swiftly, but inlining critical CSS could shave off a few hundred milliseconds.',
      'FCP is respectable; optimizing render‑blocking resources will boost it into the elite tier.',
    ],
    fair: [
      'There’s a noticeable pause before content shows—visitors may wonder if something broke.',
      'Injecting critical CSS and deferring analytics scripts can revive your page startup.',
    ],
    poor: [
      'FCP flat‑lines beyond three seconds—an eternity in ER time, and users may abandon.',
      'Immediate action: defer heavy scripts and pre‑connect to your CDN to restore life support.',
    ],
  },

  'largest-contentful-paint': {
    excellent: [
      'Hero content loads before users even sit down—exemplary bedside manner.',
      'LCP in the green means your interface is stabilizing quickly and reliably.',
    ],
    good: [
      'Main visual appears promptly, though a preload hint could shave off critical milliseconds.',
      'Your LCP is healthy; consider compressing large assets to reach top‑tier performance.',
    ],
    fair: [
      'Hero element lags, leaving visitors staring at a blank stage—optimize image delivery.',
      'LCP nearing the warning zone; deferring non‑critical JS will help finish painting sooner.',
    ],
    poor: [
      'Critical delay: visitors may bounce before seeing your main content.',
      'LCP exceeds safe thresholds—prioritize your largest image with a preload link immediately.',
    ],
  },

  'speed-index': {
    excellent: [
      'Visual completeness races ahead; the page stabilizes before coffee cools.',
      'Speed Index in the green means your interface pieces together seamlessly.',
    ],
    good: [
      'Overall paint speed is respectable; resource hints can fine‑tune the delivery.',
      'Consider splitting CSS bundles to eliminate layout thrashing for an even smoother load.',
    ],
    fair: [
      'Visual build‑out feels piecemeal—users might tap their feet.',
      'Minifying and deferring non‑essential scripts will improve the pace noticeably.',
    ],
    poor: [
      'Paints arrive slowly, creating a choppy experience—lazy‑load below‑fold assets.',
      'High Speed Index indicates visual jank; prioritize above‑the‑fold content to recover.',
    ],
  },

  'total-blocking-time': {
    excellent: [
      'Main thread remains clear; interactions feel as responsive as a reflex hammer.',
      'Your JS payload is streamlined, preventing any input lag.',
    ],
    good: [
      'Minor stutters appear; code‑splitting heavy bundles will polish responsiveness.',
      'Deferring analytics scripts can reduce peaks in blocking time.',
    ],
    fair: [
      'Long tasks block input—users may notice taps being ignored.',
      'Break up tasks under 50 ms or offload to web workers to restore fluid interaction.',
    ],
    poor: [
      'Severe blocking: taps queue up—immediate triage required.',
      'Perform a bundle audit and dynamically import heavy libraries to clear the main thread.',
    ],
  },

  'cumulative-layout-shift': {
    excellent: [
      'Layout rock‑solid; nothing jumps—users stay focused.',
      'CLS nearly zero means your design holds its position perfectly.',
    ],
    good: [
      'Minor shifts detected; specifying dimensions will eradicate them.',
      'Preloading fonts and images ensures elements don’t suddenly jump.',
    ],
    fair: [
      'Elements shift unexpectedly—that jolts trust.',
      'Reserve space with CSS aspect‑ratio and inline critical styles for stability.',
    ],
    poor: [
      'Frequent layout shifts disrupt reading—urgent fix required.',
      'Remove late‑loading banners and define static slots for ads or media.',
    ],
  },

  // For the remaining keys, provide at least empty arrays to satisfy TS:
  'time-to-first-byte':   { excellent: [], good: [], fair: [], poor: [] },
  interactive:            { excellent: [], good: [], fair: [], poor: [] },
  'color-contrast':       { excellent: [], good: [], fair: [], poor: [] },
  'tap-targets':          { excellent: [], good: [], fair: [], poor: [] },
  'meta-description':     { excellent: [], good: [], fair: [], poor: [] },
};

/** Pick a random entry from an array */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Returns one two‑sentence narrative for the given metric & score.
 * Score is 0–100; buckets: excellent≥90, good≥75, fair≥50, poor<50.
 */
export function diagnosisFor(id: MetricKey, score: number): string {
  const bucket =
    score >= 90 ? 'excellent' :
    score >= 75 ? 'good' :
    score >= 50 ? 'fair' :
    'poor';

  const pool = narratives[id][bucket];
  return pool.length > 0 ? pick(pool) : '';
}
