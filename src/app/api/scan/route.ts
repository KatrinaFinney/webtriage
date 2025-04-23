// src/app/api/scan/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type RunnerResult = {
  lhr: {
    categories: {
      performance: { score: number | null };
      accessibility: { score: number | null };
      seo: { score: number | null };
    };
    // … you can include audits if you like
  };
};

// 1) ENV + SUPABASE -----------------------------------------
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 2) URL NORMALIZATION --------------------------------------
function normalizeSite(raw: string): string {
  try {
    const u = new URL(raw.trim());
    u.hash = '';
    u.search = '';
    const path = u.pathname.replace(/\/+$/, '');
    return path ? `${u.origin}${path}` : u.origin;
  } catch {
    let s = raw.trim().toLowerCase();
    if (s.endsWith('/')) s = s.slice(0, -1);
    return s;
  }
}

// 3) POST handler -------------------------------------------
export async function POST(req: Request) {
  const logs: string[] = [];
  try {
    logs.push('🏥 [scan] start');

    // 3.1) allow force override via ?force=1
    const url = new URL(req.url);
    const force = url.searchParams.get('force') === '1';
    if (force) logs.push('🔄 force=1 detected, will bypass daily limit');

    // 3.2) parse + validate
    let body: any;
    try {
      body = await req.json();
      logs.push(`🔍 payload ${JSON.stringify(body)}`);
    } catch (e: any) {
      logs.push(`❌ invalid JSON: ${e.message}`);
      return NextResponse.json({ error: 'Invalid JSON', logs }, { status: 400 });
    }
    const { site: rawSite, email } = body;
    if (!rawSite || !email) {
      logs.push('❌ missing site or email');
      return NextResponse.json({ error: 'site+email required', logs }, { status: 400 });
    }

    // 3.3) normalize
    const site = normalizeSite(rawSite);
    logs.push(`🌐 normalized to ${site}`);

    // 3.4) if force, delete any existing scan for today
    if (force) {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      await supabase
        .from('scans')
        .delete()
        .eq('site', site)
        .gte('created_at', today.toISOString());
      logs.push('🗑️ deleted today’s scans for this site');
    }

    // 3.5) reserve a slot (unique per-day constraint enforced by DB)
    let scanId: number;
    try {
      const { data: ins, error: insErr } = await supabase
        .from('scans')
        .insert([{ site, email, results: {} }])
        .select('id')
        .single();
      if (insErr) throw insErr;
      scanId = ins!.id;
      logs.push(`✅ reserved id=${scanId}`);
    } catch (dbErr: any) {
      logs.push(`❌ insert error: ${dbErr.message}`);
      // if still unique-constraint, fetch existing
      if (dbErr.details?.includes('scans_site_day_unique')) {
        logs.push('ℹ️ duplicate today — fetching existing');
        const { data: ex, error: exErr } = await supabase
          .from('scans')
          .select('results')
          .eq('site', site)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (exErr || !ex) {
          logs.push(`❌ fetch existing failed: ${exErr?.message}`);
          return NextResponse.json({ error: 'Could not load today’s scan', logs }, { status: 500 });
        }
        logs.push('✅ returning existing results');
        return NextResponse.json({ result: ex.results, logs }, { status: 200 });
      }
      return NextResponse.json({ error: 'DB error', logs }, { status: 500 });
    }

    // 3.6) dynamic requires
    const reqFn = eval('require');
    const chromeLambda = reqFn('chrome-aws-lambda') as any;
    const puppeteerCore = reqFn('puppeteer-core') as any;

    // 3.7) launch Chrome (AWS or local)
    let browser: any;
    try {
      const exePath = await chromeLambda.executablePath;
      logs.push(`🔧 AWS chrome at ${exePath}`);
      browser = await puppeteerCore.launch({
        args: chromeLambda.args,
        defaultViewport: chromeLambda.defaultViewport,
        executablePath: exePath,
        headless: true,
      });
      logs.push('🚀 AWS chrome launched');
    } catch (awsErr: any) {
      logs.push(`⚠️ AWS chrome failed: ${awsErr.message}`);
      const puppeteer = reqFn('puppeteer') as any;
      browser = await puppeteer.launch({ headless: true });
      logs.push('🚀 local chrome launched');
    }

    // 3.8) load lighthouse fn
    const lhMod = reqFn('lighthouse') as any;
    const lhFn: (url: string, opts: any) => Promise<RunnerResult> =
      typeof lhMod === 'function'
        ? lhMod
        : typeof lhMod.default === 'function'
        ? lhMod.default
        : (() => { throw new Error('Cannot load Lighthouse'); });

    // 3.9) run audit with throttlingMethod: 'provided' (no Lantern trace)
    const runner = await lhFn(site, {
      port: new URL(browser.wsEndpoint()).port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'seo'],
      throttlingMethod: 'provided',
    });
    const lhr = runner.lhr;
    logs.push(`📊 scores: perf=${Math.round((lhr.categories.performance.score||0)*100)}%`);

    // 3.10) clean up
    await browser.close();
    logs.push('🔒 browser closed');

    // 3.11) persist results
    const { error: updErr } = await supabase
      .from('scans')
      .update({ results: lhr })
      .eq('id', scanId);
    if (updErr) logs.push(`❌ save failed: ${updErr.message}`);
    else logs.push('💾 saved results');

    logs.push('🎉 done');
    return NextResponse.json({ result: lhr, logs }, { status: 200 });
  } catch (err: any) {
    console.error('🔥 uncaught:', err);
    logs.push(`❌ error: ${err.message}`);
    return NextResponse.json({ error: 'Internal error', logs }, { status: 500 });
  }
}
