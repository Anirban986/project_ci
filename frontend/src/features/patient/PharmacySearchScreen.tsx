"use client";

import { useState } from "react";
import { Search, MapPin, Clock, CheckCircle, AlertTriangle, XCircle, ShoppingBag } from "lucide-react";
import { Badge } from "@/src/components/ui/Badge";
import { StockBadge } from "@/src/components/ui/StockBadge";
import { Button } from "@/src/components/ui/Button";
import { Modal } from "@/src/components/ui/Modal";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { MOCK_MEDICINES, MOCK_PHARMACIES } from "@/src/services/mock-data";
import { formatCurrency, formatDistance, cn } from "@/src/lib/utils";
import type { Medicine } from "@/src/types";

export function PharmacySearchScreen() {
  const [query, setQuery] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [reservedId, setReservedId] = useState<string | null>(null);

  const filtered = query.trim()
    ? MOCK_MEDICINES.filter(
        (m) =>
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          m.genericName.toLowerCase().includes(query.toLowerCase())
      )
    : MOCK_MEDICINES;

  const handleReserve = (pharmacyId: string) => {
    setReservedId(pharmacyId);
    setTimeout(() => {
      setSelectedMedicine(null);
      setReservedId(null);
    }, 1500);
  };

  return (
    <div className="px-4 pt-5 pb-4 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-neutral-900 font-display">Find Medicines</h1>
        <p className="text-xs text-neutral-500 mt-0.5">Check availability at nearby pharmacies</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          className="input pl-10"
          placeholder="Search medicine name or generic…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Nearby pharmacies strip */}
      <div>
        <p className="section-title mb-3">Nearby Pharmacies</p>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
          {MOCK_PHARMACIES.map((ph) => (
            <div
              key={ph.id}
              className="flex-shrink-0 w-48 card snap-start"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-brand-500" />
                </div>
                <Badge variant={ph.isOpen ? "success" : "danger"} dot>
                  {ph.isOpen ? "Open" : "Closed"}
                </Badge>
              </div>
              <p className="font-semibold text-neutral-900 text-sm leading-tight font-display mb-1">
                {ph.name}
              </p>
              <div className="flex items-center gap-1 text-xs text-neutral-500 mb-0.5">
                <MapPin className="w-3 h-3" />
                {ph.distance && formatDistance(ph.distance)}
              </div>
              <div className="flex items-center gap-1 text-xs text-neutral-500">
                <Clock className="w-3 h-3" />
                {ph.openingHours}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Medicine list */}
      <div>
        <p className="section-title mb-3">
          {query ? `Results for "${query}"` : "All Medicines"}
        </p>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Search className="w-6 h-6" />}
            title="No medicines found"
            description="Try a different name or generic name"
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((med) => (
              <div
                key={med.id}
                className="card card-hover cursor-pointer"
                onClick={() =>
                  med.stockStatus !== "out_of_stock" && setSelectedMedicine(med)
                }
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                      med.stockStatus === "in_stock"
                        ? "bg-success-50"
                        : med.stockStatus === "low_stock"
                        ? "bg-warning-50"
                        : "bg-neutral-100"
                    )}
                  >
                    {med.stockStatus === "in_stock" ? (
                      <CheckCircle className="w-5 h-5 text-success-500" />
                    ) : med.stockStatus === "low_stock" ? (
                      <AlertTriangle className="w-5 h-5 text-warning-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-neutral-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900 text-sm font-display">
                      {med.name}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {med.genericName} · {med.manufacturer}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <StockBadge status={med.stockStatus} />
                      {med.requiresPrescription && (
                        <Badge variant="neutral">Rx Required</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-neutral-900 text-sm">
                      {formatCurrency(med.price)}
                    </p>
                    {med.stockStatus !== "out_of_stock" && (
                      <p className="text-xs text-brand-500 font-medium mt-1">Reserve →</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reserve modal */}
      <Modal
        open={!!selectedMedicine}
        onClose={() => setSelectedMedicine(null)}
        title="Reserve Medicine"
      >
        {selectedMedicine && (
          <div className="space-y-4">
            <div className="bg-neutral-50 rounded-xl p-4">
              <p className="font-semibold text-neutral-900 font-display">
                {selectedMedicine.name}
              </p>
              <p className="text-sm text-neutral-500 mt-0.5">
                {selectedMedicine.genericName}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <StockBadge status={selectedMedicine.stockStatus} />
                <span className="font-bold text-neutral-900">
                  {formatCurrency(selectedMedicine.price)}
                </span>
              </div>
            </div>

            <p className="text-xs font-medium text-neutral-500">Select pharmacy</p>
            <div className="space-y-2">
              {MOCK_PHARMACIES.filter((p) => p.isOpen).map((ph) => (
                <div key={ph.id} className="flex items-center justify-between p-3 rounded-xl border border-neutral-200">
                  <div>
                    <p className="font-medium text-sm text-neutral-800">{ph.name}</p>
                    <p className="text-xs text-neutral-500">
                      {ph.distance && formatDistance(ph.distance)} away
                    </p>
                  </div>
                  <Button
                    variant={reservedId === ph.id ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => handleReserve(ph.id)}
                    loading={reservedId === ph.id}
                  >
                    {reservedId === ph.id ? "Reserving…" : "Reserve"}
                  </Button>
                </div>
              ))}
            </div>

            {selectedMedicine.requiresPrescription && (
              <p className="text-xs text-warning-500 bg-warning-50 rounded-xl p-3">
                ⚠️ This medicine requires a valid prescription. Please carry it when collecting.
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
