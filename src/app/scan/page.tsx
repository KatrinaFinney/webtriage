'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { PDFDownloadLink } from '@react-pdf/renderer';

import ScanLoader from '../components/ScanLoader';
import ReportPdf from '../components/ReportPdf';
import styles from '../styles/ScanPage.module.css';

import {
  metricSummaries,
  metricAdvicePools,
  categoryLabels,
  categorySummaries,
  formatValue,
} from '../lib/scanMetrics';
import { buildServiceRecs, Service } from '../lib/services';

type CategoryKey = keyof typeof categoryLabels;
type MetricKey = keyof typeof metricAdvicePools;

type Audit = { displayValue: string };
type PSIResult = {
  categories: Record<CategoryKey, { score: number }>;
  audits: Record<string, Audit>;
};

type ScanPhase = 'form' | 'pending' | 'results';

const ETA_MS = 15 * 60 * 1000;

function buildHeroSummary(categories: PSIResult['categories']): string {
  const p = Math.round(categories.performance.score * 100);
  const a = Math.round(categories.accessibility.score * 100);
  const s = Math.round(categories.seo.score * 100);
  const lines: string[] = [];
  if (p < 70) lines.push(`⚡️ Speed ${p}/100 losing visitors—let’s fix that.`);
  else if (p < 90) lines.push(`🚀 Speed ${p}/100 is solid—top 10% is next.`);
  else lines.push(`🚀 Lightning-fast at ${p}/100—impress your users.`);
  if (a < 70) lines.push(`♿️ Accessibility ${a}/100 leaves people out.`);
  else lines.push(`♿️ Accessibility ${a}/100 is great—keep it up.`);
  if (s < 70) lines.push(`🔍 SEO ${s}/100 keeps you hidden from prospects.`);
  else lines.push(`🔍 SEO ${s}/100 is good—let’s help you dominate.`);
  return lines.join(' ');
}

export default function ScanPage() {
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState<ScanPhase>('form');
  const [scanId, setScanId] = useState<number | null>(null);
  const [result, setResult] = useState<PSIResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [scanTime, setScanTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);

  // Prefill domain from ?site=
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('site');
    if (q) setDomain(q);
  }, []);

  // Kick off scan
  // ─── Type‐guards ────────────────────────────────────────────────
function isErrorPayload(obj: unknown): obj is { error: string } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'error' in obj &&
    typeof (obj as Record<string, unknown>).error === 'string'
  )
}

function isScanResponse(obj: unknown): obj is { scanId: number } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'scanId' in obj &&
    typeof (obj as Record<string, unknown>).scanId === 'number'
  )
}

// ─── startScan ─────────────────────────────────────────────────
const startScan = async () => {
  setPhase('pending')
  setLogs([])
  setScanTime(new Date())
  setElapsed(0)

  try {
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site: domain, email }),
    })

    if (!res.ok) {
      const payload: unknown = await res.json()
      if (isErrorPayload(payload)) {
        alert(payload.error)
      } else {
        alert('Scan request failed')
      }
      setPhase('form')
      return
    }

    const data: unknown = await res.json()
    if (isScanResponse(data)) {
      setScanId(data.scanId)
    } else {
      // JSON didn’t match our shape
      alert('Unexpected response from server')
      setPhase('form')
    }
  } catch (err: unknown) {
    // fetch only throws on network errors, as Error
    const message = err instanceof Error ? err.message : 'Network error'
    alert(message)
    setPhase('form')
  }
}


  // Polling
  useEffect(() => {
    if (phase !== 'pending' || scanId == null) return;
    const iv = setInterval(async () => {
      try {
        const res = await fetch(`/api/scan/status/${scanId}`);
        if (!res.ok) return;
        const { status, result: r, logs: newLogs } = await res.json();
        if (Array.isArray(newLogs)) setLogs(newLogs);
        if (status === 'done' && r) {
          clearInterval(iv);
          setResult(r);
          setPhase('results');
          toast.success('📧 Report emailed!');
        }
      } catch {}
    }, 3000);
    return () => clearInterval(iv);
  }, [phase, scanId]);

  // Timer
  useEffect(() => {
    if (phase !== 'pending') return;
    const start = Date.now();
    const iv = setInterval(() => setElapsed(Date.now() - start), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  // Sub-components
  const ScanForm = () => (
    <motion.div
      key="form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={styles.formContainer}
    >
      <h1 className={styles.title}>Let’s Scan Your Site</h1>
      <p className={styles.subtext}>
        Enter your URL & email below. We’ll email you the full report.
      </p>
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
        <p className={styles.emailNote}>We’ll send you a copy of your scan results.</p>
      </div>
      <motion.button
        whileHover={{ scale:1.02 }}
        whileTap={{ scale:0.98 }}
        className={styles.scanButton}
        onClick={startScan}
        disabled={!domain||!email}
      >
        Run Scan
      </motion.button>
    </motion.div>
  );

  const ScanPending = () => (
    <motion.div
      key="pending"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles.scanningContainer}
    >
      <motion.div
        className={styles.loaderRadar}
        initial={{ rotate: 0, opacity:0.5, scale:1 }}
        animate={{ rotate: 360, opacity:[0.5,0.2,0.5], scale:[1,1.2,1] }}
        transition={{ repeat: Infinity, duration:2, ease:'linear' }}
      >
        <ScanLoader/>
      </motion.div>
      <p className={styles.runningText}>
        Scan started{scanId && ` (ID: ${scanId})`}… please wait.<br/>
        Expected ≤ 15 min ⏱
      </p>
      <div className={styles.progressOuter}>
        <div
          className={styles.progressInner}
          style={{ width: `${Math.min(elapsed/ETA_MS*100,100)}%`}}
        />
      </div>
      {elapsed>ETA_MS && (
        <p className={styles.delayNote}>
          Taking longer than usual; we’ll email you automatically once it’s ready.
        </p>
      )}
      {scanTime && (
        <div className={styles.scanMeta}>
          Requested at <strong>{scanTime.toLocaleTimeString()}</strong>
        </div>
      )}
      {logs.length>0 && <pre className={styles.debug}>{logs.join('')}</pre>}
    </motion.div>
  );

  const ScanResults = () => {
    if (!result) return null;
    const categories = result.categories;
    const entries = Object.entries(categories) as Array<[CategoryKey,{score:number}]>;
    const metricKeys = Object.keys(metricAdvicePools) as MetricKey[];
    const services: Service[] = buildServiceRecs(categories);

    return (
      <motion.div
        key="results"
        initial={{ opacity:0, y:20 }}
        animate={{ opacity:1, y:0 }}
        className={styles.resultsContainer}
      >
        {scanTime && (
          <div className={styles.scanMeta}>
            Scanned on <strong>{scanTime.toLocaleString()}</strong>{' '}
            <button className={styles.rerun} onClick={()=>{
              setResult(null);
              setPhase('form');
            }}>
              Scan Another Site
            </button>
          </div>
        )}

        <h2 className={styles.resultTitle}>
          Vital Signs for <span className={styles.resultDomain}>{domain}</span>
        </h2>
        <p className={styles.overview}>A quick, one-page health check.</p>
        <p className={styles.heroSummary}>{buildHeroSummary(categories)}</p>

        <div className={styles.grid}>
          {entries.map(([key,{score}])=>{
            const pct = Math.round(score*100);
            return (
              <div key={key} className={styles.card}>
                <div className={styles.cardLabel}>{categoryLabels[key]}</div>
                <div className={styles.cardScore}><strong>{pct}/100</strong></div>
                <p className={styles.cardSummary}>{categorySummaries[key]}</p>
              </div>
            )
          })}
        </div>

        <h3 className={styles.subheading}>Key Checkups & Advice</h3>
        <p className={styles.sectionIntro}>
          Four critical checkups—each with a narrative and a tip.
        </p>
        <p className={styles.legend}>Hover ℹ️ for technical detail.</p>
        <div className={styles.auditGrid}>
          {metricKeys.map((id) => {
            const raw = result.audits[id]?.displayValue ?? 'N/A';
            const val = formatValue(id, raw);
            const tipList = metricAdvicePools[id];
            const tip = tipList[Math.floor(Math.random()*tipList.length)];
            return (
              <div key={id} className={styles.auditCard}>
                <header className={styles.auditHeader}>
                  <h4 className={styles.auditTitle}>
                    {id}
                    <span className={styles.tooltip}>
                      ℹ️
                      <span className={styles.tooltipText}>
                        {metricSummaries[id]}
                      </span>
                    </span>
                  </h4>
                </header>
                <div className={styles.auditValue}><strong>{val}</strong></div>
                <p className={styles.reportParagraph}>
                  {id==='total-blocking-time'
                    ? `With ${val} blocked, your page is responsive swiftly.`
                    : id==='cumulative-layout-shift'
                    ? `A CLS of ${val} means your layout is stable.`
                    : `Your site’s first visual element appears in ${val}.`}
                </p>
                <div className={styles.auditSuggestion}>
                  <span className={styles.suggestionLabel}>Tip:</span>
                  <p className={styles.suggestionText}>{tip}</p>
                </div>
              </div>
            );
          })}
        </div>

        <PDFDownloadLink
          document={<ReportPdf site={domain} result={result} scannedAt={scanTime?.toISOString()} />}
          fileName={`WebTriage-report-${domain}.pdf`}
        >
          {({ loading }) => loading ? <span>Preparing…</span> : <span>Download Report</span>}
        </PDFDownloadLink>

        <section className={styles.nextSteps}>
          <h3 className={styles.nextStepsTitle}>Ready to Level Up?</h3>
          <p className={styles.nextStepsIntro}>
            Every plan—pick the one that fits your goals.
          </p>
          <div className={styles.servicesGrid}>
            {services.map((svc) => (
              <div key={svc.name} className={styles.serviceCard}>
                <div className={styles.servicePriceBadge}>{svc.price}</div>
                <h4 className={styles.serviceTitle}>{svc.name}</h4>
                <p className={styles.serviceDesc}>{svc.desc}</p>
                <button
                  className={styles.serviceButton}
                  onClick={()=>window.location.href=svc.link}
                >
                  {svc.cta}
                </button>
              </div>
            ))}
          </div>
        </section>
      </motion.div>
    );
  };

  return (
    <div className={styles.page}>
      <AnimatePresence initial={false} mode="wait">
  {phase === 'form'    && <ScanForm    key="form"    />}
  {phase === 'pending' && <ScanPending key="pending" />}
  {phase === 'results' && result && <ScanResults key="results" />}
</AnimatePresence>
    </div>
  );
}
