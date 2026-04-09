import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

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

  const nextInLine = history.slice(-5).map((_, i) =>
    currentNumber + i + 1
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {error && (
        <div className="bg-red-600 text-white p-4 text-center">
          Supabase error: {error}
        </div>
      )}

      {/* HEADER */}
      <div className="bg-blue-900 p-6 text-center">
        <h1 className="text-4xl font-bold">
          {department} Live Queue Monitor
        </h1>
      </div>

      {/* MAIN DISPLAY */}
      <div className="flex flex-1">

        {/* A. NOW SERVING */}
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900">
          <h2 className="text-3xl mb-6">NOW SERVING</h2>

          <div className="text-8xl font-bold text-green-400">
            {currentNumber.toString().padStart(3, "0")}
          </div>

          <p className="mt-4 text-lg">
            Window 1
          </p>
        </div>

        {/* B. NEXT IN LINE */}
        <div className="w-1/3 bg-gray-800 p-8">
          <h2 className="text-2xl mb-6">Next in Line</h2>

          <div className="space-y-4">
            {nextInLine.map((num, index) => (
              <div
                key={index}
                className="bg-gray-700 p-4 rounded-xl text-center text-3xl"
              >
                {num.toString().padStart(3, "0")}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* C. ANNOUNCEMENT AREA */}
      <div className="bg-blue-800 p-4 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap text-lg">
          🏥 Please prepare your documents before entering. 
          💙 Stay hydrated. 
          🩺 Wear your mask properly.
        </div>
      </div>


    </div>
  );
};

export default LiveQueueMonitor;