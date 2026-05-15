"use client";

import { useState } from "react";
import { MessageSquare, Video, MapPin, Bot, Clock, CheckCircle } from "lucide-react";
import { StatCard } from "@/src/components/admin/Statcard";
import { SectionCard, PeriodTabs } from "@/src/components/admin/Sectioncard ";
import { ChartBar } from "@/src/components//admin/Chartbar";
import { ChartLine } from "@/src/components/admin/Chartline";
import { AdminTable } from "@/src/components/admin/Admintable";
import { AdminHeader } from "@/src/components/admin/Adminheader ";
import { Badge } from "@/src/components/ui/Badge";
import { CONSULTATION_STATS } from "@/src/services/admin/mock-admin-data";
import { formatTime, formatDate, cn } from "@/src/lib/utils";
import type { AdminConsultation, ConsultationMode, ConsultationStatus } from "@/src/types/admin";

const MODE_CONFIG: Record<ConsultationMode, { icon: React.ElementType; color: string; label: string }> = {
  ai:         { icon: Bot,        color: "text-brand-500 bg-brand-50",   label: "AI"        },
  video:      { icon: Video,      color: "text-purple-500 bg-purple-50", label: "Video"     },
  "in-person":{ icon: MapPin,     color: "text-success-600 bg-success-50",label: "In-Person" },
};

const STATUS_BADGE: Record<ConsultationStatus, { variant: "success" | "warning" | "neutral" | "danger"; label: string }> = {
  completed: { variant: "success", label: "Completed" },
  ongoing:   { variant: "brand" as "success",   label: "Ongoing"   },
  cancelled: { variant: "danger",  label: "Cancelled" },
  "no-show": { variant: "neutral", label: "No Show"   },
};

export function AdminConsultations() {
  const [period, setPeriod] = useState("Daily");

  const trendData =
    period === "Daily"   ? CONSULTATION_STATS.dailyTrend   :
    period === "Weekly"  ? CONSULTATION_STATS.weeklyTrend  :
    CONSULTATION_STATS.monthlyTrend;

  const periodValue =
    period === "Daily"   ? CONSULTATION_STATS.totalToday     :
    period === "Weekly"  ? CONSULTATION_STATS.totalThisWeek  :
    CONSULTATION_STATS.totalThisMonth;

  return (
    <div>
      <AdminHeader title="Consultations" subtitle="All consultation activity across modes" />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Today"         value={CONSULTATION_STATS.totalToday}     change={12.1} changeLabel="vs yesterday"   trend={CONSULTATION_STATS.dailyTrend}   color="purple" icon={<MessageSquare className="w-5 h-5" />} />
        <StatCard label="This Week"     value={CONSULTATION_STATS.totalThisWeek}  change={8.4}  changeLabel="vs last week"   color="brand"   icon={<MessageSquare className="w-5 h-5" />} />
        <StatCard label="This Month"    value={CONSULTATION_STATS.totalThisMonth} change={18.7} changeLabel="vs last month"  color="teal"    icon={<MessageSquare className="w-5 h-5" />} />
        <StatCard label="Ongoing Now"   value={CONSULTATION_STATS.ongoingNow}     color="success" icon={<CheckCircle className="w-5 h-5" />} />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Avg Duration (min)" value={CONSULTATION_STATS.avgDuration}          color="brand"   size="sm" icon={<Clock className="w-4 h-4" />} />
        <StatCard label="Completion Rate"    value={`${CONSULTATION_STATS.completionRate}%`} color="success" size="sm" icon={<CheckCircle className="w-4 h-4" />} />
        <StatCard label="AI Consults"        value={CONSULTATION_STATS.byMode.ai}            color="warning" size="sm" icon={<Bot className="w-4 h-4" />} />
      </div>

      {/* Trend + mode split */}
      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        <SectionCard
          title={`Consultations — ${period}`}
          subtitle={`${periodValue.toLocaleString()} total`}
          className="lg:col-span-2"
          action={
            <PeriodTabs active={period} options={["Daily", "Weekly", "Monthly"]} onChange={setPeriod} />
          }
        >
          <ChartLine data={trendData} color="#a855f7" valueSuffix=" consults" />
        </SectionCard>

        <SectionCard title="By Mode">
          <div className="space-y-4 pt-1">
            {(["ai", "video", "in-person"] as ConsultationMode[]).map((mode) => {
              const cfg   = MODE_CONFIG[mode];
              const Icon  = cfg.icon;
              const val   = CONSULTATION_STATS.byMode[mode];
              const total = Object.values(CONSULTATION_STATS.byMode).reduce((a, b) => a + b, 0);
              const pct   = Math.round((val / total) * 100);
              const barColors: Record<ConsultationMode, string> = { ai: "#0a84ff", video: "#a855f7", "in-person": "#22c55e" };
              return (
                <div key={mode}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0", cfg.color)}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-medium text-neutral-700 flex-1">{cfg.label}</span>
                    <span className="text-sm text-neutral-500">{val.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: barColors[mode] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* Recent consultations table */}
      <SectionCard title="Recent Consultations" subtitle="Latest activity" noPad>
        <div className="px-5 pb-5 pt-2">
          <AdminTable
            data={CONSULTATION_STATS.recentConsultations as unknown as Record<string, unknown>[]}
            keyField="id"
            columns={[
              { key: "patientName", label: "Patient",
                render: (row) => <span className="font-medium text-neutral-900">{(row as unknown as AdminConsultation).patientName}</span> },
              { key: "doctorName",  label: "Doctor / AI",
                render: (row) => <span className="text-neutral-600">{(row as unknown as AdminConsultation).doctorName}</span> },
              { key: "mode", label: "Mode",
                render: (row) => {
                  const c = row as unknown as AdminConsultation;
                  const cfg  = MODE_CONFIG[c.mode];
                  const Icon = cfg.icon;
                  return (
                    <span className={cn("flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full w-fit", cfg.color)}>
                      <Icon className="w-3 h-3" />{cfg.label}
                    </span>
                  );
                },
              },
              { key: "status", label: "Status",
                render: (row) => {
                  const c = row as unknown as AdminConsultation;
                  const b = STATUS_BADGE[c.status];
                  return <Badge variant={b.variant} dot>{b.label}</Badge>;
                },
              },
              { key: "duration", label: "Duration", align: "center",
                render: (row) => {
                  const c = row as unknown as AdminConsultation;
                  return <span className="text-neutral-500">{c.duration > 0 ? `${c.duration} min` : "—"}</span>;
                },
              },
              { key: "fee", label: "Fee", align: "right",
                render: (row) => {
                  const c = row as unknown as AdminConsultation;
                  return <span className="font-medium text-neutral-800">{c.fee > 0 ? `₹${c.fee}` : "Free"}</span>;
                },
              },
              { key: "startedAt", label: "Time",
                render: (row) => <span className="text-neutral-400 text-xs">{formatTime((row as unknown as AdminConsultation).startedAt)}</span> },
            ]}
          />
        </div>
      </SectionCard>
    </div>
  );
}