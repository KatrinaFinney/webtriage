// File: src/app/components/ScanReportEmail.tsx
'use client';
import React from 'react';
import type { PSIResult } from '@/types/webVitals';
import { buildHeroSummary } from '@/lib/scanHelpers';
import { buildServiceRecs }  from '@/lib/services';

export default function ScanReportEmail({
  site,
  result,
}: {
  site:   string;
  result: PSIResult;
}) {
  const hero     = buildHeroSummary(result.categories);
  const services = buildServiceRecs(result.categories);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#333' }}>
      <h1>Your WebTriage Report for {site}</h1>
      <p>{hero}</p>
      <h2>Recommended Next Steps</h2>
      <ul>
        {services.map(s => (
          <li key={s.slug}>
            <a href={s.link}>{s.title}</a> — {s.summary}
          </li>
        ))}
      </ul>
    </div>
  );
}
