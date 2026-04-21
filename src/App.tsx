import React from "react";
import { Routes, Route } from "react-router-dom";

import LiveQueueMonitor from "./pages/LiveQueueMonitor";
import PatientQueue from "./pages/PatientQueue";

import AdminLogin from "./pages/AdminLogin";
import UserLogin from "./pages/UserLogin";
import AdminSignup from "./pages/AdminSignup";
import SignupSelection from "./pages/SignupSelection";
import UserSignup from "./pages/UserSignup";
import AdminForgotPassword from "./pages/AdminForgotPassword";
import AdminLayout from "./pages/AdminLayout";
import AdminHome from "./pages/AdminHome";
import AdminDepartments from "./pages/AdminDepartments";
import DepartmentPage from "./pages/DepartmentPage";
import AdminSettings from "./pages/AdminSettings";
import AdminProfile from "./pages/AdminProfile";

import WelcomeScreen from "./components/WelcomeScreen";
import DepartmentSelection from "./components/DepartmentSelection";
import QueueInformation from "./components/QueueInformation";
import { supabase } from "./lib/supabaseClient";
import { encodeDepartmentForQr } from "./lib/departmentCodes";

/* =============================
   QUEUE INFORMATION WRAPPER
============================= */

interface QueueInformationWrapperProps {
  department: string;
  doctorName: string;
  roomNumber: string;
  getNextDepartmentTicket: (department: string) => number;
  onPrint: (ticketNumber: number) => Promise<{ ok: boolean; message: string }>;
  onBack: () => void;
  onCancel: () => void;
}

const QueueInformationWrapper: React.FC<QueueInformationWrapperProps> = ({
  department,
  doctorName,
  roomNumber,
  getNextDepartmentTicket,
  onPrint,
  onBack,
  onCancel,
}) => {
  const [ticketNumber, setTicketNumber] = React.useState<number | null>(null);

  React.useEffect(() => {
    const nextTicket = getNextDepartmentTicket(department);
    setTicketNumber(nextTicket);
  }, [department, getNextDepartmentTicket]);

  if (ticketNumber === null) {
    return <div className="flex items-center justify-center h-screen bg-blue-900 text-white">Loading...</div>;
  }

  return (
    <QueueInformation
      ticketNumber={ticketNumber.toString().padStart(3, "0")}
      doctorName={doctorName}
      roomNumber={roomNumber}
      department={department}
      onPrint={async () => onPrint(ticketNumber)}
      onBack={onBack}
      onCancel={onCancel}
    />
  );
};

const App: React.FC = () => {
  return (
    <Routes>

  {/* ================= KIOSK ================= */}
  <Route path="/" element={<WelcomeScreenWrapper />} />

  {/* ================= LIVE MONITOR (PUBLIC) ================= */}
  <Route path="/live/:department" element={<LiveQueueMonitor />} />

  {/* ================= PATIENT QUEUE STATUS ================= */}
  <Route path="/queue/:queueNumber" element={<PatientQueue />} />
  <Route path="/q/:queueNumber" element={<PatientQueue />} />

  {/* ================= ADMIN ================= */}
  <Route path="/admin" element={<AdminLogin />} />
  <Route path="/user" element={<UserLogin />} />
  <Route path="/admin/signup" element={<SignupSelection />} />
  <Route path="/admin/signup/admin" element={<AdminSignup />} />
  <Route path="/admin/signup/user" element={<UserSignup />} />
  <Route path="/admin/forgot" element={<AdminForgotPassword />} />

  {/* DASHBOARD WITH LAYOUT */}
  <Route path="/admin/dashboard" element={<AdminLayout />}>

    {/* Dashboard Home */}
    <Route index element={<AdminHome />} />

    {/* Departments */}
    <Route path="departments" element={<AdminDepartments />} />

    {/* Department Sub Services */}
    <Route path="departments/:id/page" element={<DepartmentPage />} />

    {/* Settings */}
    <Route path="settings" element={<AdminSettings />} />

    <Route path="profile" element={<AdminProfile />} />

  </Route>

  <Route path="*" element={<WelcomeScreenWrapper />} />

</Routes>
  );
};

/* =============================
   KIOSK WRAPPER
============================= */

type OperationResult = { ok: boolean; message: string; printed?: boolean };

const WelcomeScreenWrapper = () => {
  const [screen, setScreen] = React.useState("welcome");
  const [selectedDepartment, setSelectedDepartment] = React.useState<string | null>(null);
  const [selectedService, setSelectedService] = React.useState<string | null>(null);

  const [assignedDoctor, setAssignedDoctor] = React.useState("");
  const [assignedRoom, setAssignedRoom] = React.useState("");

  const baseUrl =
    import.meta.env.VITE_PRINT_SERVICE_URL || "http://127.0.0.1:5000";
  const qrBaseUrl = (
    import.meta.env.VITE_QR_BASE_URL ||
    "https://nmmc-queue-system.vercel.app"
  ).replace(/\/$/, "");

  const checkDailyReset = React.useCallback(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem("queueDate");

    if (storedDate !== today) {
      localStorage.setItem("departmentCounters", JSON.stringify({}));
      localStorage.setItem("serviceCounts", JSON.stringify({}));
      localStorage.setItem("liveQueue", JSON.stringify({}));
      localStorage.setItem("queueDate", today);
    }
  }, []);

  const getNextDepartmentTicket = React.useCallback((department: string): number => {
    checkDailyReset();
    const counters = JSON.parse(localStorage.getItem("departmentCounters") || "{}");
    return (counters[department] || 0) + 1;
  }, [checkDailyReset]);

  const incrementDepartmentTicket = React.useCallback((department: string): number => {
    checkDailyReset();
    const counters = JSON.parse(localStorage.getItem("departmentCounters") || "{}");
    counters[department] = (counters[department] || 0) + 1;
    localStorage.setItem("departmentCounters", JSON.stringify(counters));
    return counters[department];
  }, [checkDailyReset]);

  const printTicket = async (payload: Record<string, string>): Promise<OperationResult> => {
    try {
      const response = await fetch(`${baseUrl}/print`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Print service error: ${response.status}`);
      }

      return { ok: true, message: "Ticket sent to printer.", printed: true };
    } catch (error) {
      console.error("Automatic print via Python service failed.", error);
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Printing failed. Please try again.",
        printed: false,
      };
    }
  };

  const saveTicketToSupabase = async (
    formattedTicketNumber: string,
    payload: Record<string, string>
  ): Promise<OperationResult> => {
    const timestamp = new Date().toISOString();

    const insertPayloads = [
      {
        queue_number: formattedTicketNumber,
        department: payload.department,
        service: payload.service,
        status: "waiting",
        timestamp,
        doctor: payload.doctorName,
        room: payload.roomNumber,
      },
      {
        queue_number: formattedTicketNumber,
        department: payload.department,
        service: payload.service,
        status: "waiting",
        doctor: payload.doctorName,
        room: payload.roomNumber,
      },
      {
        queue_number: formattedTicketNumber,
        department: payload.department,
        service: payload.service,
        status: "waiting",
      },
    ];

    let lastErrorMessage = "Unknown Supabase error";

    for (const candidatePayload of insertPayloads) {
      const { error } = await supabase.from("tickets").insert(candidatePayload);
      if (!error) {
        return { ok: true, message: "Ticket saved online." };
      }
      lastErrorMessage = error.message;
    }

    return {
      ok: false,
      message: `Failed to save ticket online: ${lastErrorMessage}`,
    };
  };

  const processTicket = async (ticketNumber: number): Promise<OperationResult> => {
    if (!selectedDepartment || !selectedService) {
      return {
        ok: false,
        message: "Please select a department and service before printing.",
      };
    }

    const formattedTicketNumber = ticketNumber.toString().padStart(3, "0");
    const departmentCode = encodeDepartmentForQr(selectedDepartment);
    const qrUrl = `${qrBaseUrl}/q/${encodeURIComponent(formattedTicketNumber)}?d=${encodeURIComponent(departmentCode)}`;
    const payload = {
      department: selectedDepartment,
      service: selectedService,
      queue_number: formattedTicketNumber,
      ticketNumber: formattedTicketNumber,
      doctorName: assignedDoctor,
      roomNumber: assignedRoom,
      qrUrl,
      qr_url: qrUrl,
    };

    const [printResult, saveResult] = await Promise.all([
      printTicket(payload),
      saveTicketToSupabase(formattedTicketNumber, payload),
    ]);

    if (printResult.ok && saveResult.ok) {
      return {
        ok: true,
        message: "Printed successfully and saved online.",
        printed: true,
      };
    }

    if (printResult.ok && !saveResult.ok) {
      return {
        ok: false,
        message: `Printed successfully, but ${saveResult.message}`,
        printed: true,
      };
    }

    if (!printResult.ok && saveResult.ok) {
      return {
        ok: false,
        message: `Saved online, but printing failed: ${printResult.message}`,
        printed: false,
      };
    }

    return {
      ok: false,
      message: `Printing failed: ${printResult.message} | ${saveResult.message}`,
      printed: false,
    };
  };

  const updateServiceCount = (department: string, service: string) => {
    const stored = JSON.parse(localStorage.getItem("serviceCounts") || "{}");

    if (!stored[department]) {
      stored[department] = {};
    }

    if (!stored[department][service]) {
      stored[department][service] = 0;
    }

    stored[department][service] += 1;

    localStorage.setItem("serviceCounts", JSON.stringify(stored));
  };

  return (
    <>
      {screen === "welcome" && (
        <WelcomeScreen onStart={() => setScreen("department")} />
      )}

      {screen === "department" && (
        <DepartmentSelection
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          onSelectSubService={(service) => {
            setAssignedDoctor("Sample Doctor");
            setAssignedRoom("101");
            setSelectedService(service);
            setScreen("queue");
          }}
          onBackToWelcome={() => setScreen("welcome")}
        />
      )}

      {screen === "queue" && selectedDepartment && (
        <QueueInformationWrapper
          department={selectedDepartment}
          doctorName={assignedDoctor}
          roomNumber={assignedRoom}
          getNextDepartmentTicket={getNextDepartmentTicket}
          onPrint={async (ticketNum) => {
            const result = await processTicket(ticketNum);

            if (result.printed && selectedDepartment) {
              incrementDepartmentTicket(selectedDepartment);
              if (selectedService) {
                updateServiceCount(selectedDepartment, selectedService);
              }

              setSelectedDepartment(null);
              setSelectedService(null);
              setAssignedDoctor("");
              setAssignedRoom("");
              setScreen("welcome");
            }

            return result;
          }}
          onBack={() => setScreen("department")}
          onCancel={() => setScreen("welcome")}
        />
      )}
    </>
  );
};

export default App;
