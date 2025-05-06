// src/lib/normalizeLhr.ts
import type { Result as LHResult } from 'lighthouse'
import type { PSIResult, MetricKey } from '@/types/webVitals'

export default function normalizeLhr(lhr: LHResult): PSIResult {
  // 1) Categories
  const categories: PSIResult['categories'] = {
    performance      : { score: lhr.categories.performance.score ?? 0 },
    accessibility    : { score: lhr.categories.accessibility.score ?? 0 },
    seo              : { score: lhr.categories.seo.score ?? 0 },
    'mobile-friendly': { score: lhr.categories['best-practices']?.score ?? 0 },
  }

  // 2) Metrics
  const metrics: Record<MetricKey, { value: number; unit: string }> = {
    'largest-contentful-paint': {
      value: lhr.audits['largest-contentful-paint'].numericValue ?? 0,
      unit: 'ms',
    },
    'first-contentful-paint': {
      value: lhr.audits['first-contentful-paint'].numericValue ?? 0,
      unit: 'ms',
    },
    'speed-index': {
      value: lhr.audits['speed-index'].numericValue ?? 0,
      unit: 'ms',
    },
    'total-blocking-time': {
      value: lhr.audits['total-blocking-time'].numericValue ?? 0,
      unit: 'ms',
    },
    'time-to-first-byte': {
      value: lhr.audits['time-to-first-byte'].numericValue ?? 0,
      unit: 'ms',
    },
    'cumulative-layout-shift': {
      value: lhr.audits['cumulative-layout-shift'].numericValue ?? 0,
      unit: '',
    },
    interactive: {
      value: lhr.audits['interactive'].numericValue ?? 0,
      unit: 'ms',
    },
    // the following three are placeholders (no numericValue in LHR)
    'color-contrast': { value: 0, unit: '' },
    'tap-targets'   : { value: 0, unit: '' },
    'meta-description': { value: 0, unit: '' },
  }

  // 3) Screenshots (if any)
  const screenshots: string[] = []
  const film = lhr.audits['final-screenshot']
  if (film && film.details) {
    // cast only to pull out the `data` field
    const details = film.details as { data?: string }
    if (typeof details.data === 'string') {
      screenshots.push(details.data)
    }
  }

  // 4) Audits: we don't actually use this deeply, so satisfy the type with an empty map
  const audits: PSIResult['audits'] = {}

  return { categories, metrics, screenshots, audits }
}
