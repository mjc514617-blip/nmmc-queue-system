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
      className="flex flex-col justify-between items-center h-screen w-full text-slate-700 cursor-pointer select-none bg-linear-to-br from-slate-100 via-slate-50 to-emerald-50"
    >
      {/* Top Logos Section */}
      <div className="w-full flex justify-center items-center gap-16 pt-10">
        <div className="w-28 h-28 flex items-center justify-center overflow-visible">
          <img
            src={dohLogo}
            alt="DOH Logo"
            className="w-full h-full object-contain scale-[1.5] drop-shadow-[0_6px_12px_rgba(15,23,42,0.15)]"
          />
        </div>
        <div className="w-28 h-28 flex items-center justify-center overflow-visible">
          <img
            src={nmmcLogo}
            alt="NMMC Logo"
            className="w-full h-full object-contain scale-[0.95] drop-shadow-[0_6px_12px_rgba(15,23,42,0.15)]"
          />
        </div>
        <div className="w-28 h-28 flex items-center justify-center overflow-visible">
          <img
            src={pafpLogo}
            alt="PAFP Logo"
            className="w-full h-full object-contain scale-[1.35] drop-shadow-[0_6px_12px_rgba(15,23,42,0.15)]"
          />
        </div>
      </div>

      {/* Center Hospital Information */}
      <div className="text-center px-10">
        <h1 className="text-5xl font-bold tracking-wide mb-4 text-slate-700 drop-shadow-[0_1px_0_rgba(255,255,255,0.85)]">
          Northern Mindanao Medical Center
        </h1>

        <h2 className="text-2xl font-semibold mb-6 tracking-wider text-emerald-700">
          Outpatient Department
        </h2>

        <p className="text-lg text-slate-500 italic">
          Delivering Compassionate and Quality Healthcare Services
        </p>
      </div>

      {/* Bottom Touch Instruction */}
      <div className="pb-16">
        <div className="animate-pulse bg-white/85 text-emerald-700 text-xl font-semibold px-10 py-4 rounded-2xl shadow-lg border border-emerald-200">
          Touch Anywhere to Start
        </div>
      </div>
    </div>
  );
};

export default React.memo(WelcomeScreen);
