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
    const { error } = await supabaseAdmin
      .from('jobs')
      .insert([{
        full_name: job.fullName,
        business_email: job.businessEmail,
        website_url: job.websiteUrl,
        service: job.service,
        notes: job.notes,
        encrypted_blob: job.encrypted_blob,
        ciphertext_data_key: job.ciphertext_data_key,
        iv: job.iv,
        tag: job.tag,
      }])
      .single();
  
    if (error) {
      console.error('❌ Supabase insert error:', error);
      throw error;
    } else {
      console.log('✅ Supabase insert success');
    }
  }
  