import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const RESET_TIMEZONE = process.env.RESET_TIMEZONE || "Asia/Manila";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const run = async () => {
  console.log(`[midnight-reset] Starting reset with timezone ${RESET_TIMEZONE}`);

  const { data, error } = await supabase.rpc("run_midnight_reset", {
    p_timezone: RESET_TIMEZONE,
  });

  if (error) {
    console.error("[midnight-reset] Failed:", error.message);
    process.exit(1);
  }

  console.log("[midnight-reset] Success:");
  console.log(JSON.stringify(data, null, 2));
};

void run();
