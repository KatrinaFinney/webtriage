/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/workers/run-scans.ts

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Redis }        from '@upstash/redis';
import { createClient } from '@supabase/supabase-js';
import lighthouse        from 'lighthouse';
import puppeteer        from 'puppeteer';
import chromeAws        from 'chrome-aws-lambda';
import { Resend }       from 'resend';

import normalizeLhr     from '@/lib/normalizeLhr';
import { generatePdf }  from '@/lib/pdf';

// ─── CONFIG & CLIENTS ───────────────────────────────────────
const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  RESEND_API_KEY,
  UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN,
  SCAN_BATCH_SIZE = '3',
} = process.env;

if (
  !SUPABASE_URL ||
  !SUPABASE_SERVICE_ROLE_KEY ||
  !RESEND_API_KEY ||
  !UPSTASH_REDIS_REST_URL ||
  !UPSTASH_REDIS_REST_TOKEN
) {
  throw new Error(
    'Missing one of SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN'
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const resend    = new Resend(RESEND_API_KEY);
const redis     = new Redis({
  url:   UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
});

const GROUP       = 'scan-workers';
const CONSUMER    = 'consumer-1';
const STREAM_NAME = 'scan:queue';
const BATCH_SIZE  = parseInt(SCAN_BATCH_SIZE, 10);

// ─── Type for Redis xreadgroup response ─────────────────────
type StreamEntry = [ string, [ string, string[] ][] ];

// ─── HELPERS ────────────────────────────────────────────────

async function ensureGroup() {
  try {
    await redis.xgroup(
      STREAM_NAME,
      { type: 'CREATE', group: GROUP, id: '0', options: { MKSTREAM: true } }
    );
    console.log(`✅ Created consumer group "${GROUP}"`);
  } catch (err: any) {
    if (!/BUSYGROUP/.test(err.message)) throw err;
    console.log(`✅ Consumer group "${GROUP}" already exists`);
  }
}

function normalise(raw: string): string {
  try {
    const u = new URL(raw.trim().startsWith('http') ? raw : `https://${raw}`);
    u.hash = ''; u.search = '';
    return u.href.endsWith('/') ? u.href : u.href + '/';
  } catch {
    return raw;
  }
}
// ─── MAIN CONSUMER LOOP ────────────────────────────────────
async function consumeScans(): Promise<void> {
  console.log(`▶️ Starting Redis consumer (batch=${BATCH_SIZE})…`);
  await ensureGroup();

  while (true) {
    // Read new messages from the stream
    const raw = (await redis.xreadgroup(
      GROUP, CONSUMER, STREAM_NAME, '>'
    )) as StreamEntry[] | null;

    if (!raw) continue;
    const [, entries] = raw[0];

    for (const [ entryId, fieldsArr ] of entries) {
      // build a key/value map from [field, value, ...]
      const fm: Record<string,string> = {};
      for (let i = 0; i < fieldsArr.length; i += 2) {
        fm[fieldsArr[i]] = fieldsArr[i+1];
      }
      const scanId = parseInt(fm.scanId, 10);
      console.log(`🔔 Got job ${entryId} → scanId=${scanId}`);

      try {
        // mark processing
        await supabase.from('scans')
          .update({ status: 'processing' })
          .eq('id', scanId);

        // fetch scan details
        const { data } = await supabase
          .from('scans')
          .select('site,email')
          .eq('id', scanId)
          .single();
        if (!data) throw new Error('Scan not found');

        const url = normalise(data.site);
        const exePath = await chromeAws.executablePath;
        const browser = await puppeteer.launch({
          headless: true,
          executablePath: exePath || undefined,
          args: exePath
            ? chromeAws.args
            : ['--no-sandbox','--disable-setuid-sandbox'],
        });

        // run Lighthouse
        const port   = Number(new URL(browser.wsEndpoint()).port);
        const runner = await lighthouse(url, {
          port,
          output: 'json',
          logLevel: 'error',
          onlyCategories: ['performance','accessibility','seo'],
          throttlingMethod: 'provided',
        }) as any;
        const lhr = runner.lhr as any;

        // normalize & persist
        const psiResult = normalizeLhr(lhr);
        await supabase.from('scans')
          .update({
            results:     psiResult,
            status:      'done',
            finished_at: new Date(),
          })
          .eq('id', scanId);

        // generate PDF & email
        const scannedAt = new Date().toLocaleString();
        const pdfBuffer = await generatePdf({ site: url, result: psiResult, scannedAt });
        const link = `https://webtriage.pro/report/${scanId}`;

        await resend.emails.send({
          from:    'WebTriage <reports@webtriage.pro>',
          to:      data.email,
          subject: `Your WebTriage report for ${url}`,
          html:    `<h2>Your report is ready</h2><p><a href="${link}">View full report</a></p>`,
          attachments: [{ filename: 'report.pdf', content: pdfBuffer }],
        });
        console.log(`✅ Scan ${scanId} emailed to ${data.email}`);

        // acknowledge successful processing
        await redis.xack(STREAM_NAME, GROUP, entryId);
        console.log(`✅ Acked ${entryId}`);

        await browser.close();
      } catch (err: any) {
        console.error(`❌ Scan ${scanId} failed:`, err);
        // no ACK, so it can retry later
      }
    }
  }
}

consumeScans().catch(err => {
  console.error('💥 Fatal consumer error:', err);
  process.exit(1);
});
