import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://etrdsdttsuiqgkomcsxe.supabase.co";
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0cmRzZHR0c3VpcWdrb21jc3hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNjQ3ODIsImV4cCI6MjA4Nzc0MDc4Mn0.eGz8i843n4U8IYWsCbfrNTON97UDbT48qaK2QHJDBDg";

export const supabase = createClient(supabaseUrl, supabaseKey);

// expose client on window object so you can run commands in console
if (typeof window !== "undefined") {
  // @ts-ignore
  (window as any).supabase = supabase;
}