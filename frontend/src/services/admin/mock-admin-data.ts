import type {
  UserGrowthStats, DoctorStats, ConsultationStats, AIUsageStats,
  PaymentStats, ReportStats, SystemHealthStats,
  AdminUser, AdminDoctor, AdminConsultation, AdminPayment,
  AdminPrescription, AIRequestLog,
} from "@/src/types/admin";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const DAYS   = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKS  = ["Wk 1", "Wk 2", "Wk 3", "Wk 4"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const HOURS  = Array.from({ length: 12 }, (_, i) => `${(i * 2).toString().padStart(2, "0")}:00`);

// ─── Users ────────────────────────────────────────────────────────────────────

export const ADMIN_USERS: AdminUser[] = [
  { id: "u1",  name: "Arjun Mehta",     email: "arjun@medlink.in",    phone: "+91 98765 43210", role: "patient",  status: "active",   joinedAt: "2024-01-15", lastActive: "2025-07-22", consultations: 8  },
  { id: "u2",  name: "Sonia Roy",       email: "sonia@medlink.in",    phone: "+91 91234 56789", role: "patient",  status: "active",   joinedAt: "2024-02-10", lastActive: "2025-07-21", consultations: 3  },
  { id: "u3",  name: "Pradeep Kumar",   email: "pradeep@medlink.in",  phone: "+91 93456 78901", role: "patient",  status: "inactive", joinedAt: "2024-03-05", lastActive: "2025-06-30", consultations: 1  },
  { id: "u4",  name: "Lakshmi Devi",    email: "lakshmi@medlink.in",  phone: "+91 94567 89012", role: "patient",  status: "active",   joinedAt: "2024-04-20", lastActive: "2025-07-20", consultations: 12 },
  { id: "u5",  name: "Rahul Sharma",    email: "rahul@medlink.in",    phone: "+91 95678 90123", role: "patient",  status: "banned",   joinedAt: "2024-05-11", lastActive: "2025-05-15", consultations: 0  },
  { id: "u6",  name: "Dr. Priya Sharma",email: "priya@medlink.in",    phone: "+91 96789 01234", role: "doctor",   status: "active",   joinedAt: "2023-06-01", lastActive: "2025-07-22", consultations: 234},
  { id: "u7",  name: "Dr. Rohan Das",   email: "rohan@medlink.in",    phone: "+91 97890 12345", role: "doctor",   status: "active",   joinedAt: "2023-07-15", lastActive: "2025-07-22", consultations: 412},
  { id: "u8",  name: "Dr. Ananya Bose", email: "ananya@medlink.in",   phone: "+91 98901 23456", role: "doctor",   status: "active",   joinedAt: "2023-09-22", lastActive: "2025-07-21", consultations: 178},
  { id: "u9",  name: "HealthFirst Rx",  email: "hf@medlink.in",       phone: "+91 99012 34567", role: "pharmacy", status: "active",   joinedAt: "2023-03-10", lastActive: "2025-07-22", consultations: 0  },
  { id: "u10", name: "MedPlus Titagarh",email: "mp@medlink.in",       phone: "+91 90123 45678", role: "pharmacy", status: "active",   joinedAt: "2023-05-01", lastActive: "2025-07-22", consultations: 0  },
];

export const USER_GROWTH_STATS: UserGrowthStats = {
  totalUsers:    14872,
  activeToday:   1243,
  newToday:      87,
  newThisWeek:   524,
  newThisMonth:  2180,
  byRole:        { patient: 12440, doctor: 1820, pharmacy: 612 },
  dailyGrowth:   DAYS.map((label, i) => ({ label, value: rand(60, 130) })),
  weeklyGrowth:  WEEKS.map((label) => ({ label, value: rand(450, 650) })),
  monthlyGrowth: MONTHS.map((label, i) => ({ label, value: rand(1400, 2400) })),
};

// ─── Doctors ──────────────────────────────────────────────────────────────────

export const ADMIN_DOCTORS: AdminDoctor[] = [
  { id: "d1", name: "Dr. Priya Sharma",   specialization: "General Physician", qualification: "MBBS, MD",              hospital: "Apollo Clinic",        rating: 4.8, totalConsultations: 234, consultationsToday: 6,  status: "available",  verificationStatus: "verified", joinedAt: "2023-06-01", revenueGenerated: 117000 },
  { id: "d2", name: "Dr. Rohan Das",      specialization: "Cardiologist",      qualification: "MBBS, DM Cardiology",   hospital: "AMRI Hospital",        rating: 4.9, totalConsultations: 412, consultationsToday: 8,  status: "busy",       verificationStatus: "verified", joinedAt: "2023-07-15", revenueGenerated: 494400 },
  { id: "d3", name: "Dr. Ananya Bose",    specialization: "Dermatologist",     qualification: "MBBS, MD Dermatology",  hospital: "Skin & Care Clinic",   rating: 4.7, totalConsultations: 178, consultationsToday: 4,  status: "available",  verificationStatus: "verified", joinedAt: "2023-09-22", revenueGenerated: 142400 },
  { id: "d4", name: "Dr. Suresh Nair",    specialization: "Neurologist",       qualification: "MBBS, DM Neurology",    hospital: "Medanta",              rating: 4.6, totalConsultations: 89,  consultationsToday: 2,  status: "offline",    verificationStatus: "verified", joinedAt: "2024-01-10", revenueGenerated: 133500 },
  { id: "d5", name: "Dr. Kavitha Reddy",  specialization: "Gynecologist",      qualification: "MBBS, MS Gynecology",   hospital: "Rainbow Hospital",     rating: 4.9, totalConsultations: 321, consultationsToday: 7,  status: "available",  verificationStatus: "verified", joinedAt: "2023-08-05", revenueGenerated: 288900 },
  { id: "d6", name: "Dr. Amit Joshi",     specialization: "Pediatrician",      qualification: "MBBS, MD Pediatrics",   hospital: "Children's Hospital",  rating: 4.7, totalConsultations: 156, consultationsToday: 3,  status: "busy",       verificationStatus: "pending",  joinedAt: "2024-03-15", revenueGenerated: 93600  },
  { id: "d7", name: "Dr. Meera Pillai",   specialization: "Psychiatrist",      qualification: "MBBS, MD Psychiatry",   hospital: "Mind Care Clinic",     rating: 4.5, totalConsultations: 67,  consultationsToday: 1,  status: "available",  verificationStatus: "pending",  joinedAt: "2024-05-20", revenueGenerated: 53600  },
  { id: "d8", name: "Dr. Vikram Singh",   specialization: "Orthopedist",       qualification: "MBBS, MS Orthopedics",  hospital: "Fortis Hospital",      rating: 4.8, totalConsultations: 203, consultationsToday: 5,  status: "offline",    verificationStatus: "verified", joinedAt: "2023-11-01", revenueGenerated: 243600 },
];

export const DOCTOR_STATS: DoctorStats = {
  total:                 1820,
  availableToday:        412,
  busyNow:               234,
  offline:               1174,
  pendingVerification:   38,
  bySpecialization: [
    { label: "General Physician", count: 542 },
    { label: "Cardiologist",      count: 198 },
    { label: "Dermatologist",     count: 176 },
    { label: "Gynecologist",      count: 212 },
    { label: "Pediatrician",      count: 234 },
    { label: "Other",             count: 458 },
  ],
  topDoctors: [
    { name: "Dr. Rohan Das",     consultations: 412, rating: 4.9 },
    { name: "Dr. Kavitha Reddy", consultations: 321, rating: 4.9 },
    { name: "Dr. Priya Sharma",  consultations: 234, rating: 4.8 },
    { name: "Dr. Vikram Singh",  consultations: 203, rating: 4.8 },
    { name: "Dr. Ananya Bose",   consultations: 178, rating: 4.7 },
  ],
};

// ─── Consultations ────────────────────────────────────────────────────────────

export const ADMIN_CONSULTATIONS: AdminConsultation[] = [
  { id: "c1",  patientName: "Arjun Mehta",   doctorName: "Dr. Priya Sharma",  mode: "video",      status: "completed", startedAt: "2025-07-22T09:30:00Z", duration: 18, fee: 500  },
  { id: "c2",  patientName: "Sonia Roy",      doctorName: "Dr. Rohan Das",     mode: "video",      status: "ongoing",   startedAt: "2025-07-22T10:45:00Z", duration: 12, fee: 1200 },
  { id: "c3",  patientName: "Lakshmi Devi",   doctorName: "Dr. Ananya Bose",   mode: "in-person",  status: "completed", startedAt: "2025-07-22T08:00:00Z", duration: 25, fee: 800  },
  { id: "c4",  patientName: "Pradeep Kumar",  doctorName: "AI Assistant",      mode: "ai",         status: "completed", startedAt: "2025-07-22T11:00:00Z", duration: 4,  fee: 0    },
  { id: "c5",  patientName: "Riya Patel",     doctorName: "Dr. Kavitha Reddy", mode: "video",      status: "cancelled", startedAt: "2025-07-22T10:00:00Z", duration: 0,  fee: 900  },
  { id: "c6",  patientName: "Mohan Lal",      doctorName: "AI Assistant",      mode: "ai",         status: "completed", startedAt: "2025-07-22T09:00:00Z", duration: 5,  fee: 0    },
  { id: "c7",  patientName: "Deepa Nair",     doctorName: "Dr. Suresh Nair",   mode: "in-person",  status: "no-show",   startedAt: "2025-07-22T11:30:00Z", duration: 0,  fee: 1500 },
  { id: "c8",  patientName: "Kiran Rao",      doctorName: "Dr. Priya Sharma",  mode: "video",      status: "completed", startedAt: "2025-07-22T08:30:00Z", duration: 22, fee: 500  },
];

export const CONSULTATION_STATS: ConsultationStats = {
  totalToday:      248,
  totalThisWeek:   1642,
  totalThisMonth:  6840,
  ongoingNow:      34,
  avgDuration:     19,
  completionRate:  87.4,
  byMode:          { ai: 2840, video: 2600, "in-person": 1400 },
  dailyTrend:      DAYS.map((label) => ({ label, value: rand(200, 320) })),
  weeklyTrend:     WEEKS.map((label) => ({ label, value: rand(1400, 1900) })),
  monthlyTrend:    MONTHS.map((label) => ({ label, value: rand(5800, 8200) })),
  recentConsultations: ADMIN_CONSULTATIONS,
};

// ─── AI Usage ─────────────────────────────────────────────────────────────────

export const AI_REQUEST_LOG: AIRequestLog[] = [
  { id: "ai1", patientId: "p4", patientName: "Pradeep Kumar", symptoms: ["fever", "headache"],       riskLevel: "medium", responseMs: 842,  timestamp: "2025-07-22T11:00:00Z", tokensUsed: 1240 },
  { id: "ai2", patientId: "p6", patientName: "Mohan Lal",     symptoms: ["cough", "fatigue"],        riskLevel: "low",    responseMs: 710,  timestamp: "2025-07-22T09:00:00Z", tokensUsed: 980  },
  { id: "ai3", patientId: "p7", patientName: "Ritu Sharma",   symptoms: ["chest-pain"],              riskLevel: "high",   responseMs: 960,  timestamp: "2025-07-22T08:15:00Z", tokensUsed: 1580 },
  { id: "ai4", patientId: "p8", patientName: "Anil Kumar",    symptoms: ["nausea", "stomach-pain"],  riskLevel: "low",    responseMs: 680,  timestamp: "2025-07-22T07:45:00Z", tokensUsed: 870  },
  { id: "ai5", patientId: "p9", patientName: "Geeta Devi",    symptoms: ["dizziness", "body-ache"],  riskLevel: "medium", responseMs: 790,  timestamp: "2025-07-22T07:00:00Z", tokensUsed: 1120 },
];

export const AI_USAGE_STATS: AIUsageStats = {
  requestsToday:     1284,
  requestsThisWeek:  8420,
  requestsThisMonth: 34200,
  avgResponseMs:     812,
  totalTokensUsed:   42800000,
  estimatedCost:     1284,
  byRiskLevel:       { low: 18400, medium: 12800, high: 3000 },
  hourlyTrend:       HOURS.map((label) => ({ label, value: rand(40, 180) })),
  dailyTrend:        DAYS.map((label) => ({ label, value: rand(900, 1500) })),
  weeklyTrend:       WEEKS.map((label) => ({ label, value: rand(7000, 10000) })),
  recentRequests:    AI_REQUEST_LOG,
  topSymptoms: [
    { symptom: "Fever",         count: 4820 },
    { symptom: "Headache",      count: 3640 },
    { symptom: "Cough",         count: 3210 },
    { symptom: "Body Ache",     count: 2980 },
    { symptom: "Fatigue",       count: 2740 },
    { symptom: "Nausea",        count: 1920 },
    { symptom: "Chest Pain",    count: 1240 },
    { symptom: "Dizziness",     count: 1180 },
  ],
};

// ─── Payments ─────────────────────────────────────────────────────────────────

export const ADMIN_PAYMENTS: AdminPayment[] = [
  { id: "pay1", patientName: "Arjun Mehta",  doctorName: "Dr. Priya Sharma",  amount: 500,  status: "success", method: "upi",        timestamp: "2025-07-22T09:30:00Z" },
  { id: "pay2", patientName: "Sonia Roy",    doctorName: "Dr. Rohan Das",     amount: 1200, status: "success", method: "card",       timestamp: "2025-07-22T10:45:00Z" },
  { id: "pay3", patientName: "Lakshmi Devi", doctorName: "Dr. Ananya Bose",   amount: 800,  status: "success", method: "upi",        timestamp: "2025-07-22T08:00:00Z" },
  { id: "pay4", patientName: "Riya Patel",   doctorName: "Dr. Kavitha Reddy", amount: 900,  status: "failed",  method: "netbanking", timestamp: "2025-07-22T10:00:00Z", failureReason: "Insufficient funds"  },
  { id: "pay5", patientName: "Kiran Rao",    doctorName: "Dr. Priya Sharma",  amount: 500,  status: "success", method: "wallet",     timestamp: "2025-07-22T08:30:00Z" },
  { id: "pay6", patientName: "Deepa Nair",   doctorName: "Dr. Suresh Nair",   amount: 1500, status: "failed",  method: "card",       timestamp: "2025-07-22T11:30:00Z", failureReason: "Card declined"       },
  { id: "pay7", patientName: "Mohan Verma",  doctorName: "Dr. Ananya Bose",   amount: 800,  status: "refunded",method: "upi",        timestamp: "2025-07-21T15:00:00Z" },
  { id: "pay8", patientName: "Priya Singh",  doctorName: "Dr. Rohan Das",     amount: 1200, status: "success", method: "card",       timestamp: "2025-07-22T07:00:00Z" },
];

export const PAYMENT_STATS: PaymentStats = {
  revenueToday:        48200,
  revenueThisWeek:     312400,
  revenueThisMonth:    1284000,
  weeklyGrowth:        12.4,
  monthlyGrowth:       18.7,
  failedToday:         14,
  failedThisWeek:      87,
  successRate:         94.2,
  avgTransactionValue: 820,
  byMethod:            { upi: 18400, card: 14200, netbanking: 8400, wallet: 7200 },
  dailyRevenue:        DAYS.map((label) => ({ label, value: rand(38000, 62000) })),
  weeklyRevenue:       WEEKS.map((label) => ({ label, value: rand(280000, 380000) })),
  monthlyRevenue:      MONTHS.map((label) => ({ label, value: rand(1000000, 1600000) })),
  recentPayments:      ADMIN_PAYMENTS,
};

// ─── Reports & Prescriptions ──────────────────────────────────────────────────

export const ADMIN_PRESCRIPTIONS: AdminPrescription[] = [
  { id: "presc1", patientName: "Arjun Mehta",   doctorName: "Dr. Priya Sharma",  medicineCount: 2, issuedAt: "2025-07-22T09:45:00Z", validUntil: "2025-08-22", dispensed: true  },
  { id: "presc2", patientName: "Lakshmi Devi",   doctorName: "Dr. Ananya Bose",   medicineCount: 3, issuedAt: "2025-07-22T08:25:00Z", validUntil: "2025-08-22", dispensed: false },
  { id: "presc3", patientName: "Kiran Rao",      doctorName: "Dr. Priya Sharma",  medicineCount: 1, issuedAt: "2025-07-22T08:50:00Z", validUntil: "2025-08-22", dispensed: true  },
  { id: "presc4", patientName: "Sonia Roy",      doctorName: "Dr. Rohan Das",     medicineCount: 4, issuedAt: "2025-07-21T14:00:00Z", validUntil: "2025-08-21", dispensed: false },
  { id: "presc5", patientName: "Pradeep Kumar",  doctorName: "Dr. Suresh Nair",   medicineCount: 2, issuedAt: "2025-07-20T11:00:00Z", validUntil: "2025-08-20", dispensed: true  },
];

export const REPORT_STATS: ReportStats = {
  totalPrescriptions:  28400,
  prescriptionsToday:  184,
  dispensedToday:      142,
  pendingDispense:     42,
  monthlyPrescriptions: MONTHS.map((label) => ({ label, value: rand(2000, 3200) })),
  topMedicines: [
    { name: "Paracetamol 500mg", count: 8420 },
    { name: "Metformin 500mg",   count: 4840 },
    { name: "Cetirizine 10mg",   count: 3620 },
    { name: "Atorvastatin 10mg", count: 3180 },
    { name: "Azithromycin 500mg",count: 2940 },
    { name: "Omeprazole 20mg",   count: 2480 },
  ],
  topDiagnoses: [
    { name: "Viral Fever",      count: 6840 },
    { name: "Hypertension",     count: 4920 },
    { name: "Diabetes Type 2",  count: 4210 },
    { name: "Respiratory Inf.", count: 3840 },
    { name: "Skin Allergy",     count: 2980 },
    { name: "Gastritis",        count: 2640 },
  ],
  recentPrescriptions: ADMIN_PRESCRIPTIONS,
};

// ─── System Health ────────────────────────────────────────────────────────────

export const SYSTEM_HEALTH_STATS: SystemHealthStats = {
  overallStatus:      "healthy",
  uptimeDays:         142,
  errorRate:          0.28,
  requestsPerMinute:  348,
  lastDeployment:     "2025-07-20T04:00:00Z",
  services: [
    { name: "API Gateway",       status: "healthy",  uptime: 99.98, responseMs: 42,  lastChecked: "2025-07-22T11:59:00Z", icon: "Globe"        },
    { name: "Auth Service",      status: "healthy",  uptime: 99.95, responseMs: 68,  lastChecked: "2025-07-22T11:59:00Z", icon: "Shield"       },
    { name: "AI Engine",         status: "healthy",  uptime: 99.82, responseMs: 812, lastChecked: "2025-07-22T11:59:00Z", icon: "Bot"          },
    { name: "Video Service",     status: "degraded", uptime: 98.40, responseMs: 320, lastChecked: "2025-07-22T11:59:00Z", icon: "Video"        },
    { name: "Database (Primary)",status: "healthy",  uptime: 99.99, responseMs: 12,  lastChecked: "2025-07-22T11:59:00Z", icon: "Database"     },
    { name: "Database (Replica)",status: "healthy",  uptime: 99.97, responseMs: 18,  lastChecked: "2025-07-22T11:59:00Z", icon: "Database"     },
    { name: "Payment Gateway",   status: "healthy",  uptime: 99.90, responseMs: 280, lastChecked: "2025-07-22T11:59:00Z", icon: "CreditCard"   },
    { name: "Storage (S3)",      status: "healthy",  uptime: 99.99, responseMs: 95,  lastChecked: "2025-07-22T11:59:00Z", icon: "HardDrive"    },
    { name: "Notification Svc",  status: "healthy",  uptime: 99.80, responseMs: 145, lastChecked: "2025-07-22T11:59:00Z", icon: "Bell"         },
    { name: "Search Service",    status: "down",     uptime: 95.20, responseMs: 0,   lastChecked: "2025-07-22T11:59:00Z", icon: "Search"       },
  ],
  serverMetrics: [
    { label: "CPU Usage",    value: 42,   unit: "%",  max: 100, status: "healthy"  },
    { label: "Memory",       value: 68,   unit: "%",  max: 100, status: "healthy"  },
    { label: "Disk Usage",   value: 54,   unit: "%",  max: 100, status: "healthy"  },
    { label: "Network I/O",  value: 82,   unit: "%",  max: 100, status: "degraded" },
    { label: "DB Conn Pool", value: 240,  unit: "/300", max: 300, status: "healthy" },
  ],
  errorLog: [
    { timestamp: "2025-07-22T11:45:00Z", level: "error", message: "Search Service: Connection timeout after 30s"      },
    { timestamp: "2025-07-22T11:30:00Z", level: "warn",  message: "Video Service: High latency detected (320ms)"      },
    { timestamp: "2025-07-22T10:12:00Z", level: "warn",  message: "Payment Gateway: Retry on transaction pay-7821"    },
    { timestamp: "2025-07-22T09:55:00Z", level: "info",  message: "AI Engine: Model cache refreshed successfully"     },
    { timestamp: "2025-07-22T08:00:00Z", level: "info",  message: "Scheduled backup completed in 4m 12s"              },
    { timestamp: "2025-07-22T07:30:00Z", level: "error", message: "Search Service: Pod crash-looping, restarting…"    },
    { timestamp: "2025-07-21T23:00:00Z", level: "info",  message: "Daily analytics snapshot generated"                },
  ],
};