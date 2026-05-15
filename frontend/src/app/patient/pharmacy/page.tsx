import { PharmacySearchScreen } from "@/src/features/patient/PharmacySearchScreen";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Find Medicines" };

export default function PharmacyPage() {
  return <PharmacySearchScreen />;
}
