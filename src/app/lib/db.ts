// Implements Supabase job queue insertion helper.

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize the Supabase client using environment variables
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // service role key for inserts
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

export interface JobRecord {
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

/**
 * Inserts a new job into the Supabase 'jobs' table.
 * @param job - an object matching the JobRecord interface
 */
export async function createJob(job: JobRecord): Promise<void> {
  const { data, error } = await supabase
    .from('jobs')
    .insert([
      {
        full_name: job.fullName,
        business_email: job.businessEmail,
        website_url: job.websiteUrl,
        service: job.service,
        notes: job.notes,
        encrypted_blob: job.encrypted_blob,
        ciphertext_data_key: job.ciphertext_data_key,
        iv: job.iv,
        tag: job.tag
      }
    ]);

  if (error) {
    console.error('Error inserting job into Supabase:', error);
    throw error;
  }
}
