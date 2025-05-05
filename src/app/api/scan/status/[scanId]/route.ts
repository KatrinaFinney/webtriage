// src/app/api/scan/status/[scanId]/route.ts
export const dynamic = 'force-dynamic'

import { NextResponse }     from 'next/server'
import { createClient }     from '@supabase/supabase-js'
import { Redis }            from '@upstash/redis'
import { resend }           from '@/lib/resend'
import { generatePdf }      from '@/lib/pdf'
import { buildServiceRecs } from '@/lib/services'
import { buildHeroSummary } from '@/lib/scanHelpers'
import normalizeLhr          from '@/lib/normalizeLhr'
import type { PSIResult }   from '@/types/webVitals'

// ─── CONFIG ──────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase     = createClient(SUPABASE_URL, SUPABASE_KEY)
const redis        = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

interface CachePayload {
  status: string
  result?: PSIResult
  logs:   string[]
}

export async function GET(request: Request) {
  // parse scanId
  const parts  = new URL(request.url).pathname.split('/')
  const scanId = parseInt(parts.at(-1)!, 10)
  if (Number.isNaN(scanId)) {
    return NextResponse.json({ error: 'Invalid scanId' }, { status: 400 })
  }
  const cacheKey = `scan:${scanId}:status`

  // 1) Try Redis cache
  const cachedRaw = await redis.get<CachePayload|string>(cacheKey)
  if (cachedRaw != null) {
    let fromCache: CachePayload | null = null
    if (typeof cachedRaw === 'object') {
      fromCache = cachedRaw
    } else {
      try { fromCache = JSON.parse(cachedRaw) } catch { /* ignore */ }
    }
    if (fromCache) {
      const res = NextResponse.json(fromCache)
      res.headers.set('x-cache', 'HIT')
      res.headers.set('Cache-Control', 'public, s-maxage=3, stale-while-revalidate=2')
      return res
    }
  }

  // 2) Fetch from Supabase (including site & email)
  const { data, error } = await supabase
    .from('scans')
    .select('status, results, site, email')
    .eq('id', scanId)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { status: 'error', error: error?.message ?? 'Not found' },
      { status: error ? 500 : 404 }
    )
  }

  // 3) Build the base payload
  const payload: CachePayload = {
    status: data.status,
    logs:   [], // if you eventually store logs, populate here
  }

  // 4) If done, normalize the LHR -> PSIResult
  if (data.status === 'done' && data.results) {
    try {
      const psi = normalizeLhr(data.results)  // your helper converts LHR JSON into PSIResult
      payload.result = psi
    } catch (normErr: unknown) {
      console.error('🔄 normalizeLhr failed', normErr)
      // fallback to raw data.results if you want:
      payload.result = data.results as PSIResult
    }
  }

  // 5) If done, generate PDF, email & cache
  if (data.status === 'done' && payload.result) {
    // 5a) PDF
    let pdfBase64 = ''
    try {
      const pdfBytes = await generatePdf({
        site:      data.site,
        result:    payload.result,
        scannedAt: new Date().toLocaleString(),
      })
      pdfBase64 = Buffer.from(pdfBytes).toString('base64')
    } catch (pdfErr: unknown) {
      console.error('📄 PDF generation failed', pdfErr)
    }

    // 5b) Services HTML
    const svcs = buildServiceRecs(payload.result.categories)
    const servicesHtml = svcs.map(svc => `
      <li style="margin-bottom:12px">
        <a href="${svc.link}"
           style="color:#4fd1c5;text-decoration:none;font-weight:700">
          ${svc.title}
        </a> — ${svc.summary}
      </li>
    `).join('')

    // 5c) Send email
    try {
      await resend.emails.send({
        from:    'onboarding@webtriage.dev',
        to:      [data.email],
        subject: `Your WebTriage Report for ${data.site}`,
        html: `
<!doctype html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:20px;background:#f4f4f4;font-family:Arial,sans-serif">
  <table role="presentation" width="100%" style="max-width:600px;margin:auto;background:#071a2f;color:#fff;padding:32px;border-radius:8px">
    <tr><td align="center">
      <h1 style="margin:0 0 16px;font-size:24px">WebTriage Report</h1>
      <p style="font-size:16px;margin:0 0 24px">Quick snapshot for <strong>${data.site}</strong></p>
      <p style="font-size:14px;line-height:1.5;margin:0 0 24px">
        ${buildHeroSummary(payload.result.categories)}
      </p>
      <a href="https://your-domain.com/reports/${encodeURIComponent(data.site)}.pdf"
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
        attachments: pdfBase64
          ? [{ content: pdfBase64, filename: 'webtriage-report.pdf' }]
          : [],
      })
    } catch (mailErr: unknown) {
      console.error('✉️  Email send failed', mailErr)
    }

    // 5d) Cache final result
    await redis.set(cacheKey, JSON.stringify(payload), { ex: 3600 })
  }

  // 6) Return JSON
  const res = NextResponse.json(payload)
  res.headers.set('x-cache','MISS')
  res.headers.set('Cache-Control','public, s-maxage=3, stale-while-revalidate=2')
  return res
}
