"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Package, Bell, LogOut, Heart } from "lucide-react";
import { cn } from "@/src/lib/utils";

const NAV_ITEMS = [
  { href: "/pharmacy/dashboard", icon: LayoutGrid, label: "Dashboard" },
  { href: "/pharmacy/inventory", icon: Package, label: "Inventory" },
];

export function PharmacyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-neutral-900 font-display text-sm">MedLink</span>
            <span className="text-xs text-warning-500 border border-warning-100 bg-warning-50 rounded-full px-2 py-0.5 ml-1">Pharmacy</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-neutral-400 hover:text-neutral-600">
              <Bell className="w-5 h-5" />
            </button>
            <Link href="/" className="text-neutral-400 hover:text-neutral-600">
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Tab nav */}
      <div className="bg-white border-b border-neutral-200">
        <div className="flex px-4 gap-0">
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

      <main className="px-4 py-5 pb-10">{children}</main>
    </div>
  );
}
