"use client";

import { useState } from "react";
import { Stethoscope, CheckCircle, Clock, WifiOff, Star, Search } from "lucide-react";
import { StatCard } from "@/src/components/admin/Statcard";
import { SectionCard } from "@/src/components/admin/Sectioncard ";
import { AdminTable } from "@/src/components/admin/Admintable";
import { AdminHeader } from "@/src/components/admin/Adminheader ";
import { Badge } from "@/src/components/ui/Badge";
import { Avatar } from "@/src/components/ui/Avatar";
import { DOCTOR_STATS, ADMIN_DOCTORS } from "@/src/services/admin/mock-admin-data";
import { formatCurrency, formatDate, cn } from "@/src/lib/utils";
import type { AdminDoctor } from "@/src/types/admin";

const STATUS_CONFIG: Record<AdminDoctor["status"], { variant: "success" | "warning" | "neutral" | "danger"; label: string }> = {
  available:  { variant: "success", label: "Available"  },
  busy:       { variant: "warning", label: "Busy"       },
  offline:    { variant: "neutral", label: "Offline"    },
  suspended:  { variant: "danger",  label: "Suspended"  },
};

const VERIFY_CONFIG: Record<AdminDoctor["verificationStatus"], { variant: "success" | "warning" | "danger"; label: string }> = {
  verified: { variant: "success", label: "Verified" },
  pending:  { variant: "warning", label: "Pending"  },
  rejected: { variant: "danger",  label: "Rejected" },
};

export function AdminDoctors() {
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState<"all" | AdminDoctor["status"]>("all");

  const filtered = ADMIN_DOCTORS.filter((d) => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.specialization.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <AdminHeader title="Doctors" subtitle="All registered doctors and their activity" />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Doctors"        value={DOCTOR_STATS.total}               color="brand"   icon={<Stethoscope className="w-5 h-5" />} />
        <StatCard label="Available Today"      value={DOCTOR_STATS.availableToday}      color="success" icon={<CheckCircle className="w-5 h-5" />} />
        <StatCard label="Pending Verification" value={DOCTOR_STATS.pendingVerification} color="warning" icon={<Clock className="w-5 h-5" />} />
        <StatCard label="Offline Now"          value={DOCTOR_STATS.offline}             color="teal" icon={<WifiOff className="w-5 h-5" />} />
      </div>

      {/* Specialization + top doctors */}
      <div className="grid lg:grid-cols-2 gap-5 mb-6">
        <SectionCard title="By Specialization">
          <div className="space-y-3">
            {DOCTOR_STATS.bySpecialization.map((item) => {
              const pct = Math.round((item.count / DOCTOR_STATS.total) * 100);
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-700 font-medium">{item.label}</span>
                    <span className="text-neutral-500">{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-2 rounded-full bg-brand-400" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Top Performing Doctors">
          <div className="space-y-3">
            {DOCTOR_STATS.topDoctors.map((doc, i) => (
              <div key={doc.name} className="flex items-center gap-3">
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                  i === 0 ? "bg-amber-100 text-amber-600" :
                  i === 1 ? "bg-neutral-200 text-neutral-600" :
                  "bg-orange-100 text-orange-600"
                )}>
                  {i + 1}
                </span>
                <Avatar name={doc.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate">{doc.name}</p>
                  <p className="text-xs text-neutral-400">{doc.consultations} consultations</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold flex-shrink-0">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {doc.rating}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Doctors table */}
      <SectionCard
        title="All Doctors"
        subtitle={`${filtered.length} doctors`}
        noPad
        action={
          <select
            value={statusFilter}
            onChange={(e) => setStatus(e.target.value as typeof statusFilter)}
            className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 text-neutral-600 bg-white"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="offline">Offline</option>
            <option value="suspended">Suspended</option>
          </select>
        }
      >
        <div className="px-5 py-3 border-b border-neutral-50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input
              className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-xl bg-neutral-50 placeholder:text-neutral-400 focus:outline-none focus:border-brand-400"
              placeholder="Search name or specialty…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="px-5 pb-5">
          <AdminTable
            data={filtered as unknown as Record<string, unknown>[]}
            keyField="id"
            columns={[
              {
                key: "name", label: "Doctor",
                render: (row) => {
                  const d = row as unknown as AdminDoctor;
                  return (
                    <div className="flex items-center gap-2.5">
                      <Avatar name={d.name} size="sm" />
                      <div>
                        <p className="font-medium text-neutral-900 text-sm">{d.name}</p>
                        <p className="text-xs text-neutral-400">{d.specialization}</p>
                      </div>
                    </div>
                  );
                },
              },
              { key: "hospital", label: "Hospital",
                render: (row) => <span className="text-neutral-600 text-sm">{(row as unknown as AdminDoctor).hospital}</span> },
              { key: "status", label: "Status",
                render: (row) => {
                  const d = row as unknown as AdminDoctor;
                  const c = STATUS_CONFIG[d.status];
                  return <Badge variant={c.variant} dot>{c.label}</Badge>;
                },
              },
              { key: "verificationStatus", label: "Verified",
                render: (row) => {
                  const d = row as unknown as AdminDoctor;
                  const c = VERIFY_CONFIG[d.verificationStatus];
                  return <Badge variant={c.variant}>{c.label}</Badge>;
                },
              },
              { key: "consultationsToday", label: "Today", align: "center",
                render: (row) => <span className="font-medium">{(row as unknown as AdminDoctor).consultationsToday}</span> },
              { key: "totalConsultations", label: "Total", align: "center",
                render: (row) => <span className="font-medium">{(row as unknown as AdminDoctor).totalConsultations}</span> },
              { key: "rating", label: "Rating", align: "center",
                render: (row) => {
                  const d = row as unknown as AdminDoctor;
                  return (
                    <span className="flex items-center gap-1 justify-center text-amber-500 font-semibold text-sm">
                      <Star className="w-3 h-3 fill-amber-400" />{d.rating}
                    </span>
                  );
                },
              },
              { key: "revenueGenerated", label: "Revenue", align: "right",
                render: (row) => <span className="font-semibold text-neutral-800">{formatCurrency((row as unknown as AdminDoctor).revenueGenerated)}</span> },
            ]}
          />
        </div>
      </SectionCard>
    </div>
  );
}