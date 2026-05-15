import { PatientListScreen } from "@/src/features/doctor/PatientListScreen";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Patients" };

export default function Page() {
  return <PatientListScreen />;
}
