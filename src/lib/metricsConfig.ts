// File: src/lib/metricsConfig.ts

import type { CategoryKey, MetricKey } from '@/types/webVitals';
import { ReactNode } from 'react';

export interface MetricConfig {
  [x: string]: ReactNode;
  id:       MetricKey;
  title:    string;
  staticDesc: string;
  unit:     string;
  category: CategoryKey;
}

export const metricsConfig: MetricConfig[] = [
  {
    id: 'first-contentful-paint',
    title: 'Initial Assessment',
    staticDesc: 'When the first meaningful content appears.',
    unit: 'ms',
    category: 'performance',
  },
  {
    id: 'largest-contentful-paint',
    title: 'Critical Image Stabilization',
    staticDesc: 'How quickly your main visual element loads.',
    unit: 'ms',
    category: 'performance',
  },
  {
    id: 'speed-index',
    title: 'Vital Flow Rate',
    staticDesc: 'How fast the above‑the‑fold content paints.',
    unit: 'ms',
    category: 'performance',
  },
  {
    id: 'time-to-first-byte',
    title: 'Wake‑Up Pulse',
    staticDesc: 'Server response latency before any data arrives.',
    unit: 'ms',
    category: 'performance',
  },
  {
    id: 'total-blocking-time',
    title: 'Input Triage Delay',
    staticDesc: 'Total main‑thread time blocking user input.',
    unit: 'ms',
    category: 'performance',
  },
  {
    id: 'interactive',
    title: 'Alertness Check',
    staticDesc: 'Time until the page reliably responds.',
    unit: 'ms',
    category: 'performance',
  },
  {
    id: 'cumulative-layout-shift',
    title: 'Stability Scan',
    staticDesc: 'Sum of unexpected layout shifts.',
    unit: '',
    category: 'performance',
  },
  {
    id: 'color-contrast',
    title: 'Contrast Screening',
    staticDesc: 'Legibility of text against its background.',
    unit: '',
    category: 'accessibility',
  },
  {
    id: 'tap-targets',
    title: 'Touch‑Point Check',
    staticDesc: 'Ease of tapping interactive elements.',
    unit: '',
    category: 'accessibility',
  },
  {
    id: 'meta-description',
    title: 'Meta Summary Audit',
    staticDesc: 'Quality of your SEO description tag.',
    unit: '',
    category: 'seo',
  },
];
