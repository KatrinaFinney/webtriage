// src/app/api/scan/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Redis from 'ioredis'

interface ScanRequest {
  site: string
  email: string
}

// ─── Environment validation ────────────────────────────────────
const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  REDIS_URL,
  REDIS_TOKEN,
} = process.env

if (
  !SUPABASE_URL ||
  !SUPABASE_SERVICE_ROLE_KEY ||
  !REDIS_URL ||
  !REDIS_TOKEN
) {
  throw new Error(
    'Missing one of SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, REDIS_URL or REDIS_TOKEN'
  )
}

// ─── Clients ───────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const redis    = new Redis(REDIS_URL, { password: REDIS_TOKEN })

// ─── Helpers ────────────────────────────────────────────────────

// Normalize the incoming URL string
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

// Type‐guard for our expected POST body shape
function isScanRequest(body: unknown): body is ScanRequest {
  return (
    typeof body === 'object' &&
    body !== null &&
    'site' in body &&
    typeof (body as Record<string, unknown>).site === 'string' &&
    'email' in body &&
    typeof (body as Record<string, unknown>).email === 'string'
  )
}

// ─── POST /api/scan ────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1) Parse raw JSON
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON payload' },
      { status: 400 }
    )
  }

  // 2) Validate with our type‐guard
  if (!isScanRequest(body)) {
    return NextResponse.json(
      { error: '`site` and `email` are required' },
      { status: 400 }
    )
  }
  const { site: rawSite, email } = body

  // 3) Normalize + prepare
  const site  = normalizeSite(rawSite)
  const today = new Date().toISOString().slice(0, 10)

  // 4) Insert row as pending
  const { data, error } = await supabase
    .from('scans')
    .insert([{ site, email, status: 'pending', created_day: today }])
    .select('id')
    .single()

  if (error || !data) {
    console.error('❌ Supabase insert error:', error)
    return NextResponse.json(
      { error: error?.message || 'Database error' },
      { status: 500 }
    )
  }

  // ←— **DEBUG LOG**: confirm insertion
  console.log(`✅ Inserted scan ID ${data.id}`)

  // 4) Enqueue the new scan (don’t fail the request if Redis is down)
  try {
    await redis.xadd('scan:queue', '*', 'scanId', String(data.id))
    // ←— **DEBUG LOG**: confirm enqueue
    console.log(`✅ Enqueued scan ID ${data.id}`)
  } catch (e) {
    // if it's an Error, print its message, otherwise the whole thing
    console.error('⚠️ Could not enqueue scan:',
      e instanceof Error ? e.message : e
   )
  }

  // 5) Return immediately with 202
  return NextResponse.json({ scanId: data.id }, { status: 202 })
}
