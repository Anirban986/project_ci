import { cn } from "@/src/lib/utils";

interface ProgressBarProps {
  value: number; // 0–100
  max?: number;
  label?: string;
  showPercent?: boolean;
  color?: "brand" | "success" | "warning" | "danger";
  className?: string;
}

const COLOR_CLASSES = {
  brand:   "bg-brand-500",
  success: "bg-success-500",
  warning: "bg-warning-500",
  danger:  "bg-danger-500",
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent,
  color = "brand",
  className,
}: ProgressBarProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercent) && (
        <div className="flex justify-between text-xs text-neutral-600 mb-1.5">
          {label && <span>{label}</span>}
          {showPercent && <span>{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="w-full bg-neutral-100 rounded-full h-2">
        <div
          className={cn(
            "h-2 rounded-full transition-all duration-500",
            COLOR_CLASSES[color]
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
