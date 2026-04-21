import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentPortalUser") || "null");
    const fallbackUser = JSON.parse(localStorage.getItem("adminUser") || "null");
    if (storedUser) {
      setAdminName(storedUser.username);
      return;
    }
    if (fallbackUser) {
      setAdminName(fallbackUser.username);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentPortalUser");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex bg-linear-to-br from-[#f4faf6] via-white to-[#e6f5eb] text-slate-700">

      {/* SIDEBAR */}
      <div className="m-4 w-68 rounded-3xl border border-[#dbeee0] bg-white/96 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.10)] backdrop-blur-sm flex flex-col justify-between">

        <div>
          <h2 className="text-2xl font-bold mb-2 tracking-tight text-emerald-800">
            Northern Mindanao Medical Center
          </h2>

          <nav className="space-y-4">

            <button
              onClick={() => navigate("/admin/dashboard")}
              className={`block w-full text-left px-4 py-2.5 rounded-xl border text-sm transition ${
                location.pathname === "/admin/dashboard"
                  ? "bg-emerald-700 text-white border-emerald-700 shadow-sm font-semibold"
                  : "bg-white text-slate-700 border-[#dce8df] hover:bg-[#edf8f1] hover:border-emerald-200"
              }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => navigate("/admin/dashboard/departments")}
              className={`block w-full text-left px-4 py-2.5 rounded-xl border text-sm transition ${
                location.pathname.includes("departments")
                  ? "bg-emerald-700 text-white border-emerald-700 shadow-sm font-semibold"
                  : "bg-white text-slate-700 border-[#dce8df] hover:bg-[#edf8f1] hover:border-emerald-200"
              }`}
            >
              Departments
            </button>

          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-xl border border-slate-200 bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 hover:text-slate-900"
        >
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 px-2 py-4 pr-4">

        {/* TOP BAR */}
        <div className="flex justify-between items-center rounded-2xl border border-[#dbeee0] bg-white/96 shadow-[0_8px_24px_rgba(15,23,42,0.08)] px-6 py-4">

          <h1 className="text-xl font-semibold text-emerald-800">
            Control Panel
          </h1>

          {/* PROFILE DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
            >
              {adminName}
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl border border-[#dbeee0] bg-white shadow-lg p-4">

                <p
                  onClick={() => {
                    navigate("/admin/dashboard/profile");
                    setProfileOpen(false);
                  }}
                  className="cursor-pointer hover:text-emerald-700 mb-2"
                >
                  My Profile
                </p>

                <p
                  onClick={() => {
                    navigate("/admin/dashboard/settings");
                    setProfileOpen(false);
                  }}
                  className="cursor-pointer hover:text-emerald-700 mb-2"
                >
                  Settings
                </p>

                <hr className="my-2" />

                <p
                  onClick={handleLogout}
                  className="cursor-pointer text-slate-700 transition hover:text-emerald-700"
                >
                  🚪 Logout
                </p>

              </div>
            )}
          </div>

        </div>

        {/* PAGE CONTENT */}
        <div className="p-6">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default AdminLayout;
