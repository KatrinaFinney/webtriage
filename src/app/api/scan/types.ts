export type Audit = { displayValue: string };
export type PSIResult = {
  categories: {
    performance: { score: number };
    accessibility: { score: number };
    seo: { score: number };
  };
  audits: Record<string, Audit>;
};

export const metricAdvicePools: Record<string, string[]> = {
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
  };