// File: src/app/components/ReportPdf.tsx
import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { formatValue }            from '@/lib/scanMetrics';
import { metricAdvicePools }      from '@/app/api/scan/types'; // adjust path as needed
import { buildHeroSummary }       from '@/lib/scanHelpers';
import type { PSIResult, MetricKey } from '@/types/webVitals';

interface ReportPdfProps {
  site:      string;
  result:    PSIResult;
  scannedAt: string;
}

export default function ReportPdf({ site, result, scannedAt }: ReportPdfProps) {
  const { metrics, categories } = result;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>WebTriage Report for {site}</Text>
      <Text style={styles.subheader}>Scanned at: {scannedAt}</Text>

      {/* Vitals Summary */}
      <View style={styles.heroSummary}>
        <Text style={styles.heroHeading}>Vitals Summary</Text>
        <Text style={styles.heroText}>
          {buildHeroSummary(categories)}
        </Text>
      </View>

      {/* Metrics */}
      {Object.entries(metrics).map(([id, { value, score, unit }]) => {
        const tips = metricAdvicePools[id as MetricKey] || [];
        const tip  = tips.length
          ? tips[Math.floor(Math.random() * tips.length)]
          : '';

        return (
          <View key={id} style={styles.card}>
            <Text style={styles.cardTitle}>
              {id.replace(/-/g, ' ')}
            </Text>
            <Text>Value: {formatValue(id as MetricKey, value)}{unit}</Text>
            <Text>Score: {score}%</Text>
            {tip && (
              <Text style={styles.advice}>
                “{tip.replace(/"/g, "'")}”
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
  heroHeading:  { fontSize: 14, fontWeight: '600' },
  heroText:     { fontSize: 12, marginBottom: 12 },
  card:         { marginBottom: 12 },
  cardTitle:    { fontSize: 14, fontWeight: '600' },
  advice:       { fontSize: 10, marginTop: 4, fontStyle: 'italic' },
});
