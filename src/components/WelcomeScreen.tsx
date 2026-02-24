import React from "react";
import nmmcLogo from "../assets/nmmc.png";
import dohLogo from "../assets/doh.png";
import pafpLogo from "../assets/pafp.png";

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div
      onClick={onStart}
      className="flex flex-col justify-between items-center h-screen w-full text-white cursor-pointer select-none bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700"
    >
      {/* Top Logos Section */}
      <div className="w-full flex justify-center items-center gap-16 pt-10">
        <img
          src={dohLogo}
          alt="DOH Logo"
          className="h-28 object-contain"
        />
        <img
          src={nmmcLogo}
          alt="NMMC Logo"
          className="h-28 object-contain"
        />
        <img
          src={pafpLogo}
          alt="PAFP Logo"
          className="h-28 object-contain"
        />
      </div>

      {/* Center Hospital Information */}
      <div className="text-center px-10">
        <h1 className="text-5xl font-bold tracking-wide mb-4 drop-shadow-lg">
          Northern Mindanao Medical Center
        </h1>

        <h2 className="text-2xl font-semibold mb-6 tracking-wider">
          Outpatient Department
        </h2>

        <p className="text-lg opacity-80 italic">
          Delivering Compassionate and Quality Healthcare Services
        </p>
      </div>

      {/* Bottom Touch Instruction */}
      <div className="pb-16">
        <div className="animate-pulse bg-white text-blue-900 text-xl font-semibold px-10 py-4 rounded-2xl shadow-2xl">
          Touch Anywhere to Start
        </div>
      </div>
    </div>
  );
};

export default React.memo(WelcomeScreen);
