/* ---------------------------------------------------------------
   PDF generator – uses @react-pdf/renderer
---------------------------------------------------------------- */
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

import type { PSIResult, CategoryKey, MetricKey } from '@/types/webVitals';
import {
  categoryLabels,
  categorySummaries,
  metricSummaries,
  formatValue,
  metricAdvicePools,
} from '@/lib/scanMetrics';
import { buildServiceRecs, Service } from '@/lib/services';


/* ---------------------------------------------------------------
   font
---------------------------------------------------------------- */
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrU5nw3Vj84pA.woff2' },
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrU5nw3Vz84pA.woff2',
      fontWeight: 700,
    },
  ],
});

/* ---------------------------------------------------------------
   styles
---------------------------------------------------------------- */
const styles = StyleSheet.create({
  page: { backgroundColor: '#071a2f', padding: 24, fontFamily: 'Inter', color: '#fff', flexDirection: 'column' },
  title: { fontSize: 28, fontWeight: 800, marginBottom: 8 },
  scanMeta: { fontSize: 8, color: '#666', marginBottom: 12 },
  hero: { fontSize: 12, marginBottom: 16, textAlign: 'center' },
  sectionTitle: { fontSize: 22, fontWeight: 800, marginBottom: 12, textAlign: 'center' },
  overview: { fontSize: 18, fontWeight: 500, color: '#cbd5e1', marginBottom: 16, textAlign: 'center' },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  card: { width: '30%', padding: 8, border: '1px solid #112c56', borderRadius: 4 },
  cardLabel: { fontSize: 10, fontWeight: 700, marginBottom: 4, color: '#4fd1c5' },
  cardScore: { fontSize: 14, fontWeight: 800, marginBottom: 4 },
  cardSummary: { fontSize: 9, color: '#94a3b8' },
  auditGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  auditCard: { width: '48%', padding: 8, border: '1px solid #112c56', borderRadius: 4, backgroundColor: '#0f2344' },
  auditTitle: { fontSize: 12, fontWeight: 700, color: '#4fd1c5', marginBottom: 4 },
  auditValue: { fontSize: 12, fontWeight: 800, marginBottom: 4 },
  auditNarrative: { fontSize: 9, color: '#dbeafe', marginBottom: 4 },
  auditTip: { fontSize: 9, fontStyle: 'italic', color: '#e2e8f0' },
  nextServices: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  serviceCard: { width: '48%', padding: 8, border: '1px solid #112c56', borderRadius: 4, backgroundColor: '#0f2344', marginBottom: 8 },
  serviceName: { fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 4 },
  serviceDesc: { fontSize: 9, color: '#dbeafe', marginBottom: 4 },
  serviceLink: { fontSize: 10, color: '#4fd1c5' },
});

/* ---------------------------------------------------------------
   simple internal helper
---------------------------------------------------------------- */
function heroString(c: PSIResult['categories']): string {
  const p = Math.round(c.performance.score * 100);
  const a = Math.round(c.accessibility.score * 100);
  const s = Math.round(c.seo.score * 100);
  const msg: string[] = [
    `Speed ${p}/100`,
    `Accessibility ${a}/100`,
    `SEO ${s}/100`,
  ];
  return `Headline vitals – ${msg.join(' · ')}. Full details below.`;
}

/* ---------------------------------------------------------------
   main component
---------------------------------------------------------------- */
export default function ReportPdf({
  site,
  result,
  scannedAt = new Date().toLocaleString(),
}: {
  site: string;
  result: PSIResult;
  scannedAt?: string;
}) {
  /* ------------ derived data ------------ */
  const categoryPairs = Object.entries(result.categories) as Array<
    [CategoryKey, { score: number }]
  >;

  const services = buildServiceRecs(result.categories);

  const vitals: MetricKey[] = Object.keys(metricAdvicePools) as MetricKey[];

  /* ------------ render ------------ */
  return (
    <Document>
      <Page style={styles.page}>
        {/* header */}
        <Text style={styles.title}>WebTriage Report – {site}</Text>
        <Text style={styles.scanMeta}>Scanned {scannedAt}</Text>
        <Text style={styles.hero}>{heroString(result.categories)}</Text>

        {/* vital signs */}
        <Text style={styles.sectionTitle}>Vital Signs</Text>
        <View style={styles.grid}>
          {categoryPairs.map(([key, { score }]) => (
            <View key={key} style={styles.card}>
              <Text style={styles.cardLabel}>{categoryLabels[key]}</Text>
              <Text style={styles.cardScore}>{Math.round(score * 100)}/100</Text>
              <Text style={styles.cardSummary}>{categorySummaries[key]}</Text>
            </View>
          ))}
        </View>

        {/* key check‑ups */}
        <Text style={styles.sectionTitle}>Key Check‑ups & Advice</Text>
        <View style={styles.auditGrid}>
          {vitals.map((id) => {
            const raw = result.metrics[id]?.value ?? 0;
            const val = formatValue(id, raw);
            const tipArr = metricAdvicePools[id];
            const tip = tipArr[Math.floor(Math.random() * tipArr.length)];
            return (
              <View key={String(id)} style={styles.auditCard}>
                <Text style={styles.auditTitle}>{metricSummaries[id]}</Text>
                <Text style={styles.auditValue}>{val}</Text>
                <Text style={styles.auditNarrative}>
                  {metricSummaries[id]}
                </Text>
                <Text style={styles.auditTip}>Tip: {tip}</Text>
              </View>
            );
          })}
        </View>

        {/* services */}
        <Text style={styles.sectionTitle}>Recommended Next‑Steps</Text>
        <View style={styles.nextServices}>
          {services.map((svc: Service) => (
            <View key={svc.name} style={styles.serviceCard}>
              <Text style={styles.serviceName}>{svc.name}</Text>
              <Text style={styles.serviceDesc}>{svc.desc}</Text>
              <Text style={styles.serviceLink}>{svc.price}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
