// src/app/api/scan/status/[scanId]/route.ts

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Redis }        from '@upstash/redis'

// ─── TYPES ─────────────────────────────────────────────────
interface CachePayload {
  status: string
  result?: unknown
  logs:   string[]
}

// ─── CONFIG ────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL!
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!
const redis        = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// ─── HANDLER ───────────────────────────────────────────────
export async function GET(request: Request) {
  console.log('🚦 status start @', Date.now())

  // 1) Parse scanId from URL
  const parts  = new URL(request.url).pathname.split('/')
  const scanId = parseInt(parts.at(-1) || '', 10)
  if (Number.isNaN(scanId)) {
    return NextResponse.json({ error: 'Invalid scanId' }, { status: 400 })
  }

  const cacheKey = `scan:${scanId}:status`

  // 2) Try Redis GET
  console.log('🔍 Redis GET @', Date.now())
  // tell TS this may be either our CachePayload or a raw JSON string
  const cachedRaw = await redis.get<CachePayload | string>(cacheKey)

  if (cachedRaw != null) {
    let fromCache: CachePayload | null = null

    if (typeof cachedRaw === 'object') {
      // Upstash SDK parsed it for us already
      fromCache = cachedRaw
      console.log('⚡️ Cache HIT (object) @', Date.now())
    } else {
      // it's a string → try JSON.parse
      try {
        fromCache = JSON.parse(cachedRaw) as CachePayload
        console.log('⚡️ Cache HIT (string) @', Date.now())
      } catch {
        console.warn('⚠️ Invalid JSON in cache, treating as MISS:', cachedRaw)
      }
    }

    if (fromCache) {
      const res = NextResponse.json(fromCache)
      res.headers.set('x-cache', 'HIT')
      return res
    }
  }

  // 3) Cache-miss → fetch from Supabase
  console.log('⚡️ Cache MISS @', Date.now())
  console.log('⏱️ Supabase fetch start @', Date.now())
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
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

  // 4) Build payload
  const payload: CachePayload = {
    status: data.status,
    logs:   [],
    ...(data.status === 'done' ? { result: data.results } : {}),
  }

  // 5) Cache it as a JSON string
  console.log('📝 Redis SET value →', JSON.stringify(payload))
  await redis.set(cacheKey, JSON.stringify(payload), { ex: 3600 })

  // 6) Return payload, marking MISS
  const res = NextResponse.json(payload)
  res.headers.set('x-cache', 'MISS')
  console.log('✅ Returning payload @', Date.now())
  return res
}
