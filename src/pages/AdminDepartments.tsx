import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import DepartmentCard from "../components/DepartmentCard";

const departments = [
  "Internal Medicine",
  "Surgery",
  "Pediatrics",
  "Obstetrics & Gynecology",
  "Orthopedics",
  "Family & Community Medicine",
  "Rehabilitation Medicine",
  "ENT - HNS",
  "Dental",
  "Pathology",
  "Ophthalmology",
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
    <div>
      <BackButton />

      <h2 className="text-3xl font-bold mb-8 text-gray-800">
        🏥 Departments
      </h2>

      <div className="grid grid-cols-3 gap-6">
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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl w-96 shadow-xl">

            <h3 className="text-xl font-bold mb-4">
              🔐 {selectedDept}
            </h3>

            {/* ✅ ONLY ONE INPUT NOW */}
            <input
              type="password"
              placeholder="Enter Access Code"
              className="w-full border px-4 py-2 rounded-xl"
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
                className="bg-gray-300 px-4 py-2 rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={handleAccess}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl"
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
