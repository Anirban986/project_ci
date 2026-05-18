"use client";

import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { useUIStore, type ToastType } from "@/src/store/ui.store";
import { cn } from "@/src/lib/utils";

const TOAST_CONFIG: Record<
  ToastType,
  { icon: React.ElementType; classes: string }
> = {
  success: { icon: CheckCircle,   classes: "bg-success-50 text-success-700 border-success-200" },
  error:   { icon: AlertCircle,   classes: "bg-danger-50  text-danger-700  border-danger-200"  },
  warning: { icon: AlertTriangle, classes: "bg-warning-50 text-warning-700 border-warning-200" },
  info:    { icon: Info,          classes: "bg-brand-50   text-brand-700   border-brand-200"   },
};

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 inset-x-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const { icon: Icon, classes } = TOAST_CONFIG[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-card-hover pointer-events-auto",
              classes
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
