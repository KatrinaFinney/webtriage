/* eslint-disable no-console */
// src/app/api/workers/run-scans.ts
import { createClient } from '@supabase/supabase-js';
import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer';
import chromeAws from 'chrome-aws-lambda';
import { Resend } from 'resend';

/* ─── Runtime configuration ---------------------------------- */

if (
  !process.env.SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY ||
  !process.env.RESEND_API_KEY
) {
  throw new Error(
    'SUPABASE_URL / SERVICE_ROLE_KEY / RESEND_API_KEY missing in env'
  );
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

/* ─── Types --------------------------------------------------- */

interface PSIResult {
  categories: {
    performance: { score: number | null };
    accessibility: { score: number | null };
    seo: { score: number | null };
  };
  audits?: Record<string, unknown>;
}

/* ─── Utility ------------------------------------------------- */

function normalise(raw: string): string {
  try {
    const u = new URL(raw.trim().startsWith('http') ? raw : `https://${raw}`);
    u.hash = '';
    u.search = '';
    return u.href.endsWith('/') ? u.href : u.href + '/';
  } catch {
    return raw;
  }
}

async function genPdfBuffer(): Promise<Buffer> {
  // TODO: real PDF generation
  return Buffer.from('PDF coming soon');
}

function buildEmailHTML(url: string, lhr: PSIResult, link: string) {
  const p = Math.round((lhr.categories.performance.score || 0) * 100);
  const s = Math.round((lhr.categories.seo.score || 0) * 100);
  const a = Math.round((lhr.categories.accessibility.score || 0) * 100);

  return /* html */ `
    <h2 style="margin:0 0 12px;font-family:system-ui">
      Your WebTriage report for ${url}
    </h2>
    <table style="font-family:system-ui;border-collapse:collapse">
      <tr><th align="left">Performance</th><td>${p}/100</td></tr>
      <tr><th align="left">SEO</th><td>${s}/100</td></tr>
      <tr><th align="left">Accessibility</th><td>${a}/100</td></tr>
    </table>
    <p style="font-family:system-ui;margin-top:12px">
      View the full interactive page:<br/>
      <a href="${link}">${link}</a>
    </p>
    <p style="font-family:system-ui;font-size:.9rem;color:#666">
      Need deeper fixes? Reply to this email any time.
    </p>
  `;
}

/* ─── Main worker -------------------------------------------- */

async function runPendingScans() {
  console.log(`▶ Fetching up to ${BATCH_SIZE} pending scans…`);

  const { data: pending, error } = await supabase
    .from('scans')
    .select('id, site, email')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE);

  if (error) {
    console.error('❌  DB fetch error:', error);
    return;
  }
  if (!pending || pending.length === 0) {
    console.log('✅  No pending scans.');
    return;
  }

  for (const { id, site, email } of pending as Array<{
    id: number;
    site: string;
    email: string;
  }>) {
    const url = normalise(site);
    console.log(`\n🔎  #${id} – raw "${site}"\n    normalized → ${url}`);

    try {
      /* 1) Launch Chrome via Puppeteer */
      const exePath = await chromeAws.executablePath; // null on GitHub runner
      const browser = await puppeteer.launch({
        headless: true,
        executablePath: exePath || undefined,
        args: chromeAws.args,
      });
      const port = parseInt(new URL(browser.wsEndpoint()).port, 10);
      console.log(
        `🚀  Puppeteer (port ${port}) – using ${
          exePath ? 'chrome-aws-lambda' : 'system Chrome'
        }`
      );

      /* 2) Lighthouse */
      const { lhr } = (await lighthouse(url, {
        port,
        output: 'json',
        logLevel: 'error',
        onlyCategories: ['performance', 'accessibility', 'seo'],
        throttlingMethod: 'provided',
      })) as unknown as { lhr: PSIResult };

      const perf = Math.round((lhr.categories.performance.score || 0) * 100);
      const seoScore = Math.round((lhr.categories.seo.score || 0) * 100);
      const a11y = Math.round(
        (lhr.categories.accessibility.score || 0) * 100
      );
      console.log(`📊  perf ${perf} / seo ${seoScore} / a11y ${a11y}`);

      /* 3) Close browser */
      await browser.close();
      console.log('🔒  Browser closed');

      /* 4) Persist results */
      await supabase
        .from('scans')
        .update({ results: lhr, status: 'done', finished_at: new Date() })
        .eq('id', id);

      /* 5) E-mail user (non-fatal on failure) */
      try {
        const pdf = await genPdfBuffer();
        await resend.emails.send({
          from: 'WebTriage <reports@webtriage.pro>',
          to: email,
          subject: 'Your 15-minute WebTriage report',
          html: buildEmailHTML(url, lhr, `https://webtriage.pro/report/${id}`),
          attachments: [{ filename: 'WebTriage-report.pdf', content: pdf }],
        });
        console.log(`📧  Email sent to ${email}`);
      } catch (mailErr) {
        console.error('📧  Email failed:', mailErr);
      }

      console.log(`✅  Scan #${id} completed`);
    } catch (err) {
      console.error(`❌  Scan #${id} error:`, err);
      await supabase
        .from('scans')
        .update({ status: 'error', error_message: (err as Error).message })
        .eq('id', id);
    }
  }

  console.log('🏁 All pending scans processed.');
}

/* ------------------------------------------------------------ */
runPendingScans().catch((e) => {
  console.error('Fatal worker error:', e);
  process.exit(1);
});
