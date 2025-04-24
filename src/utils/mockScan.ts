// src/utils/mockScan.ts

export interface ScanResults {
  performance: number
  seo: number
  mobile: number
  accessibility: number
}

const DEFAULT_RESULTS: ScanResults = {
  performance: 82,
  seo: 74,
  mobile: 90,
  accessibility: 88,
}

/**
 * Simulates a website scan by waiting for a few seconds,
 * then returning fixed mock metrics.
 *
 * Used only in development for UI testing.
 */
export default async function mockScan(): Promise<ScanResults> {
  // simulate a 4-second scan delay
  await new Promise((resolve) => setTimeout(resolve, 4000))
  return { ...DEFAULT_RESULTS }
}
