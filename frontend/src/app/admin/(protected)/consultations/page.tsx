import { AdminConsultations } from "@/src/features/admin/adminconsultations";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Consultations" };

export default function Page() {
  return <AdminConsultations />;
}