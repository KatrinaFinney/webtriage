// File: src/lib/metricsConfig.ts

import type { CategoryKey, MetricKey } from '@/types/webVitals';


export interface MetricConfig {
  id:         MetricKey;
  title:      string;
  staticDesc: string;
  unit:       string;
  category:   CategoryKey;
}

export const metricsConfig: MetricConfig[] = [
  {
    id: 'first-contentful-paint',
    title: 'First‑Sight Pulse',
    staticDesc:
      'Marks the moment your visitor sees something on screen, so they know the page is alive. ' +
      'A slow pulse here can lead to confusion and early exits.',
    unit: 'ms',
    category: 'performance',
  },
  {
    id: 'largest-contentful-paint',
    title: 'Full‑View ECG',
    staticDesc:
      'Measures when the main hero image or block fully renders, giving users confidence to proceed. ' +
      'Delays at this stage can frustrate visitors as they wait for your core content.',
    unit: 'ms',
    category: 'performance',
  },
  {
    id: 'speed-index',
    title: 'Flow‑Rate Monitor',
    staticDesc:
      'Tracks how smoothly your page paints over time, reflecting perceived loading speed. ' +
      'Choppy flow can feel heavy and slow, reducing user engagement.',
    unit: 'ms',
    category: 'performance',
  },
  {
    id: 'time-to-first-byte',
    title: 'Wake‑Up Reflex',
    staticDesc:
      'Captures server responsiveness before any data arrives to the browser. ' +
      'A sluggish reflex delays everything that follows, making pages feel unresponsive at birth.',
    unit: 'ms',
    category: 'performance',
  },
  {
    id: 'total-blocking-time',
    title: 'Triage Delay Scan',
    staticDesc:
      'Sums up long tasks that freeze your page and block user input. ' +
      'High delay means taps and clicks may be ignored, harming the experience.',
    unit: 'ms',
    category: 'performance',
  },
  {
    id: 'interactive',
    title: 'Alertness Check',
    staticDesc:
      'Determines when the page reliably responds to the first click or tap. ' +
      'If it wakes up late, users will perceive your site as sluggish and unreliable.',
    unit: 'ms',
    category: 'performance',
  },
  {
    id: 'cumulative-layout-shift',
    title: 'Stability Index',
    staticDesc:
      'Quantifies unexpected movement of elements during load to prevent mis‑taps. ' +
      'High instability can disorient visitors as content jumps around on them.',
    unit: '',
    category: 'performance',
  },
  {
    id: 'color-contrast',
    title: 'Contrast Vital Signs',
    staticDesc:
      'Checks whether text stands out clearly against its background for all users. ' +
      'Poor contrast can exclude those with low vision or reading difficulties.',
    unit: '',
    category: 'accessibility',
  },
  {
    id: 'tap-targets',
    title: 'Touch‑Point Vitality',
    staticDesc:
      'Ensures buttons and links are large enough to tap confidently on any device. ' +
      'Tiny targets frustrate mobile users and lead to accidental taps.',
    unit: '',
    category: 'accessibility',
  },
  {
    id: 'meta-description',
    title: 'SEO Summary Check',
    staticDesc:
      'Verifies that each page has a clear, compelling summary for search results. ' +
      'Strong descriptions build trust and boost click‑through rates.',
    unit: '',
    category: 'seo',
  },
];
