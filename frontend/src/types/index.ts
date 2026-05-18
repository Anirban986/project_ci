// ─── User & Auth ─────────────────────────────────────────────────────────────

export type UserRole = "patient" | "doctor" | "pharmacy";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
}

export interface Patient extends User {
  role: "patient";
  dateOfBirth?: string;
  bloodGroup?: string;
  allergies?: string[];
  emergencyContact?: string;
}

export interface Doctor extends User {
  role: "doctor";
  specialization: string;
  qualification: string;
  licenseNo: string;
  experience: number; // years
  rating: number;
  reviewCount: number;
  consultationFee: number;
  available: boolean;
  hospital?: string;
}

export interface Pharmacy extends User {
  role: "pharmacy";
  address: string;
  lat?: number;
  lng?: number;
  distance?: number; // km
  isOpen: boolean;
  openingHours: string;
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "ongoing"
  | "completed"
  | "cancelled";

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  type: "video" | "in-person" | "ai-consult";
  notes?: string;
}

// ─── Medicines & Pharmacy ─────────────────────────────────────────────────────

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  category: string;
  price: number;
  requiresPrescription: boolean;
  stockStatus: StockStatus;
  quantity?: number;
}

export interface PharmacyMedicine extends Medicine {
  pharmacyId: string;
  pharmacyName: string;
  distance?: number;
}

export interface MedicineReservation {
  id: string;
  medicineId: string;
  medicineName: string;
  pharmacyId: string;
  pharmacyName: string;
  patientId: string;
  quantity: number;
  status: "pending" | "ready" | "collected" | "cancelled";
  reservedAt: string;
  expiresAt: string;
}

// ─── Medical Vault ────────────────────────────────────────────────────────────

export type DocumentCategory =
  | "prescription"
  | "report"
  | "scan"
  | "certificate"
  | "other";

export interface MedicalDocument {
  id: string;
  patientId: string;
  name: string;
  category: DocumentCategory;
  fileType: "pdf" | "image";
  fileUrl: string;
  fileSize: number; // bytes
  uploadedAt: string;
  sharedWith?: string[]; // doctor IDs
  tags?: string[];
}

// ─── AI Consult ───────────────────────────────────────────────────────────────

export type RiskLevel = "low" | "medium" | "high";

export interface Symptom {
  id: string;
  label: string;
  icon?: string;
}

export interface AIConsultMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AIConsultResult {
  possibleConditions: {
    name: string;
    probability: number;
    description: string;
  }[];
  riskLevel: RiskLevel;
  recommendations: string[];
  seekHelpUrgency: "routine" | "soon" | "immediate";
}

// ─── Prescriptions ────────────────────────────────────────────────────────────

export interface PrescriptionItem {
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  items: PrescriptionItem[];
  notes?: string;
  issuedAt: string;
  validUntil: string;
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
