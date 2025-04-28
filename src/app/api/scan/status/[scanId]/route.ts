/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/scan/status/[scanId]/route.ts

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// first try the anon key, fallback to service-role if you haven’t provided an ANON one
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY =
  process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  // only warn at build-time, don’t throw
  // you’ll see this in Vercel logs if you forgot to set env
  console.warn('⚠️ Missing SUPABASE_URL or SUPABASE_KEY in env')
}

// safe createClient even if KEY is empty string
const supabase = createClient(SUPABASE_URL ?? '', SUPABASE_KEY ?? '')

/**
 * GET /api/scan/status/[scanId]
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(_req: Request, context: any) {
  const raw = context.params?.scanId
  const id = parseInt(raw, 10)
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid scan ID' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('scans')
    .select('status, results')
    .eq('id', id)
    .single()

  if (error) {
    // not found
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    // other DB error
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(
    { status: data.status, result: data.results ?? null },
    { status: 200 }
  )
}
