import { PatientProfile } from "@/src/features/patient/PatientProfile";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Profile" };

export default function ProfilePage() {
  return <PatientProfile />;
}
