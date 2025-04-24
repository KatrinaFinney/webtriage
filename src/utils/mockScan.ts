// src/utils/mockScan.ts

/**
 * The shape of the result our ScanPage UI expects:
 * 
 *   {
 *     categories: {
 *       performance: { score: number };
 *       accessibility: { score: number };
 *       seo: { score: number };
 *     };
 *     // (you can add `audits` here if your UI needs them)
 *   }
 */
export interface PSIResult {
  categories: {
    performance: { score: number };
    accessibility: { score: number };
    seo: { score: number };
  };
  audits?: Record<string, { displayValue: string; score: number }>;
}

// These are your “mock” percentages, on a 0–1 scale
const DEFAULT_SCORES = {
  performance: 0.82,
  accessibility: 0.88,
  seo: 0.74,
} as const;

/**
 * Simulates a 4-second scan, then resolves to a PSIResult.
 * 
 * @param domain — the URL being “scanned” (unused in mock)
 */
export default function mockScan(_domain: string): Promise<PSIResult> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        categories: {
          performance: { score: DEFAULT_SCORES.performance },
          accessibility: { score: DEFAULT_SCORES.accessibility },
          seo: { score: DEFAULT_SCORES.seo },
        },
        // audits omitted; add if your UI needs individual audit details
      });
    }, 4_000);
  });
}
