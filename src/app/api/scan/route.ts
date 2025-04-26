/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/scan/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface PSIResult {
  categories: {
    performance: { score: number | null }
    accessibility: { score: number | null }
    seo: { score: number | null }
  }
  audits?: Record<string, unknown>
}

interface ScanRequest {
  site: string
  email: string
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}
const supabase = createClient<any, any>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

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

export async function POST(req: NextRequest) {
  const logs: string[] = []
  try {
    logs.push('🏥 [scan] start')
    console.log('→ [scan] handler invoked')

    // Parse + validate
    logs.push('… parsing body')
    console.log('→ [scan] before JSON.parse')
    let body: unknown
    try {
      body = await req.json()
      console.log('→ [scan] body parsed:', body)
    } catch (e: any) {
      logs.push(`❌ JSON parse error: ${e.message}`)
      console.log('→ [scan] JSON parse failed:', e)
      return NextResponse.json({ logs, error: 'Invalid JSON payload' }, { status: 400 })
    }

    if (
      typeof body !== 'object' ||
      body === null ||
      typeof (body as any).site !== 'string' ||
      typeof (body as any).email !== 'string'
    ) {
      logs.push('❌ missing or invalid site/email')
      console.log('→ [scan] validation failed on body:', body)
      return NextResponse.json({ logs, error: '`site` and `email` are required' }, { status: 400 })
    }
    const { site: rawSite, email } = body as ScanRequest
    logs.push(`🔍 payload site=${rawSite}, email=${email}`)
    console.log('→ [scan] validated payload')

    // Normalize
    logs.push('… normalizing URL')
    const site = normalizeSite(rawSite)
    logs.push(`🌐 normalized to ${site}`)
    console.log('→ [scan] normalized URL:', site)

    // Cache check
    logs.push('… checking cache/rate-limit')
    console.log('→ [scan] before cache lookup')
    const todayKey = new Date().toISOString().slice(0, 10)
    let existing: { id: number } | null = null
    if (!(new URL(req.url).searchParams.get('force') === '1')) {
      const { data } = await supabase
        .from('scans')
        .select('id')
        .eq('site', site)
        .eq('created_day', todayKey)
        .single()
      existing = data
      console.log('→ [scan] cache lookup result:', data)
    }
    if (existing) {
      logs.push('ℹ️ already scanned today → checking cache validity')
      console.log('→ [scan] fetching cached results for id', existing.id)
      const { data: prev } = await supabase
        .from('scans')
        .select('results')
        .eq('site', site)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      console.log('→ [scan] prev.results:', prev?.results)
      if (
        prev &&
        prev.results &&
        typeof (prev.results as any).categories === 'object' &&
        (prev.results as any).audits
      ) {
        logs.push('ℹ️ returning valid cached scan')
        console.log('→ [scan] returning early with cache')
        return NextResponse.json({ logs, result: prev.results as PSIResult }, { status: 200 })
      }
      logs.push('⚠️ cached results invalid or missing → running fresh scan')
      console.log('→ [scan] cache invalid; continuing')
    } else {
      console.log('→ [scan] no existing cache; proceeding')
    }

    // Reserve DB row
    logs.push('… reserving DB row')
    console.log('→ [scan] before DB insert')
    let scanId: number
    try {
      const { data, error } = await supabase
        .from('scans')
        .insert([{ site, email, results: {} }])
        .select('id')
        .single()
      if (error) throw error
      scanId = data.id
      logs.push(`✅ reserved scan id=${scanId}`)
      console.log('→ [scan] reserved id:', scanId)
    } catch (e: any) {
      console.log('→ [scan] DB insert error:', e.message)
      if (e.message.includes('duplicate key value')) {
        logs.push('⚠️ placeholder insert conflict → reusing existing row')
        const { data: existingRow } = await supabase
          .from('scans')
          .select('id')
          .eq('site', site)
          .eq('created_day', todayKey)
          .single()
        scanId = existingRow!.id
        console.log('→ [scan] reused id:', scanId)
      } else {
        logs.push(`❌ DB insert failed: ${e.message}`)
        return NextResponse.json({ logs, error: 'Database error' }, { status: 500 })
      }
    }

    // Launch Chrome
    logs.push('… launching Chrome')
    console.log('→ [scan] before chrome-aws-lambda import')
    const chromeAws = (await import('chrome-aws-lambda')).default as any
    console.log('→ [scan] imported chrome-aws-lambda, executablePath=', chromeAws.executablePath)
    const launcherMod = await import('chrome-launcher')
    console.log('→ [scan] imported chrome-launcher')
    const chrome = await launcherMod.launch({
      chromePath: await chromeAws.executablePath,
      chromeFlags: chromeAws.args,
    })
    logs.push(`🚀 AWS Chrome launched on port ${chrome.port}`)
    console.log('→ [scan] chrome launched, port=', chrome.port)

    // Run Lighthouse
    logs.push('… running Lighthouse')
    console.log('→ [scan] before lighthouse import')
    const lhMod = await import('lighthouse')
    console.log('→ [scan] imported lighthouse')
    const lighthouse = (lhMod as any).default || lhMod
    console.log('→ [scan] invoking lighthouse')
    const runner = (await lighthouse(site, {
      port: chrome.port,
      output: 'json',
      logLevel: 'info',
      onlyCategories: ['performance', 'accessibility', 'seo'],
      throttlingMethod: 'provided',
    })) as { lhr: PSIResult }
    console.log('→ [scan] lighthouse returned')
    const lhr = runner.lhr
    logs.push(`📊 scores: perf=${Math.round((lhr.categories.performance.score || 0) * 100)}%`)

    // Shutdown Chrome
    logs.push('… shutting down Chrome')
    console.log('→ [scan] before chrome.kill')
    await chrome.kill()
    logs.push('🔒 Chrome killed')
    console.log('→ [scan] chrome killed')

    // Save results
    logs.push('… saving results')
    console.log('→ [scan] before DB update')
    {
      const { error } = await supabase
        .from('scans')
        .update({ results: lhr })
        .eq('id', scanId)
      if (error) {
        logs.push(`❌ save failed: ${error.message}`)
        console.log('→ [scan] DB update error:', error)
      } else {
        logs.push('💾 results saved')
        console.log('→ [scan] results saved')
      }
    }

    logs.push('🎉 done')
    console.log('→ [scan] completed successfully, returning')
    return NextResponse.json({ logs, result: lhr }, { status: 200 })
  } catch (err: any) {
    console.error('🔥 uncaught:', err)
    logs.push(`❌ uncaught: ${err.message}`)
    return NextResponse.json({ logs, error: 'Internal error' }, { status: 500 })
  }
}
