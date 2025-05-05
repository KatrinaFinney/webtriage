/* ---------------------------------------------------------------
   metricAdvicePools.ts
   – Randomised 2‑sentence, plain‑language advice for every metric
---------------------------------------------------------------- */
import type { MetricKey } from '@/types/webVitals';

/** helper – pick one entry per call */
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/** public API */
export const metricAdvicePools: Record<MetricKey, string[]> = {
  /* ───────── Performance core ─────────────────────────────── */

  'first-contentful-paint': [
    'Nothing appears for over a second—visitors wonder if something broke. 👉 Pre‑connect to your CDN and inline critical CSS to get pixels on‑screen sooner.',
    'First paint is stalled by synchronous scripts in <head>. 👉 Add defer or move analytics to the end of <body>.',
    'Blocking fonts delay that first glimpse. 👉 Use font‑display:swap so text shows instantly.',
    'Large hero images choke the render path. 👉 Serve modern formats (AVIF/WebP) and priority‑hint the banner.',
    'Multiple DNS look‑ups add invisible latency. 👉 Declare <link rel="preconnect"> for third‑party origins.',
    'Unused CSS is parsed before any paint. 👉 Tree‑shake or purge unused rules in your build step.',
  ],

  'largest-contentful-paint': [
    'Key visual content lingers off‑screen, leaving visitors staring at a blank hero. 👉 Compress hero imagery and priority‑hint its request.',
    'Your banner doesn’t surface until late in the waterfall. 👉 Inline only the CSS necessary for first paint.',
    'Slow LCP drags down Core Web Vitals scores. 👉 Defer non‑critical JavaScript and third‑party tags.',
    'Heavy carousels push the largest element further down. 👉 Lazy‑load off‑screen slides.',
    'Server response variance adds seconds. 👉 Introduce edge caching to serve HTML faster.',
    'Render‑blocking Google Fonts file delays LCP. 👉 Self‑host fonts or use preload.',
  ],

  'speed-index': [
    'Visual progress crawls, making the site feel heavy. 👉 Lazy‑load below‑fold images and consolidate CSS.',
    'Incremental paints inch down the page. 👉 Minify, gzip and split bundles for faster progression.',
    'Above‑the‑fold renders but the rest stalls. 👉 Set fetchpriority="high" on critical images.',
    'Long tasks delay successive paints. 👉 Break large scripts and load modules on demand.',
    'Off‑screen images decode too early. 👉 Add loading="lazy" to defer work.',
    'Skeleton loaders paint late; switch to lightweight colour blocks.',
  ],

  'total-blocking-time': [
    'JavaScript monopolises the main thread—taps feel ignored. 👉 Chunk heavy libraries and adopt code‑splitting.',
    'Third‑party tags block input for hundreds of ms. 👉 Defer ads & analytics until after DOMContentLoaded.',
    'Large polyfills execute on modern browsers. 👉 Ship modern bundles via module/nomodule split.',
    'Hydration runs as a single monolith. 👉 Adopt partial hydration or islands architecture.',
    'Source‑map evaluation in prod slows the thread. 👉 Strip dev‑only tools from live builds.',
    'Use web‑workers for expensive computations to free the UI thread.',
  ],

  interactive: [
    'Page looks ready but ignores clicks—frustrating visitors. 👉 Server‑render key routes to shorten time‑to‑interactive.',
    'Main‑thread busywork delays interaction by seconds. 👉 Shift non‑critical JS to requestIdleCallback.',
    'Large bundles parse post‑render, prolonging TTI. 👉 Introduce route‑based code‑splits.',
    'Blocking localStorage calls lock the thread. 👉 Switch to async storage or IndexedDB.',
    'Hydration stutters on low‑end mobiles. 👉 Stream partial HTML and hydrate progressively.',
    'Prefetch fewer routes to avoid crowding the main thread during load.',
  ],

  'cumulative-layout-shift': [
    'Elements jump as images download—users mis‑tap and lose context. 👉 Reserve space with aspect‑ratio boxes.',
    'Late‑loaded fonts nudge text and buttons. 👉 Preload fonts or use font‑display:optional.',
    'Ad iframes push content mid‑read. 👉 Allocate static slots or collapse when empty.',
    'Dynamic banners slide in, shifting main content. 👉 Overlay them with absolute positioning.',
    'Carousel images load at varying heights, jolting the page. 👉 Fix container dims and crop images consistently.',
    'Lazy components insert without animation. 👉 Animate height transitions or use skeleton loaders.',
  ],

  'time-to-first-byte': [
    'Server response is sluggish—every metric starts on its back foot. 👉 Add edge caching and optimise DB queries.',
    'TTFB exceeds 600 ms—search engines may penalise ranking. 👉 Upgrade hosting tier or add a regional CDN node.',
    'Cold starts on serverless functions inflate TTFB. 👉 Keep‑warm strategies or switch hot paths to edge workers.',
    'Heavy SSR rendering blocks response. 👉 Cache templates or prerender popular pages.',
    'Compression disabled; HTML ships uncompressed. 👉 Enable Brotli or Gzip at the edge.',
    'Blocking middleware delays bytes leaving the server. 👉 Move auth to lighter layers or cache tokens.',
  ],
  /* ───────── Accessibility / UX extras ─────────────────────── */

  'color-contrast': [
    'Text / background fails WCAG AA. 👉 Raise contrast above 4.5:1.',
    'Pale grays on white undermine readability. 👉 Darken text or add a tinted panel.',
    'Buttons rely on colour alone for meaning. 👉 Add icons or underline links.',
    'Thin fonts with low contrast = eye‑strain. 👉 Increase weight or swap family.',
    'Verify dark‑mode too; brand colours may need alternates.',
    'Use Chrome DevTools “Contrast issues” to surface offenders quickly.',
  ],

  'tap-targets': [
    'Links sit too close; fat‑finger taps misfire. 👉 Add 8‑10 px spacing.',
    'Icons under 40 px hinder thumbs. 👉 Expand hit‑areas with padding.',
    'Sticky footer hides the last list‑item. 👉 Inset content or raise z‑index.',
    'Primary CTA should run full‑width on small screens for confident taps.',
    'Avoid interactive elements in the first 48 px (Safari toolbar zone).',
    'Use Lighthouse’s Tap‑Targets audit to zero in on culprits.',
  ],

  'meta-description': [
    'Pages lack meta descriptions—Google picks random text. 👉 Add concise copy ≤ 155 chars.',
    'Duplicate descriptions cannibalise clicks. 👉 Customise per page intent.',
    'Descriptions truncate on mobile. 👉 Front‑load keywords & value prop.',
    'Use action verbs—invites clicks and boosts dwell‑time signals.',
    'Include a keyword + soft CTA (“Learn how…”) to improve CTR.',
    'A/B‑test two variants via Search Console to see which drives more traffic.',
  ],
};

/** helper used by UI components */
export const adviceFor = (id: MetricKey): string => pick(metricAdvicePools[id]);
