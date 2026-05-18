"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Calendar, FileText, LogOut } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Heart } from "lucide-react";

const NAV_ITEMS = [
  { href: "/doctor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/doctor/patients", icon: Users, label: "Patients" },
  { href: "/doctor/consultation", icon: FileText, label: "Consultation" },
];

export function DoctorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-neutral-50">
      {/* Top header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-neutral-900 font-display text-sm">MedLink</span>
            <span className="text-xs text-neutral-400 border border-neutral-200 rounded-full px-2 py-0.5 ml-1">Doctor</span>
          </div>
          <Link href="/" className="text-neutral-400 hover:text-neutral-600">
            <LogOut className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Sub nav */}
      <div className="bg-white border-b border-neutral-200 sticky top-14 z-30">
        <div className="max-w-4xl mx-auto px-4 flex gap-0">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  active
                    ? "border-brand-500 text-brand-600"
                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
