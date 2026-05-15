import { AdminSystemHealth } from "@/src/features/admin/adminsystemhealth";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "System Health" };

export default function Page() {
  return <AdminSystemHealth />;
}