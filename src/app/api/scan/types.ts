import { MetricKey } from "@/types/webVitals";

export type Audit = { displayValue: string };
export type PSIResult = {
  categories: {
    performance: { score: number };
    accessibility: { score: number };
    seo: { score: number };
  };
  audits: Record<string, Audit>;
};

/**
 * Random tip ⇒  pool[id][Math.floor(Math.random()*pool[id].length)]
 */
export const metricAdvicePools: Record<MetricKey, string[]> = {
  /* ── Wake‑up Time  (TTFB) ───────────────────────── */
  'time-to-first-byte': [
    'Introduce edge‑caching or a CDN POP nearest key regions.',
    'Review database queries; slow JOINs balloon TTFB.',
    'Enable Brotli/Gzip to shrink HTML before the first byte travels.',
    'Avoid heavy SSR on every request – cache rendered templates.',
    'Keep serverless functions warm or move hot paths to edge workers.',
    'Compress cookies: oversized headers delay handshake completion.',
  ],

  /* ── First Peek  (FCP) ──────────────────────────── */
  'first-contentful-paint': [
    'Inline critical CSS; defer the rest with `media="print"` swap trick.',
    'Move analytics scripts to the end of `<body>` or add `defer`.',
    'Pre‑connect to fonts/CDNs to cut DNS + TLS round‑trips.',
    'Purge unused CSS to slim the render‑blocking payload.',
    'Replace hero videos with a lightweight poster or LQIP.',
    'Ensure images above the fold use `priority` (Next.js) or `fetchpriority`.',
  ],

  /* ── Full View  (LCP) ───────────────────────────── */
  'largest-contentful-paint': [
    'Preload the hero image with `as="image"` and correct dimensions.',
    'Convert hero JPEG/PNG to AVIF or WebP to cut transfer time.',
    'Compress critical font files; set `font-display:swap`.',
    'Serve modern, tree‑shaken JS bundles via module/nomodule.',
    'Lazy‑load below‑the‑fold images to free bandwidth for LCP.',
    'Push server hints (`103 Early‑Hints`) for critical assets.',
  ],

  /* ── Visual Flow  (Speed Index) ─────────────────── */
  'speed-index': [
    'Lazy‑load off‑screen images and defer non‑critical JS.',
    'Combine CSS files to reduce layout thrash during paint.',
    'Split bundles by route; send only what’s needed for first view.',
    'Use `fetchpriority="high"` on above‑the‑fold images.',
    'Minify and Brotli‑compress all text assets.',
    'Shorten the critical request chain by inlining small SVG or logos.',
  ],

  /* ── Input Pause  (TBT) ─────────────────────────── */
  'total-blocking-time': [
    'Break long JavaScript tasks into chunks under 50 ms.',
    'Introduce web‑workers for heavy parsing/JSON work.',
    'Defer ads/analytics until after `DOMContentLoaded`.',
    'Remove unnecessary polyfills for evergreen browsers.',
    'Adopt `requestIdleCallback` for non‑essential logic.',
    'Eliminate large, unused third‑party libraries.',
  ],

  /* ── Tremor Check  (CLS) ────────────────────────── */
  'cumulative-layout-shift': [
    'Reserve width/height for every image and video.',
    'Avoid inserting banners that push content down—overlay instead.',
    'Use `font-display:optional` to prevent late font swaps.',
    'Pre‑size ad slots or collapse them when empty.',
    'Animate changes with transform/opacity, not top/left.',
    'Stick to a predictable heading hierarchy.',
  ],

  /* ── Alertness Check  (TTI) ─────────────────────── */
  interactive: [
    'Stream HTML + hydrate components incrementally.',
    'Load event listeners early; defer analytics until idle.',
    'Split vendor bundle; lazy‑import admin or dashboard code.',
    'Eliminate synchronous `localStorage` calls on startup.',
    'Use prefetch hints (`rel=prefetch`) for soon‑to‑be‑needed JS.',
    'Adopt partial/islands hydration to shrink main bundle.',
  ],

  /* ── Touch Ease  (tap‑targets) ───────────────────── */
  'tap-targets': [
    'Increase button hit‑area to at least 48 × 48 px.',
    'Add `cursor:pointer` and enough breathing room between links.',
    'Ensure form fields are full‑width on mobile for confident tapping.',
    'Keep sticky footers from covering primary CTAs.',
    'Test with Apple VoiceOver rotor to cycle through actionable items.',
    'Leave 8‑10 px minimum gap between inline links.',
  ],
  "color-contrast": [],
  "meta-description": []
};
  