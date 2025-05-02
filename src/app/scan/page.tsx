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
type MetricKey = keyof typeof metricAdvicePools;
type PSIResult = {
  categories: Record<CategoryKey, { score: number }>;
  audits: Record<string, { displayValue: string; details?: { data: string } }>;
};

type ScanPhase = 'form' | 'pending' | 'results';
const ETA_MS = 60 * 1000;

// ─── Hero summary helper (triage tone) ───────────────────────────────────
function buildHeroSummary(
  categories: Record<'performance'|'accessibility'|'seo', { score: number }>
): string {
  const p = Math.round(categories.performance.score * 100);
  const a = Math.round(categories.accessibility.score * 100);
  const s = Math.round(categories.seo.score * 100);
  const lines: string[] = [];

  // Perfusion → Performance
  if (p < 70) {
    lines.push(
      `💔 Perfusion ${p}/100 is critical—our first step is stabilizing core functions.`
    );
  } else if (p < 90) {
    lines.push(
      `💉 Perfusion ${p}/100 is improving—next, we’ll optimize to full recovery.`
    );
  } else {
    lines.push(
      `💪 Perfusion ${p}/100 is strong—your site’s vital signs are excellent.`
    );
  }

  // Mobility → Accessibility
  if (a < 70) {
    lines.push(
      `🏥 Mobility ${a}/100 is limited—let’s ensure every visitor can move freely.`
    );
  } else {
    lines.push(
      `🤝 Mobility ${a}/100 is good—your site welcomes all patients.`
    );
  }

  // Visibility → SEO
  if (s < 70) {
    lines.push(
      `🔦 Visibility ${s}/100 is low—we’ll prescribe a treatment plan to boost reach.`
    );
  } else {
    lines.push(
      `🌟 Visibility ${s}/100 is high—your site is easily found by search.`
    );
  }

  return lines.join(' ');
}

// ─── Scan Form ────────────────────────────────────────────────────
interface ScanFormProps {
  domain: string;
  email: string;
  setDomain: React.Dispatch<React.SetStateAction<string>>;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  onStart: () => Promise<void>;
}
const ScanForm: React.FC<ScanFormProps> = ({
  domain,
  email,
  setDomain,
  setEmail,
  onStart,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={styles.formContainer}
  >
    <h1 className={styles.title}>Let’s Scan Your Site</h1>
    <p className={styles.subtext}>
      Enter your URL & email below. We’ll email you the full report.
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
        onChange={e => setDomain(e.target.value)}
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
        onChange={e => setEmail(e.target.value)}
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
      onClick={onStart}
      disabled={!domain || !email}
    >
      Run Scan
    </motion.button>
  </motion.div>
);

// ─── Pending State ───────────────────────────────────────────────
interface ScanPendingProps {
  elapsed: number;
  logs: string[];
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
      animate={{ rotate: 360, opacity: [0.5, 0.2, 0.5], scale: [1, 1.2, 1] }}
      transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
    >
      <ScanLoader />
    </motion.div>

    <p className={styles.runningText}>
      Hang tight—your site’s health check is running…<br />
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

    {logs.length > 0 && (
      <pre className={styles.debug}>{logs.join('')}</pre>
    )}
  </motion.div>
);
// ─── Results State ────────────────────────────────────────────────
interface ScanResultsProps {
  domain: string;
  result: PSIResult;
}
const ScanResults: React.FC<ScanResultsProps> = ({ domain, result }) => {
  const entries = Object.entries(result.categories) as Array<
    [CategoryKey, { score: number }]
  >;
  const metricKeys = Object.keys(metricAdvicePools) as MetricKey[];
  const services: Service[] = buildServiceRecs(result.categories);
  const [selectedService, setSelectedService] =
    useState<string | null>(null);

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.resultsContainer}
    >
      <h2 className={styles.resultTitle}>
        Vital Signs for{' '}
        <span className={styles.resultDomain}>{domain}</span>
      </h2>
      <p className={styles.overview}>A quick, one-page health check.</p>

      {/* “Scan Again” button immediately below summary */}
      <button
        className={styles.rerunButton}
        onClick={() => window.location.reload()}
      >
        Scan Another Site
      </button>

      <div className={styles.heroSummary}>
      {buildHeroSummary(result.categories)}
      </div>


      {/* instant-preview filmstrip */}
      <div className={styles.filmstripContainer}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {result.audits['final-screenshot']?.details?.data && (
          <>
            <img
              src={result.audits['final-screenshot'].details.data}
              alt="Final render of your page"
              className={styles.filmstripThumb}
            />
            <button
              className={styles.deepLink}
              onClick={() => toast('Generating full filmstrip…')}
            >
              View Full Filmstrip & Trace
            </button>
          </>
        )}
      </div>

      {/* top-level category cards */}
      <div className={styles.grid}>
        {entries.map(([key, { score }]) => {
          const pct = Math.round(score * 100);
          return (
            <div key={key} className={styles.card}>
              <div className={styles.cardLabel}>
                {/* you can replace these with your branded copy */}
                {categoryLabels[key]}
              </div>
              <div className={styles.cardScore}>
                <strong>{pct}/100</strong>
              </div>
              <p className={styles.cardSummary}>
                {categorySummaries[key]}
              </p>
              {pct < 90 && (
                <button
                  className={styles.upsellButton}
                  onClick={() =>
                    setSelectedService(
                      `Emergency Fix: ${categoryLabels[key]}`
                    )
                  }
                >
                  Need help boosting {categoryLabels[key]}?
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* detailed audits */}
      <h3 className={styles.subheading}>Key Checkups & Advice</h3>
      <p className={styles.sectionIntro}>
        Four critical, business-focused checkups—with actionable tips.
      </p>
      <p className={styles.legend}>Hover ℹ️ for more info.</p>

      <div className={styles.auditGrid}>
        {metricKeys.map(id => {
          const raw = result.audits[id]?.displayValue ?? 'N/A';
          const val = formatValue(id, raw);
          const tipList = metricAdvicePools[id];
          const tip =
            tipList[Math.floor(Math.random() * tipList.length)];
          return (
            <div key={id} className={styles.auditCard}>
              <header className={styles.auditHeader}>
                <h4 className={styles.auditTitle}>
                  {/* swap in your branded label here */}
                  {id}
                  <span className={styles.tooltip}>
                    ℹ️
                    <span className={styles.tooltipText}>
                      {metricSummaries[id]}
                    </span>
                  </span>
                </h4>
              </header>
              <div className={styles.auditValue}>
                <strong>{val}</strong>
              </div>
              <p className={styles.reportParagraph}>
                {/* friendly narratives */}
                {id === 'total-blocking-time'
                  ? `With ${val} of blocking time, your page stays responsive.`
                  : id === 'cumulative-layout-shift'
                  ? `A CLS of ${val} means your layout is stable.`
                  : `First paint in ${val}—your users see something quickly.`}
              </p>
              <div className={styles.auditSuggestion}>
                <span className={styles.suggestionLabel}>Tip:</span>
                <p className={styles.suggestionText}>{tip}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* PDF download */}
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
          loading ? (
            <span>Preparing…</span>
          ) : (
            <button className={styles.downloadButton}>
              Download Full Report
            </button>
          )
        }
      </PDFDownloadLink>

      {/* services & modal */}
      <section className={styles.nextSteps}>
        <h3 className={styles.nextStepsTitle}>
          Ready to Level Up?
        </h3>
        <div className={styles.servicesGrid}>
          {services.map(svc => (
            <div key={svc.name} className={styles.serviceCard}>
              <div className={styles.servicePriceBadge}>
                {svc.price}
              </div>
              <h4 className={styles.serviceTitle}>
                {svc.name}
              </h4>
              <p className={styles.serviceDesc}>
                {svc.desc}
              </p>
              <button
                className={styles.serviceButton}
                onClick={() =>
                  setSelectedService(svc.name)
                }
              >
                {svc.cta}
              </button>
            </div>
          ))}
        </div>

        <div className={styles.fullTriageBanner}>
          <p>
            Start the journey to website wellness with an extensive
            site triage and prescription—or entrust us to nurse
            your site back to perfect health.
          </p>
          <button
            className={styles.fullTriageButton}
            onClick={() =>
              setSelectedService('Full Recovery Plan')
            }
          >
            Begin Site Treatment
          </button>
        </div>
      </section>

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
  const [elapsed, setElapsed] = useState(0);

  // ─── Type-guards (no `any`) ───────────────────────────────
  function isErrorPayload(
    obj: unknown
  ): obj is { error: string } {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'error' in obj &&
      typeof (obj as Record<string,unknown>).error === 'string'
    );
  }
  function isScanResponse(
    obj: unknown
  ): obj is { scanId: number } {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'scanId' in obj &&
      typeof (obj as Record<string,unknown>).scanId === 'number'
    );
  }

  // ─── Kick off scan ──────────────────────────────────────────
  const startScan = async () => {
    setPhase('pending');
    setLogs([]);
    setElapsed(0);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ site: domain, email }),
      });

      if (!res.ok) {
        const payload: unknown = await res.json();
        alert(
          isErrorPayload(payload)
            ? payload.error
            : 'Scan request failed'
        );
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
    } catch (err) {
      alert(
        err instanceof Error ? err.message : 'Network error'
      );
      setPhase('form');
    }
  };

  // ─── Polling ────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'pending' || scanId == null) return;
    const iv = setInterval(async () => {
      try {
        const payload = (await fetch(
          `/api/scan/status/${scanId}`
        ).then(r => r.json())) as {
          status: string;
          result?: PSIResult;
          logs: string[];
        };
        setLogs(payload.logs);
        if (payload.status === 'done' && payload.result) {
          clearInterval(iv);
          setResult(payload.result);
          setPhase('results');
          toast.success('📧 Report emailed!');
        }
      } catch {
        /* swallow */
      }
    }, 3000);
    return () => clearInterval(iv);
  }, [phase, scanId]);

  // ─── Timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'pending') return;
    const start = Date.now();
    const iv = setInterval(
      () => setElapsed(Date.now() - start),
      1000
    );
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
          <ScanPending
            elapsed={elapsed}
            logs={logs}
            key="pending"
          />
        )}
        {phase === 'results' && result && (
          <ScanResults
            domain={domain}
            result={result}
            key="results"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
