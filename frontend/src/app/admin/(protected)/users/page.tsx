import { AdminUsers } from "@/src/features/admin/adminusers";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Users" };

export default function Page() {
  return <AdminUsers />;
}