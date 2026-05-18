"use client";

import { useState } from "react";
import { Search, FileText, MessageCircle, ChevronRight } from "lucide-react";
import { Avatar } from "@/src/components/ui/Avatar";
import { Badge } from "@/src/components/ui/Badge";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { MOCK_APPOINTMENTS } from "@/src/services/mock-data";
import { formatDate } from "@/src/lib/utils";

const PATIENTS = [
  { id: "p1", name: "Arjun Mehta",    age: 33, condition: "Viral Fever",    lastVisit: "2025-07-18", status: "completed" as const },
  { id: "p2", name: "Sonia Roy",      age: 28, condition: "Hypertension",   lastVisit: "2025-07-22", status: "pending"   as const },
  { id: "p3", name: "Pradeep Kumar",  age: 45, condition: "Diabetes Type 2", lastVisit: "2025-07-10", status: "confirmed" as const },
  { id: "p4", name: "Lakshmi Devi",   age: 55, condition: "Arthritis",      lastVisit: "2025-07-05", status: "completed" as const },
];

export function PatientListScreen() {
  const [query, setQuery] = useState("");

  const filtered = query
    ? PATIENTS.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : PATIENTS;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-neutral-900 font-display">Patient List</h2>
        <span className="text-sm text-neutral-500">{PATIENTS.length} total</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          className="input pl-10"
          placeholder="Search patient name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="w-6 h-6" />}
          title="No patients found"
          description="Try a different name"
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((patient) => (
            <div key={patient.id} className="card card-hover cursor-pointer">
              <div className="flex items-start gap-3">
                <Avatar name={patient.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-neutral-900 text-sm font-display">
                      {patient.name}
                    </p>
                    <span className="text-xs text-neutral-400">{patient.age}y</span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-0.5">{patient.condition}</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Last visit: {formatDate(patient.lastVisit)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    variant={
                      patient.status === "completed"
                        ? "neutral"
                        : patient.status === "confirmed"
                        ? "brand"
                        : "warning"
                    }
                    dot
                  >
                    {patient.status}
                  </Badge>
                  <div className="flex gap-1.5">
                    <button className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors">
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 hover:bg-brand-100 transition-colors">
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
