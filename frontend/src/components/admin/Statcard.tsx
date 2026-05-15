import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { TrendPoint } from "@/src/types/admin";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: TrendPoint[];
  color?: "brand" | "success" | "warning" | "danger" | "purple" | "teal";
  icon: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
}

const COLOR_MAP = {
  brand:   { bg: "bg-brand-50",   icon: "text-brand-500",   bar: "#0a84ff" },
  success: { bg: "bg-success-50", icon: "text-success-600", bar: "#22c55e" },
  warning: { bg: "bg-warning-50", icon: "text-warning-500", bar: "#f59e0b" },
  danger:  { bg: "bg-danger-50",  icon: "text-danger-500",  bar: "#f43f5e" },
  purple:  { bg: "bg-purple-50",  icon: "text-purple-500",  bar: "#a855f7" },
  teal:    { bg: "bg-teal-50",    icon: "text-teal-500",    bar: "#14b8a6" },
};

function MiniSparkline({ data, color }: { data: TrendPoint[]; color: string }) {
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 80;
  const H = 28;
  const step = W / (values.length - 1);

  const points = values
    .map((v, i) => `${i * step},${H - ((v - min) / range) * H}`)
    .join(" ");

  return (
    <svg width={W} height={H} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );
}

export function StatCard({
  label,
  value,
  change,
  changeLabel,
  trend,
  color = "brand",
  icon,
  className,
  size = "md",
}: StatCardProps) {
  const colors = COLOR_MAP[color] ?? COLOR_MAP.brand;
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral  = change === 0;

  return (
    <div className={cn("bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm hover:shadow-md transition-shadow", className)}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", "bg-gray-100")}>
          <span className={colors.icon}>{icon}</span>
        </div>
        {trend && trend.length > 1 && (
          <MiniSparkline data={trend} color={colors.bar} />
        )}
      </div>

      <p className={cn("font-bold text-neutral-900 font-display", size === "md" ? "text-2xl" : "text-xl")}>
        {typeof value === "number" ? value.toLocaleString("en-IN") : value}
      </p>
      <p className="text-xs text-neutral-500 mt-0.5 font-medium">{label}</p>

      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-3">
          <span className={cn(
            "flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
            isPositive ? "text-success-600 bg-success-50" :
            isNegative ? "text-danger-600 bg-danger-50"   :
            "text-neutral-500 bg-neutral-100"
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> :
             isNegative ? <TrendingDown className="w-3 h-3" /> :
             <Minus className="w-3 h-3" />}
            {Math.abs(change)}%
          </span>
          {changeLabel && (
            <span className="text-xs text-neutral-400">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}