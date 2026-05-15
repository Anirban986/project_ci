import { ConsultPage } from "@/src/features/patient/ConsultPage";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Consult" };

export default function ConsultRoutePage() {
  return <ConsultPage />;
}