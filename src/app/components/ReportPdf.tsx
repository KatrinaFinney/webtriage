import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

import { PSIResult } from '../api/scan/types'
import {
  metricAdvicePools,
  categoryLabels,
  categorySummaries,
  formatValue,
} from '../lib/scanMetrics'
import { buildServiceRecs, Service } from '../lib/services'

type MetricKey = keyof typeof metricAdvicePools
type CategoryKey = keyof typeof categoryLabels

Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrU5nw3Vj84pA.woff2' },
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrU5nw3Vz84pA.woff2',
      fontWeight: 700,
    },
  ],
})

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#071a2f',
    padding: 24,
    fontFamily: 'Inter',
    color: '#fff',
    flexDirection: 'column',
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    marginBottom: 8,
  },
  scanMeta: { fontSize: 8, color: '#666', marginBottom: 12 },
  hero: { fontSize: 12, marginBottom: 16, textAlign: 'center' },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 800,
    marginBottom: 12,
    textAlign: 'center',
  },
  overview: {
    fontSize: 18,
    fontWeight: 500,
    color: '#cbd5e1',
    marginBottom: 16,
    textAlign: 'center',
  },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  card: { width: '30%', padding: 8, border: '1px solid #112c56', borderRadius: 4 },
  cardLabel: { fontSize: 10, fontWeight: 700, marginBottom: 4, color:'#4fd1c5' },
  cardScore: { fontSize: 14, fontWeight: 800, marginBottom: 4 },
  cardSummary: { fontSize: 9, color: '#94a3b8' },
  auditGrid: { flexDirection: 'row', flexWrap: 'wrap', gap:8, marginBottom:16 },
  auditCard: {
    width: '48%',
    padding: 8,
    border: '1px solid #112c56',
    borderRadius: 4,
    backgroundColor: '#0f2344',
  },
  auditTitle: { fontSize: 12, fontWeight: 700, color: '#4fd1c5', marginBottom:4 },
  auditValue: { fontSize: 12, fontWeight: 800, marginBottom:4 },
  auditNarrative: { fontSize:9, color:'#dbeafe', marginBottom:4 },
  auditTip: { fontSize:9, fontStyle:'italic', color:'#e2e8f0' },
  nextServices: { flexDirection: 'row', flexWrap:'wrap', justifyContent:'space-between' },
  serviceCard: {
    width:'48%',
    padding:8,
    border:'1px solid #112c56',
    borderRadius:4,
    backgroundColor: '#0f2344',
    marginBottom:8,
  },
  serviceName: { fontSize:12, fontWeight:700, color:'#fff', marginBottom:4 },
  serviceDesc: { fontSize:9, color:'#dbeafe', marginBottom:4 },
  serviceLink: { fontSize:10, color:'#4fd1c5' },
})

function buildHeroSummary(categories: PSIResult['categories']): string {
  const p = Math.round(categories.performance.score * 100)
  const a = Math.round(categories.accessibility.score * 100)
  const s = Math.round(categories.seo.score * 100)
  const lines:string[] = []
  if (p<70) lines.push(`⚡️ Speed ${p}/100 losing visitors—let’s fix it.`)
  else if (p<90) lines.push(`🚀 Speed ${p}/100 solid—top 10% next.`)
  else lines.push(`🚀 Lightning-fast at ${p}/100—delight users.`)
  if (a<70) lines.push(`♿️ Accessibility ${a}/100 leaves people out.`)
  else lines.push(`♿️ Accessibility ${a}/100 is great—keep it up.`)
  if (s<70) lines.push(`🔍 SEO ${s}/100 keeps you hidden.`)
  else lines.push(`🔍 SEO ${s}/100 is good—let’s help you dominate.`)
  return lines.join(' ')
}

export default function ReportPdf({
  site,
  result,
  scannedAt,
}: {
  site: string
  result: PSIResult
  scannedAt?: string
}) {
  const categories = result.categories;
  const entries = Object.entries(categories) as Array<[CategoryKey,{score:number}]>;
  const metrics = Object.keys(metricAdvicePools) as MetricKey[];
  const services: Service[] = buildServiceRecs(categories);

  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>WebTriage Report for {site}</Text>
        <Text style={styles.scanMeta}>{scannedAt ?? new Date().toLocaleString()}</Text>
        <Text style={styles.hero}>{buildHeroSummary(categories)}</Text>

        <Text style={styles.sectionTitle}>Vital Signs</Text>
        <View style={styles.grid}>
          {entries.map(([key,{score}])=>{
            const pct = Math.round(score*100);
            return (
              <View key={key} style={styles.card}>
                <Text style={styles.cardLabel}>{categoryLabels[key]}</Text>
                <Text style={styles.cardScore}>{pct}/100</Text>
                <Text style={styles.cardSummary}>{categorySummaries[key]}</Text>
              </View>
            )
          })}
        </View>

        <Text style={styles.sectionTitle}>Key Checkups & Advice</Text>
        <View style={styles.auditGrid}>
          {metrics.map(id=>{
            const raw = result.audits[id]?.displayValue ?? 'N/A';
            const val = formatValue(id, raw);
            const tip = metricAdvicePools[id][Math.floor(Math.random()*metricAdvicePools[id].length)];
            return (
              <View key={id} style={styles.auditCard}>
                <Text style={styles.auditTitle}>{id}</Text>
                <Text style={styles.auditValue}>{val}</Text>
                <Text style={styles.auditNarrative}>
                  {id==='total-blocking-time'
                    ? `With ${val} blocked, your page is responsive swiftly.`
                    : id==='cumulative-layout-shift'
                    ? `A CLS of ${val} means your layout is stable.`
                    : `Your site’s first visual element appears in ${val}.`}
                </Text>
                <Text style={styles.auditTip}>Tip: {tip}</Text>
              </View>
            )
          })}
        </View>

        <Text style={styles.sectionTitle}>Recommended Next Steps</Text>
        <View style={styles.nextServices}>
          {services.map(svc=>(
            <View key={svc.name} style={styles.serviceCard}>
              <Text style={styles.serviceName}>{svc.name}</Text>
              <Text style={styles.serviceDesc}>{svc.desc}</Text>
              <Text style={styles.serviceLink}>{svc.price}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  )
}
