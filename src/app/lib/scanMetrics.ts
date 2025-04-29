// src/lib/scanMetrics.ts

/** 1a) Category keys for the top-level scores */
export type CategoryKey = 'performance' | 'accessibility' | 'seo'

/** 1b) Metric keys for the individual audits */
export type MetricKey =
  | 'first-contentful-paint'
  | 'largest-contentful-paint'
  | 'cumulative-layout-shift'
  | 'total-blocking-time'

/** 1c) Now all of your lookups become typed Records */
/**
 * Our three scan categories; we derive the
 * key-type automatically from the literal below.
 */
export const categoryLabels = {
    performance: 'Site Speed',
    accessibility: 'Usability',
    seo: 'Discoverability',
  } as const
  
  /** The union type "performance" | "accessibility" | "seo" */
  export type ScanCategoryKey = keyof typeof categoryLabels
  
  /**
   * Human-readable summaries for the category cards.
   * Must use the same keys as `categoryLabels`.
   */
  export const categorySummaries = {
    performance: 'How fast your pages load & respond.',
    accessibility: 'How easy it is for everyone to use.',
    seo: 'How well search engines can find you.',
  } as const

export const metricSummaries: Record<MetricKey, string> = {
  'first-contentful-paint': 'Time until the first text or image appears.',
  'largest-contentful-paint': 'Time until the main content image or text appears.',
  'cumulative-layout-shift': 'How much visible elements shift unexpectedly.',
  'total-blocking-time': 'Total time the page was unresponsive after first paint.',
}

export const metricAdvicePools: Record<MetricKey, string[]> = {
  'first-contentful-paint': [
    'Inline critical CSS to reduce render-blocking.',
    'Preload hero fonts and images.',
    'Defer non-essential JavaScript.',
  ],
  'largest-contentful-paint': [
    'Compress hero images (WebP/AVIF).',
    'Lazy-load off-screen media.',
    'Set long cache headers on images.',
  ],
  'cumulative-layout-shift': [
    'Specify width/height on media elements.',
    'Reserve space for ads and embeds.',
    'Use CSS transform for animations.',
  ],
  'total-blocking-time': [
    'Break up long tasks into smaller chunks.',
    'Offload heavy work to Web Workers.',
    'Minify and compress JS bundles.',
  ],
}

export function formatValue(id: MetricKey, raw: string): string {
  const num = parseFloat(raw.replace(/[^\d.]/g, '')) || 0
  return id === 'total-blocking-time'
    ? `${num} millisecond${num === 1 ? '' : 's'}`
    : `${num} second${num === 1 ? '' : 's'}`
}
