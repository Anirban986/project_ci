import type { DocumentCategory, StockStatus } from "@/src/types";

export const APP_NAME = "MedLink";
export const APP_TAGLINE = "Your health, connected.";

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
};

export const STOCK_STATUS_COLORS: Record<StockStatus, string> = {
  in_stock: "text-success-600 bg-success-50",
  low_stock: "text-warning-500 bg-warning-50",
  out_of_stock: "text-danger-600 bg-danger-50",
};

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  prescription: "Prescription",
  report: "Report",
  scan: "Scan / X-Ray",
  certificate: "Certificate",
  other: "Other",
};

export const SYMPTOM_CHIPS = [
  { id: "fever", label: "Fever" },
  { id: "headache", label: "Headache" },
  { id: "cough", label: "Cough" },
  { id: "fatigue", label: "Fatigue" },
  { id: "nausea", label: "Nausea" },
  { id: "chest-pain", label: "Chest Pain" },
  { id: "shortness-of-breath", label: "Breathlessness" },
  { id: "sore-throat", label: "Sore Throat" },
  { id: "body-ache", label: "Body Ache" },
  { id: "dizziness", label: "Dizziness" },
  { id: "rash", label: "Skin Rash" },
  { id: "stomach-pain", label: "Stomach Pain" },
];

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const SPECIALIZATIONS = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Orthopedist",
  "Gynecologist",
  "Pediatrician",
  "Psychiatrist",
  "Ophthalmologist",
  "ENT Specialist",
];
