// test-supabase.js
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
async function run() {
  const { data, error } = await supabase
    .from('scans')
    .select('id')
    .limit(1)
  console.log('DATA:', data, 'ERROR:', error)
}
run()
