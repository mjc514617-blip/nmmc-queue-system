import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

type LoginAccount = {
  username?: string;
  email?: string;
  password?: string;
  role?: string;
};

const asArray = (value: unknown): LoginAccount[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value as LoginAccount[];
  if (typeof value === "object") return [value as LoginAccount];
  return [];
};

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    const accountSources: LoginAccount[] = [
      ...asArray(JSON.parse(localStorage.getItem("adminUser") || "null")),
      ...asArray(JSON.parse(localStorage.getItem("adminUsers") || "[]")),
    ];

    const loginIdentifier = identifier.trim().toLowerCase();

    const matchedAccount = accountSources.find((account) => {
      const accountEmail = (account.email || "").toLowerCase();
      const accountUsername = (account.username || "").toLowerCase();

      return (
        (loginIdentifier === accountEmail || loginIdentifier === accountUsername) &&
        password === (account.password || "")
      );
    });

    if (matchedAccount) {
      localStorage.setItem(
        "currentPortalUser",
        JSON.stringify({
          username: matchedAccount.username || "User",
          email: matchedAccount.email || "",
          role: "admin",
        })
      );
      navigate("/admin/dashboard");
    } else {
      alert("Invalid credentials. Please check your username/email and password.");
    }
  };

  // ✅ ENTER KEY SUPPORT
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 via-white to-emerald-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white/95 p-10 shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
        <h1 className="text-3xl font-extrabold tracking-tight text-center text-emerald-800 mb-2">
          Admin Login
        </h1>
        <p className="text-center text-sm text-slate-500 mb-8">
          Sign in using your admin credentials to manage the dashboard.
        </p>

        <div className="space-y-5">
          <input
            type="text"
            placeholder="Username or Email"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3 text-slate-600"
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-emerald-700 text-white py-3 rounded-xl font-semibold hover:bg-emerald-800 transition"
          >
            Login
          </button>

          <div className="flex justify-between text-sm">
            <button
              onClick={() => navigate("/admin/signup")}
              className="text-emerald-700 hover:underline"
            >
              Sign Up
            </button>

            <button
              onClick={() => navigate("/admin/forgot")}
              className="text-emerald-700 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            onClick={() => navigate("/user?from=admin")}
            className="w-full text-sm text-slate-600 hover:text-emerald-700 hover:underline"
          >
            Continue as User Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
