import React from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

type QueueRow = {
  id: number;
  name: string | null;
  service: string | null;
  queue_number: number | null;
  status: string | null;
  created_at: string | null;
};

const formatQueueNumber = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === "") return "000";
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed)) return String(value);
  return String(parsed).padStart(3, "0");
};

const formatEstimatedMinutes = (minutes: number): string => {
  if (minutes <= 0) return "Less than a minute";
  if (minutes === 1) return "1 minute";
  return `${minutes} minutes`;
};

const QueueTracking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queueParam = searchParams.get("queue") || searchParams.get("q") || "";

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [queueRow, setQueueRow] = React.useState<QueueRow | null>(null);
  const [nowServing, setNowServing] = React.useState<number>(0);
  const [lastSyncedAt, setLastSyncedAt] = React.useState<Date | null>(null);

  React.useEffect(() => {
    const queueNumber = Number.parseInt(queueParam, 10);

    if (!queueParam || Number.isNaN(queueNumber)) {
      setError("No valid queue number found in the QR code.");
      setLoading(false);
      return;
    }

    let isMounted = true;

    const refreshNowServing = async () => {
      const { data: liveData } = await supabase
        .from("live_queue")
        .select("current_number")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return Number(liveData?.current_number) || 0;
    };

    const loadQueue = async () => {
      setLoading(true);
      setError(null);

      const { data, error: queueError } = await supabase
        .from("queue")
        .select("id, name, service, queue_number, status, created_at")
        .eq("queue_number", queueNumber)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!isMounted) return;

      if (queueError) {
        setError(`Database error: ${queueError.message}`);
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Queue number not found.");
        setLoading(false);
        return;
      }

      setQueueRow(data as QueueRow);

      const servingNumber = await refreshNowServing();
      if (isMounted) {
        setNowServing(servingNumber);
        setLastSyncedAt(new Date());
        setLoading(false);
      }
    };

    void loadQueue();

    const queueChannel = supabase
      .channel(`public_queue_${queueNumber}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queue",
        },
        (payload) => {
          const changedQueueNumber = Number((payload.new as QueueRow | null)?.queue_number || 0);
          if (changedQueueNumber !== queueNumber) return;
          setQueueRow(payload.new as QueueRow);
          setLastSyncedAt(new Date());
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_queue",
        },
        async () => {
          const servingNumber = await refreshNowServing();
          setNowServing(servingNumber);
          setLastSyncedAt(new Date());
        }
      )
      .subscribe();

    const interval = window.setInterval(() => {
      void refreshNowServing().then((servingNumber) => {
        setNowServing(servingNumber);
        setLastSyncedAt(new Date());
      });
    }, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
      void supabase.removeChannel(queueChannel);
    };
  }, [queueParam]);

  const yourNumber = Number(queueRow?.queue_number) || 0;
  const position = Math.max(0, yourNumber - nowServing);
  const statusLabel = queueRow?.status || "waiting";
  const estimatedWaitMinutes = Math.max(0, position * 3);
  const isDone = statusLabel === "done";
  const isServing = statusLabel === "serving";

  if (loading) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center bg-linear-to-br from-slate-950 via-emerald-950 to-teal-900 px-6 text-white">
        <div className="text-center">
          <div className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          <p className="text-2xl font-semibold">Loading your queue status...</p>
        </div>
      </div>
    );
  }

  if (error || !queueRow) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center bg-linear-to-br from-slate-950 via-emerald-950 to-teal-900 px-6 text-white">
        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur">
          <h1 className="text-3xl font-bold">Queue Tracking</h1>
          <p className="mt-4 text-lg text-white/85">{error}</p>
          <p className="mt-3 text-sm text-white/70">Please scan the QR code again or ask the kiosk staff to reprint your ticket.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh w-full overflow-y-auto overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.22),transparent_35%),linear-gradient(135deg,#020617_0%,#064e3b_50%,#0f766e_100%)] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-4xl border border-white/10 bg-white/10 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-8 lg:p-10">
          <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-200/80">Public Queue Tracking</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Your ticket is active</h1>
            </div>
            <div className="inline-flex rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100">
              Status: {statusLabel}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-6 text-center shadow-lg lg:col-span-1">
              <p className="text-sm uppercase tracking-[0.3em] text-white/60">Your Number</p>
              <div className="mt-4 text-7xl font-black tracking-[0.18em] text-emerald-300">
                {formatQueueNumber(queueRow.queue_number)}
              </div>
              <p className="mt-4 text-sm text-white/70">Scan this ticket from any phone, data, or WiFi connection.</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-lg lg:col-span-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/8 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-emerald-200/75">Now Serving</p>
                  <p className="mt-2 text-5xl font-black text-white">
                    {formatQueueNumber(nowServing)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/8 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-emerald-200/75">People Ahead</p>
                  <p className="mt-2 text-5xl font-black text-white">{position}</p>
                </div>

                <div className="rounded-2xl bg-white/8 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-emerald-200/75">Department</p>
                  <p className="mt-2 text-2xl font-bold text-white">{queueRow.name || "N/A"}</p>
                </div>

                <div className="rounded-2xl bg-white/8 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-emerald-200/75">Service</p>
                  <p className="mt-2 text-2xl font-bold text-white">{queueRow.service || "N/A"}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-5">
                {isDone ? (
                  <p className="text-xl font-bold text-emerald-200">Your queue has been completed. Thank you for waiting.</p>
                ) : isServing ? (
                  <p className="text-xl font-bold text-emerald-200">It is your turn now. Please proceed to the assigned area.</p>
                ) : position === 0 ? (
                  <p className="text-xl font-bold text-emerald-200">You are next. Please go to the assigned area.</p>
                ) : (
                  <p className="text-lg text-white/85">Updates refresh automatically in real time while you stay on this page.</p>
                )}
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/8 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-emerald-200/75">Estimated Wait</p>
                  <p className="mt-2 text-3xl font-black text-white">{formatEstimatedMinutes(estimatedWaitMinutes)}</p>
                </div>

                <div className="rounded-2xl bg-white/8 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-emerald-200/75">Last Synced</p>
                  <p className="mt-2 text-xl font-bold text-white">
                    {lastSyncedAt ? lastSyncedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueTracking;