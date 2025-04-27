"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
// src/app/api/workers/run-scans.ts
const supabase_js_1 = require("@supabase/supabase-js");
const lighthouse_1 = __importDefault(require("lighthouse"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const chrome_aws_lambda_1 = __importDefault(require("chrome-aws-lambda"));
const resend_1 = require("resend");
/* ─── Runtime configuration ---------------------------------- */
if (!process.env.SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    !process.env.RESEND_API_KEY) {
    throw new Error('SUPABASE_URL / SERVICE_ROLE_KEY / RESEND_API_KEY missing in env');
}
const BATCH_SIZE = parseInt(process.argv[2] || process.env.SCAN_BATCH_SIZE || '3', 10);
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
/* ─── Utility ------------------------------------------------- */
function normalise(raw) {
    try {
        const u = new URL(raw.trim().startsWith('http') ? raw : `https://${raw}`);
        u.hash = '';
        u.search = '';
        return u.href.endsWith('/') ? u.href : u.href + '/';
    }
    catch {
        return raw;
    }
}
async function genPdfBuffer() {
    // TODO implement a real PDF
    return Buffer.from('PDF coming soon');
}
function buildEmailHTML(url, lhr, link) {
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
    if (!pending?.length) {
        console.log('✅  No pending scans.');
        return;
    }
    for (const { id, site, email } of pending) {
        const url = normalise(site);
        console.log(`\n🔎  #${id} – raw "${site}"\n    normalized → ${url}`);
        try {
            /* 1) Launch Chrome (Puppeteer) */
            const exePath = await chrome_aws_lambda_1.default.executablePath; // null on runner
            const browser = await puppeteer_1.default.launch({
                headless: true,
                executablePath: exePath || undefined,
                args: exePath
                    ? chrome_aws_lambda_1.default.args // Lambda binary
                    : ['--no-sandbox', '--disable-setuid-sandbox'], // system Chrome
            });
            const port = parseInt(new URL(browser.wsEndpoint()).port, 10);
            console.log(`🚀  Puppeteer (port ${port}) – ${exePath ? 'lambda' : 'system'} chrome`);
            /* 2-4) Lighthouse, save, e-mail */
            try {
                const runner = await (0, lighthouse_1.default)(url, {
                    port,
                    output: 'json',
                    logLevel: 'error',
                    onlyCategories: ['performance', 'accessibility', 'seo'],
                    throttlingMethod: 'provided',
                }); // ← relax the Lighthouse type
                const lhr = runner.lhr; // ← tighten back to our shape
                const perf = Math.round((lhr.categories.performance.score || 0) * 100);
                const seoScore = Math.round((lhr.categories.seo.score || 0) * 100);
                const a11y = Math.round((lhr.categories.accessibility.score || 0) * 100);
                console.log(`📊  perf ${perf} / seo ${seoScore} / a11y ${a11y}`);
                /* 3) Persist */
                const { error: updateErr } = await supabase
                    .from('scans')
                    .update({ results: lhr, status: 'done', finished_at: new Date() })
                    .eq('id', id);
                if (updateErr) {
                    throw new Error(`DB update failed: ${updateErr.message}`);
                }
                /* 4) E-mail (best-effort) */
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
                }
                catch (mailErr) {
                    console.error('📧  Email failed:', mailErr);
                }
                console.log(`✅  Scan #${id} completed`);
            }
            finally {
                /* NEW: always close Chrome */
                await browser.close().catch(() => { });
                console.log('🔒  Browser closed');
            }
        }
        catch (err) {
            console.error(`❌  Scan #${id} error:`, err);
            await supabase
                .from('scans')
                .update({ status: 'error', error_message: err.message })
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
