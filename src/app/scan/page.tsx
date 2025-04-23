'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ScanLoader from '../components/ScanLoader';
import styles from '../styles/ScanPage.module.css';

type Audit = {
  displayValue: string;
  score: number;
};

type PSIResult = {
  categories: {
    performance: { score: number };
    accessibility: { score: number };
    seo: { score: number };
  };
  audits: Record<string, Audit>;
};

export default function ScanPage() {
  const router = useRouter();

  // ─── Form state ─────────────────────────────────────────────
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState<'form' | 'scanning' | 'results'>('form');

  // ─── Scan results state ─────────────────────────────────────
  const [result, setResult] = useState<PSIResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [scanTime, setScanTime] = useState<Date | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  // ─── Plain-English summaries ─────────────────────────────────
  const metricSummaries: Record<string, string> = {
    'first-contentful-paint': 'Time until the first text or image appears.',
    'largest-contentful-paint':
      'Time until the main content image or text appears.',
    'cumulative-layout-shift':
      'How much visible elements shift unexpectedly.',
    'total-blocking-time':
      'Total time the page was unresponsive after first paint.',
  };

  // ─── Advice pools ───────────────────────────────────────────
  const metricAdvicePools: Record<string, string[]> = {
    'first-contentful-paint': [
      'Inline critical CSS to reduce render-blocking.',
      'Preload hero fonts and images.',
      'Defer non-essential JavaScript.',
    ],
    'largest-contentful-paint': [
      'Compress hero images (WebP/AVIF).',
      'Lazy-load offscreen media.',
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

  // ─── Top-level labels & summaries ──────────────────────────
  const categoryLabels = {
    performance: 'Site Speed',
    accessibility: 'Usability',
    seo: 'Discoverability',
  } as const;

  const categorySummaries = {
    performance: 'How fast your pages load & respond.',
    accessibility: 'How easy it is for everyone to use.',
    seo: 'How well search engines can find you.',
  } as const;

  // ─── Kick off scan ──────────────────────────────────────────
  const startScan = async () => {
    setPhase('scanning');
    setLogs([]);
    setShowDebug(false);

    const endpoint =
      '/api/scan' + (process.env.NODE_ENV !== 'production' ? '?force=1' : '');
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site: domain, email }),
    });

    let json: any;
    try {
      json = await res.json();
    } catch {
      console.error('🔴 Non-JSON response:', await res.text());
      alert('Server error; see console.');
      setPhase('form');
      return;
    }

    if (Array.isArray(json.logs)) setLogs(json.logs);
    setScanTime(new Date());

    if (res.status === 429) {
      alert(json.error || 'One free scan per URL per day.');
      setPhase('form');
      return;
    }
    if (res.status !== 200 || json.error) {
      alert(json.error || 'Scan failed. See console.');
      setPhase('form');
      return;
    }

    setResult(json.result as PSIResult);
    setPhase('results');
  };

  // ─── Precompute typed categories ────────────────────────────
  let categoryEntries: Array<[keyof typeof categoryLabels, { score: number }]> =
    [];
  if (result) {
    categoryEntries = Object.entries(
      result.categories
    ) as Array<[keyof typeof categoryLabels, { score: number }]>;
  }

  return (
    <div className={styles.page}>
      <AnimatePresence mode="wait">
        {/* ─── FORM ───────────────────────────────────────── */}
        {phase === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={styles.formContainer}
          >
            <h1 className={styles.title}>Let’s Scan Your Site</h1>
            <p className={styles.subtext}>
              Enter your URL & email; we’ll email you a copy of your report.
            </p>

            <div className={styles.field}>
              <label htmlFor="site" className={styles.label}>
                Website URL
              </label>
              <input
                id="site"
                type="url"
                placeholder="https://example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.emailInput}
              />
              <p className={styles.emailNote}>
                We’ll send you a copy of your scan.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={styles.scanButton}
              onClick={startScan}
              disabled={!domain || !email}
            >
              Run Scan
            </motion.button>
          </motion.div>
        )}

        {/* ─── SCANNING ───────────────────────────────────── */}
        {phase === 'scanning' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.scanningContainer}
          >
            <ScanLoader />
            <p className={styles.runningText}>Running diagnostics…</p>
          </motion.div>
        )}

        {/* ─── RESULTS ────────────────────────────────────── */}
        {phase === 'results' && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.resultsContainer}
          >
            {/* Timestamp & Re-run */}
            {scanTime && (
  <div className={styles.scanMeta}>
    Scanned on {scanTime.toLocaleString()}
    {process.env.NODE_ENV !== 'production' && (
      <button className={styles.rerun} onClick={startScan}>
        Re-run
      </button>
    )}
  </div>
)}

            {/* Overview */}
            <h2 className={styles.resultTitle}>
  Vital Signs for{' '}
  <span className={styles.resultDomain}>{domain}</span>
</h2>

            <p className={styles.overview}>
              A quick, one-page health check.
            </p>

            {/* Top-Level Scores */}
            <div className={styles.grid}>
              {categoryEntries.map(([key, { score }]) => {
                const pct = Math.round(score * 100);
                return (
                  <div key={key} className={styles.card}>
                    <div className={styles.cardLabel}>
                      {categoryLabels[key]}
                    </div>
                    <div className={styles.cardScore}>{pct}/100</div>
                    <p className={styles.cardSummary}>
                      {categorySummaries[key]}
                    </p>
                  </div>
                );
              })}
            </div>

            <h3 className={styles.subheading}>Key Checkups & Advice</h3>
<p className={styles.sectionIntro}>
  We’ve distilled your site’s health into four critical checkups—each paired with a clear, non-technical explanation and a single, powerful tip. Think of this as your site’s mini health report: quick to read, easy to act on, and designed to elevate your users’ experience.
</p>
<p className={styles.legend}>
  Hover the ℹ️ to see the technical metric and why it matters.
</p>

            <div className={styles.auditGrid}>
              {(
                [
                  {
                    id: 'first-contentful-paint',
                    brand: 'First Visual Pulse',
                    tech: 'First Contentful Paint (FCP)',
                    narrative: (val: string) =>
                      `Your site’s first visual element appears in ${val}, so visitors don’t stare at a blank screen.`,
                    tipPool: metricAdvicePools['first-contentful-paint'],
                  },
                  {
                    id: 'largest-contentful-paint',
                    brand: 'Main Visual Pulse',
                    tech: 'Largest Contentful Paint (LCP)',
                    narrative: (val: string) =>
                      `At ${val}, your main content is visible quickly—keeping users engaged right away.`,
                    tipPool: metricAdvicePools['largest-contentful-paint'],
                  },
                  {
                    id: 'cumulative-layout-shift',
                    brand: 'Stability Score',
                    tech: 'Cumulative Layout Shift (CLS)',
                    narrative: (val: string) =>
                      `A CLS of ${val} means elements aren’t jumping around—your layout feels solid.`,
                    tipPool: metricAdvicePools['cumulative-layout-shift'],
                  },
                  {
                    id: 'total-blocking-time',
                    brand: 'Interaction Delay',
                    tech: 'Total Blocking Time (TBT)',
                    narrative: (val: string) =>
                      `With ${val} of blocking, your page becomes interactive smoothly and swiftly.`,
                    tipPool: metricAdvicePools['total-blocking-time'],
                  },
                ] as const
              ).map(({ id, brand, tech, narrative, tipPool }) => {
                const audit =
                  result!.audits[id] ?? { displayValue: 'N/A', score: 0 };
                const rawNum =
                  parseFloat(audit.displayValue.replace(/[^\d.]/g, '')) || 0;
                const valText = formatValue(id, audit.displayValue);
                const rating = ratingFor(id, rawNum);
                const tip =
                  tipPool && tipPool.length
                    ? tipPool[Math.floor(Math.random() * tipPool.length)]
                    : 'Review this area for improvements.';

                return (
                  <div key={id} className={styles.auditCard}>
                    <header className={styles.auditHeader}>
                      <h4 className={styles.auditTitle}>
                        {brand}
                        <span className={styles.tooltip}>
                          ℹ️
                          <span className={styles.tooltipText}>
                            {tech}: {metricSummaries[id]}
                          </span>
                        </span>
                      </h4>
                    </header>

                    {/* Value with spelled‐out units */}
                    <div className={styles.auditValue}>
                      {valText}
                    </div>

                    {/* Narrative */}
                    <p className={styles.reportParagraph}>
                      {narrative(valText)}
                    </p>

                    {/* Tip */}
                    <div className={styles.auditSuggestion}>
                      <div className={styles.suggestionLabel}>Tip:</div>
                      <p className={styles.suggestionText}>{tip}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Debug Logs */}
            {process.env.NODE_ENV !== 'production' && (
  <>
    <button
      className={styles.debugToggle}
      onClick={() => setShowDebug((d) => !d)}
    >
      {showDebug ? 'Hide Logs' : 'Show Debug Logs'}
    </button>
    {showDebug && <pre className={styles.debug}>{logs.join('\n')}</pre>}
  </>
)}

         {/* ── NEXT STEPS ────────────────────────────────────── */}
<section className={styles.nextSteps}>
  <h3 className={styles.nextStepsTitle}>Ready to Level Up?</h3>
  <p className={styles.nextStepsIntro}>
    Whether you need a one-off deep dive or ongoing peace of mind, pick the plan
    that fits your goals—and let’s get your site into peak shape.
  </p>

  <div className={styles.servicesGrid}>
    {[
      {
        name: 'Site Triage',
        price: '$99',
        desc: 'Comprehensive performance, UX, SEO & accessibility audit with a clear action roadmap.',
        cta: 'Start Triage',
        link: '/services?service=Site%20Triage',
      },
      {
        name: 'Emergency Fix',
        price: '$149',
        desc: 'Fast, targeted repairs to critical issues so your site stays stable and reliable.',
        cta: 'Request Fix',
        link: '/services?service=Emergency%20Fix',
      },
      {
        name: 'Continuous Care',
        price: '$499/mo',
        desc: 'Monthly health checks, proactive updates & 24/7 monitoring so you never worry.',
        cta: 'Subscribe',
        link: '/services?service=Continuous%20Care',
      },
      {
        name: 'Full Recovery Plan',
        price: 'From $999',
        desc: 'In-depth rebuild & optimization for top performance, design & accessibility.',
        cta: 'Plan Recovery',
        link: '/services?service=Full%20Recovery%20Plan',
      },
    ].map((svc) => (
      <div key={svc.name} className={styles.serviceCard}>
        <div className={styles.servicePriceBadge}>{svc.price}</div>
        <h4 className={styles.serviceTitle}>{svc.name}</h4>
        <p className={styles.serviceDesc}>{svc.desc}</p>
        <button
          className={styles.serviceButton}
          onClick={() => router.push(svc.link)}
        >
          {svc.cta}
        </button>
      </div>
    ))}
  </div>
</section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────
function formatValue(id: string, raw: string): string {
  const num = parseFloat(raw.replace(/[^\d.]/g, '')) || 0;
  if (id === 'total-blocking-time') {
    return `${num} millisecond${num === 1 ? '' : 's'}`;
  }
  return `${num} second${num === 1 ? '' : 's'}`;
}

function ratingFor(id: string, val: number): 'Excellent' | 'Good' | 'Fair' | 'Poor' {
  if (id === 'first-contentful-paint') {
    if (val < 1000) return 'Excellent';
    if (val < 2500) return 'Good';
    if (val < 4000) return 'Fair';
    return 'Poor';
  }
  if (id === 'largest-contentful-paint') {
    if (val < 2500) return 'Excellent';
    if (val < 4000) return 'Good';
    if (val < 6000) return 'Fair';
    return 'Poor';
  }
  if (id === 'cumulative-layout-shift') {
    if (val < 0.1) return 'Excellent';
    if (val < 0.25) return 'Good';
    return 'Poor';
  }
  if (id === 'total-blocking-time') {
    if (val < 200) return 'Excellent';
    if (val < 600) return 'Good';
    if (val < 1000) return 'Fair';
    return 'Poor';
  }
  return 'Poor';
}
