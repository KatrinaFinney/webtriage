"use strict";
// src/app/api/workers/run-scans.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const lighthouse_1 = __importDefault(require("lighthouse"));
const chromeLauncher = __importStar(require("chrome-launcher"));
const chrome_aws_lambda_1 = __importDefault(require("chrome-aws-lambda"));
const resend_1 = require("resend");
/* ─── Config -------------------------------------------------- */
if (!process.env.SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    !process.env.RESEND_API_KEY) {
    throw new Error('SUPABASE_URL / SERVICE_ROLE_KEY / RESEND_API_KEY missing');
}
const BATCH_SIZE = parseInt(process.argv[2] || process.env.SCAN_BATCH_SIZE || '3', 10);
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
function buildEmailHTML(url, lhr, publicLink) {
    const perf = Math.round((lhr.categories.performance.score || 0) * 100);
    const seo = Math.round((lhr.categories.seo.score || 0) * 100);
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
async function genPdfBuffer() {
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
    for (const scan of pending) {
        const { id, site, email } = scan;
        const normUrl = normalise(site);
        console.log(`\n🔎  #${id} – raw "${site}"\n    normalized → ${normUrl}`);
        try {
            /* 1) Launch Chrome */
            let chrome = null;
            try {
                chrome = await chromeLauncher.launch({
                    chromePath: await chrome_aws_lambda_1.default.executablePath, // null on local
                    chromeFlags: chrome_aws_lambda_1.default.args,
                    logLevel: 'error',
                });
                console.log(`🚀  Puppeteer (port ${chrome.port})`);
            }
            catch (e) {
                throw new Error('Failed to launch Chrome: ' + e.message);
            }
            /* 2) Lighthouse run */
            const { lhr } = (await (0, lighthouse_1.default)(normUrl, {
                port: chrome.port,
                output: 'json',
                logLevel: 'error',
                onlyCategories: ['performance', 'accessibility', 'seo'],
                throttlingMethod: 'provided',
            }));
            const perf = Math.round((lhr.categories.performance.score || 0) * 100);
            const seo = Math.round((lhr.categories.seo.score || 0) * 100);
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
        }
        catch (e) {
            console.error(`❌  Scan #${id} error:`, e);
            await supabase
                .from('scans')
                .update({ status: 'error', error_message: e.message })
                .eq('id', id);
        }
    }
    console.log('🏁 All pending scans processed.');
}
/* ─── Utility -------------------------------------------------- */
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
/* -------------------------------------------------------------- */
runPendingScans().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
