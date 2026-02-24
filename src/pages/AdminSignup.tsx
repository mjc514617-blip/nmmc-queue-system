import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminSignup: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<"form" | "verify">("form");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [method, setMethod] = useState<"email" | "phone" | "">("");
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const isFormValid =
    username && email && phone && password && confirm && method;

  const handleGenerateCode = () => {
    if (!isFormValid) {
      alert("Please complete all fields and select verification method.");
      return;
    }

    if (password !== confirm) {
      alert("Passwords do not match.");
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);

    alert(`Demo Verification Code sent via ${method.toUpperCase()}: ${code}`);

    setStep("verify");
  };

  const handleVerify = () => {
    if (verificationCode === generatedCode) {
      const user = { username, email, phone, password };
      localStorage.setItem("adminUser", JSON.stringify(user));
      alert("Account successfully created!");
      navigate("/admin");
    } else {
      alert("Invalid verification code.");
    }
  };

  // ✅ ENTER KEY SUPPORT
  const handleKeyDownForm = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleGenerateCode();
    }
  };

  const handleKeyDownVerify = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md relative">

        <button
          onClick={() =>
            step === "verify" ? setStep("form") : navigate("/admin")
          }
          className="absolute top-4 left-4 text-blue-900 font-semibold"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-center text-blue-900 mb-8">
          Admin Registration
        </h1>

        {step === "form" && (
          <div className="space-y-4">

            <input
              type="text"
              placeholder="Username"
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDownForm}
            />

            <input
              type="email"
              placeholder="Email Address"
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDownForm}
            />

            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={handleKeyDownForm}
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDownForm}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3"
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>

            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={handleKeyDownForm}
            />

            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-600">
                Verify via:
              </p>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setMethod("email")}
                  className={`px-4 py-2 rounded-xl border ${
                    method === "email"
                      ? "bg-blue-900 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  Email
                </button>

                <button
                  type="button"
                  onClick={() => setMethod("phone")}
                  className={`px-4 py-2 rounded-xl border ${
                    method === "phone"
                      ? "bg-blue-900 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  Phone
                </button>
              </div>
            </div>

            <button
              onClick={handleGenerateCode}
              disabled={!isFormValid}
              className={`w-full py-3 rounded-xl font-semibold ${
                isFormValid
                  ? "bg-blue-900 text-white hover:bg-blue-800"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
            >
              Send Verification Code
            </button>
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-4">

            <input
              type="text"
              placeholder="Enter 6-digit code"
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              onKeyDown={handleKeyDownVerify}
            />

            <button
              onClick={handleVerify}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-500"
            >
              Verify & Create Account
            </button>

          </div>
        )}

      </div>
    </div>
  );
};

export default AdminSignup;
