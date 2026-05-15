"use client";

import { useState } from "react";
import {
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  Bell,
  XCircle,
} from "lucide-react";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { MOCK_PHARMACY, MOCK_RESERVATIONS } from "@/src/services/mock-data";
import { formatDate, formatTime } from "@/src/lib/utils";

const STATS = [
  { label: "Reservations", value: "3",  icon: ShoppingBag, color: "bg-brand-50 text-brand-500" },
  { label: "Ready",         value: "1",  icon: CheckCircle2, color: "bg-success-50 text-success-600" },
  { label: "Low Stock",     value: "2",  icon: AlertTriangle, color: "bg-warning-50 text-warning-500" },
  { label: "Out of Stock",  value: "1",  icon: Package,      color: "bg-danger-50 text-danger-500" },
];

const PENDING_RESERVATIONS = [
  {
    id: "r1",
    patientName: "Arjun Mehta",
    medicine: "Paracetamol 500mg",
    qty: 2,
    time: "2025-07-21T10:00:00Z",
    status: "pending" as const,
  },
  {
    id: "r2",
    patientName: "Sonia Roy",
    medicine: "Metformin 500mg",
    qty: 1,
    time: "2025-07-21T09:30:00Z",
    status: "pending" as const,
  },
  {
    id: "r3",
    patientName: "Pradeep Kumar",
    medicine: "Cetirizine 10mg",
    qty: 3,
    time: "2025-07-21T08:45:00Z",
    status: "ready" as const,
  },
];

export function PharmacyDashboard() {
  const pharmacy = MOCK_PHARMACY;
  const [reservations, setReservations] = useState(PENDING_RESERVATIONS);

  const markReady = (id: string) =>
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "ready" as const } : r))
    );

  const markCollected = (id: string) =>
    setReservations((prev) => prev.filter((r) => r.id !== id));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="font-bold text-neutral-900 font-display text-lg">{pharmacy.name}</h1>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="success" dot>Open</Badge>
          <span className="text-xs text-neutral-500">{pharmacy.openingHours}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {STATS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card text-center py-3 px-1">
            <div className={`w-7 h-7 rounded-xl ${color} flex items-center justify-center mx-auto mb-1.5`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <p className="font-bold text-neutral-900 text-lg leading-none">{value}</p>
            <p className="text-[10px] text-neutral-500 mt-1 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Reservations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="section-title">Reservations</p>
          <span className="flex items-center gap-1 text-xs text-warning-500 font-medium">
            <Bell className="w-3.5 h-3.5" />
            {reservations.filter((r) => r.status === "pending").length} pending
          </span>
        </div>

        <div className="space-y-3">
          {reservations.map((res) => (
            <div key={res.id} className="card">
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    res.status === "ready" ? "bg-success-50" : "bg-brand-50"
                  }`}
                >
                  {res.status === "ready" ? (
                    <CheckCircle2 className="w-5 h-5 text-success-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-brand-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-900 text-sm font-display">
                    {res.patientName}
                  </p>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    {res.medicine} × {res.qty}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {formatTime(res.time)} · {formatDate(res.time)}
                  </p>
                </div>
                <Badge
                  variant={res.status === "ready" ? "success" : "warning"}
                  dot
                >
                  {res.status === "ready" ? "Ready" : "Pending"}
                </Badge>
              </div>

              <div className="flex gap-2">
                {res.status === "pending" ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      fullWidth
                      icon={<XCircle className="w-3.5 h-3.5" />}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => markReady(res.id)}
                    >
                      Mark Ready
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    onClick={() => markCollected(res.id)}
                  >
                    Mark Collected
                  </Button>
                )}
              </div>
            </div>
          ))}

          {reservations.length === 0 && (
            <div className="card text-center py-8">
              <p className="text-neutral-400 text-sm">No reservations at the moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
