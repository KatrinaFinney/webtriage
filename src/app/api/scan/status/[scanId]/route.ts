// src/app/api/scan/status/[scanId]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Redis }        from '@upstash/redis'

// ─── CONFIG ────────────────────────────────────────────────
const supabaseUrl   = process.env.SUPABASE_URL!
const supabaseKey   = process.env.SUPABASE_SERVICE_ROLE_KEY!
const redis         = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

// ─── STATUS HANDLER ───────────────────────────────────────
export async function GET(request: Request) {
  console.log('🚦 status start @', Date.now())
  
  // Parse scanId
  const parts  = new URL(request.url).pathname.split('/')
  const scanId = parseInt(parts.pop() || '', 10)
  if (Number.isNaN(scanId)) {
    return NextResponse.json({ error: 'Invalid scanId' }, { status: 400 })
  }

  const cacheKey = `scan:${scanId}:status`

  // 1) Try Redis cache (sub-10 ms) :contentReference[oaicite:4]{index=4}
  console.log('🔍 Redis GET @', Date.now())
  const cached = await redis.get<string>(cacheKey)
  if (cached) {
    console.log('⚡️ Cache HIT @', Date.now())
    return NextResponse.json(JSON.parse(cached))
  }

  // 2) Cache-miss → fetch Supabase (1–2 s) :contentReference[oaicite:5]{index=5}
  console.log('⏱️ Supabase fetch start @', Date.now())
  const supabase = createClient(supabaseUrl, supabaseKey)
  const { data, error } = await supabase
    .from('scans')
    .select('status,results')
    .eq('id', scanId)
    .single()
  console.log('⏱️ Supabase fetch end @', Date.now())

  if (error || !data) {
    console.error('❌ Supabase error or no data:', error)
    return NextResponse.json({ status: 'error', error: error?.message ?? 'Not found' }, { status: error ? 500 : 404 })
  }

  // 3) Build payload & populate Redis (TTL = 60 s)
  const payload = {
    status: data.status,
    result: data.status === 'done' ? data.results : undefined,
    logs:   [], // wire in real logs later
  }
  console.log('📝 Redis SET @', Date.now())
  await redis.set(cacheKey, JSON.stringify(payload), { ex: 60 })

  console.log('✅ Returning payload @', Date.now())
  return NextResponse.json(payload)
}
