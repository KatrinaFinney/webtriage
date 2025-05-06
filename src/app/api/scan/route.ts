// src/app/api/scan/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Redis }        from '@upstash/redis'

// ─── Setup Supabase & Redis clients ─────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// ─── Enforce dynamic behavior ────────────────────────────────────────
export const dynamic = 'force-dynamic'

// ─── Only allow POST ────────────────────────────────────────────────
export async function GET() {
  console.warn('[api/scan] GET attempted – only POST is supported')
  return NextResponse.json({ error: 'Method GET not allowed' }, { status: 405 })
}

export async function POST(req: NextRequest) {
  console.log('[api/scan] ▶ POST handler start @', new Date().toISOString())
  console.log('[api/scan] incoming URL:', req.url)

  // 1) Parse + validate JSON
  let body: { site: string; email: string }
  try {
    body = await req.json()
    console.log('[api/scan] parsed body:', body)
  } catch (err) {
    console.error('[api/scan] ❌ JSON parse error:', err)
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const { site: rawSite, email } = body
  if (!rawSite || !email) {
    console.warn('[api/scan] ❌ Missing site or email')
    return NextResponse.json(
      { error: '`site` and `email` are required' },
      { status: 400 }
    )
  }

  // 2) Insert a new scan row
  const today = new Date().toISOString().slice(0, 10)
  console.log('[api/scan] 🗄️ Inserting scan record for:', rawSite, email)
  const { data, error } = await supabase
    .from('scans')
    .insert([{ site: rawSite.trim(), email, status: 'pending', created_day: today }])
    .select('id')
    .single()

  if (error || !data) {
    console.error('[api/scan] ❌ DB insert error:', error)
    return NextResponse.json(
      { error: error?.message || 'Database error' },
      { status: 500 }
    )
  }
  console.log(`[api/scan] ✅ Inserted scan ID ${data.id}`)

  // 3) Enqueue into Redis stream
  try {
    await redis.xadd('scan:queue', '*', { scanId: String(data.id) })
    console.log(`[api/scan] ✅ Enqueued scan ID ${data.id} into Redis stream`)
  } catch (e) {
    console.warn('[api/scan] ⚠️ Could not enqueue scan ID', data.id, e)
  }

  // 4) Return immediately with 202
  console.log(`[api/scan] ← responding 202 with scanId ${data.id}`)
  return NextResponse.json({ scanId: data.id }, { status: 202 })
}
