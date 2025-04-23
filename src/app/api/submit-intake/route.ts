// src/app/api/scan/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import chromeLambda from 'chrome-aws-lambda';
import puppeteerCore from 'puppeteer-core';
import lighthouse from 'lighthouse';
import type { RunnerResult } from 'lighthouse';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

function normalizeSite(raw: string): string {
  try {
    const u = new URL(raw.trim());
    u.hash = '';
    u.search = '';
    u.protocol = 'https:';
    u.pathname = u.pathname.replace(/\/+$/, '');
    return u.toString().toLowerCase();
  } catch {
    return raw.trim().toLowerCase();
  }
}

export async function POST(req: Request) {
  const logs: string[] = [];
  try {
    logs.push('🏥 [scan] Handler start');

    const body = await req.json();
    logs.push(`🔍 Payload: ${JSON.stringify(body)}`);

    const { site: rawSite, email } = body;
    if (!rawSite || !email) {
      logs.push('❌ Missing site or email');
      return NextResponse.json({ error: 'Missing site or email', logs }, { status: 400 });
    }

    const site = normalizeSite(rawSite);
    logs.push(`🌐 Normalized site: ${site}`);

    // Reserve slot
    const { data: inserted, error: insertErr } = await supabase
      .from('scans')
      .insert([{ site, email, results: {} }])
      .select('id')
      .single();
    if (insertErr) throw insertErr;
    const scanId = inserted!.id;
    logs.push(`✅ Reserved slot id=${scanId}`);

    // Launch Chrome
    const exePath = await chromeLambda.executablePath;
    logs.push(`🔧 execPath: ${exePath}`);
    const browser = await puppeteerCore.launch({
      args: chromeLambda.args,
      defaultViewport: chromeLambda.defaultViewport,
      executablePath: exePath,
      headless: true,
    });
    logs.push('🚀 Chrome launched');

    // Lighthouse
    const runner = (await lighthouse(site, {
      port: new URL(browser.wsEndpoint()).port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance','accessibility','seo'],
    })) as RunnerResult;
    const lhr = runner.lhr;
    logs.push(`📊 LH perf=${Math.round(lhr.categories.performance.score*100)}%`);

    await browser.close();
    logs.push('🔒 Browser closed');

    // Persist
    const { error: updateErr } = await supabase
      .from('scans')
      .update({ results: lhr })
      .eq('id', scanId);
    if (updateErr) throw updateErr;
    logs.push('💾 Results saved');

    logs.push('🎉 Completed successfully');
    return NextResponse.json({ result: lhr, logs });
  } catch (err: any) {
    console.error('🔥 [scan] Uncaught error:', err);
    logs.push(`❌ Uncaught error: ${err.message}`);
    return NextResponse.json(
      { error: 'Internal server error', logs },
      { status: 500 }
    );
  }
}
