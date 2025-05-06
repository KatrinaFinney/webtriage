// File: src/app/api/scan/status/[scanId]/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse }        from 'next/server';
import { createClient }        from '@supabase/supabase-js';
import { Redis }               from '@upstash/redis';
import { resend }              from '@/lib/resend';
import { generatePdf }         from '@/lib/pdf';
import { buildServiceRecs }    from '@/lib/services';
import type { PSIResult }      from '@/types/webVitals';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase     = createClient(SUPABASE_URL, SUPABASE_KEY);

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface CachePayload {
  status: string;
  result?: PSIResult;
  logs:   string[];
}

export async function GET(request: Request) {
  let cacheHit = false;
  const scanId = Number(request.url.split('/').pop());
  if (Number.isNaN(scanId)) {
    return NextResponse.json({ message: 'Invalid scanId' }, { status: 400 });
  }

  const cacheKey = `scan:${scanId}:status`;

  // Try Redis cache
  try {
    const raw = await redis.get<string | CachePayload>(cacheKey);
    if (raw) {
      cacheHit = true;
      const payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const res = NextResponse.json(payload);
      res.headers.set('x-cache', 'HIT');
      res.headers.set('Cache-Control', 'public, s-maxage=3, stale-while-revalidate=2');
      return res;
    }
  } catch {
    // cache miss → continue
  }

  // Fetch from Supabase
  const { data, error } = await supabase
    .from('scans')
    .select('status, results, site, email')
    .eq('id', scanId)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { message: error?.message ?? 'Scan not found' },
      { status: error ? 500 : 404 }
    );
  }

  const payload: CachePayload = {
    status: data.status,
    logs:   [],
    ...(data.status === 'done' && data.results
      ? { result: data.results as PSIResult }
      : {})
  };

  // On done → generate PDF, send email & cache
  if (data.status === 'done' && data.results) {
    try {
      // a) Generate PDF attachment
      const buf = await generatePdf({
        site:      data.site,
        result:    data.results as PSIResult,
        scannedAt: new Date().toLocaleString(),
      });
      const pdfB64 = Buffer.from(buf).toString('base64');

      // b) Services HTML for email
      const servicesHtml = buildServiceRecs((data.results as PSIResult).categories)
        .map(s => `<li style="margin-bottom:12px">
          <a href="${s.link}" style="color:#4fd1c5;font-weight:700">${s.title}</a> — ${s.summary}
        </li>`)
        .join('');

      // c) Send email
      await resend.emails.send({
        from:    'onboarding@webtriage.dev',
        to:      [data.email],
        subject: `Your WebTriage Report for ${data.site}`,
        html: `
          <html><body>
            <p>Your site scan is complete.</p>
            <ul>${servicesHtml}</ul>
          </body></html>
        `,
        attachments: [{ content: pdfB64, filename: 'webtriage-report.pdf' }],
      });
    } catch (e) {
      console.error(`Scan ${scanId} email/PDF error:`, e);
    }

    // Cache the done payload
    await redis.set(cacheKey, JSON.stringify(payload), { ex: 3600 });
  }

  // Return JSON with headers
  const res = NextResponse.json(payload);
  res.headers.set('x-cache', cacheHit ? 'HIT' : 'MISS');
  res.headers.set('Cache-Control', 'public, s-maxage=3, stale-while-revalidate=2');
  return res;
}
