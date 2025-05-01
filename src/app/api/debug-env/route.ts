// src/app/api/debug-env/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || null,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || null,
    UPSTASH_REDIS_URL:       process.env.UPSTASH_REDIS_URL       || null,
    UPSTASH_REDIS_TOKEN:     process.env.UPSTASH_REDIS_TOKEN     || null,
  })
}
