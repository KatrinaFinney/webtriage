// File: src/app/api/scan/status/[scanId]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Redis }        from '@upstash/redis'

// ─── CONFIG ────────────────────────────────────────────────
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const redis       = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// ─── STATUS HANDLER ───────────────────────────────────────
export async function GET(request: Request) {
  console.log('🚦 status start @', Date.now())

  // Parse scanId from URL
  const parts  = new URL(request.url).pathname.split('/')
  const rawId  = parts.pop() || ''
  const scanId = parseInt(rawId, 10)
  if (Number.isNaN(scanId)) {
    return NextResponse.json({ error: 'Invalid scanId' }, { status: 400 })
  }

  const cacheKey = `scan:${scanId}:status`

  // ─── Try Redis cache ─────────────────────────────────────
  console.log('🔍 Redis GET @', Date.now())
  const cachedRaw = await redis.get<string>(cacheKey)
  let fromCache: { status: string; result?: unknown; logs: string[] } | null = null

  if (cachedRaw) {
    try {
      fromCache = JSON.parse(cachedRaw)
      console.log('⚡️ Cache HIT @', Date.now())
    } catch (e) {
      console.warn('⚠️ Invalid JSON in cache, treating as MISS:', cachedRaw)
      fromCache = null
    }
  }

  if (fromCache) {
    const res = NextResponse.json(fromCache)
    res.headers.set('x-cache', 'HIT')
    return res
  }

  // ─── Cache MISS → Supabase fetch ─────────────────────────
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

  // ─── Build payload & populate Redis ────────────────────
  const payload = {
    status: data.status,
    result: data.status === 'done' ? data.results : undefined,
    logs:   [], // no logs implemented yet
  }
  console.log('📝 Redis SET @', Date.now())
  await redis.set(cacheKey, JSON.stringify(payload), { ex: 3600 }) // 1 hour TTL

  // ─── Return response with MISS header ─────────────────────
  console.log('✅ Returning payload @', Date.now())
  const res = NextResponse.json(payload)
  res.headers.set('x-cache', 'MISS')
  return res
}
