"use client";

import { useState } from "react";
import { Search, CheckCircle, AlertTriangle, XCircle, Plus, ChevronDown } from "lucide-react";
import { StockBadge } from "@/src/components/ui/StockBadge";
import { Button } from "@/src/components/ui/Button";
import { Modal } from "@/src/components/ui/Modal";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { MOCK_MEDICINES } from "@/src/services/mock-data";
import { formatCurrency, cn } from "@/src/lib/utils";
import type { Medicine, StockStatus } from "@/src/types";

const STATUS_OPTIONS: { value: StockStatus; label: string; icon: React.ElementType; color: string }[] = [
  { value: "in_stock",     label: "In Stock",     icon: CheckCircle,  color: "text-success-600 bg-success-50" },
  { value: "low_stock",    label: "Low Stock",    icon: AlertTriangle, color: "text-warning-500 bg-warning-50" },
  { value: "out_of_stock", label: "Out of Stock", icon: XCircle,      color: "text-danger-600 bg-danger-50" },
];

function StatusSelector({
  current,
  onChange,
}: {
  current: StockStatus;
  onChange: (s: StockStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const currentOption = STATUS_OPTIONS.find((o) => o.value === current)!;
  const Icon = currentOption.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors",
          currentOption.color
        )}
      >
        <Icon className="w-3.5 h-3.5" />
        {currentOption.label}
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-card-hover z-10 overflow-hidden w-40">
          {STATUS_OPTIONS.map((opt) => {
            const OptIcon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors hover:bg-neutral-50",
                  current === opt.value ? "opacity-50 cursor-default" : ""
                )}
              >
                <OptIcon className={cn("w-4 h-4", opt.color.split(" ")[0])} />
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function InventoryScreen() {
  const [medicines, setMedicines] = useState<Medicine[]>(MOCK_MEDICINES);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<StockStatus | "all">("all");
  const [addOpen, setAddOpen] = useState(false);
  const [newMed, setNewMed] = useState({ name: "", genericName: "", price: "", quantity: "" });

  const updateStatus = (id: string, status: StockStatus) =>
    setMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, stockStatus: status } : m))
    );

  const filtered = medicines.filter((m) => {
    const matchQuery =
      !query ||
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.genericName.toLowerCase().includes(query.toLowerCase());
    const matchStatus = filterStatus === "all" || m.stockStatus === filterStatus;
    return matchQuery && matchStatus;
  });

  const counts = {
    in_stock: medicines.filter((m) => m.stockStatus === "in_stock").length,
    low_stock: medicines.filter((m) => m.stockStatus === "low_stock").length,
    out_of_stock: medicines.filter((m) => m.stockStatus === "out_of_stock").length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-neutral-900 font-display text-lg">Inventory</h1>
          <p className="text-xs text-neutral-500 mt-0.5">{medicines.length} medicines tracked</p>
        </div>
        <Button
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setAddOpen(true)}
        >
          Add
        </Button>
      </div>

      {/* Summary pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterStatus("all")}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
            filterStatus === "all"
              ? "bg-neutral-900 text-white border-neutral-900"
              : "bg-white text-neutral-600 border-neutral-200"
          )}
        >
          All ({medicines.length})
        </button>
        <button
          onClick={() => setFilterStatus("in_stock")}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
            filterStatus === "in_stock"
              ? "bg-success-500 text-white border-success-500"
              : "bg-white text-success-600 border-success-100"
          )}
        >
          In Stock ({counts.in_stock})
        </button>
        <button
          onClick={() => setFilterStatus("low_stock")}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
            filterStatus === "low_stock"
              ? "bg-warning-500 text-white border-warning-500"
              : "bg-white text-warning-500 border-warning-100"
          )}
        >
          Low Stock ({counts.low_stock})
        </button>
        <button
          onClick={() => setFilterStatus("out_of_stock")}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
            filterStatus === "out_of_stock"
              ? "bg-danger-500 text-white border-danger-500"
              : "bg-white text-danger-600 border-danger-100"
          )}
        >
          Out of Stock ({counts.out_of_stock})
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          className="input pl-10"
          placeholder="Search medicine…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Medicine list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="w-6 h-6" />}
          title="No medicines found"
          description="Try a different search or filter"
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((med) => (
            <div key={med.id} className="card">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-900 text-sm font-display leading-tight">
                    {med.name}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {med.genericName} · {med.manufacturer}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm font-bold text-neutral-900">
                      {formatCurrency(med.price)}
                    </span>
                    {med.quantity !== undefined && (
                      <span className="text-xs text-neutral-400">
                        Qty: {med.quantity}
                      </span>
                    )}
                    {med.requiresPrescription && (
                      <span className="text-xs text-brand-500 font-medium">Rx</span>
                    )}
                  </div>
                </div>
                <StatusSelector
                  current={med.stockStatus}
                  onChange={(s) => updateStatus(med.id, s)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add medicine modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Medicine">
        <div className="space-y-3">
          <div>
            <label className="label block mb-1.5">Medicine Name</label>
            <input
              className="input"
              placeholder="e.g. Amoxicillin 500mg"
              value={newMed.name}
              onChange={(e) => setNewMed((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="label block mb-1.5">Generic Name</label>
            <input
              className="input"
              placeholder="e.g. Amoxicillin"
              value={newMed.genericName}
              onChange={(e) => setNewMed((p) => ({ ...p, genericName: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label block mb-1.5">Price (₹)</label>
              <input
                className="input"
                type="number"
                placeholder="0"
                value={newMed.price}
                onChange={(e) => setNewMed((p) => ({ ...p, price: e.target.value }))}
              />
            </div>
            <div>
              <label className="label block mb-1.5">Quantity</label>
              <input
                className="input"
                type="number"
                placeholder="0"
                value={newMed.quantity}
                onChange={(e) => setNewMed((p) => ({ ...p, quantity: e.target.value }))}
              />
            </div>
          </div>
          <Button
            variant="primary"
            fullWidth
            onClick={() => {
              if (!newMed.name) return;
              const newEntry: Medicine = {
                id: `m${Date.now()}`,
                name: newMed.name,
                genericName: newMed.genericName,
                manufacturer: "—",
                category: "General",
                price: Number(newMed.price) || 0,
                requiresPrescription: false,
                stockStatus: "in_stock",
                quantity: Number(newMed.quantity) || 0,
              };
              setMedicines((prev) => [newEntry, ...prev]);
              setNewMed({ name: "", genericName: "", price: "", quantity: "" });
              setAddOpen(false);
            }}
          >
            Add to Inventory
          </Button>
        </div>
      </Modal>
    </div>
  );
}
