// src/app/scan/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';                       // ★ new
import ScanLoader from '../components/ScanLoader';
import styles from '../styles/ScanPage.module.css';

//////////////////////////////////
// — Types
//////////////////////////////////

type Audit = { displayValue: string };
type PSIResult = {
  categories: {
    performance: { score: number };
    accessibility: { score: number };
    seo: { score: number };
  };
  audits: Record<string, Audit>;
};

type ScanPhase = 'form' | 'pending' | 'results';


//////////////////////////////////
// — Constants
//////////////////////////////////

const ETA_MS = 15 * 60 * 1000; // 15 minutes target

//////////////////////////////////
// — Component
//////////////////////////////////

export default function ScanPage() {
  // ─── Form fields
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState<ScanPhase>('form');

  // ─── Scan tracking
  const [scanId, setScanId] = useState<number | null>(null);
  const [result, setResult] = useState<PSIResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [scanTime, setScanTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);               // ★ new

  // ─── Metric summaries & advice
  const metricSummaries: Record<string, string> = {
    'first-contentful-paint': 'Time until the first text or image appears.',
    'largest-contentful-paint': 'Time until the main content image or text appears.',
    'cumulative-layout-shift': 'How much visible elements shift unexpectedly.',
    'total-blocking-time': 'Total time the page was unresponsive after first paint.',
  };

  const metricAdvicePools: Record<string, string[]> = {
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

  // ─── Pre-fill domain from URL query
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('site');
    if (q) setDomain(q);
  }, []);

  // ─── Kick off scan
  const startScan = async () => {
    console.log('▶️ startScan()', { domain, email });
    setPhase('pending');
    setLogs([]);
    setScanTime(new Date());
    setElapsed(0);                                         // ★ reset timer

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site: domain, email }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Scan request failed');
        setPhase('form');
        return;
      }
      const { scanId } = await res.json();
      setScanId(scanId);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Network error';
      console.error('Network error:', e);
      alert(msg);
      setPhase('form');
    }
  };

  // ─── Poll for status
  useEffect(() => {
    if (phase !== 'pending' || scanId == null) return;
    const iv = setInterval(async () => {
      try {
        const res = await fetch(`/api/scan/status/${scanId}`);
        console.log('⏱️  Polling:', res.status, res.statusText, await res.clone().text())
        if (!res.ok) {
          console.warn(`Status fetch failed: ${res.status} ${res.statusText}`);
          return;
        }
        const { status, result: resData, logs: newLogs } = (await res.json()) as {
          status: string;
          result?: PSIResult;
          logs?: string[];
        };
        if (Array.isArray(newLogs)) setLogs(newLogs);
        if (status === 'done' && resData) {
          console.log('✅  Scan is done – about to switch phase to results');
          clearInterval(iv);
          setResult(resData);
          setPhase('results');
          toast.success('📧  Report emailed!');            // ★ toast
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);
    return () => clearInterval(iv);
  }, [phase, scanId]);

  useEffect(() => {
    console.log('🔄 phase is now', phase);
  }, [phase]);
  
  // ─── Progress-bar timer
  useEffect(() => {
      if (phase !== 'pending') return;
      const t0 = Date.now();
      const tid = setInterval(() => setElapsed(Date.now() - t0), 1000);
      return () => clearInterval(tid);
    }, [phase]);
  

  // ─── Prepare entries for results
  let entries: Array<[keyof typeof categoryLabels, { score: number }]> = [];
  if (result?.categories) {
    entries = Object.entries(result.categories) as Array<[keyof typeof categoryLabels, { score: number }]>;
  }
/** Build a punchy headline based on scores */
function buildHeroSummary(categories: PSIResult['categories']): string {
  const p = Math.round(categories.performance.score * 100);
  const a = Math.round(categories.accessibility.score * 100);
  const s = Math.round(categories.seo.score * 100);

  const lines: string[] = [];

  if (p < 70) {
    lines.push(`⚡️ Your load speed (${p}/100) is costing you visitors—let’s fix that.`);
  } else if (p < 90) {
    lines.push(`🚀 Solid load speed at ${p}/100, but we can push you into the top 10%.`);
  } else {
    lines.push(`🚀 Lightning-fast at ${p}/100—your users will love the speed.`);
  }

  if (a < 70) {
    lines.push(`♿️ Accessibility at ${a}/100 leaves real users behind.`);
  } else {
    lines.push(`♿️ Great accessibility at ${a}/100—ensure every visitor can engage.`);
  }

  if (s < 70) {
    lines.push(`🔍 SEO at ${s}/100 means you’re invisible to new traffic.`);
  } else {
    lines.push(`🔍 With ${s}/100 SEO, you’re ranking—but we can help you dominate.`);
  }

  return lines.join(' ');
}

/** Pick which extra services to show */
function buildServiceRecs(categories: PSIResult['categories']) {
  const recs: Array<{
    name: string;
    price: string;
    desc: string;
    cta: string;
    link: string;
  }> = [];

  if (categories.performance.score < 0.8) {
    recs.push({
      name: 'Emergency Fix',
      price: '$149',
      desc: 'Fast, targeted repairs for critical issues.',
      cta: 'Request Fix',
      link: '/services?service=Emergency%20Fix',
    });
  }
  if (categories.accessibility.score < 0.75 || categories.seo.score < 0.75) {
    recs.push({
      name: 'Continuous Care',
      price: '$499/mo',
      desc: 'Monthly health checks & 24/7 monitoring.',
      cta: 'Subscribe',
      link: '/services?service=Continuous%20Care',
    });
  }

  // Always include these two
  recs.push(
    {
      name: 'Site Triage',
      price: '$99',
      desc: 'In-depth audit with action roadmap.',
      cta: 'Start Triage',
      link: '/services?service=Site%20Triage',
    },
    {
      name: 'Full Recovery Plan',
      price: 'From $999',
      desc: 'Complete rebuild & optimization.',
      cta: 'Plan Recovery',
      link: '/services?service=Full%20Recovery%20Plan',
    }
  );

  return recs;
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
            {/* fields … unchanged */}
            <div className={styles.field}>
              <label htmlFor="site" className={styles.label}>Website URL</label>
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
              <label htmlFor="email" className={styles.label}>Email Address</label>
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
              disabled={!domain || !email}
            >
              Run Scan
            </motion.button>
          </motion.div>
        )}

        {/* ─── PENDING */}
        {phase === 'pending' && (
          <motion.div
            key="pending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.scanningContainer}
          >
            <ScanLoader />
            <p className={styles.runningText}>
              Scan started{scanId && ` (ID: ${scanId})`}… please wait.<br/>
              Expected&nbsp;≤&nbsp;15&nbsp;min&nbsp;⏱
            </p>

            {/* progress bar */}
            <div className={styles.progressOuter}>
              <div
                className={styles.progressInner}
                style={{ width: `${Math.min((elapsed / ETA_MS) * 100, 100)}%` }}
              />
            </div>

            {elapsed > ETA_MS && (
              <p className={styles.delayNote}>
                Taking longer than usual; we’ll email you automatically once it’s ready.
              </p>
            )}

            {scanTime && (
              <div className={styles.scanMeta}>
                Requested at <strong>{scanTime.toLocaleTimeString()}</strong>
              </div>
            )}
            {logs.length > 0 && (
              <pre className={styles.debug}>{logs.join('')}</pre>
            )}
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
            <p className={styles.heroSummary}>
  {buildHeroSummary(result.categories)}
</p>
            {/* header metadata */}
            {scanTime && (
              <div className={styles.scanMeta}>
                Scanned on <strong>{scanTime.toLocaleString()}</strong>{' '}
                <button
                  className={styles.rerun}
                  onClick={() => {
                    setResult(null);
                    setPhase('form');
                  }}
                >
                  Scan Another Site
                </button>
              </div>
            )}

            {/* scores */}
            <h2 className={styles.resultTitle}>
              Vital Signs for <span className={styles.resultDomain}>{domain}</span>
            </h2>
            <p className={styles.overview}>A quick, one-page health check.</p>

            <div className={styles.grid}>
              {entries.map(([key, { score }]) => {
                const pct = Math.round(score * 100);
                return (
                  <div key={key} className={styles.card}>
                    <div className={styles.cardLabel}>{categoryLabels[key]}</div>
                    <div className={styles.cardScore}><strong>{pct}/100</strong></div>
                    <p className={styles.cardSummary}>{categorySummaries[key]}</p>
                  </div>
                );
              })}
            </div>

            {/* audits */}
            <h3 className={styles.subheading}>Key Checkups &amp; Advice</h3>
            <p className={styles.sectionIntro}>
              Four critical checkups—each with a narrative and a tip.
            </p>
            <p className={styles.legend}>Hover ℹ️ for technical detail.</p>

            <div className={styles.auditGrid}>
              {/* map audits … unchanged */}
              {[
                { id:'first-contentful-paint', brand:'First Visual Pulse', tech:'First Contentful Paint (FCP)', narrative:(v:string)=>`Your site’s first visual element appears in ${v}.`, tipPool:metricAdvicePools['first-contentful-paint'] },
                { id:'largest-contentful-paint', brand:'Main Visual Pulse', tech:'Largest Contentful Paint (LCP)', narrative:(v:string)=>`At ${v}, your main content is visible quickly.`, tipPool:metricAdvicePools['largest-contentful-paint'] },
                { id:'cumulative-layout-shift', brand:'Stability Score', tech:'Cumulative Layout Shift (CLS)', narrative:(v:string)=>`A CLS of ${v} means your layout is stable.`, tipPool:metricAdvicePools['cumulative-layout-shift'] },
                { id:'total-blocking-time', brand:'Interaction Delay', tech:'Total Blocking Time (TBT)', narrative:(v:string)=>`With ${v} blocked, your page is responsive swiftly.`, tipPool:metricAdvicePools['total-blocking-time'] },
              ].map(({ id, brand, tech, narrative, tipPool }) => {
                const audit = result.audits[id] ?? { displayValue:'N/A' };
                const valText = formatValue(id, audit.displayValue);
                const tip = tipPool[Math.floor(Math.random() * tipPool.length)];
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
                    <div className={styles.auditValue}><strong>{valText}</strong></div>
                    <p className={styles.reportParagraph}>{narrative(valText)}</p>
                    <div className={styles.auditSuggestion}>
                      <span className={styles.suggestionLabel}>Tip:</span>
                      <p className={styles.suggestionText}>{tip}</p>
                    </div>
                  </div>
                );
              })}
            </div>

          {/* ── NEXT STEPS (dynamic) ── */}
<section className={styles.nextSteps}>
  <h3 className={styles.nextStepsTitle}>Ready to Level Up?</h3>
  <p className={styles.nextStepsIntro}>
    Based on your report, we’ve hand-picked the perfect next steps.
  </p>

  <div className={styles.servicesGrid}>
    {buildServiceRecs(result.categories).map((svc) => (
      <div key={svc.name} className={styles.serviceCard}>
        <div className={styles.servicePriceBadge}>{svc.price}</div>
        <h4 className={styles.serviceTitle}>{svc.name}</h4>
        <p className={styles.serviceDesc}>{svc.desc}</p>
        <button
          className={styles.serviceButton}
          onClick={() => (window.location.href = svc.link)}
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

/* ─── Helpers ─────────────────────────────────────────────── */
function formatValue(id: string, raw: string): string {
  const num = parseFloat(raw.replace(/[^\d.]/g, '')) || 0;
  return id === 'total-blocking-time'
    ? `${num} millisecond${num === 1 ? '' : 's'}`
    : `${num} second${num === 1 ? '' : 's'}`;
}
