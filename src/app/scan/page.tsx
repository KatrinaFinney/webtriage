/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import ScanLoader from '../components/ScanLoader';
import styles from '../styles/ScanPage.module.css';

//////////////////////////////////
// — Types
//////////////////////////////////

type Audit = {
  displayValue: string;
};

type PSIResult = {
  categories: {
    performance: { score: number };
    accessibility: { score: number };
    seo: { score: number };
  };
  audits: Record<string, Audit>;
};

interface ScanResponse {
  logs?: string[];
  result?: PSIResult;
  error?: string;
}

//////////////////////////////////
// — Component
//////////////////////////////////

export default function ScanPage() {
  const router = useRouter();
  const search = useSearchParams();

  // ─── Form state
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState<'form' | 'scanning' | 'results'>('form');

  // ─── Scan results state
  const [result, setResult] = useState<PSIResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [scanTime, setScanTime] = useState<Date | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  // ─── Seed domain from ?site=… on mount
  useEffect(() => {
    const s = search.get('site');
    if (s) setDomain(s);
  }, [search]);

  // ─── Plain-English summaries
  const metricSummaries: Record<string, string> = {
    'first-contentful-paint': 'Time until the first text or image appears.',
    'largest-contentful-paint': 'Time until the main content image or text appears.',
    'cumulative-layout-shift': 'How much visible elements shift unexpectedly.',
    'total-blocking-time': 'Total time the page was unresponsive after first paint.',
  };

  // ─── Advice pools
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

  // ─── Top-level labels & summaries
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

  // ─── Kick off scan
  const startScan = async () => {
    console.log('🔎 startScan called with', { domain, email });

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

    const json = (await res.json()) as ScanResponse;

    // record logs & timestamp
    if (Array.isArray(json.logs)) setLogs(json.logs);
    setScanTime(new Date());

    // handle rate-limit or errors
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

    // success!
    setResult(json.result!);
    setPhase('results');
  };

  // ─── Prepare category entries for rendering
  let categoryEntries: Array<[keyof typeof categoryLabels, { score: number }]> = [];
  if (result) {
    categoryEntries = Object.entries(
      result.categories
    ) as Array<[keyof typeof categoryLabels, { score: number }]>;
  }

  return (
    <div className={styles.page}>
      <AnimatePresence mode="wait">
        {/* ─── FORM */}
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
              Enter your URL &amp; email below. We’ll email you the full report.
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
                We’ll send you a copy of your scan results.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={styles.scanButton}
              onClick={startScan}
              /* disabled={!domain || !email} */
            >
              Run Scan
            </motion.button>
          </motion.div>
        )}

        {/* ─── SCANNING */}
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

        {/* ─── RESULTS */}
        {phase === 'results' && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.resultsContainer}
          >
            {/* Timestamp & Re-run (dev only) */}
            {scanTime && (
              <div className={styles.scanMeta}>
                Scanned on <strong>{scanTime.toLocaleString()}</strong>{' '}
                {process.env.NODE_ENV !== 'production' && (
                  <button className={styles.rerun} onClick={startScan}>
                    Re-run
                  </button>
                )}
              </div>
            )}

            {/* Dynamic title */}
            <h2 className={styles.resultTitle}>
              Vital Signs for{' '}
              <span className={styles.resultDomain}>{domain}</span>
            </h2>
            <p className={styles.overview}>
              A quick, one-page health check.
            </p>

            {/* Top-level scores */}
            <div className={styles.grid}>
              {categoryEntries.map(([key, { score }]) => {
                const pct = Math.round(score * 100);
                return (
                  <div key={key} className={styles.card}>
                    <div className={styles.cardLabel}>
                      {categoryLabels[key]}
                    </div>
                    <div className={styles.cardScore}>
                      <strong>{pct}/100</strong>
                    </div>
                    <p className={styles.cardSummary}>
                      {categorySummaries[key]}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Explanation */}
            <h3 className={styles.subheading}>Key Checkups &amp; Advice</h3>
            <p className={styles.sectionIntro}>
              We’ve distilled your site’s health into four critical checkups—each with a simple narrative and one clear tip.
            </p>
            <p className={styles.legend}>
              Hover the ℹ️ to see the technical metric and why it matters.
            </p>

            {/* Detailed mini-reports */}
            <div className={styles.auditGrid}>
              {(
                [
                  {
                    id: 'first-contentful-paint',
                    brand: 'First Visual Pulse',
                    tech: 'First Contentful Paint (FCP)',
                    narrative: (v: string) =>
                      `Your site shows its first visual element in ${v}, so visitors never see a blank screen.`,
                    tipPool: metricAdvicePools['first-contentful-paint'],
                  },
                  {
                    id: 'largest-contentful-paint',
                    brand: 'Main Visual Pulse',
                    tech: 'Largest Contentful Paint (LCP)',
                    narrative: (v: string) =>
                      `At ${v}, your main content is visible—keeping users engaged from the start.`,
                    tipPool: metricAdvicePools['largest-contentful-paint'],
                  },
                  {
                    id: 'cumulative-layout-shift',
                    brand: 'Stability Score',
                    tech: 'Cumulative Layout Shift (CLS)',
                    narrative: (v: string) =>
                      `A CLS of ${v} means your layout feels stable—elements aren’t jumping around.`,
                    tipPool: metricAdvicePools['cumulative-layout-shift'],
                  },
                  {
                    id: 'total-blocking-time',
                    brand: 'Interaction Delay',
                    tech: 'Total Blocking Time (TBT)',
                    narrative: (v: string) =>
                      `With ${v} blocked, your page becomes interactive smoothly and swiftly.`,
                    tipPool: metricAdvicePools['total-blocking-time'],
                  },
                ] as const
              ).map(({ id, brand, tech, narrative, tipPool }) => {
                const audit = result.audits[id] ?? { displayValue: 'N/A' };
                const valText = formatValue(id, audit.displayValue);
                const tip =
                  tipPool[Math.floor(Math.random() * tipPool.length)];

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

                    <div className={styles.auditValue}>
                      <strong>{valText}</strong>
                    </div>
                    <p className={styles.reportParagraph}>
                      {narrative(valText)}
                    </p>

                    <div className={styles.auditSuggestion}>
                      <span className={styles.suggestionLabel}>Tip:</span>
                      <p className={styles.suggestionText}>{tip}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Debug Logs (dev only) */}
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

            {/* ── NEXT STEPS ── */}
            <section className={styles.nextSteps}>
              <h3 className={styles.nextStepsTitle}>Ready to Level Up?</h3>
              <p className={styles.nextStepsIntro}>
                One-off deep dives or ongoing care—choose the plan that matches your goals, and let’s get your site into peak shape.
              </p>
              <div className={styles.servicesGrid}>
                {[
                  {
                    name: 'Site Triage',
                    price: '$99',
                    desc: `In-depth performance, UX, SEO & accessibility audit with a clear roadmap.`,
                    cta: 'Start Triage',
                    link: '/services?service=Site%20Triage',
                  },
                  {
                    name: 'Emergency Fix',
                    price: '$149',
                    desc: `Fast, targeted repairs for critical issues so your site stays stable.`,
                    cta: 'Request Fix',
                    link: '/services?service=Emergency%20Fix',
                  },
                  {
                    name: 'Continuous Care',
                    price: '$499/mo',
                    desc: `Monthly health checks, proactive updates & 24/7 monitoring—never worry again.`,
                    cta: 'Subscribe',
                    link: '/services?service=Continuous%20Care',
                  },
                  {
                    name: 'Full Recovery Plan',
                    price: 'From $999',
                    desc: `Complete rebuild & optimization for top performance, design & accessibility.`,
                    cta: 'Plan Recovery',
                    link: '/services?service=Full%20Recovery%20Plan',
                  },
                ].map((svc) => (
                  <div key={svc.name} className={styles.serviceCard}>
                    <div className={styles.servicePriceBadge}>{svc.price}</div>
                    <h4 className={styles.serviceTitle}>{svc.name}</h4>
                    <p className={styles.serviceDesc}>{svc.desc}</p>
                    <button className={styles.serviceButton} onClick={() => router.push(svc.link)}>
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

// ─── Helpers
function formatValue(id: string, raw: string): string {
  const num = parseFloat(raw.replace(/[^\d.]/g, '')) || 0;
  if (id === 'total-blocking-time') {
    return `${num} millisecond${num === 1 ? '' : 's'}`;
  }
  return `${num} second${num === 1 ? '' : 's'}`;
}
