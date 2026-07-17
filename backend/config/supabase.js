const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn(
    "⚠️ Warning: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Database saving features will not work."
  );
} else {
  supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

module.exports = supabase;


