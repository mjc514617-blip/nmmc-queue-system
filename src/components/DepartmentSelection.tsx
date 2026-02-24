import React from "react";

interface DepartmentSelectionProps {
  selectedDepartment: string | null;
  setSelectedDepartment: (dept: string | null) => void;
  onSelectSubService: (service: string, ticketNumber: number) => void;
  onBackToWelcome: () => void;
}

const departments = [
  "Internal Medicine","Surgery", "Pediatrics", "Obstetrics & Gynecology", "Orthopedics",
  "Family & Community Medicine", "Rehabilitation Medicine", "ENT - HNS",
  "Dental", "Pathology", "Ophthalmology",
];

const subServices: Record<string, string[]> = {
  "Internal Medicine": [
    "Cardiology", "Pulmonology", "Nephrology",
    "Endocrinology & Diabetology", "Gastroenterology",
    "Hematology & Medical Oncology",
  ],
  Surgery: [
    "General Surgery",
    "Cardiovascular Surgery/Heart Center",
    "Anesthesiology",
    "Otorhinolaryngology",
    "Neurosurgery",
  ],
  Pediatrics: [
    "Child Consultation", "Hepatology",
    "Pediatric Gastroenterology", "Nutrition",
    "Pediatric Hematology", "Pediatric Nephrology",
    "Pediatric Cardiology", "Neurodevelopmental OPD",
    "Immunization",
  ],
  "Obstetrics & Gynecology": [
    "Prenatal Care", "High-Risk Pregnancy Management",
    "Labor & Delivery", "Postpartum Care",
    "Gynecological Consultations",
    "Minimally Invasive Surgery",
    "Biopsy Services", "Menopause Management",
  ],
  Orthopedics: [
    "Orthopedic Surgery", "Trauma Surgery",
    "Joint Replacement", "Spine Surgery",
    "Hand & Upper Limb Surgery",
    "Orthopedic Oncology",
    "Pediatric Orthopedics"
  ],
  "Family & Community Medicine": [
    "Out-patient Consultaion",
    "Preventive Care & Wellness",
    "Chronic Disease Management",
    "Family Health Services",
    "Community-Oriented Primary Care"
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
  "ENT - HNS": [
    "Craniomaxillofacial Surgery",
    "Facial Plastics",
    "Head & Neck Surgery",
    "Head & Neck Surgical Oncology",
    "Otology", "Laryngology",
    "Rhinology", "Microvascular Reconstruction"
  ],
  Dental: [
    "Dental Consultation", "Preventive Services",
    "Restorative Dentistry", "Oral Surgery",
    "Dental Radiology", "Age Determination Services"
  ],
  Pathology: [
    "Fine Needle Aspiration Biopsy",
    "Tissue Biopsy", "Laboratory Testing",
    "Routine Drug Testing", "Blood Bank Services"
  ],
  Ophthalmology: [
    "Glaucoma", "Retina & Vitreous Services",
    "Cornea & External Diseases",
    "Oculoplastic & Orbit Surgery",
    "Neuro-Ophthalmology", "Uveitis & Immunology",
    "Pediatric Ophthalmology",
    "Cataract & Refractive Services"
  ]
};

const DepartmentSelection: React.FC<DepartmentSelectionProps> = ({
  selectedDepartment,
  setSelectedDepartment,
  onSelectSubService,
  onBackToWelcome,
}) => {

  const checkDailyReset = () => {
  const today = new Date().toDateString();
  const storedDate = localStorage.getItem("queueDate");

  if (storedDate !== today) {
    // New day detected
    localStorage.setItem("departmentCounters", JSON.stringify({}));
    localStorage.setItem("serviceCounts", JSON.stringify({}));
    localStorage.setItem("liveQueue", JSON.stringify({}));
    localStorage.setItem("queueDate", today);
  }
};

  // 🔢 Department Ticket Generator
  const generateDepartmentTicket = (department: string) => {

  checkDailyReset(); // 🔥 ADD THIS FIRST

  const counters = JSON.parse(localStorage.getItem("departmentCounters") || "{}");

  if (!counters[department]) {
    counters[department] = 0;
  }

  counters[department] += 1;

  localStorage.setItem("departmentCounters", JSON.stringify(counters));

  return counters[department];
};

  // 🔥 NEW: Real-Time Service Counter Update
  const updateServiceCount = (department: string, service: string) => {
    const stored = JSON.parse(localStorage.getItem("serviceCounts") || "{}");

    if (!stored[department]) {
      stored[department] = {};
    }

    if (!stored[department][service]) {
      stored[department][service] = 0;
    }

    stored[department][service] += 1;

    localStorage.setItem("serviceCounts", JSON.stringify(stored));
  };

  // =========================
  // MODE 1: Select Department
  // =========================
  if (!selectedDepartment) {
    return (
      <div className="h-screen w-full bg-blue-900 text-white flex flex-col items-center justify-center p-10">
        <h1 className="text-4xl font-bold mb-10">
          Select Department
        </h1>

        <div className="grid grid-cols-2 gap-6 max-w-5xl w-full">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className="bg-white text-blue-900 py-6 rounded-2xl text-xl font-semibold shadow-lg hover:scale-105 transition"
            >
              {dept}
            </button>
          ))}
        </div>

        <button
          onClick={onBackToWelcome}
          className="mt-10 bg-gray-500 px-6 py-3 rounded-xl text-lg"
        >
          Back
        </button>
      </div>
    );
  }

  // =========================
  // MODE 2: Sidebar + Services
  // =========================
  return (
    <div className="h-screen w-full flex bg-gray-100">

      {/* Sidebar */}
      <div className="w-1/4 bg-blue-900 text-white p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Departments</h2>

        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDepartment(dept)}
            className={`block w-full text-left px-4 py-3 rounded-lg mb-2 transition ${
              selectedDepartment === dept
                ? "bg-white text-blue-900 font-bold"
                : "hover:bg-blue-700"
            }`}
          >
            {dept}
          </button>
        ))}

        <button
          onClick={() => setSelectedDepartment(null)}
          className="mt-6 bg-gray-500 w-full py-2 rounded-lg"
        >
          Back to Department List
        </button>
      </div>

      {/* Sub Services */}
      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold text-blue-900 mb-8">
          {selectedDepartment} Services
        </h1>

        <div className="grid grid-cols-2 gap-6">
          {subServices[selectedDepartment]?.map((service) => (
            <button
              key={service}
              onClick={() => {
                const ticketNumber = generateDepartmentTicket(selectedDepartment);

                // 🔥 UPDATE SERVICE COUNT
                onSelectSubService(service, ticketNumber);
              }}
              className="bg-blue-900 text-white py-6 rounded-2xl text-xl font-semibold shadow-lg hover:scale-105 transition"
            >
              {service}
            </button>
          )) || (
            <p className="text-gray-600">
              No sub-services available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentSelection;
