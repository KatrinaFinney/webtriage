// src/app/api/debug-supabase/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    SUPABASE_URL:              process.env.SUPABASE_URL   || null,
    SERVICE_ROLE_KEY:          process.env.SUPABASE_SERVICE_ROLE_KEY   || null,
    SUPABASE_ANON_KEY:         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null,
  })
}