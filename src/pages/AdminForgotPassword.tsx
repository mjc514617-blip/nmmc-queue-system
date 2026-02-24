import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

const AdminForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [method, setMethod] = useState<"email" | "phone" | "">("");
  const [step, setStep] = useState<"form" | "verify">("form");
  const [generatedCode, setGeneratedCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleGenerateCode = () => {
    const user = JSON.parse(localStorage.getItem("adminUser") || "null");

    if (!user || user.username !== username) {
      alert("Username not found.");
      return;
    }

    if (!method) {
      alert("Select verification method.");
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);

    alert(`Demo Code sent via ${method}: ${code}`);

    setStep("verify");
  };

  const handleReset = () => {
    if (inputCode !== generatedCode) {
      alert("Invalid code.");
      return;
    }

    const user = JSON.parse(localStorage.getItem("adminUser") || "null");
    user.password = newPassword;
    localStorage.setItem("adminUser", JSON.stringify(user));

    alert("Password successfully reset!");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">

      <div className="bg-white p-8 rounded-2xl shadow w-96">

        <BackButton />

        <h2 className="text-xl font-bold mb-6 text-center">
          Forgot Password
        </h2>

        {step === "form" && (
          <div className="space-y-4">

            <input
              type="text"
              placeholder="Username"
              className="w-full border px-4 py-2 rounded-xl"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <div className="flex gap-4">
              <button
                onClick={() => setMethod("email")}
                className={`flex-1 py-2 rounded-xl ${
                  method === "email"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100"
                }`}
              >
                Email
              </button>

              <button
                onClick={() => setMethod("phone")}
                className={`flex-1 py-2 rounded-xl ${
                  method === "phone"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100"
                }`}
              >
                Phone
              </button>
            </div>

            <button
              onClick={handleGenerateCode}
              className="w-full bg-blue-900 text-white py-2 rounded-xl"
            >
              Send Code
            </button>

          </div>
        )}

        {step === "verify" && (
          <div className="space-y-4">

            <input
              type="text"
              placeholder="Enter Code"
              className="w-full border px-4 py-2 rounded-xl"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
            />

            <input
              type="password"
              placeholder="New Password"
              className="w-full border px-4 py-2 rounded-xl"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <button
              onClick={handleReset}
              className="w-full bg-green-600 text-white py-2 rounded-xl"
            >
              Reset Password
            </button>

          </div>
        )}

      </div>
    </div>
  );
};

export default AdminForgotPassword;
