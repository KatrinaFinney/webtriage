// src/app/api/scan/status/[scanId]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Redis }        from '@upstash/redis'

// ─── CONFIG ────────────────────────────────────────────────
const supabaseUrl   = process.env.SUPABASE_URL!
const supabaseKey   = process.env.SUPABASE_SERVICE_ROLE_KEY!
const redis         = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
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

  // 1) Try Redis cache (fast)
  console.log('🔍 Redis GET @', Date.now())
  const cached = await redis.get<string>(cacheKey)
  if (cached) {
    console.log('⚡️ Cache HIT @', Date.now())
    const response = NextResponse.json(JSON.parse(cached))
    response.headers.set('x-cache', 'HIT')
    return response
  }

  // 2) Cache-miss → fetch from Supabase (slower)
  console.log('⚡️ Cache MISS @', Date.now())
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
    return NextResponse.json(
      { status: 'error', error: error?.message ?? 'Not found' },
      { status: error ? 500 : 404 }
    )
  }

  // 3) Build payload & populate Redis
  const payload = {
    status: data.status,
    result: data.status === 'done' ? data.results : undefined,
    logs:   [], // no logs implemented yet
  }
  console.log('📝 Redis SET @', Date.now())
  await redis.set(cacheKey, JSON.stringify(payload), { ex: 60 })

  // 4) Return response with MISS header
  console.log('✅ Returning payload @', Date.now())
  const response = NextResponse.json(payload)
  response.headers.set('x-cache', 'MISS')
  return response
}
