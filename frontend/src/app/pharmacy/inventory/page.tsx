import { InventoryScreen } from "@/src/features/pharmacy/InventoryScreen";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Inventory" };

export default function Page() {
  return <InventoryScreen />;
}
