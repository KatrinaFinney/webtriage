import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

interface JobRow {
  fullName: string;
  businessEmail: string;
  websiteUrl: string;
  service: string;
  notes: string;
  encrypted_blob?: string;
  ciphertext_data_key?: string;
  iv?: string;
  tag?: string;
}

export async function createJob(job: JobRow) {
  await supabaseAdmin
    .from('jobs')
    .insert([job])
    .single();
} 