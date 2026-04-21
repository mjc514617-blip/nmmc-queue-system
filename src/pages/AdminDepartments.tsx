import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import DepartmentCard from "../components/DepartmentCard";

const departments = [
  "Internal Medicine",
  "Pediatrics",
  "Surgery",
  "Dental",
  "Family & Community Medicine (FAMED)",
  "Obstetrics & Gynecology",
  "Family Planning",
  "Orthopedics",
  "Rehabilitation Medicine",
  "Ophthalmology",
  "Psychiatry",
  "Otorhinolaryngology",
];

const AdminDepartments: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");

  const correctCode = "1234";

  const handleAccess = () => {
    if (accessCode !== correctCode) {
      setError("Wrong access code.");
      return;
    }

    // 🔥 FIXED NAVIGATION PATH
    navigate(`/admin/dashboard/departments/${selectedDept}/page`);

    setSelectedDept(null);
    setAccessCode("");
    setError("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAccess();
    }
  };

  return (
    <div className="rounded-4xl border border-[#dbeee0] bg-white/96 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.12)] backdrop-blur-sm md:p-8">
      <BackButton />

      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-emerald-800">
            Departments
          </h2>
          <p className="mt-2 text-sm text-slate-500">Select a department to open its control panel</p>
        </div>
        <div className="hidden md:inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800">
          {departments.length} Departments
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {departments.map((dept) => (
          <DepartmentCard
            key={dept}
            name={dept}
            onClick={() => {
              setSelectedDept(dept);
              setAccessCode("");
              setError("");
            }}
          />
        ))}
      </div>

      {selectedDept && (
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-[1px] flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-3xl border border-[#dbeee0] bg-white p-8 shadow-2xl">

            <h3 className="text-xl font-bold text-emerald-800 mb-2">
              {selectedDept}
            </h3>
            <p className="mb-4 text-sm text-slate-500">Enter the department access code to continue.</p>

            {/* ✅ ONLY ONE INPUT NOW */}
            <input
              type="password"
              placeholder="Enter Access Code"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            {error && (
              <p className="text-red-500 mt-2">{error}</p>
            )}

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setSelectedDept(null)}
                className="rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-300 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleAccess}
                className="rounded-xl bg-emerald-700 text-white px-4 py-2.5 text-sm font-semibold hover:bg-emerald-800 transition"
              >
                Enter
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDepartments;
