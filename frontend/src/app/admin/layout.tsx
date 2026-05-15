import { AdminSidebar } from "@/src/components/admin/Adminsidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | MedLink Admin" },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminSidebar />
      <main className="flex-1 min-w-0 px-4 sm:px-6 py-6 lg:py-8 mt-14 lg:mt-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}