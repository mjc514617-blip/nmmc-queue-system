import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const formatQueueNumber = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === "") return "000";
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed)) return String(value);
  return String(parsed).padStart(3, "0");
};

const LiveQueueMonitor = () => {
  const { department } = useParams();

  const [currentNumber, setCurrentNumber] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const deptName = (department || "").trim().toLowerCase();
    if (!deptName) {
      setError("Missing department in URL.");
      return;
    }

    const fetchInitial = async () => {
      const { data, error } = await supabase
        .from("live_queue")
        .select("current_number, history")
        .ilike("department", deptName)
        .order("updated_at", { ascending: false })
        .limit(1);

      if (error) {
        setError(error.message);
        console.error("Supabase fetch error", error);
        return;
      }
      setError(null);
      const latest = data?.[0];
      if (latest) {
        setCurrentNumber(latest.current_number);
        setHistory(latest.history);
      } else {
        setCurrentNumber(0);
        setHistory([]);
        setError(`No live_queue row found for department: ${deptName}`);
      }
    };

    fetchInitial();

    // subscribe to all live_queue updates, then filter by department
    // (avoids filter encoding issues and allows any department to work)
    const channel = supabase
      .channel("live_queue")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "live_queue",
        },
        (payload) => {
          const changedDepartment = (payload.new.department || "").toString().trim().toLowerCase();
          if (changedDepartment !== deptName) return;
          setCurrentNumber(payload.new.current_number);
          setHistory(payload.new.history);
        }
      )
      .subscribe();

    // mobile browsers can pause realtime sockets; poll as a fallback.
    const interval = setInterval(fetchInitial, 3000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [department]);

  const nextInLine = history.slice(-6).map((_, i) =>
    currentNumber + i + 1
  );

  const recentHistory = history.slice(-6).reverse();
  const formattedDepartment = (department || "Department").replace(/-/g, " ");

  return (
    <div className="h-dvh w-full overflow-y-auto overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.15),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.1),transparent_28%),linear-gradient(180deg,#eefaf1_0%,#f8fcf9_42%,#e9f7ee_100%)] px-4 py-5 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        {error && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-semibold text-rose-700 shadow-sm">
            Supabase error: {error}
          </div>
        )}

        <div className="rounded-4xl border border-emerald-100 bg-white/96 p-4 shadow-[0_22px_70px_rgba(15,23,42,0.12)] backdrop-blur-sm sm:p-6 lg:p-8">
          <div className="mb-5 rounded-[1.75rem] border border-emerald-100 bg-[linear-gradient(135deg,#0f2f1d_0%,#1f6f43_52%,#34a853_100%)] px-5 py-5 text-white shadow-lg sm:px-6 sm:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-emerald-100/90">NMMC Hospital Queue Board</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                {formattedDepartment}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-sky-50/90 sm:text-base">
                  Real-time public queue display for the hospital waiting area.
                </p>
              </div>

              <div className="inline-flex items-center rounded-full border border-emerald-200/40 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-emerald-50 backdrop-blur">
                Live Feed Active
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.45fr_0.95fr]">
            <section className="rounded-[1.75rem] border border-emerald-100 bg-[linear-gradient(180deg,#ffffff_0%,#f5fbf6_100%)] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-7">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.38em] text-emerald-700">Now Serving</p>
                  <p className="mt-1 text-sm text-slate-500">Counter 01</p>
                </div>
                <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">
                  Window Active
                </div>
              </div>

              <div className="mt-5 rounded-[1.75rem] border border-emerald-100 bg-[linear-gradient(180deg,#ecfdf3_0%,#ffffff_100%)] p-5 text-center shadow-[0_14px_35px_rgba(15,23,42,0.08)] sm:p-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.45em] text-slate-400">Current Ticket</p>
                <p className="mt-3 text-7xl font-black tracking-[0.22em] text-emerald-700 sm:text-8xl lg:text-9xl">
                  {formatQueueNumber(currentNumber)}
                </p>
                <p className="mt-3 text-sm text-slate-500">Please prepare documents before proceeding.</p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-center shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Counter</p>
                  <p className="mt-1 text-2xl font-black text-emerald-700">01</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Queue Mode</p>
                  <p className="mt-1 text-2xl font-black text-emerald-700">Live</p>
                </div>
                <div className="rounded-2xl border border-lime-100 bg-lime-50 px-4 py-3 text-center shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Next Up</p>
                  <p className="mt-1 text-2xl font-black text-lime-700">{formatQueueNumber(currentNumber + 1)}</p>
                </div>
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-emerald-100 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-6">
              <h2 className="text-sm font-bold uppercase tracking-[0.32em] text-emerald-700">Upcoming</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {nextInLine.map((num, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-4 text-center shadow-sm"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">Slot {index + 1}</p>
                    <p className="mt-1 text-3xl font-black tracking-[0.15em] text-emerald-700">{formatQueueNumber(num)}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <section className="rounded-[1.75rem] border border-emerald-100 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-6">
              <h2 className="text-sm font-bold uppercase tracking-[0.32em] text-emerald-700">Recent Service Calls</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {recentHistory.length > 0 ? (
                  recentHistory.map((item, index) => (
                    <div key={`${item}-${index}`} className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                      {item}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800/80 sm:col-span-2 lg:col-span-3">
                    Waiting for the first service call.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-emerald-100 bg-[linear-gradient(180deg,#f8fcf9_0%,#f0f9f4_100%)] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-6">
              <h2 className="text-sm font-bold uppercase tracking-[0.32em] text-emerald-700">Patient Reminders</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li>Keep your ticket visible while waiting.</li>
                <li>Approach the counter only when your number appears.</li>
                <li>Bring your documents and valid ID.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveQueueMonitor;