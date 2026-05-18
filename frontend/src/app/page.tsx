"use client";

import { useState } from "react";
import { Heart, Stethoscope, Store, Shield, Zap, Users } from "lucide-react";
import { AuthModal } from "@/src/components/shared/AuthModal";
import { cn } from "@/src/lib/utils";
import type { UserRole } from "@/src/types";

const ROLES: {
  role: UserRole;
  label: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  borderHover: string;
}[] = [
  {
    role: "patient",
    label: "Patient",
    description: "Consult, book & manage medicines",
    icon: Heart,
    iconBg: "bg-brand-50 group-hover:bg-brand-100",
    iconColor: "text-brand-500",
    borderHover: "hover:border-brand-200",
  },
  {
    role: "doctor",
    label: "Doctor",
    description: "Manage appointments & patients",
    icon: Stethoscope,
    iconBg: "bg-success-50 group-hover:bg-success-100",
    iconColor: "text-success-600",
    borderHover: "hover:border-success-200",
  },
  {
    role: "pharmacy",
    label: "Pharmacy",
    description: "Manage inventory & reservations",
    icon: Store,
    iconBg: "bg-warning-50 group-hover:bg-amber-100",
    iconColor: "text-warning-500",
    borderHover: "hover:border-warning-200",
  },
];

const FEATURES = [
  { icon: Zap,    label: "AI-powered consults"   },
  { icon: Shield, label: "Secure health records" },
  { icon: Users,  label: "3 roles, one platform" },
];

export default function HomePage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  const handleRoleClick = (role: UserRole) => {
    setSelectedRole(role);
    setAuthOpen(true);
  };

  return (
    <main className="min-h-dvh bg-gradient-to-br from-brand-50 via-white to-neutral-50 flex flex-col items-center justify-center px-4 py-12">

      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-11 h-11 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-200">
          <Heart className="w-5 h-5 text-white fill-white" />
        </div>
        <span className="text-2xl font-bold font-display text-neutral-900 tracking-tight">
          MedLink
        </span>
      </div>
      <p className="text-neutral-500 text-sm mb-3">Your health, connected.</p>

      {/* Feature pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {FEATURES.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="flex items-center gap-1.5 text-xs text-neutral-500 bg-white border border-neutral-200 rounded-full px-3 py-1.5 shadow-sm"
          >
            <Icon className="w-3 h-3 text-brand-400" />
            {label}
          </span>
        ))}
      </div>

      {/* Role cards */}
      <div className="w-full max-w-sm space-y-3">
        <p className="text-xs font-medium text-neutral-400 uppercase tracking-widest text-center mb-4">
          Continue as
        </p>

        {ROLES.map(({ role, label, description, icon: Icon, iconBg, iconColor, borderHover }) => (
          <button
            key={role}
            onClick={() => handleRoleClick(role)}
            className={cn(
              "w-full card card-hover flex items-center gap-4 cursor-pointer group",
              "border border-transparent transition-all text-left",
              borderHover
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors",
              iconBg
            )}>
              <Icon className={cn("w-6 h-6", iconColor)} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-neutral-900 text-sm font-display">{label}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
            </div>
            <svg className="w-4 h-4 text-neutral-300 group-hover:text-neutral-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      

      {/* Auth Modal */}
      <AuthModal
        open={authOpen}
        role={selectedRole}
        onClose={() => {
          setAuthOpen(false);
          setSelectedRole(null);
        }}
      />
    </main>
  );
}