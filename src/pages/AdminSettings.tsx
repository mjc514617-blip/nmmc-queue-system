import React, { useState, useEffect } from "react";

const AdminSettings: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("adminUser") || "null");
    if (storedUser) {
      setUser(storedUser);
      setUsername(storedUser.username);
      setEmail(storedUser.email);
      setPhone(storedUser.phone);
    }
  }, []);

  const handleProfileSave = () => {
    const updatedUser = {
      ...user,
      username,
      email,
      phone,
    };

    localStorage.setItem("adminUser", JSON.stringify(updatedUser));
    setUser(updatedUser);

    alert("Profile updated successfully!");
  };

  const handlePasswordChange = () => {
    if (currentPassword !== user.password) {
      alert("Current password is incorrect.");
      return;
    }

    const updatedUser = {
      ...user,
      password: newPassword,
    };

    localStorage.setItem("adminUser", JSON.stringify(updatedUser));
    setUser(updatedUser);

    alert("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
  };

  if (!user) {
    return <div>No user found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">

      {/* Edit Profile */}
      <div className="bg-white p-8 rounded-2xl shadow-lg">

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          ✏ Edit Profile
        </h2>

        <div className="grid grid-cols-2 gap-6">

          <div>
            <label className="text-sm text-gray-600">Username</label>
            <input
              type="text"
              className="w-full border px-4 py-2 rounded-xl mt-1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              className="w-full border px-4 py-2 rounded-xl mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="col-span-2">
            <label className="text-sm text-gray-600">Phone Number</label>
            <input
              type="tel"
              className="w-full border px-4 py-2 rounded-xl mt-1"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

        </div>

        <button
          onClick={handleProfileSave}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-500 transition"
        >
          Save Changes
        </button>
      </div>

      {/* Change Password */}
      <div className="bg-white p-8 rounded-2xl shadow-lg">

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          🔐 Change Password
        </h2>

        <div className="space-y-6">

          <div>
            <label className="text-sm text-gray-600">Current Password</label>
            <input
              type="password"
              className="w-full border px-4 py-2 rounded-xl mt-1"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">New Password</label>
            <input
              type="password"
              className="w-full border px-4 py-2 rounded-xl mt-1"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

        </div>

        <button
          onClick={handlePasswordChange}
          className="mt-6 bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-500 transition"
        >
          Update Password
        </button>
      </div>

    </div>
  );
};

export default AdminSettings;
