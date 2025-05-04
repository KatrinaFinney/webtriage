// src/app/scan/ScanResults.tsx
// ──────────────────────────────────────────────────────────────────
'use client';

import React from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';

import styles           from '../styles/ScanPage.module.css';
import MetricCard       from '../components/MetricCard';
import { buildServiceRecs, Service } from '@/lib/services';
import { buildHeroSummary } from '@/app/lib/scanHelpers';
import type { PSIResult }   from '@/types/webVitals';

// ── Map Lighthouse keys to nice titles ─────────────────────────────
const vitalTitles = {
  'first-contentful-paint'   : 'First View',
  'largest-contentful-paint' : 'Largest View',
  'speed-index'              : 'Speed Index',
  'total-blocking-time'      : 'Blocking Time',
  'cumulative-layout-shift'  : 'Layout Shift',
} as const;
const vitalKeys = Object.keys(vitalTitles) as Array<keyof typeof vitalTitles>;

interface Props {
  domain:  string;
  result:  PSIResult;
  heroCopy:  React.ReactNode;
  services:  Service[];
  onRerun: () => void;
}

const ScanResults: React.FC<Props> = ({ domain, result, onRerun }) => {
  // ── Derive a local audits map with a safe fallback ───────────────
  const audits = result.audits ?? {};
  // ── Pull out any “instant preview” data, cast to string if present ─
  const filmData = audits['final-screenshot']?.details?.data as string | undefined;

  // ── Sort & render service recommendations ────────────────────────
  const services = buildServiceRecs(result.categories);

  return (
    <div className={styles.resultsContainer}>
      {/* ——— Heading ——————————————————————————————————————— */}
      <h2 className={styles.resultTitle}>
        Vital Signs for <span className={styles.resultDomain}>{domain}</span>
      </h2>
      <p className={styles.overview}>A quick, one-page health check.</p>

      {/* ——— Hero summary ——————————————————————————————— */}
      <div className={styles.heroSummary}>
        {buildHeroSummary(result.categories)}
      </div>

      {/* ——— Instant preview ————————————————————————————— */}
      {filmData && (
        <div className={styles.filmstripContainer}>
          <Image
            src={filmData}
            alt="Instant preview"
            width={640}
            height={360}
            className={styles.filmstripThumb}
            unoptimized
            priority
          />
          <button
            className={styles.deepLink}
            onClick={() => toast('Generating full filmstrip…')}
          >
            View full filmstrip & trace
          </button>
        </div>
      )}

      {/* ——— Top-level categories —————————————————————————— */}
      <div className={styles.grid}>
        {Object.entries(result.categories).map(([key, { score }]) => (
          <div key={key} className={styles.card}>
            <div className={styles.cardLabel}>{key.toUpperCase()}</div>
            <div className={styles.cardScore}>{Math.round(score * 100)}/100</div>
            <p className={styles.cardSummary}>
              {/* you can insert categorySummaries[key] if you import it */}
            </p>
          </div>
        ))}
      </div>

      {/* ——— Key check-ups & advice ——————————————————————— */}
      <h3 className={styles.subheading}>Key Check-ups & Advice</h3>
      <p className={styles.sectionIntro}>
        Five clinical metrics – each with your diagnosis + prescription.
      </p>
      <div className={styles.auditGrid}>
        {vitalKeys.map(v => {
          const a        = audits[v] ?? { displayValue: 'N/A', score: 0 };
          const rawValue = a.displayValue;
          const pctScore = a.score ? Math.round(a.score * 100) : 0;

          return (
            <MetricCard
              key={v}
              vital={v}                // <-- was `vital`, now `id`
              rawValue={rawValue}
              pctScore={pctScore}
              title={vitalTitles[v]}
            />
          );
        })}
      </div>

      {/* ——— Services / upsell ————————————————————————————— */}
      <section className={styles.nextSteps}>
        <h3 className={styles.nextStepsTitle}>Next Steps</h3>
        <p className={styles.nextStepsIntro}>
          Choose the treatment plan that matches your goals.
        </p>
        <div className={styles.servicesGrid}>
          {services.map(svc => (
            <div key={svc.name} className={styles.serviceCard}>
              <span className={styles.servicePriceBadge}>{svc.price}</span>
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
        <div className={styles.fullTriageBanner}>
          <p>
            Need intensive care? Book a full-site triage & recovery-plan prescription —
            or hand us the stethoscope and we’ll nurse your site back to perfect health.
          </p>
          <button
            className={styles.fullTriageButton}
            onClick={() =>
              (window.location.href = '/order?service=Full%20Recovery%20Plan')
            }
          >
            Begin Site Treatment
          </button>
        </div>
      </section>

      {/* ——— Rerun button ————————————————————————————————— */}
      <button
        className={styles.rerunFloating}
        onClick={onRerun}
      >
        Scan another site
      </button>
    </div>
  );
};

export default ScanResults;
