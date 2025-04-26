// src/app/api/scan/status/[scanId]/route.ts

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ─── Init Supabase client ───────────────────────────────────────────────
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ─── GET handler ─────────────────────────────────────────────────────────
export async function GET(
  request: Request,
  { params }: { params: Promise<{ scanId: string }> }
) {
  // Await the promise to pull out your dynamic segment
  const { scanId } = await params
  const id = parseInt(scanId, 10)
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid scanId' }, { status: 400 })
  }

  // Fetch status, results, and optional logs
  const { data, error } = await supabase
    .from('scans')
    .select('status, results, logs')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json(
    {
      status: data.status,
      result: data.results ?? null,
      logs: data.logs ?? null,
    },
    { status: 200 }
  )
}
