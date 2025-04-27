/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/scan/status/[scanId]/route.ts

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 🧮 Minimal shape of what we store in `scans.results`
type PSIResult = {
  categories: {
    performance: { score: number | null }
    accessibility: { score: number | null }
    seo: { score: number | null }
  }
  audits?: Record<string, any>
}

// Pull your Supabase creds from env
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

interface StatusResponse {
  status: string
  result?: PSIResult
}

// GET /api/scan/status/:scanId
export async function GET(
  _req: Request,
  { params }: { params: { scanId: string } }
) {
  const scanId = parseInt(params.scanId, 10)
  if (Number.isNaN(scanId)) {
    return NextResponse.json(
      { error: 'Invalid scanId' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('scans')
    .select('status, results')
    .eq('id', scanId)
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  const resp: StatusResponse = { status: data.status }
  if (data.status === 'done' && data.results) {
    resp.result = data.results as PSIResult
  }

  return NextResponse.json(resp, { status: 200 })
}
