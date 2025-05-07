// File: src/app/api/scan/status/[scanId]/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse }        from 'next/server';
import { createClient }        from '@supabase/supabase-js';
import { Redis }               from '@upstash/redis';
import { resend }              from '@/lib/resend';
import { generatePdf }         from '@/lib/pdf';
import { buildServiceRecs }    from '@/lib/services';
import normalizeLhr            from '@/lib/normalizeLhr';
import type { PSIResult }      from '@/types/webVitals';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface CachePayload {
  status:    string;
  logs:      string[];
  result?:   PSIResult;
  scannedAt?: string;
}

export async function GET(request: Request) {
  let cacheHit = false;
  const scanId = Number(new URL(request.url).pathname.split('/').pop());
  if (Number.isNaN(scanId)) {
    return NextResponse.json({ message: 'Invalid scanId' }, { status: 400 });
  }

  const cacheKey = `scan:${scanId}:status`;

  // 1) Try Redis cache
  try {
    const raw = await redis.get<string | CachePayload>(cacheKey);
    if (raw) {
      cacheHit = true;
      const payload: CachePayload =
        typeof raw === 'string' ? JSON.parse(raw) : raw;
      const res = NextResponse.json(payload);
      res.headers.set('x-cache', 'HIT');
      res.headers.set(
        'Cache-Control',
        'public, s-maxage=3, stale-while-revalidate=2'
      );
      return res;
    }
  } catch {
    // ignore
  }

  // 2) Fetch from Supabase
  const { data, error } = await supabase
    .from('scans')
    .select('status, results, finished_at, site, email')
    .eq('id', scanId)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { message: error?.message ?? 'Scan not found' },
      { status: error ? 500 : 404 }
    );
  }

  // 3) Build payload, normalizing LHR → PSIResult
  const payload: CachePayload = {
    status: data.status,
    logs:   [],
    ...(data.status === 'done' && data.results
      ? {
          result:    normalizeLhr(data.results),
          scannedAt: data.finished_at as string,
        }
      : {}),
  };

  // 4) If done → PDF, email, cache
  if (data.status === 'done' && data.results) {
    try {
      const buf = await generatePdf({
        site:      data.site,
        result:    payload.result!,
        scannedAt: payload.scannedAt!,
      });
      const pdfB64 = Buffer.from(buf).toString('base64');

      const servicesHtml = buildServiceRecs(
        payload.result!.categories
      )
        .map(
          (s) => `<li style="margin-bottom:12px">
            <a href="${s.link}" style="color:#4fd1c5;font-weight:700">${
            s.title
          }</a> — ${s.summary}
          </li>`
        )
        .join('');

      await resend.emails.send({
        from:    'onboarding@webtriage.dev',
        to:      [data.email],
        subject: `Your WebTriage Report for ${data.site}`,
        html: `<p>Your site scan is complete — see your full report below:</p>
               <ul>${servicesHtml}</ul>`,
        attachments: [{ content: pdfB64, filename: 'webtriage-report.pdf' }],
      });
    } catch (e) {
      console.error(`Scan ${scanId} email/PDF error:`, e);
    }

    // cache the normalized payload
    await redis.set(cacheKey, JSON.stringify(payload), { ex: 3600 });
  }

  // 5) Return JSON with cache headers
  const res = NextResponse.json(payload);
  res.headers.set('x-cache', cacheHit ? 'HIT' : 'MISS');
  res.headers.set(
    'Cache-Control',
    'public, s-maxage=3, stale-while-revalidate=2'
  );
  return res;
}
