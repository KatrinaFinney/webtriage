import React from 'react';
import { } from '@/types/webVitals';
import {  diagnosisFor }  from '@/app/lib/scanMetrics';
import type { MetricKey } from '@/types/webVitals';

/* -------- props ------------------------------------------------ */
interface Props {
  vital:     MetricKey;        // we stay with “vital”
  rawValue?: string;           // ←  add this line
  pctScore:  number;
  title:     string;
}

/* -------- component ------------------------------------------- */
const MetricCard: React.FC<Props> = ({
  vital,
  rawValue,
  pctScore,
  title,
}) => {
  return (
    <div className="auditCard">
      <header className="auditHeader">
        <h4 className="auditTitle">{title}</h4>
        <span className="statusBadge">
          {pctScore >= 90 ? 'Excellent'
            : pctScore >= 75 ? 'Good'
            : pctScore >= 50 ? 'Fair'
            : 'Poor'}
        </span>
      </header>

      <div className="auditValue">
        {rawValue ?? 'N/A'}
      </div>

      <p className="reportParagraph">
        {diagnosisFor(vital)}
      </p>
    </div>
  );
};

export default MetricCard;
