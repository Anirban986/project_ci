import { AdminDoctors } from "@/src/features/admin/admindoctors";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Doctors" };

export default function Page() {
  return <AdminDoctors />;
}