'use client';

import React, { useEffect, useState, useMemo } from 'react';
import styles from '../styles/ScanPage.module.css';
import Button from '../components/Button';
import PricingSection from '../components/PricingSection';

import type { PSIResult, CategoryKey } from '@/types/webVitals';
import { buildConversationalSummary as buildHeroSummary } from '@/lib/scanHelpers';
import { metricsConfig } from '@/lib/metricsConfig';
import {
  formatValue,
  diagnosisFor,
  categorySummaries,
} from '@/lib/scanMetrics';
import { statusClass } from '@/lib/scanHelpers';

interface Props {
  domain:    string;
  result:    PSIResult;
  scannedAt: string;
  onRerun:   () => void;
}

export default function ScanResults({
  domain,
  result,
  scannedAt,
  onRerun,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Full localized timestamp for hover
  const fullDate = useMemo(() => {
    try {
      return new Date(scannedAt).toLocaleString(undefined, {
        dateStyle:    'medium',
        timeStyle:    'short',
        timeZoneName: 'short',
      });
    } catch {
      return scannedAt;
    }
  }, [scannedAt]);

  // Relative “time ago”
  const timeAgo = useMemo(() => {
    try {
      const dt      = new Date(scannedAt);
      const diffSec = Math.round((Date.now() - dt.getTime()) / 1000);
      const rtf     = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
      const thresholds: [Intl.RelativeTimeFormatUnit, number][] = [
        ['year',   3600 * 24 * 365],
        ['month',  3600 * 24 * 30],
        ['day',    3600 * 24],
        ['hour',   3600],
        ['minute', 60],
        ['second', 1],
      ];
      for (const [unit, secs] of thresholds) {
        if (Math.abs(diffSec) >= secs) {
          const val = Math.round(-diffSec / secs);
          return rtf.format(val, unit);
        }
      }
      return 'just now';
    } catch {
      return '';
    }
  }, [scannedAt]);

  const screenshot  = result.screenshots?.[0] ?? null;
  const categories  = result.categories;
  const safeMetrics = result.metrics ?? {};

  // 4-sentence summary
  const summaryText = buildHeroSummary(categories);

  return (
    <div className={styles.dashboardContainer}>
      {/* Header + time-ago */}
      <div className={styles.glassCard}>
        <h2 className={`${styles.resultTitle} ${styles.centerText}`}>
          Website Check-up for{' '}
          <span className={styles.resultDomain}>{domain}</span>
        </h2>
        <p className={styles.centerText}>
          <time
            className={styles.timeAgo}
            dateTime={scannedAt}
            title={fullDate}
          >
            Scanned {timeAgo}
          </time>
        </p>
      </div>

      {/* Screenshot Preview */}
      {screenshot && (
       <div className={`${styles.glassCard} ${styles.previewBox}`}>
         <div className={styles.previewWrapper}>
         <img
           src={screenshot}
            alt="Site screenshot"
            className={styles.previewImg}
        />
         </div>
       </div>
     )}


      {/* Website Health Snapshot */}
      <div className={`${styles.glassCard} ${styles.heroSummarySection}`}>
        <h3 className={`${styles.sectionHeader} ${styles.centerText}`}>
          Website Health Snapshot
        </h3>
        <p className={styles.heroSummary}>{summaryText}</p>
      </div>

      {/* Vital Stats */}
      <div className={`${styles.glassCard} ${styles.dashboardSection}`}>
        <h3 className={`${styles.sectionHeader} ${styles.centerText}`}>
          Vital Stats
        </h3>
        <div className={styles.dashboardGrid}>
          {Object.entries(categories)
            .filter(([key]) => key !== 'mobile-friendly')
            .map(([key, { score }], i) => {
              const catKey = key as CategoryKey;
              const pct    = Math.round(score * 100);
              return (
                <div
                  key={key}
                  className={`${styles.dashboardCard} ${
                    mounted ? styles.fadeInUp : ''
                  }`}
                  style={{ animationDelay: `${i * 100}ms` }}
                  title={`Lighthouse category: ${catKey}`}
                >
                  <h4 className={styles.centerText}>
                    {catKey.charAt(0).toUpperCase() + catKey.slice(1)}
                  </h4>
                  <p className={styles.centerText}>
                    <strong>{pct}/100</strong>
                  </p>
                  <p className={styles.vitalExplanation}>
                    <em>{categorySummaries[catKey]}</em>
                  </p>
                </div>
              );
            })}
        </div>
      </div>

      {/* Key Vitals */}
      <div className={`${styles.glassCard} ${styles.dashboardSection}`}>
        <h3 className={`${styles.sectionHeader} ${styles.centerText}`}>
          Key Vitals
        </h3>
        <p className={styles.keyVitalsIntro}>
          <strong>These core metrics drive user experience.</strong>{' '}
          Hover the info icon <span className={styles.tooltipWrapper}>ⓘ
            <span className={styles.tooltipText}>
              Raw Lighthouse metric ID
            </span>
          </span> to see its internal ID.
        </p>
        <div className={styles.dashboardGrid}>
          {metricsConfig
            .filter(({ id }) => {
              const m = safeMetrics[id];
              return m?.value !== 0 || Math.round((m?.score ?? 0) * 100) !== 0;
            })
            .map((cfg, i) => {
              const { id, title, staticDesc, unit } = cfg;
              const metric = safeMetrics[id] ?? { score: 0, value: 0, unit: '' };
              // guard for both 0–1 and 0–100 inputs
              const raw = metric.score;
              const pct = raw > 1 ? Math.round(raw) : Math.round(raw * 100);

              return (
                <div
                  key={id}
                  className={`${styles.metricCard} ${styles.centerText} ${
                    styles[statusClass(metric.score)]
                  } ${mounted ? styles.fadeInUp : ''}`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <h4 className={styles.metricTitle}>
                    {title}{' '}
                    <span className={styles.tooltipWrapper}>ⓘ
                      <span className={styles.tooltipText}>
                        Lighthouse metric ID: {id}
                      </span>
                    </span>
                  </h4>

                  <p className={styles.metricValue}>
                    {formatValue(id, metric.value)}
                    {unit}
                  </p>

                  <div
                    className={styles.radial}
                    style={{ '--pct': `${pct}` } as React.CSSProperties}
                    aria-label={`Score: ${pct}%`}
                  >
                    {pct}%
                  </div>
                  <p className={styles.metricScoreLabel}>Score</p>

                  <p className={styles.metricNarrative}>
                    <strong>
                      {diagnosisFor(id, metric.score).split(' ')[0]}
                    </strong>{' '}
                    {diagnosisFor(id, metric.score)
                      .split(' ')
                      .slice(1)
                      .join(' ')}
                  </p>
                  <p className={styles.metricDesc}>
                    <em>{staticDesc}</em>
                  </p>
                </div>
              );
            })}
        </div>
      </div>

      {/* First Aid */}
      <div className={styles.glassCard}>
        <PricingSection />
      </div>

      {/* Scan Another Site */}
      <div style={{ textAlign: 'center', margin: '2rem 0' }}>
        <Button className={styles.darkButton} onClick={onRerun}>
          Scan Another Site
        </Button>
      </div>
    </div>
  );
}
