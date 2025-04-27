// src/app/api/workers/run-scans.ts

import { createClient } from '@supabase/supabase-js';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import chromeAws from 'chrome-aws-lambda';
import { Resend } from 'resend';

/* ─── Config -------------------------------------------------- */

if (!process.env.SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    !process.env.RESEND_API_KEY) {
  throw new Error('SUPABASE_URL / SERVICE_ROLE_KEY / RESEND_API_KEY missing');
}

const BATCH_SIZE = parseInt(
  process.argv[2] || process.env.SCAN_BATCH_SIZE || '3',
  10
);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

/* ─── Helper: build email body -------------------------------- */

interface PSIResult {
  categories: {
    performance: { score: number | null };
    accessibility: { score: number | null };
    seo: { score: number | null };
  };
  audits?: Record<string, unknown>;
}

function buildEmailHTML(url: string, lhr: PSIResult, publicLink: string) {
  const perf = Math.round((lhr.categories.performance.score || 0) * 100);
  const seo  = Math.round((lhr.categories.seo.score || 0) * 100);
  const a11y = Math.round((lhr.categories.accessibility.score || 0) * 100);

  return /* html */ `
    <h2 style="margin:0 0 12px;font-family:system-ui">
      Your WebTriage report for ${url}
    </h2>
    <table style="font-family:system-ui;border-collapse:collapse">
      <tr><th align="left">Performance</th><td>${perf}/100</td></tr>
      <tr><th align="left">SEO</th><td>${seo}/100</td></tr>
      <tr><th align="left">Accessibility</th><td>${a11y}/100</td></tr>
    </table>
    <p style="font-family:system-ui;margin-top:12px">
      View the full interactive page:<br/>
      <a href="${publicLink}">${publicLink}</a>
    </p>
    <p style="font-family:system-ui;font-size:.9rem;color:#666">
      Need deeper fixes? Reply to this email any time.
    </p>
  `;
}

/* placeholder − replace with real generator */
async function genPdfBuffer(): Promise<Buffer> {
    /* TODO: generate real PDF from Lighthouse result */
    return Buffer.from('PDF coming soon');
}

/* ─── Main worker --------------------------------------------- */

async function runPendingScans() {
  console.log(`▶ Fetching up to ${BATCH_SIZE} pending scans…`);

  const { data: pending, error } = await supabase
    .from('scans')
    .select('id, site, email')
    .eq('status', 'pending')
    .order('requested_at', { ascending: true })
    .limit(BATCH_SIZE);

  if (error) {
    console.error('❌  DB fetch error:', error);
    return;
  }
  if (!pending || pending.length === 0) {
    console.log('✅  No pending scans.');
    return;
  }

  for (const scan of pending) {
    const { id, site, email } = scan as {
      id: number;
      site: string;
      email: string;
    };

    const normUrl = normalise(site);
    console.log(`\n🔎  #${id} – raw "${site}"\n    normalized → ${normUrl}`);

    try {
      /* 1) Launch Chrome */
      let chrome = null;
      try {
        chrome = await chromeLauncher.launch({
          chromePath: await chromeAws.executablePath, // null on local
          chromeFlags: chromeAws.args,
          logLevel: 'error',
        });
        console.log(`🚀  Puppeteer (port ${chrome.port})`);
      } catch (e) {
        throw new Error('Failed to launch Chrome: ' + (e as Error).message);
      }

      /* 2) Lighthouse run */
      const { lhr } = (await lighthouse(normUrl, {
        port: chrome.port,
        output: 'json',
        logLevel: 'error',
        onlyCategories: ['performance', 'accessibility', 'seo'],
        throttlingMethod: 'provided',
      })) as unknown as { lhr: PSIResult };

      const perf = Math.round((lhr.categories.performance.score || 0) * 100);
      const seo  = Math.round((lhr.categories.seo.score || 0) * 100);
      const a11y = Math.round((lhr.categories.accessibility.score || 0) * 100);
      console.log(`📊  perf ${perf} / seo ${seo} / a11y ${a11y}`);

      /* 3) Close browser */
      await chrome?.kill();
      console.log('🔒  Browser closed');

      /* 4) Save & mark done */
      await supabase
        .from('scans')
        .update({ results: lhr, status: 'done', finished_at: new Date() })
        .eq('id', id);

      /* 5) Send e-mail with PDF */
      const pdfBuffer = await genPdfBuffer();
      const publicLink = `https://webtriage.pro/report/${id}`;
      await resend.emails.send({
        from: 'WebTriage <reports@webtriage.pro>',
        to: email,
        subject: `Your 15-minute WebTriage report`,
        html: buildEmailHTML(normUrl, lhr, publicLink),
        attachments: [
          {
            filename: 'WebTriage-report.pdf',
            content: pdfBuffer,
            
          },
        ],
      });
      console.log(`📧  Email sent to ${email}`);
      console.log(`✅  Scan #${id} completed`);

    } catch (e) {
      console.error(`❌  Scan #${id} error:`, e);
      await supabase
        .from('scans')
        .update({ status: 'error', error_message: (e as Error).message })
        .eq('id', id);
    }
  }

  console.log('🏁 All pending scans processed.');
}

/* ─── Utility -------------------------------------------------- */
function normalise(raw: string): string {
  try {
    const u = new URL(raw.trim().startsWith('http') ? raw : `https://${raw}`);
    u.hash = ''; u.search = '';
    return u.href.endsWith('/') ? u.href : u.href + '/';
  } catch {
    return raw;
  }
}

/* -------------------------------------------------------------- */
runPendingScans().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
