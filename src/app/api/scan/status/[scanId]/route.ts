/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/scan/status/[scanId]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'

// — force this route to run server-side
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// — your Supabase service-role client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  req: NextRequest,
  ctx: any                      // ← must be `any` so Next.js accepts it
): Promise<NextResponse> {
  // 1) pull the scanId out of ctx.params
  const scanId = parseInt(ctx.params.scanId as string, 10)
  if (Number.isNaN(scanId)) {
    return NextResponse.json({ error: 'Invalid scan ID' }, { status: 400 })
  }

  // 2) fetch from your scans table
  const { data, error } = await supabase
    .from('scans')
    .select('status, results, logs')
    .eq('id', scanId)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 3) spit back exactly what the client expects
  return NextResponse.json(
    {
      status: data.status,
      result: data.results ?? undefined,
      logs:   Array.isArray(data.logs) ? data.logs : undefined,
    },
    { status: 200 }
  )
}
