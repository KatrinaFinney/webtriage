// File: src/app/components/MetricCard.tsx
'use client';

import React from 'react';
import styles from '../styles/ScanPage.module.css';

import type { MetricKey } from '@/types/webVitals';
import { metricConfigs }  from '@/lib/scanMetrics';
import { formatValue }    from '@/lib/scanMetrics';
import { diagnosisFor }   from '@/lib/scanMetrics';
import { statusClass }    from '@/lib/scanHelpers';

interface Props {
  id:    MetricKey;
  score: number;  // 0–100
  value: number;  // raw numeric metric value
}

const MetricCard: React.FC<Props> = ({ id, score, value }) => {
  // find the config for this metric
  const cfg = metricConfigs.find(m => m.id === id)!;
  const display = `${formatValue(id, value)}${cfg.unit}`;
  const narrative = diagnosisFor(id, score);

  // pick a badge class based on the score
  const badgeClass = statusClass(score);

  return (
    <div className={styles.auditCard}>
      {/* Score badge */}
      <span className={`${styles.statusBadge} ${styles[badgeClass]}`}>
        {score}/100
      </span>

      {/* Title + subtitle */}
      <header className={styles.auditHeader}>
        <h4 className={styles.auditTitle}>{cfg.title}</h4>
        <span className={styles.auditSubtitle}>{cfg.blurb}</span>
      </header>

      {/* Numeric value */}
      <div className={styles.auditValue}>{display}</div>

      {/* Diagnostic narrative */}
      <p className={styles.reportParagraph}>{narrative}</p>
    </div>
  );
};

export default MetricCard;
