/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

// src/app/api/submit-intake/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import chromeLambda from 'chrome-aws-lambda'
import puppeteerCore from 'puppeteer-core'
import lighthouse, { RunnerResult } from 'lighthouse'

interface ScanResponse {
  result?: unknown
  logs: string[]
  error?: string
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

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

    // 1) Parse & validate
    const body = await req.json()
    logs.push(`🔍 Payload: ${JSON.stringify(body)}`)
    const { site: rawSite, email } = body as { site?: string; email?: string }
    if (!rawSite || !email) {
      logs.push('❌ Missing site or email')
      return NextResponse.json<ScanResponse>(
        { error: 'Missing site or email', logs },
        { status: 400 }
      )
    }

    // 2) Normalize URL
    const site = normalizeSite(rawSite)
    logs.push(`🌐 Normalized site: ${site}`)

    // 3) Reserve DB slot
    const { data: inserted, error: insertErr } = await supabase
      .from('scans')
      .insert([{ site, email, results: {} }])
      .select('id')
      .single()
    if (insertErr || !inserted) throw insertErr || new Error('DB insert failed')
    const scanId = inserted.id
    logs.push(`✅ Reserved slot id=${scanId}`)

    // 4) Launch Chrome (AWS or local)
    let browser = await puppeteerCore.launch({ headless: true })
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
      // fallback to local Puppeteer
      browser = await puppeteerCore.launch({ headless: true })
      logs.push('🚀 Local Puppeteer launched')
    }

    // 5) Run Lighthouse audit
    const wsUrl = browser.wsEndpoint()
    const port = parseInt(new URL(wsUrl).port, 10)     // ◀︎ parseInt to ensure number
    const runner = (await lighthouse(site, {
      port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'seo'],
    })) as RunnerResult
    const lhr = runner.lhr
    logs.push(
      `📊 LH perf=${Math.round((lhr.categories.performance.score! || 0) * 100)}%`
    )

    // 6) Clean up
    await browser.close()                             // now correctly typed
    logs.push('🔒 Browser closed')

    // 7) Persist results
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
