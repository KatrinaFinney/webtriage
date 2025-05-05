// src/app/scan/ScanResults.tsx
// ---------------------------------------------------------------
'use client';

import React              from 'react';
import Image              from 'next/image';

import styles             from '../styles/ScanPage.module.css';
import MetricCard         from '@/app/components/MetricCard';
import { buildServiceRecs }        from '@/lib/services';
import { buildHeroSummary }        from '@/lib/scanHelpers';
import { vitalLabels }             from '@/lib/vitalLabels';
import { categoryLabels }          from '@/lib/scanMetrics';
import { formatValue }             from '@/lib/scanMetrics';
import type { PSIResult, MetricKey } from '@/types/webVitals';


// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------
const vitalKeys = Object.keys(vitalLabels) as MetricKey[];

interface Props {
  domain:   string;
  result:   PSIResult;
  onRerun:  () => void;
}

const ScanResults: React.FC<Props> = ({ domain, result, onRerun }) => {
  const audits     = result.audits ?? {};
  const filmData   = audits['final-screenshot']?.details?.data as string | undefined;
  const services   = buildServiceRecs(result.categories);

  // -------------------------------------------------------------
  // Render
  // -------------------------------------------------------------
  return (
    <div className={styles.resultsContainer}>
      {/* ── Heading ────────────────────────────────────────────── */}
      <h2 className={styles.resultTitle}>
        Vital&nbsp;Signs for <span className={styles.resultDomain}>{domain}</span>
      </h2>
      <p className={styles.overview}>
        Your one‑page triage snapshot — clear&nbsp;vitals, clear&nbsp;priorities, all in under a&nbsp;minute.
      </p>

      {/* ── Hero summary ──────────────────────────────────────── */}
      <div className={styles.heroSummary}>
        <h3 className={styles.heroHeading}>Vitals Summary</h3>
        <p>{buildHeroSummary(result.categories)}</p>
      </div>

      {/* ── Instant preview (boxed) ───────────────────────────── */}
      {filmData && (
        <div className={styles.previewBox}>
          <Image
            src={filmData}
            alt="Instant preview"
            width={640}
            height={360}
            className={styles.previewImg}
            unoptimized
            priority
          />
        </div>
      )}

      {/* ── Category score cards ─────────────────────────────── */}
      <div className={styles.grid}>
        {Object.entries(result.categories).map(([key, { score }]) => (
          <div key={key} className={styles.card}>
            <div className={styles.cardLabel}>{categoryLabels[key as keyof typeof categoryLabels]}</div>
            <div className={styles.cardScore}>{Math.round(score * 100)}/100</div>
          </div>
        ))}
      </div>

      {/* ── Key check‑ups section ────────────────────────────── */}
      <h3 className={styles.subheading}>Key Check‑ups&nbsp;& Advice</h3>
      <p className={styles.sectionIntro}>
        Five clinical metrics – each with your personalised diagnosis & quick‑win prescription.
      </p>

      <div className={styles.auditGrid}>
        {vitalKeys.map(id => {
          const audit     = audits[id] ?? { displayValue: '0', score: 0 };
          const rawString = audit.displayValue as string | undefined;
          const numeric   = rawString ? parseFloat(rawString.replace(/[^\d.]/g, '')) : 0;
          const value     = rawString ? formatValue(id, numeric) : 'N/A';
          const pct       = audit.score ? Math.round(audit.score * 100) : 0;
          const { title, blurb } = vitalLabels[id];

          return (
            <MetricCard
              key={id} 
              id={id}
              title={title}
              blurb={blurb}
              rawValue={value}
              pctScore={pct}
            />
          );
        })}
      </div>

      {/* ── Services / Next Steps ─────────────────────────────── */}
      <section className={styles.nextSteps}>
        <h3 className={styles.nextStepsTitle}>Next Steps</h3>
        <p className={styles.nextStepsIntro}>
          Based on today’s vitals, we recommend starting with the plans below. Pick the care option that
          matches your goals — or explore the full catalogue.
        </p>

        <div className={styles.servicesGrid}>
          {services.map(svc => (
            <div key={svc.slug} className={styles.serviceCard}>
              <span className={styles.servicePriceBadge}>{svc.price}</span>
              <h4 className={styles.serviceTitle}>{svc.title}</h4>
              <p className={styles.serviceDesc}>{svc.summary}</p>
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
            Ready for a deeper diagnosis? Book a full‑site Triage or hand the stethoscope
            to our Continuous Care team and relax while we keep every vital in the green.
          </p>
          <button
            className={styles.fullTriageButton}
            onClick={() => (window.location.href = '/order?service=Site%20Triage')}
          >
            Begin Site Treatment
          </button>
        </div>
      </section>

      {/* ── Rerun button ─────────────────────────────────────── */}
      <button className={styles.rerunFloating} onClick={onRerun}>
        Scan another site
      </button>
    </div>
  );
};

export default ScanResults;
