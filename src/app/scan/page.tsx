'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { PDFDownloadLink } from '@react-pdf/renderer';
import Modal from '../components/Modal'
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

// ─── Types ─────────────────────────────────────────────────────────
type CategoryKey = keyof typeof categoryLabels;
type MetricKey = keyof typeof metricAdvicePools;
type PSIResult = {
  categories: Record<CategoryKey, { score: number }>;
  audits: Record<string, { displayValue: string; details?: { data: string } }>;
};

type ScanPhase = 'form' | 'pending' | 'results';
const ETA_MS = 60 * 1000;

// Hero summary helper (unchanged)
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

// ─── Props & Components ────────────────────────────────────────────
interface ScanFormProps {
  domain: string;
  email: string;
  setDomain: React.Dispatch<React.SetStateAction<string>>;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  onStart: () => Promise<void>;
}
const ScanForm: React.FC<ScanFormProps> = ({ domain, email, setDomain, setEmail, onStart }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={styles.formContainer}
  >
    <h1 className={styles.title}>Let’s Scan Your Site</h1>
    <p className={styles.subtext}>Enter your URL & email below. We’ll email you the full report.</p>

    <div className={styles.field}>
      <label htmlFor="site" className={styles.label}>Website URL</label>
      <input
        id="site"
        type="url"
        placeholder="https://example.com"
        value={domain}
        onChange={e => setDomain(e.target.value)}
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
        onChange={e => setEmail(e.target.value)}
        className={styles.emailInput}
      />
      <p className={styles.emailNote}>We’ll send you a copy of your scan results.</p>
    </div>

    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={styles.scanButton}
      onClick={onStart}
      disabled={!domain || !email}
    >
      Run Scan
    </motion.button>
  </motion.div>
);

interface ScanPendingProps {
  scanId: number | null;
  elapsed: number;
  scanTime: Date | null;
  logs: string[];
}
const ScanPending: React.FC<ScanPendingProps> = ({ elapsed, scanTime, logs }) => (
  <motion.div
    key="pending"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className={styles.scanningContainer}
  >
    <motion.div
      className={styles.loaderRadar}
      initial={{ rotate: 0, opacity: 0.5, scale: 1 }}
      animate={{ rotate: 360, opacity: [0.5, 0.2, 0.5], scale: [1, 1.2, 1] }}
      transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
    >
      <ScanLoader />
    </motion.div>

    <p className={styles.runningText}>
      Hang tight—your site’s health check is running…<br/>
      You’ll see results in about a minute!
    </p>

    <div className={styles.progressOuter}>
      <div
        className={styles.progressInner}
        style={{ width: `${Math.min((elapsed / ETA_MS) * 100, 100)}%` }}
      />
    </div>

    {elapsed > ETA_MS && (
      <p className={styles.delayNote}>
        Taking a bit longer? No worries—we’ll email you once it’s ready.
      </p>
    )}

    {scanTime && (
      <div className={styles.scanMeta}>
        Started at <strong>{scanTime.toLocaleTimeString()}</strong>
      </div>
    )}

    {logs.length > 0 && <pre className={styles.debug}>{logs.join('')}</pre>}
  </motion.div>
);

interface ScanResultsProps {
  domain: string;
  result: PSIResult;
  scanTime: Date | null;
  onRerun: () => void;
}
const ScanResults: React.FC<ScanResultsProps> = ({ domain, result, scanTime, onRerun }) => {
  const categories = result.categories;
  const entries = Object.entries(categories) as Array<[CategoryKey, { score: number }]>;
  const metricKeys = Object.keys(metricAdvicePools) as MetricKey[];
  const services: Service[] = buildServiceRecs(categories);
  const [selectedService, setSelectedService] = useState<string | null>(null)


  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.resultsContainer}
    >
      {scanTime && (
        <div className={styles.scanMeta}>
          Scanned on <strong>{scanTime.toLocaleString()}</strong>{' '}
          <button className={styles.rerun} onClick={onRerun}>
            Scan Another Site
          </button>
        </div>
      )}

      <h2 className={styles.resultTitle}>
        Vital Signs for <span className={styles.resultDomain}>{domain}</span>
      </h2>
      <p className={styles.overview}>A quick, one-page health check.</p>
      <p className={styles.heroSummary}>{buildHeroSummary(categories)}</p>
      
      
<div className={styles.filmstripContainer}>
  {result.audits['final-screenshot']?.details?.data && (
    <>
      <h3 className={styles.subheading}>Instant Preview</h3>
      <img
        src={result.audits['final-screenshot'].details.data}
        alt="Final render of your page"
        className={styles.filmstripThumb}
      />
      <button
        className={styles.deepLink}
        onClick={() => toast('Generating full filmstrip…')}
      >
        View full filmstrip & trace
      </button>
    </>
  )}
</div>

      <div className={styles.grid}>
        {entries.map(([key, { score }]) => {
          const pct = Math.round(score * 100);
          return (
            <div key={key} className={styles.card}>
              <div className={styles.cardLabel}>{categoryLabels[key]}</div>
              <div className={styles.cardScore}><strong>{pct}/100</strong></div>
              <p className={styles.cardSummary}>{categorySummaries[key]}</p>
              {pct < 90 && (
  <button
    className={styles.upsellButton}
    onClick={() => window.location.href = `/order?service=Emergency%20Fix&focus=${key}`}
  >
    Need help boosting {categoryLabels[key]}?
  </button>
)}

            </div>
          );
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
          const tip = tipList[Math.floor(Math.random() * tipList.length)];
          return (
            <div key={id} className={styles.auditCard}>
              <header className={styles.auditHeader}>
                <h4 className={styles.auditTitle}>
                  {id}
                  <span className={styles.tooltip}>
                    ℹ️
                    <span className={styles.tooltipText}>{metricSummaries[id]}</span>
                  </span>
                </h4>
              </header>
              <div className={styles.auditValue}><strong>{val}</strong></div>
              <p className={styles.reportParagraph}>
                {id === 'total-blocking-time'
                  ? `With ${val} blocked, your page is responsive swiftly.`
                  : id === 'cumulative-layout-shift'
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
        document={
          <ReportPdf site={domain} result={result} scannedAt={scanTime?.toISOString()} />
        }
        fileName={`WebTriage-report-${domain}.pdf`}
      >
        {({ loading }) => (loading ? <span>Preparing…</span> : <span>Download Report</span>)}
      </PDFDownloadLink>

      <section className={styles.nextSteps}>
  <h3 className={styles.nextStepsTitle}>Ready to Level Up?</h3>
  <p className={styles.nextStepsIntro}>
    Every plan—pick the one that fits your goals.
  </p>
  <div className={styles.servicesGrid}>
    {services.map((svc: Service) => (
      <div key={svc.name} className={styles.serviceCard}>
        <div className={styles.servicePriceBadge}>{svc.price}</div>
        <h4 className={styles.serviceTitle}>{svc.name}</h4>
        <p className={styles.serviceDesc}>{svc.desc}</p>
        <button
          className={styles.serviceButton}
          onClick={() => setSelectedService(svc.name)}
        >
          {svc.cta}
        </button>
      </div>
    ))}
  </div>

  {/* Full-site triage banner */}
  <div className={styles.fullTriageBanner}>
    <p>
      Start the journey to website wellness with an extensive site triage report
      and a recovery-plan prescription — <em>or</em> entrust your site to our expert
      care and we’ll nurse it back to perfect health so you can get back to business.
    </p>
    <button
      className={styles.fullTriageButton}
      onClick={() => setSelectedService('Full Recovery Plan')}
    >
      Begin Site Treatment
    </button>
  </div>
</section>

{/* Modal */}
{selectedService && (
  <Modal
    isOpen={true}
    selectedService={selectedService}
    onClose={() => setSelectedService(null)}
  />
)}
    </motion.div>
  );
};
export default function ScanPage() {
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState<ScanPhase>('form');
  const [scanId, setScanId] = useState<number | null>(null);
  const [result, setResult] = useState<PSIResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [scanTime, setScanTime] = useState<Date | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  // ─── Chunk A: startScan ─────────────────────────────────────────
  
  // ─── Type‐guards for startScan response ───────────────────────
function isErrorPayload(obj: unknown): obj is { error: string } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'error' in obj &&
    typeof (obj as Record<string, unknown>).error === 'string'
  );
}

function isScanResponse(obj: unknown): obj is { scanId: number } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'scanId' in obj &&
    typeof (obj as Record<string, unknown>).scanId === 'number'
  );
}

  const startScan = async () => {
    setPhase('pending');
    setLogs([]);
    setScanTime(new Date());
    setElapsed(0);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site: domain, email }),
      });

      if (!res.ok) {
        const payload: unknown = await res.json();
        if (isErrorPayload(payload)) {
          alert(payload.error);
        } else {
          alert('Scan request failed');
        }
        setPhase('form');
        return;
      }

      const data: unknown = await res.json();
      if (isScanResponse(data)) {
        setScanId(data.scanId);
      } else {
        alert('Unexpected response from server');
        setPhase('form');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error';
      alert(message);
      setPhase('form');
    }
  };

  // ─── Chunk B: polling effect ───────────────────────────────────
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

  // ─── Timer effect ─────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'pending') return;
    const start = Date.now();
    const iv = setInterval(() => setElapsed(Date.now() - start), 1000);
    return () => clearInterval(iv);
  }, [phase]);
  return (
    <div className={styles.page}>
      {/* Always-mounted form */}
      {phase === 'form' && (
        <ScanForm
          domain={domain}
          email={email}
          setDomain={setDomain}
          setEmail={setEmail}
          onStart={startScan}
        />
      )}

      {/* Animate only pending & results */}
      <AnimatePresence initial={false} mode="wait">
        {phase === 'pending' && (
          <ScanPending
            key="pending"
            scanId={scanId}
            elapsed={elapsed}
            scanTime={scanTime}
            logs={logs}
          />
        )}

        {phase === 'results' && result && (
          <ScanResults
            key="results"
            domain={domain}
            result={result}
            scanTime={scanTime}
            onRerun={() => {
              setResult(null);
              setPhase('form');
            }}
          />
        )}
      </AnimatePresence>
      {/* Modal */}
{selectedService && (
  <Modal
  isOpen={true}
    selectedService={selectedService}
    onClose={() => setSelectedService(null)}
  />
)}


    </div>
  );
}

