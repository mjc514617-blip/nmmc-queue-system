import React from "react";
import {
  getDepartmentServiceAvailability,
  formatMinutesToTimeLabel,
  type DepartmentServiceAvailabilityStatus,
} from "../lib/internalMedicineSchedule";

interface DepartmentSelectionProps {
  selectedDepartment: string | null;
  setSelectedDepartment: (dept: string | null) => void;
  onSelectSubService: (service: string) => void;
  onBackToWelcome: () => void;
}

const departments = [
  "Internal Medicine", "Pediatrics", "Surgery", "Dental", 
  "Family & Community Medicine (FAMED)", "Obstetrics & Gynecology", 
  "Family Planning", "Orthopedics", "Rehabilitation Medicine", "Ophthalmology",
  "Psychiatry", "Otorhinolaryngology",
];

const subServices: Record<string, string[]> = {
  "Internal Medicine": [
    "Dermatology", "Cardiology", "Pulmonology", "Rheumatology", "Geriatrics",
    "Nephrology", "Gastroenterology", "Endocrinology", "Allergology & Immunology",
    "Hematology", "Neurology",
  ],
  Pediatrics: [
    "Pediatric Cardiology", "Pediatric Nephrology", "Pediatric Developmental", 
    "Neonatology (KMC)", "Pediatric Immunization / Term High Risk Newborns", 
    "Pediatric Neurology", "Clinic", "Pediatric Gastroenterology", "Pediatric Pulmonology",
  ],
  Surgery: [
    "Urosurgery", "Neurosurgery",
  ],
  Dental: [
    "Dental Consultation", "Preventive Services",
    "Restorative Dentistry", "Oral Surgery",
    "Dental Radiology", "Age Determination Services"
  ],
  "Family & Community Medicine (FAMED)": [
    "Out-patient Consultaion",
    "Preventive Care & Wellness",
    "Chronic Disease Management",
    "Family Health Services",
    "Community-Oriented Primary Care"
  ],
  "Obstetrics & Gynecology": [
    "Dr. Armina T. Isidro",
    "Dr. Sherilyn Bote-Casiño",
    "Dr. Lucila Gatchalian",
    "Dr. Rhinelia Bataclan",
  ],
  "Family Planning": [
    "Contraceptive Counseling", "Intrauterine Device (IUD) Services",
    "Implantable Contraceptives", "Sterilization Procedures",
    "Natural Family Planning Education", "Emergency Contraception"
  ],
  Orthopedics: [
    "Orthopedic Surgery", "Trauma Surgery",
    "Joint Replacement", "Spine Surgery",
    "Hand & Upper Limb Surgery",
    "Orthopedic Oncology",
    "Pediatric Orthopedics"
  ],
  "Rehabilitation Medicine": [
    "Physical Therapy", "Occupational Therapy",
    "Musculoskeletal Rehabilitation",
    "Neurological Rehabilitation",
    "Cardiopulmonary Rehabilitation",
    "Work-Related Injury Rehabilitation",
    "Prosthetics & Orthotics",
    "Pediatric Rehabilitation",
  ],
  Ophthalmology: [
    "Glaucoma", "Retina & Vitreous Services",
    "Cornea & External Diseases",
    "Oculoplastic & Orbit Surgery",
    "Neuro-Ophthalmology", "Uveitis & Immunology",
    "Pediatric Ophthalmology",
    "Cataract & Refractive Services",
  ],
  Psychiatry: [
    "Adult Psychiatry", "Child & Adolescent Psychiatry",
    "Geriatric Psychiatry", "Addiction Psychiatry", "Consultation-Liaison Psychiatry",
    "Psychotherapy Services", "Emergency Psychiatry"
  ],
  Otorhinolaryngology: [
    "General ENT Consultation", "Head & Neck Surgery",
    "Otology & Neurotology", "Rhinology & Sinus Surgery", "Facial Plastic Surgery",
    "Pediatric ENT", "Laryngology Services"
  ]
};

const DepartmentSelection: React.FC<DepartmentSelectionProps> = ({
  selectedDepartment,
  setSelectedDepartment,
  onSelectSubService,
  onBackToWelcome,
}) => {
  const [currentTime, setCurrentTime] = React.useState<Date>(new Date());

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const getDepartmentServiceCardState = (department: string, service: string) => {
    const availability = getDepartmentServiceAvailability(department, service, currentTime);

    if (!availability) {
      return {
        isScheduled: false,
        isAvailableNow: true,
        availability: null,
        status: "available" as DepartmentServiceAvailabilityStatus,
      };
    }

    return {
      isScheduled: true,
      isAvailableNow: availability.isAvailableNow,
      availability,
      status: availability.status,
    };
  };

  // =========================
  if (!selectedDepartment) {
    return (
      <div className="relative h-screen w-full overflow-y-auto bg-linear-to-br from-[#f4faf6] via-white to-[#e6f5eb] text-slate-700 flex items-center justify-center p-6 md:p-10">
        <div className="pointer-events-none absolute -left-24 top-12 h-56 w-56 rounded-full bg-emerald-200/35 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-12 h-64 w-64 rounded-full bg-emerald-100/45 blur-3xl" />

        <div className="w-full max-w-6xl rounded-4xl bg-white/96 shadow-[0_20px_70px_rgba(15,23,42,0.12)] border border-[#dbeee0] p-6 md:p-10 backdrop-blur-sm">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-emerald-800">
              Departments
              </h1>
              <p className="mt-2 text-sm md:text-base text-slate-500">
                Choose a department to continue
              </p>
            </div>
            <div className="hidden md:inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800">
              {departments.length} Departments
            </div>
          </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className="group min-h-20 rounded-xl border border-[#dce8df] bg-white px-4 py-4 text-left shadow-[0_4px_12px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-[#edf8f1]"
            >
              <p className="text-sm md:text-base font-medium text-slate-700 group-hover:text-emerald-800">
                {dept}
              </p>
            </button>
          ))}
        </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={onBackToWelcome}
              className="rounded-xl bg-emerald-700 px-6 py-3 text-lg font-semibold text-white shadow-md transition hover:bg-emerald-800"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // MODE 2: Sidebar + Services
  // =========================
  return (
    <div className="h-screen w-full overflow-hidden bg-linear-to-br from-slate-100 via-white to-emerald-50 p-3 md:p-4">
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-4 rounded-3xl border border-[#dbeee0] bg-white/96 p-3 shadow-[0_18px_60px_rgba(15,23,42,0.10)] md:p-4 lg:flex-row">

      {/* Sidebar */}
      <div className="w-full rounded-2xl bg-[#f2f8f3] p-3 shadow-[0_4px_12px_rgba(15,23,42,0.05)] md:w-70 md:min-w-70 md:max-w-70 overflow-y-auto border border-[#e3efe6]">
        <h2 className="mb-3 px-2 text-base font-semibold tracking-tight text-emerald-800">Departments</h2>

        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDepartment(dept)}
            className={`block w-full text-left px-3 py-2.5 rounded-lg mb-2 border text-sm transition ${
              selectedDepartment === dept
                ? "bg-emerald-700 text-white border-emerald-700 shadow-sm font-semibold"
                : "bg-white text-slate-700 border-[#dce8df] hover:bg-[#edf8f1] hover:border-emerald-200"
            }`}
          >
            <p className="font-medium">{dept}</p>
          </button>
        ))}

        <button
          onClick={() => setSelectedDepartment(null)}
          className="mt-4 w-full rounded-lg bg-slate-700 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
        >
          Back to Department List
        </button>
      </div>

      {/* Sub Services */}
      <div className="flex-1 rounded-2xl border border-[#dbeee0] bg-white p-4 md:p-5 overflow-hidden flex flex-col min-h-0">
        <div className="mb-4 flex items-center justify-between border-b border-[#e2ede5] pb-3">
          <div className="text-sm text-slate-500">
            <span className="font-medium text-emerald-700">Departments</span>
            <span className="mx-2">&gt;</span>
            <span className="font-semibold text-emerald-800">{selectedDepartment}</span>
          </div>
          <p className="text-xs text-slate-500">Select a service to get your queue number</p>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
          {subServices[selectedDepartment]?.map((service) => (
            (() => {
              const cardState = getDepartmentServiceCardState(selectedDepartment, service);
              const isDisabled = cardState.isScheduled && !cardState.isAvailableNow;
              const closedMessage = cardState.status === "not-yet-available"
                ? `Tickets are available at ${cardState.availability ? formatMinutesToTimeLabel(cardState.availability.opensAtMinutes) : "opening time"}`
                : cardState.status === "closed-today"
                  ? cardState.availability?.hasTimeConfigured
                    ? "Tickets are now closed"
                    : "Schedule time not yet posted"
                  : cardState.status === "closed-day"
                    ? "Tickets are not yet available"
                    : "Available now";

              return (
                <button
                  key={service}
                  onClick={() => {
                    if (isDisabled) return;
                    onSelectSubService(service);
                  }}
                  disabled={isDisabled}
                  className={`group min-h-44 md:min-h-48 rounded-xl px-5 py-6 text-center transition duration-200 border ${
                    isDisabled
                      ? "border-[#c6ddd0] bg-[#d7eade] text-slate-600 cursor-not-allowed"
                      : "border-emerald-700/40 bg-[#218946] shadow-[0_10px_18px_rgba(33,137,70,0.18)] hover:-translate-y-0.5 hover:bg-[#1f7f41]"
                  }`}
                >
                  <div className="h-full flex flex-col items-center justify-center">
                    <p className={`text-base md:text-lg font-semibold leading-snug ${isDisabled ? "text-slate-600" : "text-white"}`}>
                      {service}
                    </p>

                    {cardState.isScheduled && cardState.availability && (
                      <>
                        {cardState.availability.schedule.windows.map((window, index) => (
                          <React.Fragment key={`${service}-window-${index}`}>
                            <p className={`mt-2 text-[11px] flex items-center justify-center gap-1.5 ${isDisabled ? "text-slate-500" : "text-emerald-50"}`}>
                              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                              </svg>
                              <span>{window.label ? `${window.label} - ${window.daysLabel}` : window.daysLabel}</span>
                            </p>
                            <p className={`text-[11px] flex items-center justify-center gap-1.5 ${isDisabled ? "text-slate-500" : "text-emerald-50"}`}>
                              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <circle cx="12" cy="12" r="9" />
                                <polyline points="12 7 12 12 15 14" />
                              </svg>
                              <span>{window.timeLabel}</span>
                            </p>
                          </React.Fragment>
                        ))}
                        <p className={`text-[11px] flex items-center justify-center gap-1.5 ${isDisabled ? "text-slate-500" : "text-emerald-50"}`}>
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span>{cardState.availability.schedule.location}</span>
                        </p>
                        <p className={`mt-2 text-xs font-semibold ${cardState.isAvailableNow ? "text-emerald-100" : "text-slate-500"}`}>
                          {closedMessage}
                        </p>
                      </>
                    )}
                  </div>
                </button>
              );
            })()
          )) || (
            <p className="text-slate-500">
              No sub-services available.
            </p>
          )}
        </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default DepartmentSelection;
