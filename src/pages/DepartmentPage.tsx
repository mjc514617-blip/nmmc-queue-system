import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import { supabase } from "../lib/supabaseClient";

const formatQueueNumber = (value: number) => value.toString().padStart(3, "0");

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
    <div className="min-h-full flex flex-col bg-linear-to-br from-[#f4faf6] via-white to-[#e6f5eb] text-slate-700">

      <div className="p-6 bg-white/96 border-b border-[#dbeee0] shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
        <BackButton />
        <div className="mt-2 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-emerald-800">
              {id} Sub-Services
            </h2>
            <p className="mt-2 text-sm text-slate-500">Department queue control panel</p>
          </div>
          <div className="hidden md:inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800">
            {services.length} Services
          </div>
        </div>
      </div>

      <div className="p-6 pb-10">

        {/* NOW SERVING */}
        <div className="mb-8 rounded-3xl border border-[#dbeee0] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] text-center">
          <h3 className="text-xl font-semibold mb-2 text-emerald-800 uppercase tracking-wide">Now Serving</h3>

          <p className="text-6xl font-black tracking-[0.2em] text-emerald-700 mb-6">
            {formatQueueNumber(liveNumber)}
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <button onClick={handleStart} className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition">Start</button>
            <button onClick={handleNext} className="rounded-xl bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-800 transition">Next</button>
            <button onClick={handleBack} className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition">Back</button>
            <button onClick={handleReset} className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 transition">Reset</button>
          </div>
        </div>


        {/* SUB SERVICES */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <div key={service} className="relative rounded-2xl border border-[#dce8df] bg-white p-6 shadow-[0_6px_16px_rgba(15,23,42,0.06)]">
              <div className="absolute top-4 right-4 rounded-full bg-emerald-700 px-3 py-1 text-xs font-semibold text-white">
                {counts[service] || 0}
              </div>
              <p className="pr-12 text-base font-semibold text-slate-700 leading-snug">{service}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default DepartmentPage;