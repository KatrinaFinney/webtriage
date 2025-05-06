// File: src/lib/normalizeLhr.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Result as LHResult } from 'lighthouse';
import type { PSIResult }          from '@/types/webVitals';

export default function normalizeLhr(lhr: LHResult): PSIResult {
  const categories: PSIResult['categories'] = {
    performance      : { score: lhr.categories.performance.score  ?? 0 },
    accessibility    : { score: lhr.categories.accessibility.score ?? 0 },
    seo              : { score: lhr.categories.seo.score           ?? 0 },
    'mobile-friendly': { score: lhr.categories['best-practices']?.score ?? 0 },
  };

  const metrics: PSIResult['metrics'] = {
    'largest-contentful-paint': {
      value: lhr.audits['largest-contentful-paint'].numericValue ?? 0,
      score: Math.round((lhr.audits['largest-contentful-paint'].score ?? 0) * 100),
      unit: 'ms',
    },
    'first-contentful-paint': {
      value: lhr.audits['first-contentful-paint'].numericValue ?? 0,
      score: Math.round((lhr.audits['first-contentful-paint'].score ?? 0) * 100),
      unit: 'ms',
    },
    'speed-index': {
      value: lhr.audits['speed-index'].numericValue ?? 0,
      score: Math.round((lhr.audits['speed-index'].score ?? 0) * 100),
      unit: 'ms',
    },
    'total-blocking-time': {
      value: lhr.audits['total-blocking-time'].numericValue ?? 0,
      score: Math.round((lhr.audits['total-blocking-time'].score ?? 0) * 100),
      unit: 'ms',
    },
    'time-to-first-byte': {
      value: lhr.audits['time-to-first-byte'].numericValue ?? 0,
      score: Math.round((lhr.audits['time-to-first-byte'].score ?? 0) * 100),
      unit: 'ms',
    },
    'cumulative-layout-shift': {
      value: lhr.audits['cumulative-layout-shift'].numericValue ?? 0,
      score: Math.round((lhr.audits['cumulative-layout-shift'].score ?? 0) * 100),
      unit: '',
    },
    interactive: {
      value: lhr.audits['interactive'].numericValue ?? 0,
      score: Math.round((lhr.audits['interactive'].score ?? 0) * 100),
      unit: 'ms',
    },
    'color-contrast': {
      value: 0,
      score: Math.round((lhr.audits['color-contrast'].score ?? 0) * 100),
      unit: '',
    },
    'tap-targets': {
      value: 0,
      score: Math.round((lhr.audits['tap-targets'].score ?? 0) * 100),
      unit: '',
    },
    'meta-description': {
      value: 0,
      score: Math.round((lhr.audits['meta-description'].score ?? 0) * 100),
      unit: '',
    },
  };

  // Screenshots
  const screenshots: string[] = [];
  const film = lhr.audits['final-screenshot'];
  if (film && (film.details as any)?.data) {
    screenshots.push((film.details as any).data);
  }

  // Raw audits
  const audits = Object.entries(lhr.audits).reduce<Record<string, any>>(
    (acc, [id, audit]) => {
      acc[id] = {
        displayValue: audit.displayValue,
        details:      audit.details,
        score:        audit.score,
      };
      return acc;
    },
    {}
  );

  return { categories, metrics, screenshots, audits };
}
