import { ConsultationScreen } from "@/src/features/doctor/ConsultationScreen";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Consultation" };

export default function Page() {
  return <ConsultationScreen />;
}
