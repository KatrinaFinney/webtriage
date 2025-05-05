/* ------------------------------------------------------------------
   MetricCard – card for a single Lighthouse metric
-------------------------------------------------------------------*/
'use client';

import React            from 'react';
import styles           from '../styles/ScanPage.module.css';

import type { MetricKey }   from '@/types/webVitals';
import { vitalLabels }      from '../../lib/vitalLabels';
import { formatValue , diagnosisFor }      from '../../lib/scanMetrics';
import { statusClass }      from '../../lib/scanHelpers';

interface Props {
  id:       MetricKey;
  pctScore: number;
  rawValue: string | undefined;
  title:     string;   
  blurb:     string;
}

const MetricCard: React.FC<Props> = ({ id, pctScore, rawValue }) => {
  const { title, blurb } = vitalLabels[id];
  const badgeClass       = styles[statusClass(pctScore)];
  const niceValue        = rawValue ? formatValue(id, +rawValue) : '—';

  return (
    <div className={styles.auditCard}>
      <span className={`${styles.statusBadge} ${badgeClass}`}>{pctScore}/100</span>

      <header className={styles.auditHeader}>
        <h4 className={styles.auditTitle}>{title}</h4>
        <span className={styles.auditSubtitle}>{blurb}</span>
      </header>

      <div className={styles.auditValue}>{niceValue}</div>
      <p className={styles.reportParagraph}>{diagnosisFor(id)}</p>
    </div>
  );
};

export default MetricCard;
