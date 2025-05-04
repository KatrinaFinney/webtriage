/* ---------------------------------------------------------------
   src/app/lib/scanMetrics.ts
   Human‑readable labels, tips & helpers – imported by UI + PDF
---------------------------------------------------------------- */
import type { CategoryKey, MetricKey } from '@/types/webVitals';

/* ── Category cards ──────────────────────────────────────────── */
export const categoryLabels: Record<CategoryKey, string> = {
  performance      : 'Vital Speed',
  accessibility    : 'Inclusive Access',
  seo              : 'Search Visibility',
  'mobile-friendly': 'Mobile Ease',
};

export const categorySummaries: Record<CategoryKey, string> = {
  performance      : 'How quickly each element appears & responds.',
  accessibility    : 'Can everyone use your site with ease?',
  seo              : 'How discoverable you are to search engines.',
  'mobile-friendly': 'Usability on phones & tablets.',
};

/* ── Metric titles / tool‑tips ───────────────────────────────── */
export const metricSummaries: Record<MetricKey, string> = {
  'largest-contentful-paint': 'Largest content block becomes visible.',
  'first-contentful-paint'  : 'First pixel paints – perceived start‑up.',
  'speed-index'             : 'Overall pace visual elements appear.',
  'total-blocking-time'     : 'Long tasks that freeze interaction.',
  interactive               : 'Ready for reliable input.',
  'cumulative-layout-shift' : 'Visual stability while loading.',
  'time-to-first-byte'      : 'Server responds & starts sending bytes.',
};

/* ── Pretty‑print numeric values for UI / PDF ────────────────── */
export const formatValue = (id: MetricKey, raw: number): string => {
  switch (id) {
    case 'cumulative-layout-shift': return raw.toFixed(2);
    case 'total-blocking-time':
    case 'time-to-first-byte':      return `${Math.round(raw)} ms`;
    default:                        return `${(raw / 1000).toFixed(2)} s`;
  }
};

/* helper: random item */
const rand = <T extends string[]>(arr: T): T[number] =>
  arr[Math.floor(Math.random() * arr.length)];
/* ---------------------------------------------------------------
   Quick, actionable “first‑aid” tips – rotated in UI & PDF
---------------------------------------------------------------- */
export const metricAdvicePools: Record<MetricKey, string[]> = {
    /* ── Performance ───────────────────────────────────────────── */
    'largest-contentful-paint': [
      'Serve hero images in AVIF/WebP and defer non‑critical CSS.',
      'Inline critical CSS and lazy‑load below‑the‑fold assets.',
      'Upgrade hosting to HTTP/3 so assets stream in parallel.',
      'Compress fonts and remove unused glyphs to shrink first paint.',
    ],
    'first-contentful-paint': [
      'Prefetch your root HTML and minimise third‑party script weight.',
      'Add `fetchpriority="high"` to the above‑the‑fold hero image.',
      'Host static assets on a global CDN to shorten distance to users.',
      'Minify CSS/JS bundles and eliminate render‑blocking resources.',
    ],
    'speed-index': [
      'Enable SSR or static generation for faster first render.',
      'Lazy‑load off‑screen images and stage hydration in chunks.',
      'Stream HTML so pixels appear sooner while loading continues.',
      'Prioritise visible content in the DOM order; defer carousels.',
    ],
    'time-to-first-byte': [
      'Introduce edge caching to cut server processing time.',
      'Review database queries for N+1 patterns slowing responses.',
      'Enable Brotli compression on dynamic responses.',
      'Use stale‑while‑revalidate so repeat hits skip the origin.',
    ],
  
    /* ── Interactivity ─────────────────────────────────────────── */
    'total-blocking-time': [
      'Split large JS bundles and load modules on demand.',
      'Move heavy computations into Web Workers.',
      'Use `requestIdleCallback` for non‑critical work after load.',
      'Eliminate synchronous JSON parsing of large payloads.',
    ],
  
    /* ── Visual stability ──────────────────────────────────────── */
    'cumulative-layout-shift': [
      'Always set width/height on images and iframes to reserve space.',
      'Avoid inserting DOM elements above existing content after load.',
      'Use CSS `aspect-ratio` for responsive images to prevent jank.',
      'Preload web‑fonts or use `font-display:optional` to reduce FOIT.',
    ],
  
    /* ── Main‑thread idle ──────────────────────────────────────── */
    interactive: [
      'Pre‑render routes or adopt streaming to shorten time‑to‑interactive.',
      'Prioritise event listeners early; shift non‑critical JS to idle.',
      'Introduce route‑based code‑splits to lighten initial bundles.',
      'Adopt progressive enhancement or partial hydration.',
    ],
  };
/* ---------------------------------------------------------------
   Rich, two‑sentence diagnostics for MetricCard & PDF
---------------------------------------------------------------- */
const diag: Record<MetricKey, string[]> = {
    'largest-contentful-paint': [
      'Key visual content lingers off‑screen, leaving visitors staring at a blank hero. 👉 Compress hero imagery and prioritise its request to bring it forward in the critical path.',
      'Your banner doesn’t surface until late in the waterfall. 👉 Convert images to next‑gen formats and inline only the CSS necessary for first paint.',
    ],
    'first-contentful-paint': [
      'Nothing appears for a full second—many users assume the page is broken. 👉 Pre‑connect to your CDN and defer analytics to unblock paint.',
      'First paint is delayed by synchronous scripts in `<head>`. 👉 Add `defer` or move non‑essential JS after `body`.',
    ],
    'speed-index': [
      'Visual progress crawls, making the whole site feel heavy. 👉 Lazy‑load images below the viewport and consolidate CSS.',
      'Users wait while incremental paints inch down the page. 👉 Minify & gzip assets and split bundles for faster progression.',
    ],
    'total-blocking-time': [
      'JavaScript monopolises the main thread—taps feel ignored. 👉 Chunk heavy libraries and adopt code‑splitting.',
      'Third‑party tags block input for hundreds of ms. 👉 Defer ads & analytics until after `DOMContentLoaded`.',
    ],
    interactive: [
      'Page looks ready but ignores clicks—frustrating visitors. 👉 Render critical routes on the server to shorten TTI.',
      'Main‑thread busywork delays interaction by seconds. 👉 Shift non‑critical JS to `requestIdleCallback`.',
    ],
    'cumulative-layout-shift': [
      'Elements jump as images download—users mis‑tap and lose context. 👉 Reserve space with `aspect-ratio` boxes.',
      'Late‑loaded fonts nudge text and buttons. 👉 Preload fonts or use `font-display:optional`.',
    ],
    'time-to-first-byte': [
      'Server response is sluggish—every metric starts on its back foot. 👉 Add edge caching and optimise DB queries.',
      'TTFB exceeds 600 ms—search engines may penalise ranking. 👉 Upgrade hosting tier or introduce a regional CDN node.',
    ],
  };
  
  /** Return a random two‑line narrative for the given metric */
  export const diagnosisFor = (id: MetricKey): string => rand(diag[id]);
    