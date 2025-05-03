/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { PDFDownloadLink } from '@react-pdf/renderer';
import Modal from '../components/Modal';
import ScanLoader from '../components/ScanLoader';
import ReportPdf from '../components/ReportPdf';
import styles from '../styles/ScanPage.module.css';

import {
  metricAdvicePools,
  categoryLabels,
  categorySummaries,
  formatValue,
} from '../lib/scanMetrics';


type CategoryKey = keyof typeof categoryLabels;
type MetricKey   = keyof typeof metricAdvicePools;

type PSIResult = {
  categories: Record<CategoryKey, { score: number }>;
  audits:     Record<MetricKey, { displayValue: string; details?: { data: string } }>;
};

type ScanPhase = 'form' | 'pending' | 'results';
const ETA_MS = 60 * 1000;

// — Branded labels for each metric
const auditLabels: Record<MetricKey, string> = {
  'first-contentful-paint':   'First Impression',
  'largest-contentful-paint': 'Hero Load',
  'total-blocking-time':      'Smooth Interaction',
  'cumulative-layout-shift':  'Visual Stability',
};

// — More medical, reassuring hero summary
function buildHeroSummary(categories: PSIResult['categories']): React.ReactNode {
  const p = Math.round(categories.performance.score * 100);
  if (p < 70)   return `Patient is weak at ${p}/100—time for treatment.`;
  if (p < 90)   return `Stable at ${p}/100—let’s boost vitality further.`;
  return          `Peak health at ${p}/100—exceptional performance.`;
}

// ─── Scan Form ─────────────────────────────────────────────────
interface ScanFormProps {
  domain: string;
  email:  string;
  setDomain: React.Dispatch<React.SetStateAction<string>>;
  setEmail:  React.Dispatch<React.SetStateAction<string>>;
  onStart:   () => Promise<void>;
}
const ScanForm: React.FC<ScanFormProps> = ({
  domain, email, setDomain, setEmail, onStart
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={styles.formContainer}
  >
    <h1 className={styles.title}>Let’s Scan Your Site</h1>
    <p className={styles.subtext}>
      Enter your URL & email below. We’ll email you a detailed health report.
    </p>
    <div className={styles.field}>
      <label htmlFor="site" className={styles.label}>Website URL</label>
      <input
        id="site" type="url" placeholder="https://example.com"
        value={domain} onChange={e => setDomain(e.target.value)}
        className={styles.input}
      />
    </div>
    <div className={styles.field}>
      <label htmlFor="email" className={styles.label}>Email Address</label>
      <input
        id="email" type="email" placeholder="you@example.com"
        value={email} onChange={e => setEmail(e.target.value)}
        className={styles.input}
      />
    </div>
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap  ={{ scale: 0.98 }}
      className={styles.primaryButton}
      onClick={onStart}
      disabled={!domain || !email}
    >
      Run Scan
    </motion.button>
  </motion.div>
);

// ─── Scan Pending ──────────────────────────────────────────────
interface ScanPendingProps {
  elapsed: number;
  logs:    string[];
}
const ScanPending: React.FC<ScanPendingProps> = ({ elapsed, logs }) => (
  <motion.div
    key="pending"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit   ={ { opacity: 0 } }
    className={styles.scanningContainer}
  >
    <motion.div
      className={styles.loaderRadar}
      initial ={{ rotate: 0, opacity: 0.5, scale: 1 }}
      animate ={{ rotate: 360, opacity: [0.5,0.2,0.5], scale: [1,1.2,1] }}
      transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
    >
      <ScanLoader/>
    </motion.div>
    <p className={styles.runningText}>
      Hang tight—your site’s wellness check is in progress…
    </p>
    <div className={styles.progressOuter}>
      <div
        className={styles.progressInner}
        style={{ width: `${Math.min((elapsed/ETA_MS)*100,100)}%` }}
      />
    </div>
    {elapsed > ETA_MS && (
      <p className={styles.delayNote}>
        Taking a bit longer? No worries—we’ll email you once it’s ready.
      </p>
    )}
    {logs.length > 0 && <pre className={styles.debug}>{logs.join('')}</pre>}
  </motion.div>
);
interface ScanResultsProps {
  domain:   string;
  result:   PSIResult;
  onRerun:  () => void;
}
const ScanResults: React.FC<ScanResultsProps> = ({ domain, result, onRerun }) => {
 

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.resultsContainer}
    >
      {/* — Top Actions */}
      <div className={styles.actionsRow}>
        <button className={styles.secondaryButton} onClick={onRerun}>
          Scan Another Site
        </button>
        <PDFDownloadLink
          document={<ReportPdf site={domain} result={result} />}
          fileName={`WebTriage-report-${domain}.pdf`}
        >
          {({ loading }) =>
            loading
              ? <button className={styles.secondaryButton} disabled>Preparing…</button>
              : <button className={styles.secondaryButton}>Download Full Report</button>
          }
        </PDFDownloadLink>
      </div>

      {/* — Hero Summary */}
      <h2 className={styles.resultTitle}>
        Vital Signs for <span className={styles.resultDomain}>{domain}</span>
      </h2>
      <p className={styles.overview}>A quick, one-page health check.</p>
      <div className={styles.heroSummary}>
        {buildHeroSummary(result.categories)}
      </div>

      {/* — Always-Two Screenshots */}
      <div className={styles.screenshotsContainer}>
        {(['initial-screenshot','final-screenshot'] as const).map((key) => {
          const data = (result.audits as any)[key]?.details?.data;
          if (!data) return null;
          return (
            <div key={key} className={styles.screenshotBox}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data} alt={key} className={styles.screenshot} />
              <p className={styles.screenshotLabel}>
                { key === 'initial-screenshot' ? 'Before Treatment' : 'After Treatment' }
              </p>
            </div>
          );
        })}
      </div>

      {/* — Category Scores */}
      <div className={styles.grid}>
        {Object.entries(result.categories).map(
          ([key,{score}]) => {
            const pct = Math.round(score*100);
            return (
              <div key={key} className={styles.card}>
                <div className={styles.cardLabel}>
                  {categoryLabels[key as CategoryKey]}
                </div>
                <div className={styles.cardScore}><strong>{pct}/100</strong></div>
                <p className={styles.cardSummary}>
                  {categorySummaries[key as CategoryKey]}
                </p>
              </div>
            );
          }
        )}
      </div>

      {/* — Deep Dive Checkups */}
      <h3 className={styles.subheading}>Key Checkups & Advice</h3>
      <p className={styles.sectionIntro}>
        Four critical diagnostics—each with a tip.
      </p>
      <div className={styles.auditGrid}>
      { (Object.keys(result.audits) as MetricKey[]).map(id => {
      const raw   = result.audits[id]?.displayValue ?? 'N/A';
      const val   = formatValue(id, raw);
      const badge = auditLabels[id] || id;
      const tip   = metricAdvicePools[id][0];
     return (
       <div key={id} className={styles.auditCard}>
         <h4 className={styles.auditTitle}>{badge}</h4>
         <div className={styles.auditValue}><strong>{val}</strong></div>
         <p className={styles.reportParagraph}>{tip}</p>
       </div>
     );
   })
 }
      </div>
    </motion.div>
  );
};
export default function ScanPage() {
  const [domain, setDomain]           = useState('');
  const [email, setEmail]             = useState('');
  const [phase, setPhase]             = useState<ScanPhase>('form');
  const [scanId, setScanId]           = useState<number|null>(null);
  const [result, setResult]           = useState<PSIResult|null>(null);
  const [logs, setLogs]               = useState<string[]>([]);
  const [elapsed, setElapsed]         = useState(0);
  const [selectedService, setSelected]= useState<string|null>(null);

  // ─── Kick off scan ───────────────────────────────────────────
  async function startScan() {
    setPhase('pending');
    setLogs([]);
    setElapsed(0);
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ site: domain, email }),
    });
    if (!res.ok) {
      const e = await res.json().catch(()=>({error:'Unknown'}));
      alert((e as any).error || 'Scan request failed');
      return setPhase('form');
    }
    const { scanId: id } = await res.json() as { scanId:number };
    setScanId(id);
  }

  // ─── Polling ─────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'pending' || scanId == null) return;
    const iv = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/scan/status/${scanId}?t=${Date.now()}`,
          { cache: 'no-store' }
        );
        if (!res.ok) return;
        const { status, result: r, logs: newLogs } = await res.json();
        setLogs(newLogs);
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

  // ─── Elapsed timer ───────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'pending') return;
    const start = Date.now();
    const iv = setInterval(() => setElapsed(Date.now()-start), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  return (
    <div className={styles.page}>
      {phase === 'form' && (
        <ScanForm
          domain={domain}
          email={email}
          setDomain={setDomain}
          setEmail={setEmail}
          onStart={startScan}
        />
      )}

      <AnimatePresence mode="wait" initial={false}>
        {phase === 'pending' && (
          <ScanPending key="pending" elapsed={elapsed} logs={logs} />
        )}
        {phase === 'results' && result && (
          <ScanResults
            key="results"
            domain={domain}
            result={result}
            onRerun={() => {
              setResult(null);
              setPhase('form');
            }}
          />
        )}
      </AnimatePresence>

      {selectedService && (
        <Modal
          isOpen
          selectedService={selectedService}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
