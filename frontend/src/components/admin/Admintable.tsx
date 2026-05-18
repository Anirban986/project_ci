import { cn } from "@/src/lib/utils";

interface Column<T> {
  key: keyof T | string;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (row: T) => React.ReactNode;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  className?: string;
  emptyMessage?: string;
  compact?: boolean;
}

export function AdminTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  className,
  emptyMessage = "No data available",
  compact = false,
}: AdminTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-400 text-sm">{emptyMessage}</div>
    );
  }

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full text-sm min-w-max">
        <thead>
          <tr className="border-b border-neutral-100">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  "text-xs font-semibold text-neutral-500 uppercase tracking-wide pb-3 pr-4",
                  col.align === "right"  && "text-right",
                  col.align === "center" && "text-center",
                  !col.align             && "text-left"
                )}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-50">
          {data.map((row) => (
            <tr
              key={String(row[keyField])}
              className="hover:bg-neutral-50 transition-colors group"
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className={cn(
                    "text-neutral-700 pr-4",
                    compact ? "py-2.5" : "py-3.5",
                    col.align === "right"  && "text-right",
                    col.align === "center" && "text-center",
                  )}
                >
                  {col.render
                    ? col.render(row)
                    : String(row[col.key as keyof T] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}