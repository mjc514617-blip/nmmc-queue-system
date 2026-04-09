import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import { supabase } from "../lib/supabaseClient";

const formatQueueNumber = (value: number) => value.toString().padStart(3, "0");

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
  const normalizedDepartment = (id || "").trim().toLowerCase();

  const [counts, setCounts] = useState<any>({});
  const [liveNumber, setLiveNumber] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);

  const fetchCountsFromSupabase = async () => {
    if (!normalizedDepartment) {
      setCounts({});
      return;
    }

    const { data, error } = await supabase
      .from("tickets")
      .select("service")
      .ilike("department", normalizedDepartment)
      .eq("status", "waiting");

    if (error) {
      console.error("Failed to load ticket counts", error);
      return;
    }

    const counted: Record<string, number> = {};
    for (const row of data || []) {
      const service = row.service || "Unknown";
      counted[service] = (counted[service] || 0) + 1;
    }
    setCounts(counted);
  };

  /* LOAD COUNTS */
  useEffect(() => {
    if (!normalizedDepartment) return;

    void fetchCountsFromSupabase();

    const ticketChannel = supabase
      .channel(`tickets_${normalizedDepartment}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tickets",
        },
        () => {
          void fetchCountsFromSupabase();
        }
      )
      .subscribe();

    const interval = setInterval(() => {
      void fetchCountsFromSupabase();
    }, 3000);

    return () => {
      clearInterval(interval);
      void supabase.removeChannel(ticketChannel);
    };
  }, [normalizedDepartment]);

  /* LOAD LIVE QUEUE */
  useEffect(() => {
    const fetchLiveQueue = async () => {
      if (!normalizedDepartment) return;

      const { data } = await supabase
        .from("live_queue")
        .select("current_number, is_running, history")
        .ilike("department", normalizedDepartment)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!data) return;
      setLiveNumber(Number(data.current_number) || 0);
      setIsRunning(Boolean(data.is_running));
      setHistory(data.history || []);
    };

    void fetchLiveQueue();

    const liveQueueChannel = supabase
      .channel(`live_queue_${normalizedDepartment}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "live_queue",
        },
        (payload) => {
          const changedDepartment = (payload.new.department || "").toString().trim().toLowerCase();
          if (changedDepartment !== normalizedDepartment) return;
          setLiveNumber(Number(payload.new.current_number) || 0);
          setIsRunning(Boolean(payload.new.is_running));
          setHistory(payload.new.history || []);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(liveQueueChannel);
    };
  }, [normalizedDepartment]);

  const updateLiveQueue = async (
    number: number,
    running: boolean,
    newHistory: string[]
  ) => {
    if (!normalizedDepartment) return;
    await supabase
      .from("live_queue")
      .upsert({
        department: normalizedDepartment,
        current_number: number,
        is_running: running,
        history: newHistory,
      }, {
        onConflict: "department",
      });
  };

  const getNextWaitingTicket = async () => {
    if (!normalizedDepartment) return null;

    const { data, error } = await supabase
      .from("tickets")
      .select("id, queue_number, service")
      .ilike("department", normalizedDepartment)
      .eq("status", "waiting")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Failed to get next waiting ticket", error);
      return null;
    }

    return data;
  };

  const setTicketStatus = async (queueValue: number, status: "waiting" | "serving" | "served") => {
    if (!normalizedDepartment || queueValue <= 0) return;

    const formattedQueue = formatQueueNumber(queueValue);
    await supabase
      .from("tickets")
      .update({ status })
      .ilike("department", normalizedDepartment)
      .eq("queue_number", formattedQueue);
  };

  const handleStart = async () => {
    if (isRunning) return;

    const nextTicket = await getNextWaitingTicket();
    if (!nextTicket) return;

    await supabase
      .from("tickets")
      .update({ status: "serving" })
      .eq("id", nextTicket.id);

    const nextNumber = Number.parseInt(nextTicket.queue_number || "0", 10) || 0;
    const newHistory = [...history, nextTicket.service || "Unknown"];

    setLiveNumber(nextNumber);
    setIsRunning(true);
    setHistory(newHistory);

    await updateLiveQueue(nextNumber, true, newHistory);
    await fetchCountsFromSupabase();
  };

  const handleNext = async () => {
    if (!isRunning) return;

    await setTicketStatus(liveNumber, "served");
    const nextTicket = await getNextWaitingTicket();
    if (!nextTicket) return;

    await supabase
      .from("tickets")
      .update({ status: "serving" })
      .eq("id", nextTicket.id);

    const nextNumber = Number.parseInt(nextTicket.queue_number || "0", 10) || 0;
    const newHistory = [...history, nextTicket.service || "Unknown"];

    setLiveNumber(nextNumber);
    setHistory(newHistory);

    await updateLiveQueue(nextNumber, true, newHistory);
    await fetchCountsFromSupabase();
  };

  const handleBack = async () => {
    if (liveNumber <= 0 || history.length === 0) return;

    const newHistory = history.slice(0, -1);
    const newNumber = liveNumber - 1;

    await setTicketStatus(liveNumber, "waiting");
    await setTicketStatus(newNumber, "serving");

    setLiveNumber(newNumber);
    setHistory(newHistory);

    await updateLiveQueue(newNumber, isRunning, newHistory);
    await fetchCountsFromSupabase();
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
            {formatQueueNumber(liveNumber)}
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