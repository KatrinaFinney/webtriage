import type { MetricKey } from '@/types/webVitals';

/** one‑sentence quick‑win tips shown beneath each metric card / in the PDF */
export const metricAdvicePools: Record<MetricKey, string[]> = {
    'largest-contentful-paint': [
        'Compress hero images and preload them.',
        'Inline critical CSS to avoid render blocking.',
    ],
    'first-contentful-paint': [
        'Defer analytics scripts until after paint.',
        'Add <link rel="preconnect"> for your CDN.',
    ],
    'speed-index': [
        'Lazy‑load images below the fold.',
        'Combine and minify CSS files.',
    ],
    'total-blocking-time': [
        'Split large JS bundles and load on demand.',
        'Move heavy work to Web Workers.',
    ],
    'cumulative-layout-shift': [
        'Reserve space with aspect‑ratio boxes.',
        'Add explicit width/height to all images.',
    ],
    'time-to-first-byte': [
        'Enable edge‑side caching.',
        'Optimise database queries on critical routes.',
    ],
    interactive: []
};
