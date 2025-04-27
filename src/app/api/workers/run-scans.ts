/* eslint-disable @typescript-eslint/no-explicit-any */

// ──────────────────────────────────────────────────────────────
//  run-scans.ts   –  background worker
//  compile: npm run build-worker   (tsconfig.worker.json)
//  run:     npm run run-worker     (needs SUPABASE_ env vars)
// ──────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'

/** Minimal slice of Lighthouse we store */
interface PSIResult {
  categories: {
    performance: { score: number | null }
    accessibility: { score: number | null }
    seo: { score: number | null }
  }
  audits?: Record<string, unknown>
}
interface ScanRow {
  id: number
  site: string
}

/* ─── 0)  Env guard ─────────────────────────────────────────── */
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

/* ─── 1)  Supabase client ───────────────────────────────────── */
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

/* helper – ensure https:// and strip hash/query */
function normalizeUrl(raw: string): string {
  const candidate = raw.startsWith('http') ? raw : `https://${raw}`
  const u = new URL(candidate)
  u.hash = ''
  u.search = ''
  return u.toString()
}

/* ─── 2)  Main runner ───────────────────────────────────────── */
async function runPendingScans() {
  console.log('▶ Fetching up to 5 pending scans…')

  const { data: pending, error } = await supabase
    .from('scans')
    .select('id, site')
    .eq('status', 'pending')
    .limit(5)

  if (error) {
    console.error('❌ DB fetch error:', error.message)
    return
  }
  if (!pending?.length) {
    console.log('✅ No pending scans.')
    return
  }

  /* dynamic ESM imports (so this works from CommonJS) */
  const { default: chromeAws }  = await import('chrome-aws-lambda')
  const chromeLauncher          = await import('chrome-launcher')
  const puppeteer               = await import('puppeteer')
  const { default: lighthouse } = await import('lighthouse')

  for (const scan of pending as ScanRow[]) {
    const { id, site } = scan
    console.log(`\n🔎  #${id} – raw "${site}"`)
    let url: string

    /* 2.0) Normalise URL */
    try {
      url = normalizeUrl(site)
      console.log(`    normalized → ${url}`)
    } catch {
      console.error(`❌ INVALID_URL for #${id}`)
      await supabase
        .from('scans')
        .update({ status: 'error', error_message: 'INVALID_URL' })
        .eq('id', id)
      continue
    }

    // mark as running
    await supabase.from('scans').update({ status: 'running' }).eq('id', id)

    try {
      /* 2.1) Launch Chromium */
      let browser: any
      let port: number

      try {
        // works in Vercel / AWS Lambda
        browser = await chromeLauncher.launch({
          chromePath: await chromeAws.executablePath, // null locally
          chromeFlags: chromeAws.args,
        })
        port = browser.port
        console.log(`🚀 chrome-aws-lambda (port ${port})`)
      } catch {
        // local fallback – unique port each launch
        const debugPort = 9222 + Math.floor(Math.random() * 1000)
        browser = await puppeteer.launch({
          headless: true,
          args: [`--remote-debugging-port=${debugPort}`, '--no-sandbox'],
        })
        port = new URL(browser.wsEndpoint()).port as unknown as number
        console.log(`🚀 Puppeteer (port ${port})`)
      }

      /* 2.2) Run Lighthouse */
      const { lhr } = (await lighthouse(url, {
          port,
          output: 'json',
          logLevel: 'error',
          onlyCategories: ['performance', 'accessibility', 'seo'],
          throttlingMethod: 'provided',
      })) as unknown as { lhr: PSIResult }

      console.log(
        `📊  perf ${Math.round((lhr.categories.performance.score ?? 0) * 100)} /` +
          ` seo ${Math.round((lhr.categories.seo.score ?? 0) * 100)} /` +
          ` a11y ${Math.round((lhr.categories.accessibility.score ?? 0) * 100)}`
      )

      /* 2.3) Close browser & short grace delay */
      if (browser.kill) await browser.kill()
      else if (browser.close) await browser.close()
      await new Promise((r) => setTimeout(r, 1000)) // free port
      console.log('🔒 Browser closed')

      /* 2.4) Save results */
      const { error: saveErr } = await supabase
        .from('scans')
        .update({ status: 'done', results: lhr })
        .eq('id', id)

      if (saveErr) throw new Error(`Save failed: ${saveErr.message}`)
      console.log(`✅ Scan #${id} saved`)
    } catch (err: any) {
      console.error(`❌ Scan #${id} error:`, err.message)
      await supabase
        .from('scans')
        .update({ status: 'error', error_message: err.message })
        .eq('id', id)
    }
  }

  console.log('\n🏁 All pending scans processed.')
}

/* ─── 3) Kick off when invoked directly ────────────────────── */
runPendingScans().catch((e) =>
  console.error('🔥 Fatal error in run-scans worker:', e)
)
