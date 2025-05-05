import { createClient } from '@supabase/supabase-js';
import type { PSIResult } from '@/types/webVitals';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Fetches the full scan row from Supabase,
 * including site, email, and PSIResult.
 */
export async function fetchScanResult(scanId: number): Promise<{
  site: string;
  email: string;
  result: PSIResult;
}> {
  const { data, error } = await supabase
    .from('scans')
    .select('site,email,results')
    .eq('id', scanId)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Scan not found');
  }

  return {
    site: data.site,
    email: data.email,
    result: data.results as PSIResult,
  };
}
