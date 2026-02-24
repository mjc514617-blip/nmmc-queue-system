import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminProfile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("adminUser") || "null");
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  if (!user) {
    return <div>No user found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-10 rounded-2xl shadow-lg relative">

          {/* 🔵 PROFESSIONAL BACK BUTTON */}
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center 
                    bg-blue-900 text-white rounded-full shadow-lg 
                    hover:bg-blue-800 transition"
        >
          ←
        </button>

      <h2 className="text-3xl font-bold mb-8 text-blue-900 text-center">
        👤 Admin Profile
      </h2>

      <div className="space-y-6 text-lg mt-6">

        <div>
          <span className="font-semibold text-gray-600">Username:</span>
          <p className="text-gray-800">{user.username}</p>
        </div>

        <div>
          <span className="font-semibold text-gray-600">Email:</span>
          <p className="text-gray-800">{user.email}</p>
        </div>

        <div>
          <span className="font-semibold text-gray-600">Phone:</span>
          <p className="text-gray-800">{user.phone}</p>
        </div>

      </div>

    </div>
  );
};

export default AdminProfile;
