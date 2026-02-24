import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    const storedUser = JSON.parse(localStorage.getItem("adminUser") || "null");

    if (!storedUser) {
      alert("No account found. Please sign up first.");
      return;
    }

    if (
      (identifier === storedUser.email ||
        identifier === storedUser.username) &&
      password === storedUser.password
    ) {
      navigate("/admin/dashboard");
    } else {
      alert("Invalid credentials");
    }
  };

  // ✅ ENTER KEY SUPPORT
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-8">
          Admin Login
        </h1>

        <div className="space-y-5">
          <input
            type="text"
            placeholder="Username or Email"
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3 text-gray-600"
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-blue-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition"
          >
            Login
          </button>

          <div className="flex justify-between text-sm">
            <button
              onClick={() => navigate("/admin/signup")}
              className="text-blue-900 hover:underline"
            >
              Sign Up
            </button>

            <button
              onClick={() => navigate("/admin/forgot")}
              className="text-blue-900 hover:underline"
            >
              Forgot Password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
