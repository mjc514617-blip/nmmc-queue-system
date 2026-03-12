import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const runtime = globalThis as {
  process?: {
    env?: Record<string, string | undefined>;
    argv?: string[];
    exit?: (code?: number) => never;
  };
};

const supabaseUrl = runtime.process?.env?.VITE_SUPABASE_URL;
const supabaseKey = runtime.process?.env?.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env vars. Ensure .env has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  runtime.process?.exit?.(1);
  throw new Error("Supabase environment variables are missing.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const department = runtime.process?.argv?.[2] || "Pediatrics";

async function test() {
  const { data, error } = await supabase
    .from("live_queue")
    .select("*")
    .eq("department", department)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    return;
  }

  console.log(`Supabase connectivity OK for department=${department}:`, data);
}

test();
