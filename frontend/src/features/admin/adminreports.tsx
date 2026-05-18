"use client";

import { useState } from "react";
import {
  FileBarChart, FileText, CheckCircle,
  Clock, Pill, Stethoscope, Download,
} from "lucide-react";
import { StatCard } from "@/src/components/admin/Statcard";
import { SectionCard, PeriodTabs } from "@/src/components/admin/Sectioncard ";
import { ChartBar } from "@/src/components/admin/Chartbar";
import { AdminTable } from "@/src/components/admin/Admintable";
import { AdminHeader } from "@/src/components/admin/Adminheader ";
import { Badge } from "@/src/components/ui/Badge";
import { REPORT_STATS } from "@/src/services/admin/mock-admin-data";
import { formatDate, formatTime, cn } from "@/src/lib/utils";
import type { AdminPrescription } from "@/src/types/admin";

export function AdminReports() {
  const [period, setPeriod] = useState("Monthly");

  return (
    <div>
      <AdminHeader
        title="Reports & Prescriptions"
        subtitle="Prescription issuance, medicine trends and diagnoses"
        actions={
          <button className="flex items-center gap-2 text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Prescriptions"
          value={REPORT_STATS.totalPrescriptions}
          change={14.2}
          changeLabel="vs last month"
          color="brand"
          icon={<FileText className="w-5 h-5" />}
        />
        <StatCard
          label="Issued Today"
          value={REPORT_STATS.prescriptionsToday}
          change={8.1}
          changeLabel="vs yesterday"
          color="purple"
          icon={<FileBarChart className="w-5 h-5" />}
        />
        <StatCard
          label="Dispensed Today"
          value={REPORT_STATS.dispensedToday}
          color="success"
          icon={<CheckCircle className="w-5 h-5" />}
        />
        <StatCard
          label="Pending Dispense"
          value={REPORT_STATS.pendingDispense}
          color="warning"
          icon={<Clock className="w-5 h-5" />}
        />
      </div>

      {/* Prescription trend + dispense rate */}
      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        <SectionCard
          title="Prescriptions Over Time"
          className="lg:col-span-2"
          action={
            <PeriodTabs
              active={period}
              options={["Monthly"]}
              onChange={setPeriod}
            />
          }
        >
          <ChartBar
            data={REPORT_STATS.monthlyPrescriptions}
            color="#a855f7"
            valueSuffix=" prescriptions"
          />
        </SectionCard>

        <SectionCard title="Dispense Summary">
          <div className="space-y-4 pt-1">
            {/* Donut-style visual */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  {/* Background circle */}
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                  {/* Progress */}
                  <circle
                    cx="18" cy="18" r="15.9"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3"
                    strokeDasharray={`${Math.round((REPORT_STATS.dispensedToday / REPORT_STATS.prescriptionsToday) * 100)} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xl font-bold text-neutral-900">
                    {Math.round((REPORT_STATS.dispensedToday / REPORT_STATS.prescriptionsToday) * 100)}%
                  </p>
                  <p className="text-[10px] text-neutral-400 font-medium">Dispensed</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-success-50 rounded-xl p-3 text-center">
                <p className="text-xs text-success-600 font-medium">Dispensed</p>
                <p className="font-bold text-success-700 text-lg">{REPORT_STATS.dispensedToday}</p>
              </div>
              <div className="bg-warning-50 rounded-xl p-3 text-center">
                <p className="text-xs text-warning-600 font-medium">Pending</p>
                <p className="font-bold text-warning-700 text-lg">{REPORT_STATS.pendingDispense}</p>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-xl p-3 text-center">
              <p className="text-xs text-neutral-500">Total issued today</p>
              <p className="font-bold text-neutral-900 text-xl">{REPORT_STATS.prescriptionsToday}</p>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Top medicines + top diagnoses */}
      <div className="grid lg:grid-cols-2 gap-5 mb-6">

        <SectionCard
          title="Top Prescribed Medicines"
          subtitle="Most frequently prescribed this month"
          action={
            <span className="flex items-center gap-1.5 text-xs text-brand-600 bg-brand-50 px-2 py-1 rounded-lg font-medium">
              <Pill className="w-3.5 h-3.5" />
              Medicines
            </span>
          }
        >
          <div className="space-y-2.5 pt-1">
            {REPORT_STATS.topMedicines.map((item, i) => {
              const max = REPORT_STATS.topMedicines[0].count;
              const pct = Math.round((item.count / max) * 100);
              return (
                <div key={item.name} className="flex items-center gap-3">
                  <span className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0",
                    i === 0 ? "bg-amber-100 text-amber-600" :
                    i === 1 ? "bg-neutral-200 text-neutral-500" :
                    i === 2 ? "bg-orange-100 text-orange-600" :
                    "bg-neutral-100 text-neutral-400"
                  )}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-neutral-700 truncate">{item.name}</span>
                      <span className="text-neutral-400 ml-2 flex-shrink-0">{item.count.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-1.5 rounded-full bg-brand-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="Top Diagnoses"
          subtitle="Most common conditions this month"
          action={
            <span className="flex items-center gap-1.5 text-xs text-success-600 bg-success-50 px-2 py-1 rounded-lg font-medium">
              <Stethoscope className="w-3.5 h-3.5" />
              Conditions
            </span>
          }
        >
          <div className="space-y-2.5 pt-1">
            {REPORT_STATS.topDiagnoses.map((item, i) => {
              const max = REPORT_STATS.topDiagnoses[0].count;
              const pct = Math.round((item.count / max) * 100);
              const colors = ["#0a84ff", "#a855f7", "#22c55e", "#f59e0b", "#f43f5e", "#14b8a6"];
              return (
                <div key={item.name} className="flex items-center gap-3">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: colors[i % colors.length] }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-neutral-700 truncate">{item.name}</span>
                      <span className="text-neutral-400 ml-2 flex-shrink-0">{item.count.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length] }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* Recent prescriptions table */}
      <SectionCard title="Recent Prescriptions" subtitle="Latest issued prescriptions" noPad>
        <div className="px-5 pb-5 pt-2">
          <AdminTable
            data={REPORT_STATS.recentPrescriptions as unknown as Record<string, unknown>[]}
            keyField="id"
            columns={[
              {
                key: "patientName", label: "Patient",
                render: (row) => (
                  <span className="font-medium text-neutral-900">
                    {(row as unknown as AdminPrescription).patientName}
                  </span>
                ),
              },
              {
                key: "doctorName", label: "Doctor",
                render: (row) => (
                  <span className="text-neutral-600">
                    {(row as unknown as AdminPrescription).doctorName}
                  </span>
                ),
              },
              {
                key: "medicineCount", label: "Medicines",
                align: "center",
                render: (row) => {
                  const p = row as unknown as AdminPrescription;
                  return (
                    <span className="flex items-center justify-center gap-1 text-brand-600 font-semibold">
                      <Pill className="w-3.5 h-3.5" />
                      {p.medicineCount}
                    </span>
                  );
                },
              },
              {
                key: "dispensed", label: "Status",
                render: (row) => {
                  const p = row as unknown as AdminPrescription;
                  return (
                    <Badge variant={p.dispensed ? "success" : "warning"} dot>
                      {p.dispensed ? "Dispensed" : "Pending"}
                    </Badge>
                  );
                },
              },
              {
                key: "issuedAt", label: "Issued",
                render: (row) => (
                  <span className="text-neutral-500 text-xs">
                    {formatDate((row as unknown as AdminPrescription).issuedAt)}
                  </span>
                ),
              },
              {
                key: "validUntil", label: "Valid Until",
                render: (row) => {
                  const p = row as unknown as AdminPrescription;
                  const expired = new Date(p.validUntil) < new Date();
                  return (
                    <span className={cn("text-xs", expired ? "text-danger-500" : "text-neutral-500")}>
                      {formatDate(p.validUntil)}
                    </span>
                  );
                },
              },
            ]}
          />
        </div>
      </SectionCard>
    </div>
  );
}