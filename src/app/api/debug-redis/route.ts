import { NextResponse } from 'next/server'
import { Redis }        from '@upstash/redis'

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function GET() {
  const key = `health:${Date.now()}`
  // 1) write “ok”
  await redis.set(key, 'ok', { ex: 60 })
  // 2) read it back
  const val = await redis.get<string>(key)
  return NextResponse.json({ key, val })
}
