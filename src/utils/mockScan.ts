export interface ScanResults {
    performance: number;
    seo: number;
    mobile: number;
    accessibility: number;
  }
  
  const DEFAULT_RESULTS: ScanResults = {
    performance: 82,
    seo: 74,
    mobile: 90,
    accessibility: 88,
  };
  
  /**
   * Simulates a 4-second scan, then returns mock metrics.
   */
  export default function mockScan(domain: string): Promise<ScanResults> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ ...DEFAULT_RESULTS });
      }, 4000);
    });
  }
  