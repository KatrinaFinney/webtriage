import type { Result as LHResult } from 'lighthouse';
import type { PSIResult }          from '@/types/webVitals';
import { metricsConfig }           from '@/lib/metricsConfig';

type LHAudit = LHResult['audits'][string];

// Only care about `.details.data` when it's a base64 string
interface DetailsWithData {
  data: string;
}

export default function normalizeLhr(lhr: LHResult): PSIResult {
  // 1) Categories
  const categories: PSIResult['categories'] = {
    performance:      { score: lhr.categories.performance.score   ?? 0 },
    accessibility:    { score: lhr.categories.accessibility.score ?? 0 },
    seo:              { score: lhr.categories.seo.score           ?? 0 },
    'mobile-friendly':{ score: lhr.categories['mobile-friendly']?.score ?? 0 },
  };

  // 2) Metrics
  const metrics: PSIResult['metrics'] = metricsConfig.reduce((acc, { id, unit }) => {
    const audit = (lhr.audits[id] ?? {}) as LHAudit;
    const rawValue =
      typeof audit.numericValue === 'number'
        ? audit.numericValue
        : parseFloat(audit.displayValue ?? '') || 0;
    const score = Math.round((audit.score ?? 0) * 100);
    acc[id] = { value: rawValue, score, unit };
    return acc;
  }, {} as PSIResult['metrics']);

  // 3) Screenshots
  const screenshots: string[] = [];

  // final-screenshot
  {
    const a = lhr.audits['final-screenshot'] as LHAudit | undefined;
    if (a?.details && typeof (a.details as DetailsWithData).data === 'string') {
      screenshots.push((a.details as DetailsWithData).data);
    }
  }

  // full-page fallback
  if (screenshots.length === 0) {
    const b = lhr.audits['full-page-screenshot'] as LHAudit | undefined;
    if (b?.details && typeof (b.details as DetailsWithData).data === 'string') {
      screenshots.push((b.details as DetailsWithData).data);
    }
  }

  // 4) Audits: only include displayValue, score, and details.data
  const audits: PSIResult['audits'] = {};
  for (const [key, audit] of Object.entries(lhr.audits) as [string, LHAudit][]) {
    const { score, displayValue, details } = audit;
    let d: { data: string } | undefined;
    if (details && typeof (details as DetailsWithData).data === 'string') {
      d = { data: (details as DetailsWithData).data };
    }
    audits[key] = { score: score ?? undefined, displayValue, details: d };
  }

  return { categories, metrics, screenshots, audits };
}
