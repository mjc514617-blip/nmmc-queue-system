import React from "react";
import { Routes, Route } from "react-router-dom";

import LiveQueueMonitor from "./pages/LiveQueueMonitor";

import AdminLogin from "./pages/AdminLogin";
import AdminSignup from "./pages/AdminSignup";
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

const App: React.FC = () => {
  return (
    <Routes>

  {/* ================= KIOSK ================= */}
  <Route path="/" element={<WelcomeScreenWrapper />} />

  {/* ================= LIVE MONITOR (PUBLIC) ================= */}
  <Route path="/live/:department" element={<LiveQueueMonitor />} />

  {/* ================= ADMIN ================= */}
  <Route path="/admin" element={<AdminLogin />} />
  <Route path="/admin/signup" element={<AdminSignup />} />
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

</Routes>
  );
};

/* =============================
   KIOSK WRAPPER (UNCHANGED)
============================= */

const WelcomeScreenWrapper = () => {
  const [screen, setScreen] = React.useState("welcome");
  const [selectedDepartment, setSelectedDepartment] = React.useState<string | null>(null);
  const [selectedService, setSelectedService] = React.useState<string | null>(null);

  const [assignedDoctor, setAssignedDoctor] = React.useState("");
  const [assignedRoom, setAssignedRoom] = React.useState("");
  const [ticketNumber, setTicketNumber] = React.useState(1);

  const printTicket = async () => {
    const payload = {
      department: selectedDepartment || "",
      service: selectedService || "",
      ticketNumber: ticketNumber.toString().padStart(2, "0"),
      doctorName: assignedDoctor,
      roomNumber: assignedRoom,
    };

    try {
      const response = await fetch("http://127.0.0.1:8787/print", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Print daemon error: ${response.status}`);
      }
    } catch (error) {
      console.error("Automatic serial print failed.", error);
    }
  };

  // 🔥 SERVICE COUNT FUNCTION
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
          onSelectSubService={(service, generatedTicket) => {
            setAssignedDoctor("Sample Doctor");
            setAssignedRoom("101");

            setTicketNumber(generatedTicket);
            setSelectedService(service); // 🔥 SAVE SERVICE

            setScreen("queue");
          }}
          onBackToWelcome={() => setScreen("welcome")}
        />
      )}

      {screen === "queue" && (
        <QueueInformation
          ticketNumber={ticketNumber.toString().padStart(2, "0")}
          doctorName={assignedDoctor}
          roomNumber={assignedRoom}
          department={selectedDepartment || ""}  // 🔥 ADD THIS
          onPrint={() => {
            if (selectedDepartment && selectedService) {
              updateServiceCount(selectedDepartment, selectedService);
            }
            void printTicket();
          }}
          onBack={() => setScreen("department")}
          onCancel={() => setScreen("welcome")}
        />
      )}
    </>
  );
};

export default App;
