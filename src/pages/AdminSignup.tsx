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

  const isFormValid = Boolean(username && email && phone && password && confirm && method);

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

    const user = { username, email, phone, password, role: "admin" };
    const existingAdmins = JSON.parse(localStorage.getItem("adminUsers") || "[]");

    const duplicateAccount = existingAdmins.find(
      (admin: { username?: string; email?: string }) =>
        admin.username?.toLowerCase() === username.toLowerCase() ||
        admin.email?.toLowerCase() === email.toLowerCase()
    );

    if (duplicateAccount) {
      alert("Admin account already exists with the same username or email.");
      return;
    }

    localStorage.setItem("adminUsers", JSON.stringify([...existingAdmins, user]));
    localStorage.setItem("adminUser", JSON.stringify(user));
    alert("Account successfully created!");
    navigate("/admin");
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
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.2),transparent_30%),linear-gradient(135deg,#0f172a_0%,#1d4ed8_55%,#dbeafe_100%)] px-4 py-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/15 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.22)] md:grid-cols-[0.9fr_1.1fr]">
          <aside className="relative overflow-hidden bg-[linear-gradient(180deg,#0f2f1d_0%,#14532d_55%,#1f8a4c_100%)] p-6 text-white md:p-8">
            <div className="absolute -right-16 top-8 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -left-10 bottom-0 h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl" />

            <button
              type="button"
              onClick={() => (step === "verify" ? setStep("form") : navigate("/admin/signup"))}
              className="relative inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              ← Back
            </button>

            <div className="relative mt-10 max-w-md">
              <p className="text-xs font-bold uppercase tracking-[0.45em] text-emerald-100/80">Admin Access</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">Create staff credentials</h1>
              <p className="mt-4 text-sm leading-6 text-emerald-50/90">
                For doctors, nurses, or department staff who will manage the live queue and now serving controls.
              </p>
            </div>
          </aside>

          <main className="p-6 md:p-8">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-emerald-700">Registration</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Admin Registration</h2>
              <p className="mt-2 text-sm text-slate-500">Fill in the details and verify before creating the account.</p>
            </div>

            {step === "form" && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyDownForm}
                />

                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDownForm}
                />

                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={handleKeyDownForm}
                />

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDownForm}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-emerald-700"
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>

                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onKeyDown={handleKeyDownForm}
                />

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-600">Verify via:</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setMethod("email")}
                      className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                        method === "email"
                          ? "border-emerald-700 bg-emerald-700 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
                      }`}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod("phone")}
                      className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                        method === "phone"
                          ? "border-emerald-700 bg-emerald-700 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
                      }`}
                    >
                      Phone
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleGenerateCode}
                  disabled={!isFormValid}
                  className={`w-full rounded-2xl py-3.5 font-semibold transition ${
                    isFormValid
                      ? "bg-emerald-700 text-white shadow-[0_10px_25px_rgba(16,185,129,0.22)] hover:bg-emerald-800"
                      : "cursor-not-allowed bg-slate-300 text-slate-500"
                  }`}
                >
                  Send Verification Code
                </button>
              </div>
            )}

            {step === "verify" && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  Enter the 6-digit verification code generated for this demo step.
                </div>

                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  onKeyDown={handleKeyDownVerify}
                />

                <button
                  onClick={handleVerify}
                  className="w-full rounded-2xl bg-emerald-700 py-3.5 font-semibold text-white shadow-[0_10px_25px_rgba(16,185,129,0.22)] transition hover:bg-emerald-800"
                >
                  Verify & Create Account
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;
