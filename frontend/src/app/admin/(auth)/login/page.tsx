import { AdminLoginPage } from "@/src/features/admin/AdminLoginPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title:  "Admin Login | MedLink",
  robots: { index: false, follow: false }, // prevents search engines indexing this
};

export default function Page() {
  return <AdminLoginPage />;
}
