import React from "react";

const AdminHome: React.FC = () => {
  const departments =
    JSON.parse(localStorage.getItem("departments") || "[]");

  const totalDepartments = departments.length;
  const activeDepartments = departments.filter(
    (d: any) => d.active
  ).length;

  return (
    <div className="grid grid-cols-3 gap-6">

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-lg font-semibold text-gray-600">
          Total Departments
        </h2>
        <p className="text-4xl font-bold mt-4 text-blue-600">
          {totalDepartments}
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-lg font-semibold text-gray-600">
          Active Departments
        </h2>
        <p className="text-4xl font-bold mt-4 text-green-600">
          {activeDepartments}
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-lg font-semibold text-gray-600">
          System Status
        </h2>
        <p className="text-2xl font-bold mt-4 text-gray-800">
          Operational
        </p>
      </div>

    </div>
  );
};

export default AdminHome;
