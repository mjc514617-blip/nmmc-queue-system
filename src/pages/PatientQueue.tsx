import React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { decodeDepartmentFromQr } from "../lib/departmentCodes";
import { getDepartmentServiceLocation } from "../lib/internalMedicineSchedule";

const formatQueueNumber = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === "") return "000";
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed)) return String(value);
  return String(parsed).padStart(3, "0");
};

type TicketRow = {
  queue_number: string;
  department: string;
  service: string;
  doctor: string;
  room: string;
};

type SnapshotQueueData = {
  queue_number: string;
  department: string;
  service: string;
  doctor: string;
  room: string;
  current_serving: string | null;
};

const buildQueueCandidates = (rawQueueNumber: string): string[] => {
  const trimmed = rawQueueNumber.trim();
  const parsed = Number.parseInt(trimmed, 10);
  const normalizedNumeric = Number.isNaN(parsed) ? null : String(parsed);
  const padded = Number.isNaN(parsed) ? null : String(parsed).padStart(3, "0");
  return Array.from(new Set([trimmed, normalizedNumeric, padded].filter(Boolean) as string[]));
};

const PatientQueue: React.FC = () => {
  const { queueNumber } = useParams<{ queueNumber: string }>();
  const [searchParams] = useSearchParams();
  const queueParam = queueNumber || searchParams.get("queue") || searchParams.get("q") || "";

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [queueData, setQueueData] = React.useState<SnapshotQueueData | null>(null);

  const departmentParam =
    searchParams.get("department") || decodeDepartmentFromQr(searchParams.get("d"));
  const serviceParam = searchParams.get("service") || "";
  const doctorParam = searchParams.get("doctor") || "";
  const roomParam = searchParams.get("room") || "";

  const buildSnapshotData = (): SnapshotQueueData | null => {
    if (!queueParam) return null;

    const queueValue = queueParam.trim();
    const departmentValue = departmentParam || searchParams.get("department") || "Unknown";
    const serviceValue = serviceParam || "";
    const doctorValue = doctorParam || "";
    const roomValue = roomParam || "";

    return {
      queue_number: queueValue,
      department: departmentValue,
      service: serviceValue,
      doctor: doctorValue,
      room: roomValue,
      current_serving: null,
    };
  };

  React.useEffect(() => {
    const fetchQueueData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!queueParam) {
          setError("No queue number provided");
          return;
        }

        const directSnapshot = buildSnapshotData();
        const hasCompleteSnapshot = Boolean(serviceParam && roomParam);

        if (hasCompleteSnapshot && directSnapshot) {
          setQueueData(directSnapshot);

          if (directSnapshot.department && directSnapshot.department !== "Unknown") {
            try {
              const { data: liveData } = await supabase
                .from("live_queue")
                .select("current_number")
                .ilike("department", directSnapshot.department)
                .order("updated_at", { ascending: false })
                .limit(1)
                .maybeSingle();

              setQueueData((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  current_serving: liveData?.current_number?.toString() || null,
                };
              });
            } catch {
              // Snapshot still renders even if live queue is unavailable.
            }
          }

          return;
        }

        const queueCandidates = buildQueueCandidates(queueParam);
        let ticket: TicketRow | null = null;
        let lastErrorMessage: string | null = null;

        for (const candidate of queueCandidates) {
          for (const withDepartmentFilter of [true, false]) {
            let ticketQuery = supabase
              .from("tickets")
              .select("queue_number, department, service, doctor, room")
              .eq("queue_number", candidate)
              .order("id", { ascending: false })
              .limit(1);

            if (withDepartmentFilter && departmentParam) {
              ticketQuery = ticketQuery.ilike("department", departmentParam);
            }

            const { data: ticketRows, error: ticketError } = await ticketQuery;

            if (ticketError) {
              lastErrorMessage = ticketError.message;
              continue;
            }

            ticket = (ticketRows?.[0] as TicketRow | undefined) || null;
            if (ticket) {
              break;
            }
          }

          if (ticket) {
            break;
          }
        }

        if (ticket) {
          const { data: liveData } = await supabase
            .from("live_queue")
            .select("current_number")
            .ilike("department", ticket.department)
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          setQueueData({
            queue_number: ticket.queue_number || queueParam,
            department: ticket.department || departmentParam || "Unknown",
            service: ticket.service || serviceParam,
            doctor: ticket.doctor || doctorParam || "",
            room: ticket.room || roomParam || "",
            current_serving: liveData?.current_number?.toString() || null,
          });
          return;
        }

        if (directSnapshot) {
          setQueueData(directSnapshot);
          return;
        }

        if (lastErrorMessage) {
          setError(`Database error: ${lastErrorMessage}`);
        } else {
          setError("Queue number not found. Please check your ticket.");
        }
      } catch (err) {
        if (err instanceof TypeError && err.message.toLowerCase().includes("failed to fetch")) {
          const directSnapshot = buildSnapshotData();
          if (directSnapshot) {
            setQueueData(directSnapshot);
            setError(null);
            return;
          }
          setError("Unable to connect to queue server. Please try again in a moment.");
        } else {
          setError(err instanceof Error ? err.message : "An error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchQueueData();
  }, [queueParam, departmentParam]);

  React.useEffect(() => {
    const deptName = (queueData?.department || "").trim().toLowerCase();
    if (!deptName) return;

    const applyCurrentServing = async () => {
      const { data } = await supabase
        .from("live_queue")
        .select("current_number")
        .ilike("department", deptName)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setQueueData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          current_serving: data?.current_number?.toString() || "0",
        };
      });
    };

    void applyCurrentServing();

    const channel = supabase
      .channel(`patient_queue_${deptName}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_queue",
        },
        (payload) => {
          const changedRow = (payload.new || {}) as {
            department?: string;
            current_number?: number;
          };
          const changedDepartment = (changedRow.department || "").toString().trim().toLowerCase();
          if (changedDepartment !== deptName) return;
          setQueueData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              current_serving: changedRow.current_number?.toString() || "0",
            };
          });
        }
      )
      .subscribe();

    const interval = window.setInterval(() => {
      void applyCurrentServing();
    }, 3000);

    return () => {
      window.clearInterval(interval);
      void supabase.removeChannel(channel);
    };
  }, [queueData?.department]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-linear-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-blue-300 mx-auto mb-4"></div>
          <p className="text-2xl font-semibold">Loading queue status...</p>
        </div>
      </div>
    );
  }

  if (error || !queueData) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-linear-to-br from-blue-900 via-blue-800 to-blue-700 text-white p-6">
        <div className="bg-red-500 rounded-3xl shadow-2xl p-12 max-w-md text-center">
          <h2 className="text-3xl font-bold mb-4">Error</h2>
          <p className="text-lg mb-6">{error}</p>
          <p className="text-sm text-white/90">
            Please verify your ticket details and scan the QR code again.
          </p>
        </div>
      </div>
    );
  }

  const parsedCurrentNum = queueData.current_serving ? parseInt(queueData.current_serving, 10) : 0;
  const parsedYourNum = parseInt(queueData.queue_number, 10);
  const currentNum = Number.isNaN(parsedCurrentNum) ? 0 : parsedCurrentNum;
  const yourNum = Number.isNaN(parsedYourNum) ? 0 : parsedYourNum;
  const position = Math.max(0, yourNum - currentNum);
  const isCompleted = currentNum > yourNum && yourNum > 0;
  const isServingNow = currentNum === yourNum && yourNum > 0;
  const isNext = currentNum + 1 === yourNum && yourNum > 0;
  const mappedRoom = getDepartmentServiceLocation(queueData.department, queueData.service);
  const normalizedRoom = (queueData.room || "").trim();
  const shouldUseMappedRoom =
    !normalizedRoom ||
    normalizedRoom.toLowerCase() === "tbd" ||
    normalizedRoom.toLowerCase() === "n/a" ||
    normalizedRoom === "101";
  const displayRoom = shouldUseMappedRoom ? mappedRoom || normalizedRoom || "TBD" : normalizedRoom;

  return (
    <div className="flex items-center justify-center h-screen w-full bg-linear-to-br from-green-900 via-green-800 to-green-700 text-white p-6">
      <div className="bg-white text-green-900 rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold mb-8">Your Queue Status</h1>

        <div className="mb-8 p-6 bg-green-50 rounded-2xl border-4 border-green-600">
          <p className="text-lg font-medium mb-2">Your Queue Number</p>
          <p className="text-6xl font-bold text-green-600">{formatQueueNumber(queueData.queue_number)}</p>
        </div>

        <div className="mb-8 p-6 bg-blue-50 rounded-2xl border-4 border-blue-600">
          <p className="text-lg font-medium mb-2">Currently Serving</p>
          <p className="text-6xl font-bold text-blue-700">{formatQueueNumber(queueData.current_serving || "0")}</p>
        </div>

        <div className="mb-8 p-6 bg-yellow-50 rounded-2xl border-4 border-yellow-600">
          <p className="text-lg font-medium mb-2">People Ahead of You</p>
          <p className="text-5xl font-bold text-yellow-600">{position}</p>
        </div>

        {isCompleted ? (
          <div className="mb-8 p-6 bg-slate-100 rounded-2xl border-4 border-slate-500">
            <p className="text-2xl font-bold text-slate-700">Queue Number Passed</p>
            <p className="text-lg mt-2 text-slate-600">Your number was already called. Please coordinate with hospital staff for further assistance.</p>
          </div>
        ) : isServingNow ? (
          <div className="mb-8 p-6 bg-green-100 rounded-2xl border-4 border-green-600 animate-pulse">
            <p className="text-2xl font-bold text-green-700">It's Your Turn Now</p>
            <p className="text-lg mt-2">Please proceed to your assigned room</p>
          </div>
        ) : isNext ? (
          <div className="mb-8 p-6 bg-emerald-100 rounded-2xl border-4 border-emerald-600">
            <p className="text-2xl font-bold text-emerald-700">You're Next</p>
            <p className="text-lg mt-2">Please prepare your documents.</p>
          </div>
        ) : null}

        <div className="mb-8 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-left">
          <p className="text-base font-bold text-amber-800">Important Reminders</p>
          <p className="mt-2 text-sm text-amber-700">
            Please be ready when your number is next and proceed immediately once called.
          </p>
          <p className="mt-1 text-sm text-amber-700">
            If you arrive late and your number is already called, the hospital is not responsible for missed queue turns.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div>
            <p className="text-lg font-medium mb-1">Department</p>
            <p className="text-2xl font-bold">{queueData.department}</p>
          </div>
          <div>
            <p className="text-lg font-medium mb-1">Service</p>
            <p className="text-2xl font-bold">{queueData.service}</p>
          </div>
          <div>
            <p className="text-lg font-medium mb-1">Room</p>
            <p className="text-2xl font-bold">{displayRoom}</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Updates automatically in real time.
        </p>
      </div>
    </div>
  );
};

export default PatientQueue;
