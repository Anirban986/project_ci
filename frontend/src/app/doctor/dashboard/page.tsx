import { DoctorDashboard } from "@/src/features/doctor/DoctorDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Doctor Dashboard" };

export default function Page() {
  return <DoctorDashboard />;
}
