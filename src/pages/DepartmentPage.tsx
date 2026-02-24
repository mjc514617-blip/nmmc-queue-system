import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import BackButton from "../components/BackButton";

const subServices: Record<string, string[]> = {
  "Internal Medicine": [
    "Cardiology","Pulmonology","Nephrology",
    "Endocrinology & Diabetology","Gastroenterology",
    "Hematology & Medical Oncology",
  ],
  Surgery: [
    "General Surgery","Cardiovascular Surgery/Heart Center",
    "Anesthesiology","Otorhinolaryngology","Neurosurgery",
  ],
  Pediatrics: [
    "Child Consultation","Hepatology",
    "Pediatric Gastroenterology","Nutrition",
    "Pediatric Hematology","Pediatric Nephrology",
    "Pediatric Cardiology","Neurodevelopmental OPD",
    "Immunization",
  ],
  "Obstetrics & Gynecology": [
    "Prenatal Care","High-Risk Pregnancy Management",
    "Labor & Delivery","Postpartum Care",
    "Gynecological Consultations",
    "Minimally Invasive Surgery","Biopsy Services",
    "Menopause Management",
  ],
  Orthopedics: [
    "Orthopedic Surgery","Trauma Surgery","Joint Replacement",
    "Spine Surgery","Hand & Upper Limb Surgery",
    "Orthopedic Oncology","Pediatric Orthopedics",
  ],
  "Family & Community Medicine": [
    "Out-patient Consultation","Preventive Care & Wellness",
    "Chronic Disease Management","Family Health Services",
    "Community-Oriented Primary Care",
  ],
  "Rehabilitation Medicine": [
    "Physical Therapy","Occupational Therapy",
    "Musculoskeletal Rehabilitation",
    "Neurological Rehabilitation",
    "Cardiopulmonary Rehabilitation",
    "Work-Related Injury Rehabilitation",
    "Prosthetics & Orthotics","Pediatric Rehabilitation",
  ],
  "ENT - HNS": [
    "Craniomaxillofacial Surgery","Facial Plastics",
    "Head & Neck Surgery","Head & Neck Surgical Oncology",
    "Otology","Laryngology","Rhinology",
    "Microvascular Reconstruction",
  ],
  Dental: [
    "Dental Consultation","Preventive Services",
    "Restorative Dentistry","Oral Surgery",
    "Dental Radiology","Age Determination Services",
  ],
  Pathology: [
    "Fine Needle Aspiration Biopsy","Tissue Biopsy",
    "Laboratory Testing","Routine Drug Testing",
    "Blood Bank Services",
  ],
  Ophthalmology: [
    "Glaucoma","Retina & Vitreous Services",
    "Cornea & External Diseases","Oculoplastic & Orbit Surgery",
    "Neuro-Ophthalmology","Uveitis & Immunology",
    "Pediatric Ophthalmology","Cataract & Refractive Services",
  ],
};

const DepartmentPage = () => {
  const { id } = useParams();
  const services = subServices[id || ""] || [];

  const [counts, setCounts] = useState<any>({});
  const [liveNumber, setLiveNumber] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);

  /* LOAD COUNTS */
    useEffect(() => {
    const loadCounts = () => {
      const stored = JSON.parse(localStorage.getItem("serviceCounts") || "{}");
      setCounts(stored[id || ""] || {});
    };

    loadCounts(); // initial load

    const interval = setInterval(loadCounts, 1000); // refresh every 1 second

    return () => clearInterval(interval);
  }, [id]);

  /* LOAD LIVE QUEUE */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("liveQueue") || "{}");
    if (stored[id || ""]) {
      setLiveNumber(stored[id || ""].currentNumber || 0);
      setIsRunning(stored[id || ""].isRunning || false);
      setHistory(stored[id || ""].history || []);
    }
  }, [id]);

  const updateCounts = (updatedCounts: any) => {
    const stored = JSON.parse(localStorage.getItem("serviceCounts") || "{}");
    stored[id || ""] = updatedCounts;
    localStorage.setItem("serviceCounts", JSON.stringify(stored));
  };

  const updateLiveQueue = (
    number: number,
    running: boolean,
    newHistory: string[]
  ) => {
    const stored = JSON.parse(localStorage.getItem("liveQueue") || "{}");
    stored[id || ""] = {
      currentNumber: number,
      isRunning: running,
      history: newHistory,
    };
    localStorage.setItem("liveQueue", JSON.stringify(stored));
  };

  const getNextAvailableService = () => {
    for (const service of services) {
      if ((counts[service] || 0) > 0) return service;
    }
    return null;
  };

  const handleStart = () => {
    if (isRunning) return;
    const nextService = getNextAvailableService();
    if (!nextService) return;

    const updatedCounts = {
      ...counts,
      [nextService]: counts[nextService] - 1,
    };

    const nextNumber = liveNumber + 1;
    const newHistory = [...history, nextService];

    setCounts(updatedCounts);
    setLiveNumber(nextNumber);
    setIsRunning(true);
    setHistory(newHistory);

    updateCounts(updatedCounts);
    updateLiveQueue(nextNumber, true, newHistory);
  };

  const handleNext = () => {
    if (!isRunning) return;
    const nextService = getNextAvailableService();
    if (!nextService) return;

    const updatedCounts = {
      ...counts,
      [nextService]: counts[nextService] - 1,
    };

    const nextNumber = liveNumber + 1;
    const newHistory = [...history, nextService];

    setCounts(updatedCounts);
    setLiveNumber(nextNumber);
    setHistory(newHistory);

    updateCounts(updatedCounts);
    updateLiveQueue(nextNumber, true, newHistory);
  };

  const handleBack = () => {
    if (liveNumber <= 0 || history.length === 0) return;

    const lastService = history[history.length - 1];

    const updatedCounts = {
      ...counts,
      [lastService]: (counts[lastService] || 0) + 1,
    };

    const newHistory = history.slice(0, -1);
    const newNumber = liveNumber - 1;

    setCounts(updatedCounts);
    setLiveNumber(newNumber);
    setHistory(newHistory);

    updateCounts(updatedCounts);
    updateLiveQueue(newNumber, isRunning, newHistory);
  };

  const handleReset = () => {
  setIsRunning(false);

  // DO NOT reset liveNumber
    updateLiveQueue(liveNumber, false, history);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">

      <div className="p-6 bg-white shadow">
        <BackButton />
        <h2 className="text-3xl font-bold text-gray-800 mt-4">
          {id} Sub-Services
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6">

        {/* NOW SERVING */}
        <div className="bg-white p-6 rounded-xl shadow mb-8 text-center">
          <h3 className="text-xl font-semibold mb-2">Now Serving</h3>

          <p className="text-5xl font-bold text-blue-900 mb-6">
            {liveNumber.toString().padStart(2, "0")}
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <button onClick={handleStart} className="bg-green-600 text-white px-5 py-2 rounded-lg">▶ Start</button>
            <button onClick={handleNext} className="bg-blue-900 text-white px-5 py-2 rounded-lg">⏭ Next</button>
            <button onClick={handleBack} className="bg-yellow-500 text-white px-5 py-2 rounded-lg">⬅ Back</button>
            <button onClick={handleReset} className="bg-red-600 text-white px-5 py-2 rounded-lg">🔄 Reset</button>
          </div>
        </div>


        {/* SUB SERVICES */}
        <div className="grid grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service} className="bg-white p-6 rounded-2xl shadow relative">
              <div className="absolute top-4 right-4 bg-blue-900 text-white text-sm px-3 py-1 rounded-full">
                {counts[service] || 0}
              </div>
              <p className="font-semibold">{service}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default DepartmentPage;