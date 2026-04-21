import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

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

const UserLogin: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showAdminBack = searchParams.get("from") === "admin";
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    const accountSources: LoginAccount[] = [
      ...asArray(JSON.parse(localStorage.getItem("userUser") || "null")),
      ...asArray(JSON.parse(localStorage.getItem("userAccount") || "null")),
      ...asArray(JSON.parse(localStorage.getItem("userAccounts") || "[]")),
      ...asArray(JSON.parse(localStorage.getItem("accounts") || "[]")),
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
          role: matchedAccount.role || "user",
        })
      );
      navigate("/admin/dashboard");
    } else {
      alert("Invalid credentials. Please check your username/email and password.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-emerald-50 via-white to-slate-100 px-4">
      <div className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white/95 p-10 shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
        {showAdminBack && (
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="mb-4 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            ← Back to Admin Login
          </button>
        )}

        <h1 className="text-3xl font-extrabold tracking-tight text-center text-emerald-800 mb-2">
          User Login
        </h1>
        <p className="mx-auto max-w-xs text-center text-sm text-slate-500 mb-8">
          Sign in with your user account.
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

        </div>
      </div>
    </div>
  );
};

export default UserLogin;
