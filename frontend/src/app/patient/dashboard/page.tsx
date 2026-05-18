import { PatientDashboard } from "@/src/features/patient/PatientDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Health" };

export default function DashboardPage() {
  return <PatientDashboard />;
}