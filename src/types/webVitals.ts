/* ---------------------------------------------------------------
   Canonical shared types – import ONLY from this file
---------------------------------------------------------------- */

export type CategoryKey =
  | 'performance'
  | 'accessibility'
  | 'seo'
  | 'mobile-friendly';

export type MetricKey =
  | 'first-contentful-paint'
  | 'largest-contentful-paint'
  | 'speed-index'
  | 'total-blocking-time'
  | 'cumulative-layout-shift'
  | 'time-to-first-byte'
  | 'interactive'
  | 'color-contrast'
  | 'tap-targets'
  | 'meta-description';

export type VitalKey = MetricKey;

/* ---------------------------------------------------------------
   Normalised PSI / Lighthouse result
---------------------------------------------------------------- */

export interface PSIResult {
  categories: Record<CategoryKey, { score: number }>;
  metrics: Record<MetricKey, { score: number; value: number; unit: string }>;
  screenshots: string[];
  /** only present if you requested the filmstrip */
  audits?: Record<
    string,
    {
      displayValue?: string;
      score?: number;
      details?: { data: string };
    }
  >;
}

/* ---------------------------------------------------------------
   Common structure for every service card / upsell
---------------------------------------------------------------- */

export interface Service {
  slug:    string; // url-safe ID
  title:   string; // marketing headline
  summary: string; // short blurb
  price:   string;
  cta:     string; // button text
  link:    string; // checkout / form url

  /* legacy aliases so old code compiles */
  name?: string;
  desc?: string;
}
