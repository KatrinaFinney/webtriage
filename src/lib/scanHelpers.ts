import type { PSIResult } from '@/types/webVitals';
import { categoryLabels, categorySummaries } from '@/lib/scanMetrics';

/**
 * Map a score (0–1) to a status class (used elsewhere)
 */
export function statusClass(scorePct: number): string {
  if (scorePct >= 0.9) return 'statusExcellent';
  if (scorePct >= 0.75) return 'statusGood';
  if (scorePct >= 0.5) return 'statusFair';
  return 'statusPoor';
}

/**
 * Build a robust, 4-sentence conversational summary:
 * - highlights two top categories
 * - calls out the single lowest category
 * - uses the one-line categorySummaries for context
 * - reads professionally and avoids metric-level detail
 */
export function buildConversationalSummary(
  categories: PSIResult['categories']
): string {
  // Build an array of { key, label, score }
  const arr = Object.entries(categories).map(([key, { score }]) => ({
    key,
    label: categoryLabels[key as keyof typeof categoryLabels],
    score: score ?? 0,
  }));
  // Sort descending by score
  const sorted = arr.sort((a, b) => b.score - a.score);
  const [first, second] = sorted;
  const lowest = sorted[sorted.length - 1];

  return [
    `Your Website Health Snapshot reveals strong fundamentals in ${first.label} and ${second.label}, reflecting areas where your site truly excels.`,
    `However, ${lowest.label} remains an opportunity for enhancement.`,
    `Consider focusing on improving ${lowest.label.toLowerCase()}, as ${categorySummaries[lowest.key as keyof typeof categorySummaries]}.`,
    `By maintaining these strengths and addressing this opportunity, your site will deliver a faster, more accessible, and search-optimized experience for all visitors.`,
  ].join(' ');
}

// Alias for backward compatibility
export { buildConversationalSummary as buildHeroSummary };
