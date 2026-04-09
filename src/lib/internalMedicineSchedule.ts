export interface ServiceScheduleWindow {
  label?: string;
  daysLabel: string;
  timeLabel: string;
  startMinutes?: number;
  endMinutes?: number;
  matchesDay: (date: Date) => boolean;
}

export interface DepartmentServiceSchedule {
  location: string;
  windows: ServiceScheduleWindow[];
}

export type DepartmentServiceAvailabilityStatus = "available" | "not-yet-available" | "closed-today" | "closed-day";

export interface DepartmentServiceAvailability {
  schedule: DepartmentServiceSchedule;
  isAvailableNow: boolean;
  status: DepartmentServiceAvailabilityStatus;
  opensAtMinutes: number;
  closesAtMinutes: number;
  hasTimeConfigured: boolean;
}

const toMinutes = (hours: number, minutes: number) => (hours * 60) + minutes;

const isWithinTimeRange = (date: Date, startMinutes: number, endMinutes: number) => {
  const nowMinutes = (date.getHours() * 60) + date.getMinutes();
  return nowMinutes >= startMinutes && nowMinutes < endMinutes;
};

const isNthWeekdayOfMonth = (date: Date, weekday: number, ordinals: number[]) => {
  if (date.getDay() !== weekday) return false;
  const ordinal = Math.floor((date.getDate() - 1) / 7) + 1;
  return ordinals.includes(ordinal);
};

const buildSharedDepartmentSchedules = (
  services: string[],
  location: string,
  windows: ServiceScheduleWindow[]
): Record<string, DepartmentServiceSchedule> => {
  const entries: Record<string, DepartmentServiceSchedule> = {};

  for (const service of services) {
    entries[service] = {
      location,
      windows,
    };
  }

  return entries;
};

const internalMedicineSchedules: Record<string, DepartmentServiceSchedule> = {
  Dermatology: {
    location: "OPD Building 2nd Floor",
    windows: [{
      daysLabel: "Monday, Tuesday, Thursday, & Friday",
      timeLabel: "8:00 AM - 12:00 NN",
      startMinutes: toMinutes(8, 0),
      endMinutes: toMinutes(12, 0),
      matchesDay: (date) => [1, 2, 4, 5].includes(date.getDay()),
    }],
  },
  Cardiology: {
    location: "HLK Building 3rd Floor",
    windows: [{
      daysLabel: "Tuesday, Wednesday, Thursday, & Friday",
      timeLabel: "8:00 AM - 12:00 NN",
      startMinutes: toMinutes(8, 0),
      endMinutes: toMinutes(12, 0),
      matchesDay: (date) => [2, 3, 4, 5].includes(date.getDay()),
    }],
  },
  Pulmonology: {
    location: "HLK Building 4th Floor",
    windows: [{
      daysLabel: "Monday, Wednesday, & Friday",
      timeLabel: "8:00 AM - 12:00 NN",
      startMinutes: toMinutes(8, 0),
      endMinutes: toMinutes(12, 0),
      matchesDay: (date) => [1, 3, 5].includes(date.getDay()),
    }],
  },
  Rheumatology: {
    location: "OPD Building 2nd Floor",
    windows: [{
      daysLabel: "2nd & 4th Tuesday",
      timeLabel: "8:00 AM - 12:00 NN",
      startMinutes: toMinutes(8, 0),
      endMinutes: toMinutes(12, 0),
      matchesDay: (date) => isNthWeekdayOfMonth(date, 2, [2, 4]),
    }],
  },
  Geriatrics: {
    location: "OPD Building 2nd Floor",
    windows: [{
      daysLabel: "Tuesday & Thursday",
      timeLabel: "8:00 AM - 12:00 NN",
      startMinutes: toMinutes(8, 0),
      endMinutes: toMinutes(12, 0),
      matchesDay: (date) => [2, 4].includes(date.getDay()),
    }],
  },
  Nephrology: {
    location: "OPD Building 2nd Floor",
    windows: [{
      daysLabel: "Tuesday & Thursday",
      timeLabel: "1:00 PM - 4:00 PM",
      startMinutes: toMinutes(13, 0),
      endMinutes: toMinutes(16, 0),
      matchesDay: (date) => [2, 4].includes(date.getDay()),
    }],
  },
  Gastroenterology: {
    location: "OPD Building 2nd Floor",
    windows: [{
      daysLabel: "Wednesday",
      timeLabel: "9:00 AM - 12:00 NN",
      startMinutes: toMinutes(9, 0),
      endMinutes: toMinutes(12, 0),
      matchesDay: (date) => date.getDay() === 3,
    }],
  },
  Endocrinology: {
    location: "OPD Building 2nd Floor",
    windows: [{
      daysLabel: "Wednesday",
      timeLabel: "8:00 AM - 12:00 NN",
      startMinutes: toMinutes(8, 0),
      endMinutes: toMinutes(12, 0),
      matchesDay: (date) => date.getDay() === 3,
    }],
  },
  "Allergology & Immunology": {
    location: "OPD Building 2nd Floor",
    windows: [{
      daysLabel: "Wednesday",
      timeLabel: "8:00 AM - 12:00 NN",
      startMinutes: toMinutes(8, 0),
      endMinutes: toMinutes(12, 0),
      matchesDay: (date) => date.getDay() === 3,
    }],
  },
  Hematology: {
    location: "OPD Building 2nd Floor",
    windows: [{
      daysLabel: "Thursday",
      timeLabel: "8:00 AM - 12:00 NN",
      startMinutes: toMinutes(8, 0),
      endMinutes: toMinutes(12, 0),
      matchesDay: (date) => date.getDay() === 4,
    }],
  },
  Neurology: {
    location: "OPD Building 2nd Floor",
    windows: [{
      daysLabel: "Friday",
      timeLabel: "8:00 AM - 12:00 NN",
      startMinutes: toMinutes(8, 0),
      endMinutes: toMinutes(12, 0),
      matchesDay: (date) => date.getDay() === 5,
    }],
  },
};

const pediatricsSchedules: Record<string, DepartmentServiceSchedule> = {
  "Pediatric Cardiology": {
    location: "HLK Building 3rd Floor",
    windows: [
      {
        label: "RHD",
        daysLabel: "Monday",
        timeLabel: "8:00 AM - 12:00 NN",
        startMinutes: toMinutes(8, 0),
        endMinutes: toMinutes(12, 0),
        matchesDay: (date) => date.getDay() === 1,
      },
      {
        label: "CHD",
        daysLabel: "Monday",
        timeLabel: "1:00 PM - 5:00 PM",
        startMinutes: toMinutes(13, 0),
        endMinutes: toMinutes(17, 0),
        matchesDay: (date) => date.getDay() === 1,
      },
    ],
  },
  "Pediatric Nephrology": {
    location: "OPD Building 3rd Floor",
    windows: [{
      daysLabel: "Tuesday",
      timeLabel: "12:00 NN - 5:00 PM",
      startMinutes: toMinutes(12, 0),
      endMinutes: toMinutes(17, 0),
      matchesDay: (date) => date.getDay() === 2,
    }],
  },
  "Pediatric Developmental": {
    location: "OPD Building 3rd Floor",
    windows: [{
      daysLabel: "Tuesday",
      timeLabel: "1:00 PM - 5:00 PM",
      startMinutes: toMinutes(13, 0),
      endMinutes: toMinutes(17, 0),
      matchesDay: (date) => date.getDay() === 2,
    }],
  },
  "Neonatology (KMC)": {
    location: "OPD Building 3rd Floor",
    windows: [{
      daysLabel: "Tuesday & Thursday",
      timeLabel: "1:00 PM - 5:00 PM",
      startMinutes: toMinutes(13, 0),
      endMinutes: toMinutes(17, 0),
      matchesDay: (date) => [2, 4].includes(date.getDay()),
    }],
  },
  "Pediatric Immunization / Term High Risk Newborns": {
    location: "OPD Building 3rd Floor",
    windows: [{
      daysLabel: "Wednesday",
      timeLabel: "1:00 PM - 5:00 PM",
      startMinutes: toMinutes(13, 0),
      endMinutes: toMinutes(17, 0),
      matchesDay: (date) => date.getDay() === 3,
    }],
  },
  "Pediatric Neurology": {
    location: "OPD Building 3rd Floor",
    windows: [{
      daysLabel: "Thursday",
      timeLabel: "1:00 PM - 5:00 PM",
      startMinutes: toMinutes(13, 0),
      endMinutes: toMinutes(17, 0),
      matchesDay: (date) => date.getDay() === 4,
    }],
  },
  Clinic: {
    location: "OPD Building 3rd Floor",
    windows: [{
      daysLabel: "Friday",
      timeLabel: "8:00 AM - 12:00 NN",
      startMinutes: toMinutes(8, 0),
      endMinutes: toMinutes(12, 0),
      matchesDay: (date) => date.getDay() === 5,
    }],
  },
  "Pediatric Gastroenterology": {
    location: "OPD Building 3rd Floor",
    windows: [{
      daysLabel: "1st & 3rd Friday",
      timeLabel: "1:00 PM - 5:00 PM",
      startMinutes: toMinutes(13, 0),
      endMinutes: toMinutes(17, 0),
      matchesDay: (date) => isNthWeekdayOfMonth(date, 5, [1, 3]),
    }],
  },
  "Pediatric Pulmonology": {
    location: "OPD Building 3rd Floor",
    windows: [
      {
        daysLabel: "2nd & 4th Friday",
        timeLabel: "1:00 PM - 5:00 PM",
        startMinutes: toMinutes(13, 0),
        endMinutes: toMinutes(17, 0),
        matchesDay: (date) => isNthWeekdayOfMonth(date, 5, [2, 4]),
      },
      {
        daysLabel: "1st & 3rd Friday",
        timeLabel: "1:00 PM - 5:00 PM",
        startMinutes: toMinutes(13, 0),
        endMinutes: toMinutes(17, 0),
        matchesDay: (date) => isNthWeekdayOfMonth(date, 5, [1, 3]),
      },
    ],
  },
};

const surgerySchedules: Record<string, DepartmentServiceSchedule> = {
  Urosurgery: {
    location: "OPD Building 2nd Floor",
    windows: [
      {
        daysLabel: "Monday & Thursday",
        timeLabel: "1:00 PM - 5:00 PM",
        startMinutes: toMinutes(13, 0),
        endMinutes: toMinutes(17, 0),
        matchesDay: (date) => [1, 4].includes(date.getDay()),
      },
      {
        daysLabel: "Saturday",
        timeLabel: "6:00 AM - 2:00 PM",
        startMinutes: toMinutes(6, 0),
        endMinutes: toMinutes(14, 0),
        matchesDay: (date) => date.getDay() === 6,
      },
    ],
  },
  Neurosurgery: {
    location: "OPD Building 2nd Floor",
    windows: [
      {
        daysLabel: "Monday & Friday",
        timeLabel: "1:00 PM - 5:00 PM",
        startMinutes: toMinutes(13, 0),
        endMinutes: toMinutes(17, 0),
        matchesDay: (date) => [1, 5].includes(date.getDay()),
      },
    ],
  },
};

const dentalSchedules = buildSharedDepartmentSchedules(
  [
    "Dental Consultation",
    "Preventive Services",
    "Restorative Dentistry",
    "Oral Surgery",
    "Dental Radiology",
    "Age Determination Services",
  ],
  "OPD Building 3rd Floor",
  [
    {
      daysLabel: "Monday - Friday",
      timeLabel: "6:00 AM - 5:00 PM",
      startMinutes: toMinutes(6, 0),
      endMinutes: toMinutes(17, 0),
      matchesDay: (date) => [1, 2, 3, 4, 5].includes(date.getDay()),
    },
    {
      daysLabel: "Saturday",
      timeLabel: "6:00 AM - 2:00 PM",
      startMinutes: toMinutes(6, 0),
      endMinutes: toMinutes(14, 0),
      matchesDay: (date) => date.getDay() === 6,
    },
  ]
);

const famedSchedules = buildSharedDepartmentSchedules(
  [
    "Out-patient Consultaion",
    "Preventive Care & Wellness",
    "Chronic Disease Management",
    "Family Health Services",
    "Community-Oriented Primary Care",
  ],
  "OPD Building 3rd Floor",
  [
    {
      daysLabel: "Monday - Friday",
      timeLabel: "6:00 AM - 10:00 PM",
      startMinutes: toMinutes(6, 0),
      endMinutes: toMinutes(22, 0),
      matchesDay: (date) => [1, 2, 3, 4, 5].includes(date.getDay()),
    },
    {
      daysLabel: "Saturday & Sunday",
      timeLabel: "6:00 AM - 2:00 PM",
      startMinutes: toMinutes(6, 0),
      endMinutes: toMinutes(14, 0),
      matchesDay: (date) => [0, 6].includes(date.getDay()),
    },
  ]
);

const familyPlanningSchedules = buildSharedDepartmentSchedules(
  [
    "Contraceptive Counseling",
    "Intrauterine Device (IUD) Services",
    "Implantable Contraceptives",
    "Sterilization Procedures",
    "Natural Family Planning Education",
    "Emergency Contraception",
  ],
  "OB Complex Ground Floor",
  [
    {
      daysLabel: "Monday - Friday",
      timeLabel: "8:00 AM - 5:00 PM",
      startMinutes: toMinutes(8, 0),
      endMinutes: toMinutes(17, 0),
      matchesDay: (date) => [1, 2, 3, 4, 5].includes(date.getDay()),
    },
  ]
);

const orthopedicsSchedules = buildSharedDepartmentSchedules(
  [
    "Orthopedic Surgery",
    "Trauma Surgery",
    "Joint Replacement",
    "Spine Surgery",
    "Hand & Upper Limb Surgery",
    "Orthopedic Oncology",
    "Pediatric Orthopedics",
  ],
  "OPD Building Ground Floor",
  [
    {
      daysLabel: "Monday - Friday",
      timeLabel: "6:00 AM - 10:00 PM",
      startMinutes: toMinutes(6, 0),
      endMinutes: toMinutes(22, 0),
      matchesDay: (date) => [1, 2, 3, 4, 5].includes(date.getDay()),
    },
    {
      daysLabel: "Saturday & Sunday",
      timeLabel: "6:00 AM - 2:00 PM",
      startMinutes: toMinutes(6, 0),
      endMinutes: toMinutes(14, 0),
      matchesDay: (date) => [0, 6].includes(date.getDay()),
    },
  ]
);

const rehabilitationMedicineSchedules = buildSharedDepartmentSchedules(
  [
    "Physical Therapy",
    "Occupational Therapy",
    "Musculoskeletal Rehabilitation",
    "Neurological Rehabilitation",
    "Cardiopulmonary Rehabilitation",
    "Work-Related Injury Rehabilitation",
    "Prosthetics & Orthotics",
    "Pediatric Rehabilitation",
  ],
  "New Building 4th Floor",
  [
    {
      daysLabel: "Monday - Friday",
      timeLabel: "7:00 AM - 5:00 PM",
      startMinutes: toMinutes(7, 0),
      endMinutes: toMinutes(17, 0),
      matchesDay: (date) => [1, 2, 3, 4, 5].includes(date.getDay()),
    },
    {
      daysLabel: "Saturday & Sunday",
      timeLabel: "6:00 AM - 2:00 PM",
      startMinutes: toMinutes(6, 0),
      endMinutes: toMinutes(14, 0),
      matchesDay: (date) => [0, 6].includes(date.getDay()),
    },
  ]
);

const ophthalmologySchedules = buildSharedDepartmentSchedules(
  [
    "Glaucoma",
    "Retina & Vitreous Services",
    "Cornea & External Diseases",
    "Oculoplastic & Orbit Surgery",
    "Neuro-Ophthalmology",
    "Uveitis & Immunology",
    "Pediatric Ophthalmology",
    "Cataract & Refractive Services",
  ],
  "Ground Floor",
  [
    {
      daysLabel: "Monday - Friday",
      timeLabel: "6:00 AM - 10:00 PM",
      startMinutes: toMinutes(6, 0),
      endMinutes: toMinutes(22, 0),
      matchesDay: (date) => [1, 2, 3, 4, 5].includes(date.getDay()),
    },
    {
      daysLabel: "Saturday & Sunday",
      timeLabel: "6:00 AM - 2:00 PM",
      startMinutes: toMinutes(6, 0),
      endMinutes: toMinutes(14, 0),
      matchesDay: (date) => [0, 6].includes(date.getDay()),
    },
  ]
);

const psychiatrySchedules = buildSharedDepartmentSchedules(
  [
    "Adult Psychiatry",
    "Child & Adolescent Psychiatry",
    "Geriatric Psychiatry",
    "Addiction Psychiatry",
    "Consultation-Liaison Psychiatry",
    "Psychotherapy Services",
    "Emergency Psychiatry",
  ],
  "OPD Building Ground Floor",
  [
    {
      daysLabel: "Monday, Tuesday, Thursday, & Friday",
      timeLabel: "8:00 AM - 5:00 PM",
      startMinutes: toMinutes(8, 0),
      endMinutes: toMinutes(17, 0),
      matchesDay: (date) => [1, 2, 4, 5].includes(date.getDay()),
    },
  ]
);

const otorhinolaryngologySchedules = buildSharedDepartmentSchedules(
  [
    "General ENT Consultation",
    "Head & Neck Surgery",
    "Otology & Neurotology",
    "Rhinology & Sinus Surgery",
    "Facial Plastic Surgery",
    "Pediatric ENT",
    "Laryngology Services",
  ],
  "Ground Floor",
  [
    {
      daysLabel: "Monday - Friday",
      timeLabel: "6:00 AM - 10:00 PM",
      startMinutes: toMinutes(6, 0),
      endMinutes: toMinutes(22, 0),
      matchesDay: (date) => [1, 2, 3, 4, 5].includes(date.getDay()),
    },
    {
      daysLabel: "Saturday & Sunday",
      timeLabel: "6:00 AM - 2:00 PM",
      startMinutes: toMinutes(6, 0),
      endMinutes: toMinutes(14, 0),
      matchesDay: (date) => [0, 6].includes(date.getDay()),
    },
  ]
);

const obstetricsGynecologySchedules: Record<string, DepartmentServiceSchedule> = {
  "Dr. Armina T. Isidro": {
    location: "Mab Clinic 207",
    windows: [
      {
        daysLabel: "Wednesday",
        timeLabel: "4:00 PM - 6:00 PM",
        startMinutes: toMinutes(16, 0),
        endMinutes: toMinutes(18, 0),
        matchesDay: (date) => date.getDay() === 3,
      },
      {
        daysLabel: "Saturday",
        timeLabel: "10:00 AM - 12:00 PM",
        startMinutes: toMinutes(10, 0),
        endMinutes: toMinutes(12, 0),
        matchesDay: (date) => date.getDay() === 6,
      },
    ],
  },
  "Dr. Sherilyn Bote-Casiño": {
    location: "Mab Clinic 211",
    windows: [
      {
        daysLabel: "Monday & Wednesday",
        timeLabel: "11:00 AM - 2:00 PM",
        startMinutes: toMinutes(11, 0),
        endMinutes: toMinutes(14, 0),
        matchesDay: (date) => [1, 3].includes(date.getDay()),
      },
    ],
  },
  "Dr. Lucila Gatchalian": {
    location: "Mab Clinic 212",
    windows: [
      {
        daysLabel: "Monday - Friday",
        timeLabel: "10:00 AM - 4:00 PM",
        startMinutes: toMinutes(10, 0),
        endMinutes: toMinutes(16, 0),
        matchesDay: (date) => [1, 2, 3, 4, 5].includes(date.getDay()),
      },
    ],
  },
  "Dr. Rhinelia Bataclan": {
    location: "Mab Clinic 224",
    windows: [
      {
        daysLabel: "Monday, Tuesday, Thursday, Friday, & Saturday",
        timeLabel: "3:00 PM - 5:00 PM",
        startMinutes: toMinutes(15, 0),
        endMinutes: toMinutes(17, 0),
        matchesDay: (date) => [1, 2, 4, 5, 6].includes(date.getDay()),
      },
    ],
  },
};

const schedulesByDepartment: Record<string, Record<string, DepartmentServiceSchedule>> = {
  "Internal Medicine": internalMedicineSchedules,
  Pediatrics: pediatricsSchedules,
  Surgery: surgerySchedules,
  Dental: dentalSchedules,
  "Family & Community Medicine (FAMED)": famedSchedules,
  "Family Planning": familyPlanningSchedules,
  Orthopedics: orthopedicsSchedules,
  "Rehabilitation Medicine": rehabilitationMedicineSchedules,
  Ophthalmology: ophthalmologySchedules,
  "Obstetrics & Gynecology": obstetricsGynecologySchedules,
  Psychiatry: psychiatrySchedules,
  Otorhinolaryngology: otorhinolaryngologySchedules,
};

export const getDepartmentServiceAvailability = (
  department: string,
  service: string,
  date: Date = new Date()
): DepartmentServiceAvailability | null => {
  const departmentSchedules = schedulesByDepartment[department];
  if (!departmentSchedules) return null;

  const schedule = departmentSchedules[service];
  if (!schedule) return null;

  const windowsToday = schedule.windows.filter((window) => window.matchesDay(date));
  if (windowsToday.length === 0) {
    return {
      schedule,
      isAvailableNow: false,
      status: "closed-day",
      opensAtMinutes: 0,
      closesAtMinutes: 0,
      hasTimeConfigured: true,
    };
  }

  const timedWindows = windowsToday.filter(
    (window) => typeof window.startMinutes === "number" && typeof window.endMinutes === "number"
  ) as Array<ServiceScheduleWindow & { startMinutes: number; endMinutes: number }>;

  if (timedWindows.length === 0) {
    return {
      schedule,
      isAvailableNow: false,
      status: "closed-today",
      opensAtMinutes: 0,
      closesAtMinutes: 0,
      hasTimeConfigured: false,
    };
  }

  const windowsWithTicketRange = timedWindows.map((window) => {
    const opensAtMinutes = Math.max(0, window.startMinutes - 120);
    const closesAtMinutes = Math.max(opensAtMinutes, window.endMinutes - 60);
    return {
      ...window,
      opensAtMinutes,
      closesAtMinutes,
    };
  });

  const nowMinutes = (date.getHours() * 60) + date.getMinutes();
  const activeWindow = windowsWithTicketRange.find((window) =>
    isWithinTimeRange(date, window.opensAtMinutes, window.closesAtMinutes)
  );

  if (activeWindow) {
    return {
      schedule,
      isAvailableNow: true,
      status: "available",
      opensAtMinutes: activeWindow.opensAtMinutes,
      closesAtMinutes: activeWindow.closesAtMinutes,
      hasTimeConfigured: true,
    };
  }

  const nextWindow = windowsWithTicketRange
    .filter((window) => nowMinutes < window.opensAtMinutes)
    .sort((a, b) => a.opensAtMinutes - b.opensAtMinutes)[0];

  if (nextWindow) {
    return {
      schedule,
      isAvailableNow: false,
      status: "not-yet-available",
      opensAtMinutes: nextWindow.opensAtMinutes,
      closesAtMinutes: nextWindow.closesAtMinutes,
      hasTimeConfigured: true,
    };
  }

  const lastWindow = windowsWithTicketRange.sort((a, b) => b.closesAtMinutes - a.closesAtMinutes)[0];

  return {
    schedule,
    isAvailableNow: false,
    status: "closed-today",
    opensAtMinutes: lastWindow.opensAtMinutes,
    closesAtMinutes: lastWindow.closesAtMinutes,
    hasTimeConfigured: true,
  };
};

export const formatMinutesToTimeLabel = (minutes: number) => {
  const normalizedMinutes = ((minutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hours24 = Math.floor(normalizedMinutes / 60);
  const mins = normalizedMinutes % 60;
  const suffix = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${mins.toString().padStart(2, "0")} ${suffix}`;
};
