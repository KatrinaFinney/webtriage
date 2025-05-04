/* ---------------------------------------------------------------
   Canonical shared types – import ONLY from this file
---------------------------------------------------------------- */
export type CategoryKey =
  | 'performance'
  | 'accessibility'
  | 'seo'
  | 'mobile-friendly';

export type MetricKey =
  | 'largest-contentful-paint'
  | 'first-contentful-paint'
  | 'speed-index'
  | 'total-blocking-time'
  | 'interactive'
  | 'cumulative-layout-shift'
  | 'time-to-first-byte';

export type VitalKey = MetricKey;

/* ---------------------------------------------------------------
   Normalised PSI / Lighthouse result
---------------------------------------------------------------- */
export interface PSIResult {
  categories : Record<CategoryKey, { score: number }>
  metrics    : Record<MetricKey, { value: number; unit: string }>
  screenshots: string[]

  /** only present if you requested the filmstrip */
  audits?: Record<
    string,
    {
      displayValue?: string
      score?: number
      details?: { data: string }
    }
  >
}

