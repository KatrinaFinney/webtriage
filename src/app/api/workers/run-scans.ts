/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/workers/run-scans.ts
import { createClient } from '@supabase/supabase-js'
import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'
import chromeAws from 'chrome-aws-lambda'

/** Minimal Lighthouse result shape */
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

// ─── Supabase client ─────────────────────────────────────────────────────
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Narrowed chrome-aws-lambda type
type ChromeAwsType = { executablePath: string; args: string[] }
const chromeLambda = (chromeAws as unknown) as ChromeAwsType

// ─── Worker to pick up pending scans ─────────────────────────────────────
async function runPendingScans() {
  console.log('▶️  Fetching up to 5 pending scans')
  const { data, error: fetchErr } = await supabase
    .from('scans')
    .select('id, site')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(5)

  if (fetchErr) {
    console.error('❌ Error fetching pending scans:', fetchErr)
    return
  }
  const pending = (data ?? []) as ScanRow[]
  if (pending.length === 0) {
    console.log('✅ No pending scans.')
    return
  }

  for (const scan of pending) {
    const { id, site } = scan
    console.log(`\n🔎 Processing scan #${id} for site ${site}`)

    let chrome: chromeLauncher.LaunchedChrome | null = null
    try {
      // 1) Launch Chrome
      chrome = await chromeLauncher.launch({
        chromePath: await chromeLambda.executablePath,
        chromeFlags: chromeLambda.args,
      })
      console.log(`🚀 Chrome launched on port ${chrome.port}`)

      // 2) Run Lighthouse
      const raw = await lighthouse(site, {
        port: chrome.port,
        output: 'json',
        logLevel: 'error',
        onlyCategories: ['performance', 'accessibility', 'seo'],
        throttlingMethod: 'provided',
      })
      const lhr = (raw as any).lhr as PSIResult
      if (!lhr) throw new Error('Lighthouse returned no LHR')
      console.log(`📊 perf=${Math.round((lhr.categories.performance.score || 0) * 100)}%`)

      // 3) Save & mark done
      const { error: updateErr } = await supabase
        .from('scans')
        .update({ results: lhr, status: 'done' })
        .eq('id', id)
      if (updateErr) throw updateErr
      console.log(`✅ Scan #${id} done`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`❌ Scan #${scan.id} failed:`, msg)
      await supabase
        .from('scans')
        .update({ status: 'error', error_message: msg })
        .eq('id', scan.id)
    } finally {
      if (chrome) {
        try {
          await chrome.kill()
          console.log(`🔒 Chrome killed for scan #${scan.id}`)
        } catch (killErr) {
          console.warn(`⚠️ Failed to kill Chrome #${scan.id}:`, killErr)
        }
      }
    }
  }

  console.log('\n🏁 All pending scans processed.')
}

runPendingScans().catch((err) => {
  console.error('🔥 Fatal worker error:', err)
  process.exit(1)
})
