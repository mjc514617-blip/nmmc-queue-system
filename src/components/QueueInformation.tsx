import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { getDepartmentServiceAvailability, formatMinutesToTimeLabel } from "../lib/internalMedicineSchedule";

interface QueueInformationProps {
  ticketNumber: string;
  doctorName: string;
  roomNumber: string;
  department: string;
  service: string;
  onPrint: () => Promise<{ ok: boolean; message: string }>;
  onBack: () => void;
  onCancel: () => void;
}

const QueueInformation: React.FC<QueueInformationProps> = ({
  ticketNumber,
  roomNumber,
  department,
  service,
  onPrint,
  onBack,
  onCancel,
}) => {
  const [currentTime, setCurrentTime] = React.useState<Date>(new Date());
  const [printServiceStatus, setPrintServiceStatus] = React.useState<"checking" | "online" | "offline">("checking");
  const [isPrinting, setIsPrinting] = React.useState(false);
  const [printFeedback, setPrintFeedback] = React.useState<{
    type: "success" | "error" | "loading";
    message: string;
  } | null>(null);

  const QR_BASE_URL =
    import.meta.env.VITE_QR_BASE_URL || "https://nmmc-queue-system.vercel.app";
  const baseUrl =
    import.meta.env.VITE_PRINT_SERVICE_URL || "http://127.0.0.1:5000";

  const normalizedBaseUrl = QR_BASE_URL.replace(/\/$/, "");
  const qrValue = `${normalizedBaseUrl}/track?queue=${encodeURIComponent(ticketNumber)}`;
  const serviceAvailability = React.useMemo(() => {
    if (!service) {
      return null;
    }

    return getDepartmentServiceAvailability(department, service, currentTime);
  }, [currentTime, department, service]);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const isPrintAvailable = !serviceAvailability
    || serviceAvailability.isAvailableNow
    || serviceAvailability.status === "closed-day";
  const closedMessage = serviceAvailability
    ? serviceAvailability.status === "not-yet-available"
      ? `Tickets are available at ${formatMinutesToTimeLabel(serviceAvailability.opensAtMinutes)}`
      : serviceAvailability.status === "closed-today"
        ? serviceAvailability.hasTimeConfigured
          ? "Tickets are now closed"
          : "Schedule time not yet posted"
        : null
    : null;

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
    <div className="flex flex-col items-center justify-start min-h-screen w-full px-4 py-3 bg-linear-to-br from-slate-100 via-white to-emerald-50 overflow-y-auto text-slate-700">

      <h1 className="text-2xl font-extrabold tracking-wide uppercase mt-2 mb-3 text-emerald-800">
        QUEUE INFORMATION
      </h1>

      <div className="mb-3">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
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

      {closedMessage && (
        <div className="mb-3 w-full max-w-xl">
          <div className="rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-800 text-center">
            {closedMessage}
          </div>
        </div>
      )}

      {printFeedback && (
        <div className="mb-3 w-full max-w-xl">
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

      <div className="print-area bg-white text-emerald-900 rounded-3xl shadow-[0_14px_38px_rgba(15,23,42,0.12)] px-6 py-5 w-full max-w-lg text-center border border-emerald-100 mb-4">

        <p className="text-sm font-medium mb-2 text-slate-500">Your Queue Number</p>
        <div className="mx-auto mb-4 w-full max-w-52 rounded-2xl border-2 border-emerald-200 bg-white py-2 shadow-md">
          <p className="text-4xl font-extrabold tracking-widest text-emerald-700">{ticketNumber}</p>
        </div>

        <div className="mx-auto w-full max-w-80 space-y-2.5 mb-4">
          <div className="rounded-xl bg-[#218946] text-white py-2.5 px-4 shadow-md">
            <p className="text-[11px] uppercase tracking-wider text-emerald-100">Waiting Number</p>
            <p className="text-xl font-extrabold leading-tight uppercase">{ticketNumber}</p>
          </div>

          <div className="rounded-xl bg-[#218946] text-white py-2.5 px-4 shadow-md">
            <p className="text-[11px] uppercase tracking-wider text-emerald-100">Service</p>
            <p className="text-base font-extrabold leading-tight uppercase">{service || "N/A"}</p>
          </div>

          <div className="rounded-xl bg-[#218946] text-white py-2.5 px-4 shadow-md">
            <p className="text-[11px] uppercase tracking-wider text-emerald-100">Room / Location</p>
            <p className="text-base font-extrabold leading-tight uppercase">{roomNumber || "N/A"}</p>
          </div>
        </div>

        <div className="flex flex-col items-center mb-4">
          <QRCodeCanvas value={qrValue} size={105} fgColor="#15803d" bgColor="#ffffff" />
          <p className="text-sm mt-2 text-gray-600">
            Scan to Check Your Queue Status
          </p>
          <p className="text-[11px] mt-1 text-gray-500 break-all px-2">
            {qrValue}
          </p>
        </div>

        <div className="flex justify-center gap-3 flex-wrap">

          <button
            onClick={onBack}
            className="bg-slate-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-700 transition"
          >
            Back
          </button>

          <button
            onClick={() => {
              void handlePrint();
            }}
            disabled={isPrinting || !isPrintAvailable}
            className="bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-lg hover:scale-105 hover:bg-emerald-800 transition-transform duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPrinting ? "Processing..." : isPrintAvailable ? "Print Ticket" : "Ticket Unavailable"}
          </button>

          <button
            onClick={onCancel}
            className="bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-rose-700 transition"
          >
            Cancel
          </button>

        </div>
      </div>
    </div>
  );
};

export default React.memo(QueueInformation);
