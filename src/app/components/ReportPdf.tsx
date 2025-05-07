// File: src/app/components/ReportPdf.tsx

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { PSIResult, MetricKey } from '@/types/webVitals';
import { formatValue } from '@/lib/scanMetrics';
import { metricAdvicePools } from '@/app/api/scan/types'
import { buildHeroSummary }       from '@/lib/scanHelpers';

interface ReportPdfProps {
  site:      string;
  result:    PSIResult;
  scannedAt: string;
}

export default function ReportPdf({
  site,
  result,
  scannedAt,
}: ReportPdfProps) {
  // Destructure out the two pieces we need
  const { metrics, categories } = result;

  // A fixed order of vitals, so we never do Object.entries on undefined
  const vitals: MetricKey[] = [
    'first-contentful-paint',
    'largest-contentful-paint',
    'speed-index',
    'total-blocking-time',
    'cumulative-layout-shift',
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>WebTriage Report for {site}</Text>
      <Text style={styles.subheader}>Scanned at: {scannedAt}</Text>

      {/* Vitals Summary */}
      <View style={styles.heroSummary}>
        <Text style={styles.heroHeading}>Vitals Summary</Text>
        <Text style={styles.heroText}>
          {buildHeroSummary(categories)}
        </Text>
      </View>

      {/* Individual Metrics */}
      {vitals.map((id) => {
        const m = metrics[id] ?? { value: 0, score: 0, unit: '' };
        const display = formatValue(id, m.value) + m.unit;
        const pct     = Math.round(m.score);
        const tips    = metricAdvicePools[id] || [];
        const tip     = tips.length
          ? tips[Math.floor(Math.random() * tips.length)]
          : '';

        return (
          <View key={id} style={styles.card}>
            <Text style={styles.cardTitle}>
              {id.replace(/-/g, ' ')}
            </Text>
            <Text>Value: {display}</Text>
            <Text>Score: {pct}%</Text>
            {tip && (
              <Text style={styles.advice}>
                {tip.replace(/"/g, "'")}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { padding: 20, fontSize: 12 },
  header:       { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  subheader:    { fontSize: 10, marginBottom: 12 },
  heroSummary:  { marginBottom: 12 },
  heroHeading:  { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  heroText:     { fontSize: 12, lineHeight: 1.4, marginBottom: 12 },
  card:         { marginBottom: 12 },
  cardTitle:    { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  advice:       { fontSize: 10, marginTop: 4, fontStyle: 'italic' },
});
