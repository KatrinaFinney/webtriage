/* ---------------------------------------------------------------
   Human‑friendly titles & blurbs for every tracked metric
---------------------------------------------------------------- */
import type { MetricKey } from '@/types/webVitals';

interface VitalLabel { title: string; blurb: string; }

export const vitalLabels: Record<MetricKey, VitalLabel> = {
  'first-contentful-paint': {
    title : 'Wake‑up Time',
    blurb : 'How quickly the first pixel appears – the site’s initial pulse.',
  },
  'largest-contentful-paint': {
    title : 'Full‑View Moment',
    blurb : 'When the biggest element (usually the hero) finishes loading.',
  },
  'speed-index': {
    title : 'Visual Flow',
    blurb : 'Overall pace at which visible parts of the page populate.',
  },
  'total-blocking-time': {
    title : 'Input Pause',
    blurb : 'Cumulative main‑thread stalls that delay taps & clicks.',
  },
  interactive: {
    title : 'Alertness Check',
    blurb : 'When the page is fully awake and ready to respond.',
  },
  'cumulative-layout-shift': {
    title : 'Tremor Test',
    blurb : 'Measures unexpected layout jolts as elements load.',
  },
  'time-to-first-byte': {
    title : 'First Drip',
    blurb : 'Server’s reaction time – bytes start flowing to the browser.',
  },
  'color-contrast': {
    title : 'Clarity Check',
    blurb : 'Do colours provide enough contrast for easy reading?',
  },
  'tap-targets': {
    title : 'Touch Ease',
    blurb : 'Are buttons and links comfortably thumb‑friendly?',
  },
  'meta-description': {
    title : 'Snippet Health',
    blurb : 'Enticing meta copy that wins clicks in search results.',
  },
};
