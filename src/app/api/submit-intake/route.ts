/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import chromeLambda from 'chrome-aws-lambda'
import puppeteerCore, { Browser } from 'puppeteer-core'
import lighthouse from 'lighthouse'
import type { RunnerResult } from 'lighthouse'

// ────────────────────────────────────────────────────────────────
// 0) Make sure our server‐side env vars are set
// ────────────────────────────────────────────────────────────────
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

// ────────────────────────────────────────────────────────────────
// 1) Create Supabase service‐role client
// ────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

interface ScanResponse {
  result?: unknown
  logs: string[]
  error?: string
}

function normalizeSite(raw: string): string {
  try {
    const u = new URL(raw.trim())
    u.hash = ''
    u.search = ''
    u.protocol = 'https:'
    u.pathname = u.pathname.replace(/\/+$/, '')
    return u.toString().toLowerCase()
  } catch {
    return raw.trim().toLowerCase()
  }
}

export async function POST(req: Request) {
  const logs: string[] = []
  try {
    logs.push('🏥 [scan] Handler start')

    // 1) parse + validate
    const body: any = await req.json()
    logs.push(`🔍 Payload: ${JSON.stringify(body)}`)
    if (!body.site || !body.email) {
      logs.push('❌ Missing site or email')
      return NextResponse.json<ScanResponse>(
        { error: 'Missing site or email', logs },
        { status: 400 }
      )
    }

    // 2) normalize
    const site = normalizeSite(body.site as string)
    logs.push(`🌐 Normalized site: ${site}`)

    // 3) reserve slot
    const { data: inserted, error: insertErr } = await supabase
      .from('scans')
      .insert([{ site, email: body.email, results: {} }])
      .select('id')
      .single()
    if (insertErr || !inserted) {
      throw insertErr || new Error('DB insert failed')
    }
    const scanId = inserted.id
    logs.push(`✅ Reserved slot id=${scanId}`)

    // 4) launch Chrome
    let browser: Browser
    try {
      const exePath = await chromeLambda.executablePath
      logs.push(`🔧 execPath: ${exePath}`)
      browser = await puppeteerCore.launch({
        args: chromeLambda.args,
        defaultViewport: chromeLambda.defaultViewport,
        executablePath: exePath,
        headless: true,
      })
      logs.push('🚀 AWS Chrome launched')
    } catch (awsErr: any) {
      logs.push(`⚠️ AWS Chrome failed: ${awsErr.message}`)
      browser = await puppeteerCore.launch({ headless: true })
      logs.push('🚀 Local Puppeteer launched')
    }

    // 5) run Lighthouse
    const wsUrl = browser.wsEndpoint()
    const port = parseInt(new URL(wsUrl).port, 10)
    const runner = (await lighthouse(site, {
      port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'seo'],
    })) as RunnerResult
    const lhr = runner.lhr
    logs.push(
      `📊 LH perf=${Math.round((lhr.categories.performance.score || 0) * 100)}%`
    )

    // 6) cleanup
    await browser.close()
    logs.push('🔒 Browser closed')

    // 7) persist back to Supabase
    const { error: updateErr } = await supabase
      .from('scans')
      .update({ results: lhr })
      .eq('id', scanId)
    if (updateErr) throw updateErr
    logs.push('💾 Results saved')

    logs.push('🎉 Completed successfully')
    return NextResponse.json<ScanResponse>({ result: lhr, logs }, { status: 200 })
  } catch (err: any) {
    console.error('🔥 [scan] Uncaught error:', err)
    logs.push(`❌ Uncaught error: ${err.message}`)
    return NextResponse.json<ScanResponse>(
      { error: 'Internal server error', logs },
      { status: 500 }
    )
  }
}
