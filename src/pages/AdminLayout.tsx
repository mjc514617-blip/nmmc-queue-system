import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("adminUser") || "null");
    if (storedUser) {
      setAdminName(storedUser.username);
    }
  }, []);

  const handleLogout = () => {
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-gray-100">

      {/* SIDEBAR */}
      <div className="w-64 bg-gradient-to-b from-blue-900 to-indigo-900 text-white p-6 flex flex-col justify-between">

        <div>
          <h2 className="text-2xl font-bold mb-10 tracking-wide">
            HOSPITAL ADMIN
          </h2>

          <nav className="space-y-4">

            <button
              onClick={() => navigate("/admin/dashboard")}
              className={`block w-full text-left px-4 py-2 rounded-xl transition ${
                location.pathname === "/admin/dashboard"
                  ? "bg-blue-600"
                  : "hover:bg-indigo-700"
              }`}
            >
              📊 Dashboard
            </button>

            <button
              onClick={() => navigate("/admin/dashboard/departments")}
              className={`block w-full text-left px-4 py-2 rounded-xl transition ${
                location.pathname.includes("departments")
                  ? "bg-blue-600"
                  : "hover:bg-indigo-700"
              }`}
            >
              🏥 Departments
            </button>

          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-600 py-2 rounded-xl hover:bg-red-500 transition"
        >
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1">

        {/* TOP BAR */}
        <div className="flex justify-between items-center bg-white shadow px-10 py-4">

          <h1 className="text-xl font-semibold text-gray-700">
            Admin Control Panel
          </h1>

          {/* PROFILE DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="bg-indigo-900 text-white px-4 py-2 rounded-full hover:bg-indigo-800 transition"
            >
              👤 {adminName}
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-xl p-4 w-48">

                <p
                  onClick={() => {
                    navigate("/admin/dashboard/profile");
                    setProfileOpen(false);
                  }}
                  className="cursor-pointer hover:text-blue-600 mb-2"
                >
                  👤 My Profile
                </p>

                <p
                  onClick={() => {
                    navigate("/admin/dashboard/settings");
                    setProfileOpen(false);
                  }}
                  className="cursor-pointer hover:text-blue-600 mb-2"
                >
                  ⚙ Settings
                </p>

                <hr className="my-2" />

                <p
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600"
                >
                  🚪 Logout
                </p>

              </div>
            )}
          </div>

        </div>

        {/* PAGE CONTENT */}
        <div className="p-10">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default AdminLayout;
