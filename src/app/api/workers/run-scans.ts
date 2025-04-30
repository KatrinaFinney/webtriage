/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/workers/run-scans.ts

import { Redis }                  from '@upstash/redis'
import { createClient }           from '@supabase/supabase-js'
import lighthouse                  from 'lighthouse'
import puppeteer                  from 'puppeteer'
import chromeAws                  from 'chrome-aws-lambda'
import { Resend }                 from 'resend'

// ─── CONFIG & CLIENTS ───────────────────────────────────────
const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  RESEND_API_KEY,
  UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN,
  SCAN_BATCH_SIZE = '3',
} = process.env

if (
  !SUPABASE_URL ||
  !SUPABASE_SERVICE_ROLE_KEY ||
  !RESEND_API_KEY ||
  !UPSTASH_REDIS_REST_URL ||
  !UPSTASH_REDIS_REST_TOKEN
) {
  throw new Error(
    'Missing one of SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN'
  )
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const resend    = new Resend(RESEND_API_KEY)
const redis     = new Redis({
  url:   UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
})

const GROUP       = 'scan-workers'
const CONSUMER    = 'consumer-1'
const STREAM_NAME = 'scan:queue'
const BATCH_SIZE  = parseInt(SCAN_BATCH_SIZE, 10)

// ─── HELPERS ────────────────────────────────────────────────

/**
 * Ensure our consumer group exists (XGROUP CREATE ... MKSTREAM)
 */
async function ensureGroup() {
  try {
    await redis.xgroup(
      STREAM_NAME,
      {
        type: 'CREATE',
        group: GROUP,
        id: '0',
        options: { MKSTREAM: true },
      }
    )
    console.log(`✅ Created consumer group "${GROUP}"`)
  } catch (err: any) {
    // ignore BUSYGROUP if it already exists
    if (!/BUSYGROUP/.test(err.message)) throw err
    console.log(`✅ Consumer group "${GROUP}" already exists`)
  }
}

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

async function genPdfBuffer(): Promise<Buffer> {
  return Buffer.from('PDF coming soon')
}

function buildEmailHTML(url: string, lhr: any, link: string): string {
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
    <p><a href="${link}">View full report</a></p>
  `
}

// ─── MAIN CONSUMER LOOP ────────────────────────────────────
async function consumeScans(): Promise<void> {
  console.log(`▶️ Starting Redis consumer (batch=${BATCH_SIZE})…`)
  await ensureGroup()

  while (true) {
    // Read new messages from the stream
    const raw = await redis.xreadgroup(
      GROUP,
      CONSUMER,
      STREAM_NAME,
      '>'
    ) as [ string, [ string, string[] ][] ][] | null

    if (!raw) continue
    const [, entries] = raw[0]

    for (const [ entryId, fieldsArr ] of entries) {
      const fm: Record<string,string> = {}
      for (let i = 0; i < fieldsArr.length; i += 2) {
        fm[ fieldsArr[i] ] = fieldsArr[i+1]
      }
      const scanId = parseInt(fm.scanId, 10)
      console.log(`🔔 Got job ${entryId} → scanId=${scanId}`)

      try {
        await supabase
          .from('scans')
          .update({ status: 'processing' })
          .eq('id', scanId)

        const { data } = await supabase
          .from('scans')
          .select('site,email')
          .eq('id', scanId)
          .single()
        if (!data) throw new Error('Scan not found')

        const url = normalise(data.site)
        const exePath = await chromeAws.executablePath
        const browser = await puppeteer.launch({
          headless: true,
          executablePath: exePath || undefined,
          args: exePath
            ? chromeAws.args
            : ['--no-sandbox','--disable-setuid-sandbox'],
        })
        const port   = Number(new URL(browser.wsEndpoint()).port)
        const runner = await lighthouse(url, {
          port,
          output:         'json',
          logLevel:       'error',
          onlyCategories:['performance','accessibility','seo'],
          throttlingMethod:'provided',
        }) as any
        const lhr = runner.lhr as any

        await supabase
          .from('scans')
          .update({ results: lhr, status: 'done', finished_at: new Date() })
          .eq('id', scanId)

        const link = `https://webtriage.pro/report/${scanId}`
        const pdfBuffer = await genPdfBuffer()
        await resend.emails.send({
          from: 'WebTriage <reports@webtriage.pro>',
          to:   data.email,
          subject: 'Your WebTriage report',
          html: buildEmailHTML(url, lhr, link),
          attachments:[ { filename:'report.pdf', content:pdfBuffer } ],
        })
        console.log(`✅ Scan ${scanId} emailed to ${data.email}`)

        // Acknowledge so the entry isn’t redelivered
        await redis.xack(STREAM_NAME, GROUP, entryId)
        console.log(`✅ Acked ${entryId}`)

        await browser.close()
      } catch (err) {
        console.error(`❌ Scan ${entryId} failed:`, err)
        // no ACK → retry later
      }
    }
  }
}

consumeScans().catch(err => {
  console.error('💥 Fatal consumer error:', err)
  process.exit(1)
})
