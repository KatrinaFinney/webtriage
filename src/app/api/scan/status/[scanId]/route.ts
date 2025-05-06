export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';
import { resend } from '@/lib/resend';
import { generatePdf } from '@/lib/pdf';
import { buildServiceRecs } from '@/lib/services';
import { buildHeroSummary } from '@/lib/scanHelpers';
import type { PSIResult } from '@/types/webVitals';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface CachePayload {
  status: string;
  result?: PSIResult;
  logs: string[];
}

export async function GET(request: Request) {
  try {
    // 1) parse scanId
    const urlParts = new URL(request.url).pathname.split('/');
    const scanId = parseInt(urlParts.at(-1)!, 10);
    if (Number.isNaN(scanId)) {
      return NextResponse.json({ error: 'Invalid scanId' }, { status: 400 });
    }
    const cacheKey = `scan:${scanId}:status`;

    // 2) try Redis cache
    const cachedRaw = await redis.get<CachePayload | string>(cacheKey);
    if (cachedRaw != null) {
      let fromCache: CachePayload | null = null;
      if (typeof cachedRaw === 'object') {
        fromCache = cachedRaw;
      } else {
        try {
          fromCache = JSON.parse(cachedRaw) as CachePayload;
        } catch {
          /* invalid JSON → treat as cache miss */
        }
      }
      if (fromCache) {
        const res = NextResponse.json(fromCache);
        res.headers.set('x‑cache', 'HIT');
        res.headers.set(
          'Cache‑Control',
          'public, s-maxage=3, stale-while-revalidate=2'
        );
        return res;
      }
    }

    // 3) cache miss → fetch from Supabase (including site & email)
    const { data, error } = await supabase
      .from('scans')
      .select('status, results, site, email')
      .eq('id', scanId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { status: 'error', error: error?.message ?? 'Not found' },
        { status: error ? 500 : 404 }
      );
    }

    // 4) assemble payload
    const payload: CachePayload = {
      status: data.status,
      logs: [], // if you track logs, fill in here
      ...(data.status === 'done' ? { result: data.results as PSIResult } : {}),
    };

    // 5) if done → PDF + email + cache
    if (data.status === 'done' && data.results) {
      // a) generate PDF
      const pdfBytes = await generatePdf({
        site: data.site,
        result: data.results as PSIResult,
        scannedAt: new Date().toLocaleString(),
      });
      const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

      // b) build services HTML
      const svcs = buildServiceRecs(
        (data.results as PSIResult).categories
      );
      const servicesHtml = svcs
        .map(
          (svc) => `
        <li style="margin-bottom:12px;">
          <a href="${svc.link}"
             style="color:#4fd1c5;text-decoration:none;font-weight:700">
            ${svc.title}
          </a> — ${svc.summary}
        </li>`
        )
        .join('');

      // c) send via Resend
      try {
        console.log(`[scan ${scanId}] sending email…`);
        await resend.emails.send({
          from: 'onboarding@webtriage.dev',
          to: [data.email],
          subject: `Your WebTriage Report for ${data.site}`,
          html: `
<!doctype html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:20px;background:#f4f4f4;font-family:Arial,sans-serif">
  <table role="presentation" width="100%" style="max-width:600px;margin:auto;background:#071a2f;color:#fff;padding:32px;border-radius:8px">
    <tr><td align="center">
      <h1 style="margin:0 0 16px;font-size:24px">WebTriage Report</h1>
      <p style="font-size:16px;margin:0 0 24px">
        Quick snapshot for <strong>${data.site}</strong>
      </p>
      <p style="font-size:14px;line-height:1.5;margin:0 0 24px">
        ${buildHeroSummary((data.results as PSIResult).categories)}
      </p>
      <a href="https://your-domain.com/reports/${encodeURIComponent(
        data.site
      )}.pdf"
         style="display:inline-block;padding:12px 24px;background:#4fd1c5;color:#000;text-decoration:none;border-radius:4px;font-weight:700;margin-bottom:32px">
        Download Your PDF
      </a>
      <h2 style="font-size:18px;margin:32px 0 12px">Recommended Next Steps</h2>
      <ul style="list-style:none;padding:0;margin:0 0 32px">
        ${servicesHtml}
      </ul>
      <p style="font-size:14px;line-height:1.5;margin:0">
        Need help picking a plan? Reply to this email—we’re here 24/7.
      </p>
    </td></tr>
  </table>
</body></html>
          `,
          attachments: [
            {
              content: pdfBase64,
              filename: 'webtriage-report.pdf',
            },
          ],
        });
        console.log(`[scan ${scanId}] email sent`);
      } catch (err) {
        console.error(`[scan ${scanId}] email failed`, err);
      }

      // d) cache the final payload
      await redis.set(cacheKey, JSON.stringify(payload), { ex: 3600 });
    }

    // 6) finally, return JSON
    const response = NextResponse.json(payload);
    response.headers.set('x‑cache', 'MISS');
    response.headers.set(
      'Cache‑Control',
      'public, s-maxage=3, stale-while-revalidate=2'
    );
    return response;
  } catch (err) {
    // catch anything unexpected
    console.error('❌ Unhandled in /api/scan/status:', err);
    return NextResponse.json(
      { status: 'error', error: String(err) },
      { status: 500 }
    );
  }
}
