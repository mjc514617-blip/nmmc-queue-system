const DEPARTMENT_CODE_MAP: Record<string, string> = {
  "Internal Medicine": "IM",
  Surgery: "SU",
  Pediatrics: "PD",
  "Obstetrics & Gynecology": "OG",
  Orthopedics: "OR",
  "Family & Community Medicine": "FC",
  "Rehabilitation Medicine": "RM",
  "ENT - HNS": "EN",
  Dental: "DE",
  Pathology: "PA",
  Ophthalmology: "OP",
};

const CODE_DEPARTMENT_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(DEPARTMENT_CODE_MAP).map(([department, code]) => [code, department])
);

export const encodeDepartmentForQr = (department: string): string => {
  const normalized = (department || "").trim();
  return DEPARTMENT_CODE_MAP[normalized] || normalized;
};

export const decodeDepartmentFromQr = (value: string | null): string | null => {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  return CODE_DEPARTMENT_MAP[normalized] || value;
};
