// src/app/api/workers/run-scans.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import Redis from 'ioredis'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import lighthouse from 'lighthouse'
import puppeteer from 'puppeteer'
import chromeAws from 'chrome-aws-lambda'
import { Resend } from 'resend'

/** ─── CONFIG & CLIENTS ────────────────────────────────────────── */
const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  RESEND_API_KEY,
  REDIS_URL,
  REDIS_TOKEN,
  SCAN_BATCH_SIZE = '3',
} = process.env

if (
  !SUPABASE_URL ||
  !SUPABASE_SERVICE_ROLE_KEY ||
  !RESEND_API_KEY ||
  !REDIS_URL ||
  !REDIS_TOKEN
) {
  throw new Error(
    'Missing one of: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, REDIS_URL, REDIS_TOKEN'
  )
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const resend    = new Resend(RESEND_API_KEY)
const redis     = new Redis(REDIS_URL, { password: REDIS_TOKEN })

const GROUP       = 'scan-workers'
const CONSUMER    = 'consumer-1'
const STREAM_NAME = 'scan:queue'
const BATCH_SIZE  = parseInt(SCAN_BATCH_SIZE, 10)

/** ─── TYPES ───────────────────────────────────────────────────── */
interface PSIResult {
  categories: {
    performance: { score: number | null }
    accessibility: { score: number | null }
    seo:           { score: number | null }
  }
  audits?: Record<string, unknown>
}

interface ScanDetails {
  site:  string
  email: string
}

/** ─── HELPERS ─────────────────────────────────────────────────── */

// Ensure our XGROUP exists
async function ensureGroup() {
  try {
    await redis.xgroup('CREATE', STREAM_NAME, GROUP, '0', 'MKSTREAM')
    console.log(`✅ Created consumer group "${GROUP}"`)
  } catch (err: any) {
    if (!/BUSYGROUP/.test(err.message)) throw err
    console.log(`✅ Consumer group "${GROUP}" already exists`)
  }
}

// Normalize a raw user URL
function normalise(raw: string): string {
  try {
    const u = new URL(raw.trim().startsWith('http') ? raw : `https://${raw}`)
    u.hash = ''
    u.search = ''
    return u.href.endsWith('/') ? u.href : u.href + '/'
  } catch {
    return raw
  }
}

// Fetch site + email from Supabase
async function fetchScanDetails(client: SupabaseClient, scanId: number): Promise<ScanDetails> {
  const { data, error } = await client
    .from('scans')
    .select('site,email')
    .eq('id', scanId)
    .single()
  if (error || !data) throw new Error(`DB lookup failed: ${error?.message}`)
  return { site: data.site, email: data.email }
}

// TODO: swap in your real PDF generator here
async function genPdfBuffer(): Promise<Buffer> {
  return Buffer.from('PDF coming soon')
}

// Build the email body
function buildEmailHTML(url: string, lhr: PSIResult, link: string): string {
  const p = Math.round((lhr.categories.performance.score || 0) * 100)
  const s = Math.round((lhr.categories.seo.score        || 0) * 100)
  const a = Math.round((lhr.categories.accessibility.score || 0) * 100)

  return `
    <h2>Your WebTriage report for ${url}</h2>
    <table>
      <tr><th>Performance</th><td>${p}/100</td></tr>
      <tr><th>SEO</th><td>${s}/100</td></tr>
      <tr><th>Accessibility</th><td>${a}/100</td></tr>
    </table>
    <p>View the full page: <a href="${link}">${link}</a></p>
  `
}

/** ─── MAIN LOOP ──────────────────────────────────────────────── */
async function consumeScans(): Promise<void> {
  console.log(`▶️ Starting Redis consumer (batch=${BATCH_SIZE})…`)
  await ensureGroup()

  while (true) {
    // BLOCK 5s waiting for up to BATCH_SIZE jobs
    const streams = (await redis.xreadgroup(
    'GROUP', GROUP, CONSUMER,
    'COUNT', BATCH_SIZE,
    'BLOCK', 5000,
    'STREAMS', STREAM_NAME, '>')) as [string, [string, string[]][]][] | null
    
    if (!streams) continue

    const [, entries] = streams[0]  // [ streamName, [ [id, [field,val,...]] ] ]

    for (const [entryId, fields] of entries) {
      const fieldMap: Record<string,string> = {}
      for (let i=0; i<fields.length; i+=2) {
        fieldMap[fields[i]] = fields[i+1]
      }
      const scanId = parseInt(fieldMap.scanId, 10)
      console.log(`🔔 Got job ${entryId} → scanId=${scanId}`)

      try {
        // 1) Grab site + email
        const { site, email } = await fetchScanDetails(supabase, scanId)

        // 2) Mark "processing"
        await supabase
          .from('scans')
          .update({ status: 'processing' })
          .eq('id', scanId)

        // 3) Launch Chrome
        const exePath = await chromeAws.executablePath
        const browser = await puppeteer.launch({
          headless: true,
          executablePath: exePath || undefined,
          args: exePath
            ? chromeAws.args
            : ['--no-sandbox','--disable-setuid-sandbox'],
        })
        const port = parseInt(new URL(browser.wsEndpoint()).port, 10)

        // 4) Run Lighthouse
        const runner = (await lighthouse(normalise(site), {
          port, output:'json', logLevel:'error',
          onlyCategories:['performance','accessibility','seo'],
          throttlingMethod:'provided',
        })) as any
        const lhr = runner.lhr as PSIResult

        // 5) Persist results
        await supabase
          .from('scans')
          .update({ results: lhr, status:'done', finished_at: new Date() })
          .eq('id', scanId)

        // 6) Send email
        const link = `https://webtriage.pro/report/${scanId}`
        const pdfBuffer = await genPdfBuffer()
        await resend.emails.send({
          from:    'WebTriage <reports@webtriage.pro>',
          to:      email,
          subject: 'Your WebTriage report',
          html:    buildEmailHTML(normalise(site), lhr, link),
          attachments: [{ filename:'report.pdf', content:pdfBuffer }],
        })
        console.log(`✅ Scan ${scanId} complete & emailed to ${email}`)

        // 7) Acknowledge the job
        await redis.xack(STREAM_NAME, GROUP, entryId)
        console.log(`✅ Acked ${entryId}`)
        await browser.close()
      } catch (err) {
        console.error(`❌ Scan ${scanId} failed:`, err)
        // no xack → will retry
      }
    }
  }
}

/* ─── KICK IT OFF ────────────────────────────────────────────── */
consumeScans().catch((err) => {
  console.error('💥 Fatal consumer error:', err)
  process.exit(1)
})
