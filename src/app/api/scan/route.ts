// src/app/api/scan/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Redis from 'ioredis'


// ─── Environment validation ────────────────────────────────────
const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  REDIS_URL,
  REDIS_TOKEN,
} = process.env

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !REDIS_URL || !REDIS_TOKEN) {
  throw new Error(
    'Missing one of: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, REDIS_URL or REDIS_TOKEN'
  )
}

// ─── Clients ───────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const redis = new Redis(REDIS_URL, { password: REDIS_TOKEN })

// ─── Helpers ───────────────────────────────────────────────────
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

// ─── POST /api/scan ────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1) Parse + validate JSON body
  let parsed: unknown
  try {
    parsed = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON payload' },
      { status: 400 }
    )
  }
  if (parsed === null || typeof parsed !== 'object') {
    return NextResponse.json(
      { error: 'Request body must be an object' },
      { status: 400 }
    )
  }
  const jsonBody = parsed as Record<string, unknown>
  const rawSite = jsonBody.site
  const email = jsonBody.email
  if (typeof rawSite !== 'string' || typeof email !== 'string') {
    return NextResponse.json(
      { error: '`site` and `email` are required and must be strings' },
      { status: 400 }
    )
  }

  // 2) Normalize + prepare
  const site = normalizeSite(rawSite)
  const today = new Date().toISOString().slice(0, 10)

  // 3) Insert row as pending
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

  console.log(`✅ Inserted scan ID ${data.id}`)

  // 4) Enqueue the new scan (don’t block request if Redis is down)
  try {
    await redis.xadd('scan:queue', '*', 'scanId', String(data.id))
    console.log(`✅ Enqueued scan ID ${data.id}`)
  } catch (enqueueErr) {
    console.error(
      '⚠️ Could not enqueue scan:',
      enqueueErr instanceof Error ? enqueueErr.message : enqueueErr
    )
  }

  // 5) Return immediately with 202
  return NextResponse.json({ scanId: data.id }, { status: 202 })
}
