import { cn } from "@/src/lib/utils";

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPad?: boolean;
}

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className,
  noPad = false,
}: SectionCardProps) {
  return (
    <div className={cn("bg-white rounded-2xl border border-neutral-100 shadow-sm", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-neutral-50">
          <div>
            {title && (
              <h3 className="font-semibold text-neutral-900 font-display text-sm">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn(!noPad && "p-5")}>{children}</div>
    </div>
  );
}

interface PeriodTabsProps {
  active: string;
  options: string[];
  onChange: (v: string) => void;
}

export function PeriodTabs({ active, options, onChange }: PeriodTabsProps) {
  return (
    <div className="flex bg-neutral-100 rounded-xl p-0.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            active === opt
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}