import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type QueueInsertInput = {
  queueNumber: number;
  department: string;
  service: string;
};

export const insertQueueTicket = async ({
  queueNumber,
  department,
  service,
}: QueueInsertInput) => {
  // Queue table schema from Supabase Phase 1:
  // name, service, queue_number, status, created_at
  return supabase.from("queue").insert({
    name: department,
    service,
    queue_number: queueNumber,
    status: "waiting",
  });
};

// expose client on window object so you can run commands in console
if (typeof window !== "undefined") {
  // @ts-ignore
  (window as any).supabase = supabase;
}