"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Loader2 } from "lucide-react";
import { isAdminAuthenticated } from "@/src/services/admin/admin-auth.service";
import { useAdminAuthStore } from "@/src/store/admin-auth.store";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router          = useRouter();
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated);
  const [checking, setChecking] = useState(true);
  const [allowed,  setAllowed]  = useState(false);

  useEffect(() => {
    // Check both Zustand store AND sessionStorage token
    // Zustand resets on full page refresh; sessionStorage survives tab reload
    const tokenExists = isAdminAuthenticated();

    if (isAuthenticated || tokenExists) {
      setAllowed(true);
    } else {
      // Not authenticated — send to dedicated admin login page
      router.replace("/admin/login");
    }
    setChecking(false);
  }, [isAuthenticated, router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950">
        <div className="flex flex-col items-center gap-3 text-neutral-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-sm font-medium">Verifying session…</p>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950">
        <div className="flex flex-col items-center gap-3 text-neutral-500">
          <ShieldAlert className="w-8 h-8 text-danger-500" />
          <p className="text-sm font-medium">Redirecting to login…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
