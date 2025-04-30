// src/app/api/scan/status/[scanId]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  // ─── Debug Logging: entry point ─────────────────────────
  console.log('🚦 statusHandler start @', new Date().toISOString())
  console.log('⬇️ Request URL:', request.url)

  // ─── Environment Variables Check ─────────────────────────
  const SUPABASE_URL = process.env.SUPABASE_URL
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  console.log('🔑 SUPABASE_URL set?', !!SUPABASE_URL)
  console.log('🔑 SERVICE_KEY set?', !!SERVICE_KEY)
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    return NextResponse.json(
      { error: 'Missing Supabase env vars' },
      { status: 500 }
    )
  }

  // ─── Supabase Client Initialization ────────────────────
  console.log('✨ Initializing Supabase client')
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

  // ─── Parse scanId from URL ─────────────────────────────
  console.log('🔍 Parsing scanId from URL')
  const { pathname } = new URL(request.url)
  const rawId = pathname.split('/').pop()
  console.log('📝 Raw ID segment:', rawId)
  const scanId = rawId ? parseInt(rawId, 10) : NaN
  console.log('✅ Parsed scanId =', scanId)
  if (Number.isNaN(scanId)) {
    console.warn('⚠️ Invalid scanId, returning 400')
    return NextResponse.json({ error: 'Invalid scanId' }, { status: 400 })
  }

  // ─── Fetch status + results from Supabase ──────────────
  console.log('⏱️ Before Supabase fetch @', Date.now())
  let resp
  try {
    resp = await supabase
      .from('scans')
      .select('status, results')
      .eq('id', scanId)
      .single()
  } catch (e) {
    console.error('❌ Supabase fetch threw error:', e)
    return NextResponse.json({ status: 'error', error: 'DB fetch threw' }, { status: 500 })
  }
  console.log('⏱️ After Supabase fetch @', Date.now())

  const { data, error } = resp
  if (error) {
    console.error('❌ Supabase status-fetch error:', error)
    return NextResponse.json(
      { status: 'error', error: error.message },
      { status: 500 }
    )
  }

  if (!data) {
    console.error('❌ Supabase returned null data for scanId', scanId)
    return NextResponse.json(
      { status: 'error', error: 'Scan not found' },
      { status: 404 }
    )
  }

  console.log('🔖 Fetched data:', data)

  // ─── Shape payload ───────────────────────────────────
  console.log('📦 Shaping response payload')
  const payload: { status: string; result?: unknown; logs: string[] } = {
    status: data.status,
    logs: [], // TODO: fetch logs from your logs column or Redis
  }
  if (data.status === 'done' && data.results != null) {
    console.log('🏁 Scan done, including results in payload')
    payload.result = data.results
  }

  console.log('✅ Returning payload @', new Date().toISOString(), payload)
  return NextResponse.json(payload)
}
