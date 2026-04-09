-- Run this once in Supabase SQL Editor.
-- It archives old tickets and resets live queue counters.

create table if not exists public.tickets_archive (
  ticket_id bigint primary key,
  queue_number text,
  department text,
  service text,
  status text,
  timestamp timestamptz,
  doctor text,
  room text,
  created_at timestamptz,
  updated_at timestamptz,
  archived_at timestamptz not null default now()
);

create or replace function public.run_midnight_reset(p_timezone text default 'Asia/Manila')
returns jsonb
language plpgsql
security definer
as $$
declare
  v_today_local_date date;
  v_today_start_utc timestamptz;
  v_archived_count integer := 0;
  v_deleted_count integer := 0;
  v_reset_count integer := 0;
begin
  v_today_local_date := (now() at time zone p_timezone)::date;
  v_today_start_utc := (v_today_local_date::timestamp at time zone p_timezone);

  insert into public.tickets_archive (
    ticket_id,
    queue_number,
    department,
    service,
    status,
    timestamp,
    doctor,
    room,
    created_at,
    updated_at
  )
  select
    t.id,
    t.queue_number,
    t.department,
    t.service,
    t.status,
    t.timestamp,
    t.doctor,
    t.room,
    t.created_at,
    t.updated_at
  from public.tickets t
  where t.created_at < v_today_start_utc
  on conflict (ticket_id) do nothing;

  get diagnostics v_archived_count = row_count;

  delete from public.tickets
  where created_at < v_today_start_utc;

  get diagnostics v_deleted_count = row_count;

  update public.live_queue
  set
    current_number = 0,
    is_running = false,
    history = '[]'::jsonb,
    updated_at = now();

  get diagnostics v_reset_count = row_count;

  return jsonb_build_object(
    'timezone', p_timezone,
    'cutoff_utc', v_today_start_utc,
    'archived_tickets', v_archived_count,
    'deleted_tickets', v_deleted_count,
    'reset_departments', v_reset_count,
    'ran_at', now()
  );
end;
$$;
