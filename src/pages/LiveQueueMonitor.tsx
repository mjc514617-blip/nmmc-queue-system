import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const LiveQueueMonitor = () => {
  const { department } = useParams();

  const [currentNumber, setCurrentNumber] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const loadQueue = () => {
      const stored = JSON.parse(localStorage.getItem("liveQueue") || "{}");

      if (stored[department || ""]) {
        setCurrentNumber(stored[department || ""].currentNumber || 0);
        setHistory(stored[department || ""].history || []);
        setLastUpdated(new Date());
      }
    };

    loadQueue();

    const interval = setInterval(loadQueue, 1000); // real-time polling
    return () => clearInterval(interval);
  }, [department]);

  const nextInLine = history.slice(-5).map((_, i) =>
    currentNumber + i + 1
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

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
            {currentNumber.toString().padStart(2, "0")}
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
                {num.toString().padStart(2, "0")}
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

      {/* D. REAL TIME UPDATE */}
      <div className="bg-gray-900 text-center py-2 text-sm">
        Last Updated: {lastUpdated?.toLocaleTimeString()}
      </div>

    </div>
  );
};

export default LiveQueueMonitor;