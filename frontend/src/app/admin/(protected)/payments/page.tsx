import { AdminPayments } from "@/src/features/admin/adminpayments";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Payments" };

export default function Page() {
  return <AdminPayments />;
}
