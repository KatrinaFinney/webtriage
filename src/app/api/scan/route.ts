// src/app/api/scan/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient }          from '@supabase/supabase-js'
import { Redis }                 from '@upstash/redis'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function POST(req: NextRequest) {
  // 1) parse & validate
  let body: { site: string; email: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }
  const { site: rawSite, email } = body
  if (!rawSite || !email) {
    return NextResponse.json(
      { error: '`site` and `email` are required' },
      { status: 400 }
    )
  }

  // 2) normalize & insert
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('scans')
    .insert([{ site: rawSite.trim(), email, status: 'pending', created_day: today }])
    .select('id')
    .single()

  if (error || !data) {
    console.error('DB insert error', error)
    return NextResponse.json(
      { error: error?.message || 'Database error' },
      { status: 500 }
    )
  }
  console.log(`✅ Inserted scan ID ${data.id}`)

  // 3) enqueue
  try {
    // Upstash REST xadd signature: xadd(stream, id, record)
    await redis.xadd('scan:queue', '*', { scanId: String(data.id) })
    console.log(`✅ Enqueued scan ID ${data.id}`)
  } catch (e) {
    console.warn('⚠️ Could not enqueue scan:', e)
  }

  // 4) return immediately
  return NextResponse.json({ scanId: data.id }, { status: 202 })
}
