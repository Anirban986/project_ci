import { cn } from "@/src/lib/utils";

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function InfoRow({ label, value, icon, className }: InfoRowProps) {
  return (
    <div className={cn("flex items-center gap-3 py-2.5", className)}>
      {icon && (
        <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0 text-neutral-500">
          {icon}
        </div>
      )}
      <div className="flex-1 flex items-center justify-between gap-2">
        <span className="text-xs text-neutral-500">{label}</span>
        <span className="text-sm font-medium text-neutral-800 text-right">{value}</span>
      </div>
    </div>
  );
}
