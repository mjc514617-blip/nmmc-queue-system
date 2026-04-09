import React from "react";
import { useNavigate } from "react-router-dom";

const SignupSelection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 via-white to-emerald-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white/95 p-10 shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
        <h1 className="text-3xl font-extrabold tracking-tight text-center text-emerald-800 mb-2">
          Choose Sign Up Type
        </h1>
        <p className="mx-auto max-w-xs text-center text-sm text-slate-500 mb-8">
          Select which account type you want to create.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => navigate("/admin/signup/admin")}
            className="w-full bg-emerald-700 text-white py-3 rounded-xl font-semibold hover:bg-emerald-800 transition"
          >
            Sign Up as Admin
          </button>

          <button
            onClick={() => navigate("/admin/signup/user")}
            className="w-full bg-white border border-emerald-200 text-emerald-700 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition"
          >
            Sign Up as User
          </button>

          <button
            onClick={() => navigate("/admin")}
            className="w-full text-sm text-slate-600 hover:text-emerald-700 hover:underline"
          >
            Back to Admin Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupSelection;
