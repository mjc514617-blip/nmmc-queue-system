import React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { decodeDepartmentFromQr } from "../lib/departmentCodes";

const formatQueueNumber = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === "") return "000";
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed)) return String(value);
  return String(parsed).padStart(3, "0");
};

const PatientQueue: React.FC = () => {
  const { queueNumber } = useParams<{ queueNumber: string }>();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [queueData, setQueueData] = React.useState<{
    queue_number: string;
    department: string;
    service: string;
    doctor: string;
    room: string;
    current_serving: string | null;
  } | null>(null);

  const departmentParam =
    searchParams.get("department") || decodeDepartmentFromQr(searchParams.get("d"));

  React.useEffect(() => {
    const fetchQueueData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!queueNumber) {
          setError("No queue number provided");
          return;
        }

        let ticketQuery = supabase
          .from("tickets")
          .select("queue_number, department, service, doctor, room")
          .eq("queue_number", queueNumber)
          .order("id", { ascending: false })
          .limit(1);

        if (departmentParam) {
          ticketQuery = ticketQuery.ilike("department", departmentParam);
        }

        const { data: ticketRows, error: ticketError } = await ticketQuery;

        if (ticketError) {
          setError(`Database error: ${ticketError.message}`);
          return;
        }

        const ticket = ticketRows?.[0];
        if (!ticket) {
          setError("Queue number not found. Please check your ticket.");
          return;
        }

        const { data: liveData } = await supabase
          .from("live_queue")
          .select("current_number")
          .ilike("department", ticket.department)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        setQueueData({
          queue_number: ticket.queue_number || queueNumber,
          department: ticket.department || "Unknown",
          service: ticket.service || "",
          doctor: ticket.doctor || "TBD",
          room: ticket.room || "TBD",
          current_serving: liveData?.current_number?.toString() || null,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    void fetchQueueData();
  }, [queueNumber, departmentParam]);

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
          event: "UPDATE",
          schema: "public",
          table: "live_queue",
        },
        (payload) => {
          const changedDepartment = (payload.new.department || "").toString().trim().toLowerCase();
          if (changedDepartment !== deptName) return;
          setQueueData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              current_serving: payload.new.current_number?.toString() || "0",
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
      <div className="flex items-center justify-center h-screen w-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-blue-300 mx-auto mb-4"></div>
          <p className="text-2xl font-semibold">Loading queue status...</p>
        </div>
      </div>
    );
  }

  if (error || !queueData) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white p-6">
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

  const currentNum = queueData.current_serving ? parseInt(queueData.current_serving, 10) : 0;
  const yourNum = parseInt(queueData.queue_number, 10);
  const position = Math.max(0, yourNum - currentNum);

  return (
    <div className="flex items-center justify-center h-screen w-full bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white p-6">
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

        {position === 0 && (
          <div className="mb-8 p-6 bg-green-100 rounded-2xl border-4 border-green-600 animate-pulse">
            <p className="text-2xl font-bold text-green-700">You're Next!</p>
            <p className="text-lg mt-2">Please proceed to your assigned room</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <p className="text-lg font-medium mb-1">Department</p>
            <p className="text-2xl font-bold">{queueData.department}</p>
          </div>
          <div>
            <p className="text-lg font-medium mb-1">Service</p>
            <p className="text-2xl font-bold">{queueData.service}</p>
          </div>
          <div>
            <p className="text-lg font-medium mb-1">Doctor</p>
            <p className="text-2xl font-bold">{queueData.doctor}</p>
          </div>
          <div>
            <p className="text-lg font-medium mb-1">Room</p>
            <p className="text-2xl font-bold">{queueData.room}</p>
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
