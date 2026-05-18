"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Stethoscope, MessageSquare,
  Bot, CreditCard, FileBarChart, Activity,
  Heart, LogOut, ChevronRight, X, Menu,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useState } from "react";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { href: "/admin/dashboard",    icon: LayoutDashboard, label: "Dashboard"      },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/users",        icon: Users,           label: "Users"          },
      { href: "/admin/doctors",      icon: Stethoscope,     label: "Doctors"        },
    ],
  },
  {
    label: "Activity",
    items: [
      { href: "/admin/consultations",icon: MessageSquare,   label: "Consultations"  },
      { href: "/admin/ai-usage",     icon: Bot,             label: "AI Usage"       },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/admin/payments",     icon: CreditCard,      label: "Payments"       },
    ],
  },
  {
    label: "Records",
    items: [
      { href: "/admin/reports",      icon: FileBarChart,    label: "Reports & Rx"   },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { href: "/admin/system-health",icon: Activity,        label: "System Health"  },
    ],
  },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-white w-64 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm font-display">MedLink</p>
            <p className="text-[10px] text-neutral-400 font-medium tracking-widest uppercase">Admin</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-neutral-400 hover:text-white lg:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest px-3 mb-2">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                      active
                        ? "bg-brand-500 text-white"
                        : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-white" : "text-neutral-500 group-hover:text-neutral-300")} />
                    <span className="flex-1">{label}</span>
                    {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-neutral-800">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Admin</p>
            <p className="text-[10px] text-neutral-500 truncate">admin@medlink.in</p>
          </div>
        </div>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </Link>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-neutral-900 border-b border-neutral-800 h-14 flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-neutral-400 hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-brand-500 flex items-center justify-center">
            <Heart className="w-3 h-3 text-white fill-white" />
          </div>
          <span className="font-bold text-white text-sm font-display">MedLink Admin</span>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative flex">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}