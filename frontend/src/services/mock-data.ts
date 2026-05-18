import type {
  Patient,
  Doctor,
  Pharmacy,
  Appointment,
  MedicalDocument,
  Medicine,
  MedicineReservation,
  Prescription,
} from "@/src/types";

// ─── Users ────────────────────────────────────────────────────────────────────

export const MOCK_PATIENT: Patient = {
  id: "p1",
  name: "Arjun Mehta",
  email: "arjun.mehta@gmail.com",
  phone: "+91 98765 43210",
  role: "patient",
  avatarUrl: "",
  dateOfBirth: "1992-05-14",
  bloodGroup: "B+",
  allergies: ["Penicillin", "Aspirin"],
  emergencyContact: "+91 91234 56789",
  createdAt: "2024-01-15T10:00:00Z",
};

export const MOCK_DOCTOR: Doctor = {
  id: "d1",
  name: "Dr. Priya Sharma",
  email: "priya.sharma@medlink.in",
  role: "doctor",
  specialization: "General Physician",
  qualification: "MBBS, MD",
  licenseNo: "MCI-2018-045678",
  experience: 8,
  rating: 4.8,
  reviewCount: 234,
  consultationFee: 500,
  available: true,
  hospital: "Apollo Clinic, Kolkata",
  createdAt: "2023-06-01T10:00:00Z",
};

export const MOCK_PHARMACY: Pharmacy = {
  id: "ph1",
  name: "HealthFirst Pharmacy",
  email: "healthfirst@medlink.in",
  role: "pharmacy",
  address: "12, MG Road, Barrackpore, Kolkata - 700120",
  distance: 0.8,
  isOpen: true,
  openingHours: "8:00 AM – 10:00 PM",
  createdAt: "2023-03-10T10:00:00Z",
};

// ─── Doctors List ─────────────────────────────────────────────────────────────

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: "d1",
    name: "Dr. Priya Sharma",
    email: "priya@medlink.in",
    role: "doctor",
    specialization: "General Physician",
    qualification: "MBBS, MD",
    licenseNo: "MCI-2018-045678",
    experience: 8,
    rating: 4.8,
    reviewCount: 234,
    consultationFee: 500,
    available: true,
    hospital: "Apollo Clinic",
    createdAt: "2023-06-01T10:00:00Z",
  },
  {
    id: "d2",
    name: "Dr. Rohan Das",
    email: "rohan@medlink.in",
    role: "doctor",
    specialization: "Cardiologist",
    qualification: "MBBS, DM Cardiology",
    licenseNo: "MCI-2015-023456",
    experience: 12,
    rating: 4.9,
    reviewCount: 412,
    consultationFee: 1200,
    available: false,
    hospital: "AMRI Hospital",
    createdAt: "2023-06-01T10:00:00Z",
  },
  {
    id: "d3",
    name: "Dr. Ananya Bose",
    email: "ananya@medlink.in",
    role: "doctor",
    specialization: "Dermatologist",
    qualification: "MBBS, MD Dermatology",
    licenseNo: "MCI-2019-067890",
    experience: 6,
    rating: 4.7,
    reviewCount: 178,
    consultationFee: 800,
    available: true,
    hospital: "Skin & Care Clinic",
    createdAt: "2023-06-01T10:00:00Z",
  },
];

// ─── Appointments ─────────────────────────────────────────────────────────────

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "a1",
    patientId: "p1",
    patientName: "Arjun Mehta",
    doctorId: "d1",
    doctorName: "Dr. Priya Sharma",
    doctorSpecialization: "General Physician",
    date: "2025-07-22",
    time: "10:30 AM",
    status: "confirmed",
    type: "video",
  },
  {
    id: "a2",
    patientId: "p1",
    patientName: "Arjun Mehta",
    doctorId: "d2",
    doctorName: "Dr. Rohan Das",
    doctorSpecialization: "Cardiologist",
    date: "2025-07-18",
    time: "2:00 PM",
    status: "completed",
    type: "in-person",
    notes: "Follow-up in 3 months. ECG looks normal.",
  },
  {
    id: "a3",
    patientId: "p2",
    patientName: "Sonia Roy",
    doctorId: "d1",
    doctorName: "Dr. Priya Sharma",
    doctorSpecialization: "General Physician",
    date: "2025-07-22",
    time: "11:00 AM",
    status: "pending",
    type: "video",
  },
];

// ─── Medical Documents ────────────────────────────────────────────────────────

export const MOCK_DOCUMENTS: MedicalDocument[] = [
  {
    id: "doc1",
    patientId: "p1",
    name: "Blood Test Report – July 2025",
    category: "report",
    fileType: "pdf",
    fileUrl: "/docs/blood-report.pdf",
    fileSize: 420000,
    uploadedAt: "2025-07-15T09:30:00Z",
    tags: ["blood", "CBC"],
  },
  {
    id: "doc2",
    patientId: "p1",
    name: "Prescription – Dr. Priya Sharma",
    category: "prescription",
    fileType: "pdf",
    fileUrl: "/docs/prescription.pdf",
    fileSize: 185000,
    uploadedAt: "2025-07-10T14:00:00Z",
    sharedWith: ["d1"],
  },
  {
    id: "doc3",
    patientId: "p1",
    name: "Chest X-Ray",
    category: "scan",
    fileType: "image",
    fileUrl: "/docs/xray.jpg",
    fileSize: 2100000,
    uploadedAt: "2025-06-28T11:15:00Z",
  },
  {
    id: "doc4",
    patientId: "p1",
    name: "ECG Report",
    category: "report",
    fileType: "pdf",
    fileUrl: "/docs/ecg.pdf",
    fileSize: 310000,
    uploadedAt: "2025-06-20T16:45:00Z",
    sharedWith: ["d2"],
  },
];

// ─── Medicines ────────────────────────────────────────────────────────────────

export const MOCK_MEDICINES: Medicine[] = [
  {
    id: "m1",
    name: "Paracetamol 500mg",
    genericName: "Acetaminophen",
    manufacturer: "Cipla",
    category: "Analgesic",
    price: 18,
    requiresPrescription: false,
    stockStatus: "in_stock",
    quantity: 200,
  },
  {
    id: "m2",
    name: "Metformin 500mg",
    genericName: "Metformin HCl",
    manufacturer: "Sun Pharma",
    category: "Antidiabetic",
    price: 65,
    requiresPrescription: true,
    stockStatus: "in_stock",
    quantity: 150,
  },
  {
    id: "m3",
    name: "Atorvastatin 10mg",
    genericName: "Atorvastatin",
    manufacturer: "Dr. Reddy's",
    category: "Statin",
    price: 120,
    requiresPrescription: true,
    stockStatus: "low_stock",
    quantity: 30,
  },
  {
    id: "m4",
    name: "Azithromycin 500mg",
    genericName: "Azithromycin",
    manufacturer: "Abbott",
    category: "Antibiotic",
    price: 95,
    requiresPrescription: true,
    stockStatus: "out_of_stock",
    quantity: 0,
  },
  {
    id: "m5",
    name: "Cetirizine 10mg",
    genericName: "Cetirizine HCl",
    manufacturer: "Mankind",
    category: "Antihistamine",
    price: 22,
    requiresPrescription: false,
    stockStatus: "in_stock",
    quantity: 400,
  },
];

// ─── Pharmacies ───────────────────────────────────────────────────────────────

export const MOCK_PHARMACIES: Pharmacy[] = [
  {
    id: "ph1",
    name: "HealthFirst Pharmacy",
    email: "healthfirst@medlink.in",
    role: "pharmacy",
    address: "12, MG Road, Barrackpore",
    distance: 0.8,
    isOpen: true,
    openingHours: "8:00 AM – 10:00 PM",
    createdAt: "2023-03-10T10:00:00Z",
  },
  {
    id: "ph2",
    name: "MedPlus – Titagarh",
    email: "medplus.tit@medlink.in",
    role: "pharmacy",
    address: "45, Station Road, Titagarh",
    distance: 1.4,
    isOpen: true,
    openingHours: "24 Hours",
    createdAt: "2023-05-01T10:00:00Z",
  },
  {
    id: "ph3",
    name: "Apollo Pharmacy",
    email: "apollo.ph@medlink.in",
    role: "pharmacy",
    address: "78, College Road, Khardah",
    distance: 2.1,
    isOpen: false,
    openingHours: "9:00 AM – 9:00 PM",
    createdAt: "2023-07-22T10:00:00Z",
  },
];

// ─── Reservations ─────────────────────────────────────────────────────────────

export const MOCK_RESERVATIONS: MedicineReservation[] = [
  {
    id: "r1",
    medicineId: "m1",
    medicineName: "Paracetamol 500mg",
    pharmacyId: "ph1",
    pharmacyName: "HealthFirst Pharmacy",
    patientId: "p1",
    quantity: 2,
    status: "ready",
    reservedAt: "2025-07-21T10:00:00Z",
    expiresAt: "2025-07-22T22:00:00Z",
  },
];

// ─── Prescriptions ────────────────────────────────────────────────────────────

export const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: "presc1",
    doctorId: "d1",
    doctorName: "Dr. Priya Sharma",
    patientId: "p1",
    patientName: "Arjun Mehta",
    items: [
      {
        medicineId: "m1",
        medicineName: "Paracetamol 500mg",
        dosage: "500mg",
        frequency: "Twice daily",
        duration: "5 days",
        instructions: "After food",
      },
      {
        medicineId: "m5",
        medicineName: "Cetirizine 10mg",
        dosage: "10mg",
        frequency: "Once at night",
        duration: "7 days",
      },
    ],
    notes: "Stay hydrated. Rest well.",
    issuedAt: "2025-07-10T14:00:00Z",
    validUntil: "2025-08-10T00:00:00Z",
  },
];
