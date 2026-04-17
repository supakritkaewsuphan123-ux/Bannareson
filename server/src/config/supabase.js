const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env');
}

// We use service role key for backend operations that bypass RLS (like cron or admin overrides)
// and for creating the initial client.
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
