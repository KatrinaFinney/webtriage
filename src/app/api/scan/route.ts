/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/scan/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface ScanRequest {
  site: string
  email: string
}

// ─── Setup Supabase ──────────────────────────────────────────────────────
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ─── Normalize URL ───────────────────────────────────────────────────────
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

// ─── Kickoff POST (insert pending scan) ──────────────────────────────────
export async function POST(req: NextRequest) {
  // 1) Parse + validate body
  let body: unknown
  try {
    body = await req.json()
  } catch (err: unknown) {
    console.error('❌ JSON parse error:', err)
    return NextResponse.json(
      { error: 'Invalid JSON payload' },
      { status: 400 }
    )
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as any).site !== 'string' ||
    typeof (body as any).email !== 'string'
  ) {
    return NextResponse.json(
      { error: '`site` and `email` are required' },
      { status: 400 }
    )
  }

  const { site: rawSite, email } = body as ScanRequest

  // 2) Normalize & prepare
  const site = normalizeSite(rawSite)
  const today = new Date().toISOString().slice(0, 10)

  // 3) Insert row as pending
  const { data, error } = await supabase
    .from('scans')
    .insert([
      {
        site,
        email,
        status: 'pending',
        created_day: today,
      },
    ])
    .select('id')
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || 'Database error' },
      { status: 500 }
    )
  }

  // 4) Return scanId immediately
  return NextResponse.json({ scanId: data.id }, { status: 202 })
}
