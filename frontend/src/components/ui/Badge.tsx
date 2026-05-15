import { cn } from "@/src/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "neutral" | "brand";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default:  "bg-neutral-100 text-neutral-600",
  brand:    "bg-brand-50 text-brand-600",
  success:  "bg-success-50 text-success-600",
  warning:  "bg-warning-50 text-warning-500",
  danger:   "bg-danger-50 text-danger-600",
  neutral:  "bg-neutral-100 text-neutral-500",
};

const DOT_CLASSES: Record<BadgeVariant, string> = {
  default:  "bg-neutral-400",
  brand:    "bg-brand-500",
  success:  "bg-success-500",
  warning:  "bg-warning-500",
  danger:   "bg-danger-500",
  neutral:  "bg-neutral-400",
};

export function Badge({ variant = "default", children, className, dot }: BadgeProps) {
  return (
    <span className={cn("badge", VARIANT_CLASSES[variant], className)}>
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", DOT_CLASSES[variant])} />
      )}
      {children}
    </span>
  );
}
