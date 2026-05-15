import { AdminAIUsage } from "@/src/features/admin/adminaiusage";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "AI Usage" };

export default function Page() {
  return <AdminAIUsage />;
}