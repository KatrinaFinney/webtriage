// src/app/api/scan/status/[scanId]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  // ─── Debug: are we even here?
  console.log('⬇️ /api/scan/status GET request.url:', request.url)

  // ─── Pull the same key you used for POST
  const SUPABASE_URL = process.env.SUPABASE_URL
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    return NextResponse.json(
      { error: 'Missing Supabase env vars' },
      { status: 500 }
    )
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

  // ─── Parse scanId
  const { pathname } = new URL(request.url)
  const rawId = pathname.split('/').pop()
  const scanId = rawId ? parseInt(rawId, 10) : NaN
  console.log('🔍 Parsed scanId =', scanId)
  if (Number.isNaN(scanId)) {
    return NextResponse.json({ error: 'Invalid scanId' }, { status: 400 })
  }

  // ─── Fetch status + results
  const { data, error } = await supabase
    .from('scans')
    .select('status, results')
    .eq('id', scanId)
    .single()

  if (error) {
    console.error('❌ Supabase status-fetch error:', error)
    return NextResponse.json(
      { status: 'error', error: error.message },
      { status: 500 }
    )
  }

  // ─── Shape & return
  const payload: { status: string; result?: unknown; logs: string[] } = {
    status: data.status,
    logs: [], // later: wire up your real logs column
  }
  if (data.status === 'done' && data.results != null) {
    payload.result = data.results
  }
  return NextResponse.json(payload)
}
