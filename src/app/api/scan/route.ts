/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/scan/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/** The piece of Lighthouse result we care about */
interface PSIResult {
  categories: {
    performance: { score: number | null }
    accessibility: { score: number | null }
    seo: { score: number | null }
  }
  audits?: Record<string, unknown>
}

/** What we expect from the client */
interface ScanRequest {
  site: string
  email: string
}

// ─── 1) ENV + Supabase client ─────────────────────────────────────────────────
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}
const supabase = createClient<any, any>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ─── 2) Normalize incoming URL ─────────────────────────────────────────────────
function normalizeSite(raw: string): string {
  try {
    const u = new URL(raw.trim())
    u.hash = ''
    u.search = ''
    const cleanPath = u.pathname.replace(/\/+$/, '')
    return cleanPath ? `${u.origin}${cleanPath}` : u.origin
  } catch {
    let s = raw.trim().toLowerCase()
    if (s.endsWith('/')) s = s.slice(0, -1)
    return s
  }
}

// ─── 3) POST handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const logs: string[] = []
  try {
    logs.push('🏥 [scan] start')

    // 3.1) Force override?
    const urlObj = new URL(req.url)
    const forceOverride = urlObj.searchParams.get('force') === '1'
    if (forceOverride) logs.push('🔄 force=1 detected')

    // 3.2) Parse + validate body
    let body: unknown
    try {
      body = await req.json()
    } catch (e: any) {
      logs.push(`❌ JSON parse error: ${e.message}`)
      return NextResponse.json({ logs, error: 'Invalid JSON payload' }, { status: 400 })
    }
    if (
      typeof body !== 'object' ||
      body === null ||
      typeof (body as any).site !== 'string' ||
      typeof (body as any).email !== 'string'
    ) {
      logs.push('❌ missing or invalid site/email')
      return NextResponse.json({ logs, error: '`site` and `email` are required' }, { status: 400 })
    }
    const { site: rawSite, email } = body as ScanRequest
    logs.push(`🔍 payload site=${rawSite}, email=${email}`)

    // 3.3) Normalize URL
    const site = normalizeSite(rawSite)
    logs.push(`🌐 normalized to ${site}`)

    // 3.4) Rate-limit & cache check
    if (!forceOverride) {
      const { data: existing } = await supabase
        .from('scans')
        .select('id')
        .eq('site', site)
        .eq('created_day', new Date().toISOString().slice(0, 10))
        .single()

      if (existing) {
        logs.push('ℹ️ already scanned today → checking cache validity')
        const { data: prev } = await supabase
          .from('scans')
          .select('results')
          .eq('site', site)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (
          prev &&
          prev.results &&
          typeof (prev.results as any).categories === 'object' &&
          (prev.results as any).audits
        ) {
          logs.push('ℹ️ returning valid cached scan')
          return NextResponse.json({ logs, result: prev.results as PSIResult }, { status: 200 })
        } else {
          logs.push('⚠️ cached results invalid or missing → running fresh scan')
        }
      }
    } else {
      const today = new Date()
      today.setUTCHours(0, 0, 0, 0)
      await supabase
        .from('scans')
        .delete()
        .eq('site', site)
        .gte('created_at', today.toISOString())
      logs.push('🗑️ deleted today’s scans')
    }

    // 3.5) Insert placeholder row (reserve scan slot)
    let scanId: number
    {
      try {
        const { data, error } = await supabase
          .from('scans')
          .insert([{ site, email, results: {} }])
          .select('id')
          .single()
        if (error) throw error
        scanId = data.id
        logs.push(`✅ reserved scan id=${scanId}`)
      } catch (e: any) {
        if (e.message.includes('duplicate key value')) {
          logs.push('⚠️ placeholder insert conflict → reusing existing row')
          const { data: existing } = await supabase
            .from('scans')
            .select('id')
            .eq('site', site)
            .eq('created_day', new Date().toISOString().slice(0, 10))
            .single()
          scanId = existing!.id
        } else {
          logs.push(`❌ DB insert failed: ${e.message}`)
          return NextResponse.json({ logs, error: 'Database error' }, { status: 500 })
        }
      }
    }

    // ─── 3.6) Launch Chrome via chrome-aws-lambda + chrome-launcher ───────────────
    let chromeLauncher: any, chromeLambda: any
    try {
      ;({ default: chromeLambda } = await import('chrome-aws-lambda'))
      ;({ launch: chromeLauncher } = await import('chrome-launcher'))
    } catch (e: any) {
      logs.push(`❌ import error: ${e.message}`)
      throw e
    }

    const chrome = await chromeLauncher.launch({
      executablePath: await chromeLambda.executablePath,
      chromeFlags: chromeLambda.args,
    })
    logs.push(`🚀 AWS Chrome launched on port ${chrome.port}`)

    // ─── 3.7) Run Lighthouse ────────────────────────────────────────────────────
    const { default: lighthouse } = await import('lighthouse')
    const runnerResult: any = await lighthouse(site, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'seo'],
      throttlingMethod: 'provided',
    })
    const lhr: PSIResult = runnerResult.lhr
    logs.push(`📊 scores: perf=${Math.round((lhr.categories.performance.score || 0) * 100)}%`)

    // ─── 3.8) Tear down & save ─────────────────────────────────────────────────
    await chrome.kill()
    logs.push('🔒 Chrome killed')

    {
      const { error } = await supabase
        .from('scans')
        .update({ results: lhr })
        .eq('id', scanId)
      if (error) logs.push(`❌ save failed: ${error.message}`)
      else logs.push('💾 results saved')
    }

    logs.push('🎉 done')
    return NextResponse.json({ logs, result: lhr }, { status: 200 })
  } catch (err: any) {
    console.error('🔥 uncaught:', err)
    return NextResponse.json({ logs: [`❌ uncaught: ${err.message}`], error: 'Internal error' }, { status: 500 })
  }
}
