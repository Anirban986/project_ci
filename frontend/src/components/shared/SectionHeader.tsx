import Link from "next/link";
import { cn } from "@/src/lib/utils";

interface SectionHeaderProps {
  title: string;
  viewAllHref?: string;
  className?: string;
}

export function SectionHeader({ title, viewAllHref, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-3", className)}>
      <p className="section-title">{title}</p>
      {viewAllHref && (
        <Link href={viewAllHref} className="text-xs text-brand-500 font-medium hover:text-brand-600">
          View all →
        </Link>
      )}
    </div>
  );
}
