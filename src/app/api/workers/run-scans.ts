/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'


/*---------- basic LHR + row types ----------*/
interface PSIResult {
  categories: {
    performance: { score: number | null }
    accessibility: { score: number | null }
    seo: { score: number | null }
  }
  audits: Record<string, { displayValue: string }>
}
interface ScanRow { id: number; site: string; email: string | null }

/*---------- env guards ----------*/
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY } = process.env
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RESEND_API_KEY) {
  throw new Error('SUPABASE_URL / SERVICE_ROLE_KEY / RESEND_API_KEY missing')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const resend   = new Resend(RESEND_API_KEY)

/*---------- helpers ----------*/
function normalizeUrl(raw: string): string {
  const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
  u.hash = ''; u.search = ''
  return u.toString()
}

/*────────── main runner ──────────*/
async function runPendingScans() {
  console.log('▶ Fetching pending scans…')

  const { data: rows } = await supabase
    .from('scans')
    .select('id, site, email')
    .eq('status', 'pending')
    .limit(3);

  if (!rows?.length) { console.log('✓ none'); return }

  const { default: chromeAws }  = await import('chrome-aws-lambda')
  const chromeLauncher          = await import('chrome-launcher')
  const puppeteer               = await import('puppeteer')
  const { default: lighthouse } = await import('lighthouse')

  for (const scan of rows as ScanRow[]) {
    const { id, site, email } = scan
    console.log(`\n🚧 #${id} ${site}`)

    let url: string
    try { url = normalizeUrl(site) }
    catch {
      await supabase.from('scans')
        .update({ status:'error', error_message:'INVALID_URL' }).eq('id', id)
      console.error('INVALID_URL'); continue
    }

    await supabase.from('scans').update({ status:'running' }).eq('id', id)

    try {
      /* launch browser */
      let browser: any, port: number
      try {
        browser = await chromeLauncher.launch({
          chromePath: await chromeAws.executablePath,
          chromeFlags: chromeAws.args,
        })
        port = browser.port
      } catch {
        const debugPort = 9222 + Math.floor(Math.random()*1000)
        browser = await puppeteer.launch({
          headless: true,
          args:[`--remote-debugging-port=${debugPort}`, '--no-sandbox'],
        })
        port = new URL(browser.wsEndpoint()).port as unknown as number
      }

      /* run lighthouse */
      const { lhr } = (await lighthouse(url, {
        port, output:'json', logLevel:'error',
        onlyCategories:['performance','accessibility','seo'],
        throttlingMethod:'provided',
      })) as unknown as { lhr: PSIResult }

      /* close */
      if (browser.kill) await browser.kill(); else await browser.close()
      await new Promise(r=>setTimeout(r,1000))

      /* save result */
      await supabase.from('scans')
        .update({ status:'done', results:lhr }).eq('id', id)

      /* optional: email PDF */
      if (email) {
        const page = await puppeteer.launch({ headless:true, args:['--no-sandbox'] })
          .then(b=>b.newPage())
        await page.goto(`https://www.webtriage.pro/scan?scanId=${id}`,{waitUntil:'networkidle0'})
        const pdfUint8 = await page.pdf({ format:'A4' })       // Uint8Array
        const pdfBuffer = Buffer.from(pdfUint8)  
        await page.browser().close()

        await resend.emails.send({
          from:'WebTriage <reports@webtriage.pro>',
          to: email,
          subject:`Your WebTriage report (${url})`,
          html:`<p>Your full PDF report is attached.</p>`,
          attachments:[{
            filename:`WebTriage-${new URL(url).hostname}.pdf`,
            content: pdfBuffer,
          }]
        })
        console.log(`✉️  emailed → ${email}`)
      }

      console.log(`✓ #${id} done`)
    } catch (e:any) {
      await supabase.from('scans')
        .update({ status:'error', error_message:e.message }).eq('id', id)
      console.error(`✗ #${id}`, e.message)
    }
  }
}

runPendingScans().catch(e=>console.error('fatal',e))
