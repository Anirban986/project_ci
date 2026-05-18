"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, Pill, FolderOpen, User } from "lucide-react";
import { cn } from "@/src/lib/utils";

const NAV_ITEMS = [
  { href: "/patient/dashboard", icon: Home, label: "Home" },
  { href: "/patient/consult", icon: MessageCircle, label: "Consult" },
  { href: "/patient/pharmacy", icon: Pill, label: "Pharmacy" },
  { href: "/patient/vault", icon: FolderOpen, label: "Vault" },
  { href: "/patient/profile", icon: User, label: "Profile" },
];

export function PatientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-neutral-50 flex flex-col">
      <main className="flex-1 with-bottom-nav">{children}</main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 safe-bottom z-50"
        style={{ height: "calc(64px + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="flex items-center h-16 px-2">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-colors",
                  active
                    ? "text-brand-500"
                    : "text-neutral-400 hover:text-neutral-600"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5",
                    active ? "stroke-[2.5]" : "stroke-[1.75]"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    active ? "text-brand-500" : "text-neutral-400"
                  )}
                >
                  {label}
                </span>
                {active && (
                  <span className="absolute top-0 w-5 h-0.5 rounded-full bg-brand-500" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
