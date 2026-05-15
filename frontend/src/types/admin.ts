// ─── Metric primitives ────────────────────────────────────────────────────────

export interface TrendPoint {
  label: string;   // "Mon", "Jan", "Week 1" …
  value: number;
}

export interface MetricCard {
  label: string;
  value: number | string;
  change: number;        // % change (positive = up, negative = down)
  changeLabel: string;   // "vs last week"
  trend: TrendPoint[];
  icon: string;          // lucide icon name
  color: "brand" | "success" | "warning" | "danger" | "purple" | "teal";
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "patient" | "doctor" | "pharmacy";
  status: "active" | "inactive" | "banned";
  joinedAt: string;
  lastActive: string;
  consultations: number;
}

export interface UserGrowthStats {
  totalUsers: number;
  activeToday: number;
  newToday: number;
  newThisWeek: number;
  newThisMonth: number;
  dailyGrowth: TrendPoint[];
  weeklyGrowth: TrendPoint[];
  monthlyGrowth: TrendPoint[];
  byRole: { patient: number; doctor: number; pharmacy: number };
}

// ─── Doctors ──────────────────────────────────────────────────────────────────

export interface AdminDoctor {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  hospital: string;
  rating: number;
  totalConsultations: number;
  consultationsToday: number;
  status: "available" | "busy" | "offline" | "suspended";
  verificationStatus: "verified" | "pending" | "rejected";
  joinedAt: string;
  revenueGenerated: number;
}

export interface DoctorStats {
  total: number;
  availableToday: number;
  busyNow: number;
  offline: number;
  pendingVerification: number;
  bySpecialization: { label: string; count: number }[];
  topDoctors: { name: string; consultations: number; rating: number }[];
}

// ─── Consultations ────────────────────────────────────────────────────────────

export type ConsultationMode = "ai" | "video" | "in-person";
export type ConsultationStatus = "completed" | "ongoing" | "cancelled" | "no-show";

export interface AdminConsultation {
  id: string;
  patientName: string;
  doctorName: string;
  mode: ConsultationMode;
  status: ConsultationStatus;
  startedAt: string;
  duration: number; // minutes
  fee: number;
}

export interface ConsultationStats {
  totalToday: number;
  totalThisWeek: number;
  totalThisMonth: number;
  ongoingNow: number;
  avgDuration: number;
  completionRate: number;
  byMode: { ai: number; video: number; "in-person": number };
  dailyTrend: TrendPoint[];
  weeklyTrend: TrendPoint[];
  monthlyTrend: TrendPoint[];
  recentConsultations: AdminConsultation[];
}

// ─── AI Usage ─────────────────────────────────────────────────────────────────

export interface AIRequestLog {
  id: string;
  patientId: string;
  patientName: string;
  symptoms: string[];
  riskLevel: "low" | "medium" | "high";
  responseMs: number;
  timestamp: string;
  tokensUsed: number;
}

export interface AIUsageStats {
  requestsToday: number;
  requestsThisWeek: number;
  requestsThisMonth: number;
  avgResponseMs: number;
  totalTokensUsed: number;
  estimatedCost: number;
  byRiskLevel: { low: number; medium: number; high: number };
  hourlyTrend: TrendPoint[];
  dailyTrend: TrendPoint[];
  weeklyTrend: TrendPoint[];
  recentRequests: AIRequestLog[];
  topSymptoms: { symptom: string; count: number }[];
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export type PaymentStatus = "success" | "failed" | "refunded" | "pending";
export type PaymentMethod = "upi" | "card" | "netbanking" | "wallet";

export interface AdminPayment {
  id: string;
  patientName: string;
  doctorName: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  timestamp: string;
  failureReason?: string;
}

export interface PaymentStats {
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
  failedToday: number;
  failedThisWeek: number;
  successRate: number;
  avgTransactionValue: number;
  byMethod: { upi: number; card: number; netbanking: number; wallet: number };
  dailyRevenue: TrendPoint[];
  weeklyRevenue: TrendPoint[];
  monthlyRevenue: TrendPoint[];
  recentPayments: AdminPayment[];
}

// ─── Reports & Prescriptions ──────────────────────────────────────────────────

export interface AdminPrescription {
  id: string;
  patientName: string;
  doctorName: string;
  medicineCount: number;
  issuedAt: string;
  validUntil: string;
  dispensed: boolean;
}

export interface ReportStats {
  totalPrescriptions: number;
  prescriptionsToday: number;
  dispensedToday: number;
  pendingDispense: number;
  topMedicines: { name: string; count: number }[];
  topDiagnoses: { name: string; count: number }[];
  recentPrescriptions: AdminPrescription[];
  monthlyPrescriptions: TrendPoint[];
}

// ─── System Health ────────────────────────────────────────────────────────────

export type ServiceStatus = "healthy" | "degraded" | "down";

export interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  uptime: number;         // percentage
  responseMs: number;
  lastChecked: string;
  icon: string;
}

export interface SystemMetric {
  label: string;
  value: number;
  unit: string;
  max: number;
  status: ServiceStatus;
}

export interface SystemHealthStats {
  overallStatus: ServiceStatus;
  services: ServiceHealth[];
  serverMetrics: SystemMetric[];
  errorRate: number;
  requestsPerMinute: number;
  uptimeDays: number;
  lastDeployment: string;
  errorLog: { timestamp: string; level: "error" | "warn" | "info"; message: string }[];
}