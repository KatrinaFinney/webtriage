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
  metricSummaries,
  metricAdvicePools,
  categoryLabels,
  categorySummaries,
  formatValue,
} from '../lib/scanMetrics';
import { buildServiceRecs, Service } from '../lib/services';

// ─── Types ─────────────────────────────────────────────────────────
type CategoryKey = keyof typeof categoryLabels;
type MetricKey   = keyof typeof metricAdvicePools;
type PSIResult   = {
  categories: Record<CategoryKey, { score: number }>;
  audits:     Record<string, { displayValue: string; details?: { data: string } }>;
};

type ScanPhase = 'form' | 'pending' | 'results';
const ETA_MS    = 60 * 1_000;

// ─── Hero summary helper ─────────────────────────────────────────
function buildHeroSummary(categories: PSIResult['categories']): string {
  const p = Math.round((categories.performance.score || 0) * 100);
  const a = Math.round((categories.accessibility.score || 0) * 100);
  const s = Math.round((categories.seo.score || 0) * 100);
  const lines: string[] = [];
  if (p < 70) lines.push(`Your site feels sluggish at ${p}/100—let’s give it a boost.`);
  else if (p < 90) lines.push(`Good pace at ${p}/100—push for the top tier.`);
  else lines.push(`🏃 Lightning-fast at ${p}/100.`);

  if (a < 70) lines.push(`Accessibility ${a}/100—open it up for everyone.`);
  else lines.push(`♿️ Accessibility ${a}/100 is welcoming.`);

  if (s < 70) lines.push(`SEO ${s}/100—time to get discovered.`);
  else lines.push(`🔍 SEO ${s}/100 is already strong.`);

  return lines.join(' ');
}

// ─── ScanForm ──────────────────────────────────────────────────────
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
    key="form"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className={styles.formContainer}
  >
    <h1 className={styles.title}>Let’s Scan Your Site</h1>
    <p className={styles.subtext}>
      Enter your URL and email below—your detailed health check is on the way.
    </p>

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
      <p className={styles.emailNote}>We’ll email you the full report once it’s ready.</p>
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

// ─── ScanPending ───────────────────────────────────────────────────
interface ScanPendingProps {
  elapsed: number;
  logs:    string[];
}
const ScanPending: React.FC<ScanPendingProps> = ({ elapsed, logs }) => (
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
      animate={{ rotate: 360, opacity: [0.5, 0.2, 0.5], scale: [1,1.2,1] }}
      transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
    >
      <ScanLoader />
    </motion.div>

    <p className={styles.runningText}>Running your site health check…</p>

    <div className={styles.progressOuter}>
      <div
        className={styles.progressInner}
        style={{ width: `${Math.min((elapsed/ETA_MS)*100,100)}%` }}
      />
    </div>

    {logs.length > 0 && (
      <pre className={styles.debug}>{logs.join('')}</pre>
    )}
  </motion.div>
);
// ─── Type-guards ────────────────────────────────────────────────
function isErrorPayload(obj: unknown): obj is { error: string } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'error' in obj &&
    typeof (obj as any).error === 'string'
  );
}

function isScanResponse(obj: unknown): obj is { scanId: number } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'scanId' in obj &&
    typeof (obj as any).scanId === 'number'
  );
}

// ─── ScanResults ───────────────────────────────────────────────
interface ScanResultsProps {
  domain:          string;
  result:          PSIResult;
  onRerun:         () => void;
  onSelectService: (name: string) => void;
}

const ScanResults: React.FC<ScanResultsProps> = ({
  domain,
  result,
  onRerun,
  onSelectService,
}) => {
  const services: Service[] = buildServiceRecs(result.categories);

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={styles.resultsContainer}
    >
      {/* Rerun button */}
      <div className={styles.scanMeta}>
        <button className={styles.rerun} onClick={onRerun}>
          Scan Another Site
        </button>
      </div>

      {/* Hero */}
      <h2 className={styles.resultTitle}>
        Vital Signs for <span className={styles.resultDomain}>{domain}</span>
      </h2>
      <p className={styles.overview}>A quick, one-page health check.</p>
      <p className={styles.heroSummary}>
        {buildHeroSummary(result.categories)}
      </p>

      {/* Instant preview */}
      <div className={styles.filmstripContainer}>
        {result.audits['final-screenshot']?.details?.data && (
          <>
            <h3 className={styles.subheading}>Instant Preview</h3>
            <img
              src={result.audits['final-screenshot'].details.data}
              alt="Final render"
              className={styles.filmstripThumb}
            />
          </>
        )}
      </div>

      {/* Top-level score cards */}
      <div className={styles.grid}>
        {(Object.entries(result.categories) as [CategoryKey, { score: number }][])
          .map(([key, { score }]) => {
            const pct = Math.round(score * 100);
            return (
              <div key={key} className={styles.card}>
                <div className={styles.cardLabel}>{categoryLabels[key]}</div>
                <div className={styles.cardScore}>{pct}/100</div>
                <p className={styles.cardSummary}>{categorySummaries[key]}</p>
                {pct < 90 && (
                  <button
                    className={styles.upsellButton}
                    onClick={() => onSelectService(`${categoryLabels[key]} Boost`)}
                  >
                    Boost {categoryLabels[key]}
                  </button>
                )}
              </div>
            );
        })}
      </div>

      {/* Detailed checkups */}
      <h3 className={styles.subheading}>Key Checkups & Advice</h3>
      <p className={styles.sectionIntro}>
        Four detailed audits—each with an actionable tip.
      </p>
      <p className={styles.legend}>Hover for details.</p>
      <div className={styles.auditGrid}>
        {(Object.keys(metricAdvicePools) as MetricKey[]).map(id => {
          const raw   = result.audits[id]?.displayValue ?? 'N/A';
          const val   = formatValue(id, raw);
          const tips  = metricAdvicePools[id];
          const tip   = tips[Math.floor(Math.random() * tips.length)];
          return (
            <div key={id} className={styles.auditCard}>
              <header className={styles.auditHeader}>
                <h4 className={styles.auditTitle}>{metricSummaries[id]}</h4>
              </header>
              <div className={styles.auditValue}>{val}</div>
              <div className={styles.auditSuggestion}>
                <span className={styles.suggestionLabel}>Tip:</span> {tip}
              </div>
            </div>
          );
        })}
      </div>

      {/* PDF export */}
      <PDFDownloadLink
        document={
          <ReportPdf
            site={domain}
            result={result}
            scannedAt={new Date().toISOString()}
          />
        }
        fileName={`WebTriage-report-${domain}.pdf`}
      >
        {({ loading }) =>
          loading
            ? <span>Preparing…</span>
            : <button className={styles.serviceButton}>Download Full Report</button>
        }
      </PDFDownloadLink>

      {/* Services */}
      <section className={styles.nextSteps}>
        <h3 className={styles.nextStepsTitle}>Our Services</h3>
        <p className={styles.nextStepsIntro}>
          Choose the service that fits your goals:
        </p>
        <div className={styles.servicesGrid}>
          {services.map(svc => (
            <div key={svc.name} className={styles.serviceCard}>
              <div className={styles.servicePriceBadge}>{svc.price}</div>
              <h4 className={styles.serviceTitle}>{svc.name}</h4>
              <p className={styles.serviceDesc}>{svc.desc}</p>
              <button
                className={styles.serviceButton}
                onClick={() => onSelectService(svc.name)}
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
export default function ScanPage() {
  const [domain, setDomain]       = useState('');
  const [email, setEmail]         = useState('');
  const [phase, setPhase]         = useState<ScanPhase>('form');
  const [scanId, setScanId]       = useState<number | null>(null);
  const [result, setResult]       = useState<PSIResult | null>(null);
  const [logs, setLogs]           = useState<string[]>([]);
  const [elapsed, setElapsed]     = useState(0);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // ─── startScan ───────────────────────────────────────────────
  const startScan = async () => {
    setPhase('pending');
    setLogs([]);
    setElapsed(0);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site: domain, email }),
      });
      if (!res.ok) {
        const payload = await res.json();
        alert(isErrorPayload(payload) ? payload.error : 'Scan request failed');
        setPhase('form');
        return;
      }
      const data = await res.json();
      if (isScanResponse(data)) setScanId(data.scanId);
      else {
        alert('Unexpected response from server');
        setPhase('form');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
      setPhase('form');
    }
  };

  // ─── Polling ────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'pending' || scanId == null) return;
    const iv = setInterval(async () => {
      try {
        const payload = (await fetch(`/api/scan/status/${scanId}`)
          .then(r => r.json())) as {
            status: string;
            result?: PSIResult;
            logs: string[];
          };
        setLogs(payload.logs);
        if (payload.status === 'done' && payload.result) {
          clearInterval(iv);
          setResult(payload.result);
          setPhase('results');
          toast.success('🎉 Report is ready!');
        }
      } catch {
        // swallow
      }
    }, 3000);
    return () => clearInterval(iv);
  }, [phase, scanId]);

  // ─── Timer ─────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'pending') return;
    const start = Date.now();
    const iv = setInterval(() => setElapsed(Date.now() - start), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  return (
    <div className={styles.page}>
      {/* 1) Form */}
      {phase === 'form' && (
        <ScanForm
          domain={domain}
          email={email}
          setDomain={setDomain}
          setEmail={setEmail}
          onStart={startScan}
        />
      )}

      {/* 2) Pending & Results */}
      <AnimatePresence initial={false} mode="wait">
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
            onSelectService={setSelectedService}
          />
        )}
      </AnimatePresence>

      {/* 3) Booking Modal */}
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
