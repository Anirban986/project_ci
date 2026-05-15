import { cn } from "@/src/lib/utils";

interface DividerProps {
  label?: string;
  className?: string;
}

export function Divider({ label, className }: DividerProps) {
  if (label) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="flex-1 h-px bg-neutral-200" />
        <span className="text-xs text-neutral-400 font-medium">{label}</span>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>
    );
  }
  return <div className={cn("h-px bg-neutral-200 w-full", className)} />;
}
