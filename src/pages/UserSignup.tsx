import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

type UserAccount = {
  username: string;
  email: string;
  phone: string;
  password: string;
  role: "user";
};

const UserSignup: React.FC = () => {
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

  const isFormValid = username && email && phone && password && confirm && method;

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
    if (verificationCode !== generatedCode) {
      alert("Invalid verification code.");
      return;
    }

    const user: UserAccount = {
      username,
      email,
      phone,
      password,
      role: "user",
    };

    const existingUsers = JSON.parse(localStorage.getItem("userAccounts") || "[]");
    const duplicateAccount = existingUsers.find(
      (account: { username?: string; email?: string }) =>
        account.username?.toLowerCase() === username.toLowerCase() ||
        account.email?.toLowerCase() === email.toLowerCase()
    );

    if (duplicateAccount) {
      alert("User account already exists with the same username or email.");
      return;
    }

    localStorage.setItem("userAccounts", JSON.stringify([...existingUsers, user]));
    localStorage.setItem("userAccount", JSON.stringify(user));
    alert("User account successfully created!");
    navigate("/user");
  };

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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 via-white to-emerald-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white/95 p-10 shadow-[0_20px_60px_rgba(15,23,42,0.14)] relative">
        <button
          onClick={() => (step === "verify" ? setStep("form") : navigate("/admin/signup"))}
          className="absolute top-4 left-4 text-emerald-700 font-semibold"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-extrabold tracking-tight text-center text-emerald-800 mb-8">
          User Registration
        </h1>

        {step === "form" && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDownForm}
            />

            <input
              type="email"
              placeholder="Email Address"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDownForm}
            />

            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={handleKeyDownForm}
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDownForm}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3 text-slate-600"
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>

            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={handleKeyDownForm}
            />

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-600">Verify via:</p>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setMethod("email")}
                  className={`px-4 py-2 rounded-xl border ${
                    method === "email" ? "bg-emerald-700 text-white" : "bg-gray-100"
                  }`}
                >
                  Email
                </button>

                <button
                  type="button"
                  onClick={() => setMethod("phone")}
                  className={`px-4 py-2 rounded-xl border ${
                    method === "phone" ? "bg-emerald-700 text-white" : "bg-gray-100"
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
                  ? "bg-emerald-700 text-white hover:bg-emerald-800"
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
              className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              onKeyDown={handleKeyDownVerify}
            />

            <button
              onClick={handleVerify}
              className="w-full bg-emerald-700 text-white py-3 rounded-xl font-semibold hover:bg-emerald-800"
            >
              Verify and Create User
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSignup;
