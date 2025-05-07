// File: src/app/scan/ScanResults.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import styles from '../styles/ScanPage.module.css';
import Button from '../components/Button';

import type { PSIResult, CategoryKey } from '@/types/webVitals';
import { buildServiceRecs }            from '@/lib/services';
import { buildConversationalSummary as buildHeroSummary } from '@/lib/scanHelpers';

import { metricsConfig }  from '@/lib/metricsConfig';
import {
  formatValue,
  diagnosisFor,
  categoryLabels,
  categorySummaries,
} from '@/lib/scanMetrics';

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
  const services = buildServiceRecs(result.categories);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Format date/time
  const formattedDate = useMemo(() => {
    try {
      return new Date(scannedAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return scannedAt;
    }
  }, [scannedAt]);

  // Screenshot from normalized result
  const screenshot = result.screenshots?.[0] ?? null;
  const safeMetrics = result.metrics ?? {};

  return (
    <div className={styles.dashboardContainer}>
      {/* Header */}
      <div className={styles.glassCard}>
        <h2 className={`${styles.resultTitle} ${styles.centerText}`}>
          First Aid Scan for{' '}
          <span className={styles.resultDomain}>{domain}</span>
        </h2>
        <p className={`${styles.scanDate} ${styles.centerText}`}>
          Scanned on: {formattedDate}
        </p>
      </div>

      {/* Screenshot Preview */}
      {screenshot && (
        <div className={`${styles.glassCard} ${styles.previewBox}`}>
          <Image
            src={screenshot}
            alt="Site screenshot"
            width={640}
            height={360}
            className={styles.previewImg}
            unoptimized
            priority
          />
        </div>
      )}

      {/* Vital Stats */}
      <div className={`${styles.glassCard} ${styles.dashboardSection}`}>
        <h3
          className={`${styles.sectionHeader} ${styles.centerText}`}
        >
          Vital Stats
        </h3>
        <div className={styles.dashboardGrid}>
          {Object.entries(result.categories).map(
            ([key, { score }], i) => {
              const pct = Math.round(score * 100);
              const catKey = key as CategoryKey;
              return (
                <div
                  key={key}
                  className={`${styles.dashboardCard} ${
                    mounted ? styles.fadeInUp : ''
                  }`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <h4 className={styles.centerText}>
                    {categoryLabels[catKey]}
                  </h4>
                  <p className={styles.centerText}>
                    <strong>{pct}/100</strong>
                  </p>
                  <p className={styles.vitalExplanation}>
                    {categorySummaries[catKey]}
                  </p>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Website Health Snapshot */}
      <div
        className={`${styles.glassCard} ${styles.heroSummarySection}`}
      >
        <h3
          className={`${styles.sectionHeader} ${styles.centerText}`}
        >
          Website Health Snapshot
        </h3>
        <p className={styles.heroSummary}>
          {buildHeroSummary(result.categories)}
        </p>
      </div>

      {/* Key Vitals */}
      <div className={`${styles.glassCard} ${styles.dashboardSection}`}>
        <h3
          className={`${styles.sectionHeader} ${styles.centerText}`}
        >
          Key Vitals
        </h3>
        <div
          className={styles.dashboardGrid}
          style={{ justifyItems: 'center' }}
        >
          {metricsConfig.map((m, i) => {
            const { id, title, staticDesc, unit } = m;
            const metric = safeMetrics[id] ?? {
              value: 0,
              score: 0,
              unit,
            };
            return (
              <div
                key={id}
                className={`${styles.dashboardCard} ${
                  mounted ? styles.fadeInUp : ''
                }`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <h4 className={styles.centerText}>
                  {title}
                </h4>
                <p
                  className={styles.centerText}
                  style={{ color: '#94a3b8' }}
                >
                  {staticDesc}
                </p>
                <p className={styles.centerText}>
                  <strong>
                    {formatValue(id, metric.value)}
                    {unit}
                  </strong>
                </p>
                <div className={styles.progressBar} hidden />
                <p className={styles.centerText}>
                  {Math.round(metric.score)}%
                </p>
                <p className={styles.reportParagraph}>
                  {diagnosisFor(id, metric.score)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Steps */}
      <div className={`${styles.glassCard} ${styles.dashboardSection}`}>
        <h3
          className={`${styles.nextStepsTitle} ${styles.centerText}`}
        >
          Next Steps
        </h3>
        <div className={styles.servicesGrid}>
          {services.map((svc) => (
            <div key={svc.slug} className={styles.serviceCard}>
              <span
                className={styles.servicePriceBadge}
              >
                {svc.price}
              </span>
              <h4 className={styles.serviceTitle}>
                {svc.title}
              </h4>
              <p className={styles.serviceDesc}>
                {svc.summary}
              </p>
              <Button
                className={styles.serviceButton}
                onClick={() => (window.location.href = svc.link)}
              >
                {svc.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Scan Another Site */}
      <div style={{ textAlign: 'center', margin: '2rem 0' }}>
        <Button
          className={styles.darkButton}
          onClick={onRerun}
        >
          Scan Another Site
        </Button>
      </div>
    </div>
  );
}
