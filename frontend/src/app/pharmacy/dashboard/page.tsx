import { PharmacyDashboard } from "@/src/features/pharmacy/PharmacyDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pharmacy Dashboard" };

export default function Page() {
  return <PharmacyDashboard />;
}
