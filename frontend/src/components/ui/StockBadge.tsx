import { Badge } from "./Badge";
import { STOCK_STATUS_LABELS } from "@/src/lib/constants";
import type { StockStatus } from "@/src/types";

const VARIANT_MAP: Record<StockStatus, "success" | "warning" | "danger"> = {
  in_stock:     "success",
  low_stock:    "warning",
  out_of_stock: "danger",
};

export function StockBadge({ status }: { status: StockStatus }) {
  return (
    <Badge variant={VARIANT_MAP[status]} dot>
      {STOCK_STATUS_LABELS[status]}
    </Badge>
  );
}
