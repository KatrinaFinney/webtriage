// src/app/api/scan/status/[scanId]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  // 1) Pull SUPABASE_URL / ANON_KEY from env
  const urlBase   = process.env.SUPABASE_URL
  const anonKey   = process.env.SUPABASE_ANON_KEY
  if (!urlBase || !anonKey) {
    return NextResponse.json(
      { error: 'Missing SUPABASE_URL or SUPABASE_ANON_KEY in env' },
      { status: 500 }
    )
  }

  // 2) Lazily create client (now that we know env is present)
  const supabase = createClient(urlBase, anonKey)

  // 3) Parse scanId from the incoming URL
  const { pathname } = new URL(request.url)
  const rawId        = pathname.split('/').pop()
  const scanId       = rawId ? parseInt(rawId, 10) : NaN
  if (Number.isNaN(scanId)) {
    return NextResponse.json({ error: 'Invalid scanId' }, { status: 400 })
  }

  // 4) Fetch only the columns you actually have
  const { data, error } = await supabase
    .from('scans')
    .select('status, results')
    .eq('id', scanId)
    .single()

  if (error) {
    return NextResponse.json(
      { status: 'error', error: error.message },
      { status: 500 }
    )
  }

  // 5) Build your shape
  const payload: {
    status: string
    result?: unknown
    logs: string[]
  } = {
    status: data.status,
    logs: [], // stub until you add a real `logs` column
  }

  if (data.status === 'done' && data.results != null) {
    payload.result = data.results
  }

  return NextResponse.json(payload)
}
