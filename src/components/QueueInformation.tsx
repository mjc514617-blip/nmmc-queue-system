import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { encodeDepartmentForQr } from "../lib/departmentCodes";

interface QueueInformationProps {
  ticketNumber: string;
  doctorName: string;
  roomNumber: string;
  department: string;
  onPrint: () => Promise<{ ok: boolean; message: string }>;
  onBack: () => void;
  onCancel: () => void;
}

const QueueInformation: React.FC<QueueInformationProps> = ({
  ticketNumber,
  doctorName,
  roomNumber,
  department,
  onPrint,
  onBack,
  onCancel,
}) => {
  const [printServiceStatus, setPrintServiceStatus] = React.useState<"checking" | "online" | "offline">("checking");
  const [isPrinting, setIsPrinting] = React.useState(false);
  const [printFeedback, setPrintFeedback] = React.useState<{
    type: "success" | "error" | "loading";
    message: string;
  } | null>(null);

  const QR_BASE_URL =
    import.meta.env.VITE_QR_BASE_URL ||
    "https://nmmc-queue-system.vercel.app";
  const baseUrl =
    import.meta.env.VITE_PRINT_SERVICE_URL || "http://127.0.0.1:5000";

  const normalizedBaseUrl = QR_BASE_URL.replace(/\/$/, "");
  const departmentCode = encodeDepartmentForQr(department);
  const qrValue = `${normalizedBaseUrl}/q/${encodeURIComponent(ticketNumber)}?d=${encodeURIComponent(departmentCode)}`;

  React.useEffect(() => {
    let isMounted = true;

    const checkPrintService = async () => {
      try {
        const response = await fetch(`${baseUrl}/health`, {
          method: "GET",
        });

        if (!isMounted) return;
        setPrintServiceStatus(response.ok ? "online" : "offline");
      } catch {
        if (!isMounted) return;
        setPrintServiceStatus("offline");
      }
    };

    void checkPrintService();
    const interval = window.setInterval(checkPrintService, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [baseUrl]);

  const handlePrint = async () => {
    setIsPrinting(true);
    setPrintFeedback({ type: "loading", message: "Printing locally and saving ticket online..." });

    const result = await onPrint();

    setPrintFeedback({
      type: result.ok ? "success" : "error",
      message: result.message,
    });
    setIsPrinting(false);
  };

  React.useEffect(() => {
    if (!printFeedback || printFeedback.type === "loading") {
      return;
    }

    const timeout = window.setTimeout(() => {
      setPrintFeedback(null);
    }, 4000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [printFeedback]);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full text-white p-10 bg-linear-to-br from-blue-900 via-blue-800 to-blue-700 overflow-auto">

      <h1 className="text-4xl font-bold mb-10">
        Queue Information
      </h1>

      <div className="mb-4">
        <span
          className={`inline-flex items-center rounded-full px-4 py-1 text-sm font-semibold ${
            printServiceStatus === "online"
              ? "bg-green-500 text-white"
              : printServiceStatus === "offline"
                ? "bg-red-500 text-white"
                : "bg-yellow-400 text-blue-900"
          }`}
        >
          Print Service: {printServiceStatus === "online" ? "Connected" : printServiceStatus === "offline" ? "Offline" : "Checking..."}
        </span>
      </div>

      {printFeedback && (
        <div className="mb-4 w-full max-w-2xl">
          <div
            className={`rounded-xl px-4 py-3 text-sm font-semibold text-center ${
              printFeedback.type === "success"
                ? "bg-green-100 text-green-800"
                : printFeedback.type === "error"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
            }`}
          >
            {printFeedback.message}
          </div>
        </div>
      )}

      <div className="print-area bg-white text-blue-900 rounded-3xl shadow-2xl p-12 w-full max-w-2xl text-center">

        <p className="text-lg font-medium mb-2">Waiting Number</p>
        <h2 className="text-6xl font-bold mb-8">{ticketNumber}</h2>

        <div className="mb-4">
          <p className="text-lg font-medium">Attending Doctor</p>
          <p className="text-2xl font-semibold">{doctorName}</p>
        </div>

        <div className="mb-8">
          <p className="text-lg font-medium">Room Number</p>
          <p className="text-2xl font-semibold">{roomNumber}</p>
        </div>

        <div className="flex flex-col items-center mb-8">
          <QRCodeCanvas value={qrValue} size={150} />
          <p className="text-sm mt-3 text-gray-600">
            Scan to Check Your Queue Status
          </p>
          <p className="text-xs mt-2 text-gray-500 break-all px-2">
            {qrValue}
          </p>
        </div>

        <div className="flex justify-center gap-6 flex-wrap">

          <button
            onClick={onBack}
            className="bg-gray-500 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-gray-600 transition"
          >
            Back
          </button>

          <button
            onClick={() => {
              void handlePrint();
            }}
            disabled={isPrinting}
            className="bg-blue-900 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPrinting ? "Processing..." : "Print Ticket"}
          </button>

          <button
            onClick={onCancel}
            className="bg-red-600 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-red-700 transition            sudo systemctl enable ssh
            sudo systemctl start ssh
            sudo systemctl status ssh"
          >
            Cancel
          </button>

        </div>
      </div>
    </div>
  );
};

export default React.memo(QueueInformation);
