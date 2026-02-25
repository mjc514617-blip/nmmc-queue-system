import React from "react";
import { QRCodeCanvas } from "qrcode.react";

interface QueueInformationProps {
  ticketNumber: string;
  doctorName: string;
  roomNumber: string;
  department: string;   // 🔥 NEW PROP
  onPrint: () => void;
  onBack: () => void;
  onCancel: () => void;
}

const QueueInformation: React.FC<QueueInformationProps> = ({
  ticketNumber,
  doctorName,
  roomNumber,
  department,
  onPrint,
  onBack,
  onCancel,
}) => {

  // 🔥 QR will go directly to Live Monitor of that department
    const qrValue = `https://nmmc-queue-system-b0ymkzng7-mjc514617-blips-projects.vercel.app/live/${department}`;
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full text-white p-10 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 overflow-auto">
      
      <h1 className="text-4xl font-bold mb-10">
        Queue Information
      </h1>

      <div className="print-area bg-white text-blue-900 rounded-3xl shadow-2xl p-12 w-full max-w-2xl text-center">

        <p className="text-lg font-medium mb-2">Waiting Number</p>
        <h2 className="text-6xl font-bold mb-8">{ticketNumber}</h2>

        <div className="mb-4">
          <p className="text-lg font-medium">Attending Doctor</p>
          <p className="text-2xl font-semibold">{doctorName}</p>
        </div>

        <div className="mb-8">
          <p className="text-lg font-medium">Room Number</p>
          <p className="text-2xl font-semibold">{roomNumber}</p>
        </div>

        {/* 🔥 LIVE MONITOR QR CODE */}
        <div className="flex flex-col items-center mb-8">
          <QRCodeCanvas value={qrValue} size={150} />
          <p className="text-sm mt-3 text-gray-600">
            Scan to View Live Queue Monitor
          </p>
        </div>

        <div className="flex justify-center gap-6 flex-wrap">

          <button
            onClick={onBack}
            className="bg-gray-500 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-gray-600 transition"
          >
            Back
          </button>

          <button
            onClick={onPrint}
            className="bg-blue-900 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-200"
          >
            Print Ticket
          </button>

          <button
            onClick={onCancel}
            className="bg-red-600 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-red-700 transition"
          >
            Cancel
          </button>

        </div>
      </div>
    </div>
  );
};

export default React.memo(QueueInformation);