// File: src/app/api/scan/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const site  = typeof body.site  === 'string' ? body.site.trim()  : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    if (!site || !email) {
      return NextResponse.json(
        { message: 'Both site and email are required' },
        { status: 400 }
      );
    }

    // 1) Rate‑limit: 24h per site+email
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase
      .from('scans')
      .select('id', { count: 'exact', head: true })
      .eq('site', site)
      .eq('email', email)
      .gte('created_at', oneDayAgo);

    if (countError) {
      console.error('[scan] rate‑check error', countError);
    } else if ((count ?? 0) > 0) {
      return NextResponse.json(
        {
          message:
            'You’ve already scanned this site in the last 24 hours. Please try again later.',
        },
        { status: 429 }
      );
    }

    // 2) Insert new scan
    const { data, error: insertErr } = await supabase
      .from('scans')
      .insert({ site, email, status: 'pending' })
      .select('id')
      .single();

    if (insertErr || !data) {
      console.error('[scan] insert error', insertErr);
      return NextResponse.json(
        { message: insertErr?.message ?? 'Failed to start scan.' },
        { status: 500 }
      );
    }

    // 3) Enqueue scan job (your existing logic)
    // await enqueueScan(data.id);

    return NextResponse.json({ scanId: data.id }, { status: 202 });
  } catch (err: unknown) {
    console.error('[scan] unexpected error', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
