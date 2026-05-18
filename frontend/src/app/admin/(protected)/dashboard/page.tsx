import { AdminDashboard } from "@/src/features/admin/admindashboard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default function Page() {
  return <AdminDashboard />;
}