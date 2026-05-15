"use client";

import {
  Users, Stethoscope, MessageSquare, Bot,
  CreditCard, TrendingUp, Activity, AlertCircle,
} from "lucide-react";
import { StatCard } from "@/src/components/admin/Statcard";
import { SectionCard, PeriodTabs } from "@/src/components/admin/Sectioncard ";
import { ChartLine } from "@/src/components/admin/Chartline";
import { ChartBar } from "@/src/components/admin/Chartbar";
import { AdminHeader } from "@/src/components/admin/Adminheader ";
import { Badge } from "@/src/components/ui/Badge";
import {
  USER_GROWTH_STATS, DOCTOR_STATS, CONSULTATION_STATS,
  AI_USAGE_STATS, PAYMENT_STATS, SYSTEM_HEALTH_STATS,
} from "@/src/services/admin/mock-admin-data";
import { formatCurrency } from "@/src/lib/utils";
import { useState } from "react";

const ALERTS = [
  { level: "error",   message: "Search Service is down — pods crash-looping", time: "14 min ago" },
  { level: "warning", message: "Video Service latency elevated (320ms avg)",   time: "44 min ago" },
  { level: "warning", message: "Network I/O at 82% capacity",                  time: "1 hr ago"   },
];

export function AdminDashboard() {
  const [consultPeriod, setConsultPeriod] = useState("Daily");
  const [revPeriod, setRevPeriod]         = useState("Weekly");

  const consultData =
    consultPeriod === "Daily"   ? CONSULTATION_STATS.dailyTrend   :
    consultPeriod === "Weekly"  ? CONSULTATION_STATS.weeklyTrend  :
    CONSULTATION_STATS.monthlyTrend;

  const revData =
    revPeriod === "Weekly"  ? PAYMENT_STATS.weeklyRevenue :
    revPeriod === "Monthly" ? PAYMENT_STATS.monthlyRevenue :
    PAYMENT_STATS.dailyRevenue;

  return (
    <div>
      <AdminHeader
        title="Dashboard"
        subtitle="Platform overview at a glance"
      />

      {/* Alerts banner */}
      {ALERTS.length > 0 && (
        <div className="mb-6 space-y-2">
          {ALERTS.map((a, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                a.level === "error"
                  ? "bg-danger-50 border border-danger-100 text-danger-700"
                  : "bg-warning-50 border border-warning-100 text-warning-700"
              }`}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{a.message}</span>
              <span className="text-xs opacity-60 flex-shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* Top KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Users"
          value={USER_GROWTH_STATS.totalUsers}
          change={8.4}
          changeLabel="vs last month"
          trend={USER_GROWTH_STATS.dailyGrowth}
          color="brand"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="Total Doctors"
          value={DOCTOR_STATS.total}
          change={3.2}
          changeLabel="vs last month"
          color="success"
          icon={<Stethoscope className="w-5 h-5" />}
        />
        <StatCard
          label="Consultations Today"
          value={CONSULTATION_STATS.totalToday}
          change={12.1}
          changeLabel="vs yesterday"
          trend={CONSULTATION_STATS.dailyTrend}
          color="purple"
          icon={<MessageSquare className="w-5 h-5" />}
        />
        <StatCard
          label="Revenue Today"
          value={formatCurrency(PAYMENT_STATS.revenueToday)}
          change={PAYMENT_STATS.weeklyGrowth}
          changeLabel="vs last week"
          trend={PAYMENT_STATS.dailyRevenue}
          color="teal"
          icon={<CreditCard className="w-5 h-5" />}
        />
      </div>

      {/* Second KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Active Users Today"
          value={USER_GROWTH_STATS.activeToday}
          change={5.8}
          changeLabel="vs yesterday"
          color="brand"
          size="sm"
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <StatCard
          label="AI Requests Today"
          value={AI_USAGE_STATS.requestsToday}
          change={15.2}
          changeLabel="vs yesterday"
          color="warning"
          size="sm"
          icon={<Bot className="w-4 h-4" />}
        />
        <StatCard
          label="Doctors Available"
          value={DOCTOR_STATS.availableToday}
          color="success"
          size="sm"
          icon={<Stethoscope className="w-4 h-4" />}
        />
        <StatCard
          label="Failed Payments"
          value={PAYMENT_STATS.failedToday}
          change={-2.1}
          changeLabel="vs yesterday"
          color="danger"
          size="sm"
          icon={<AlertCircle className="w-4 h-4" />}
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-5 mb-6">
        <SectionCard
          title="Consultations"
          action={
            <PeriodTabs
              active={consultPeriod}
              options={["Daily", "Weekly", "Monthly"]}
              onChange={setConsultPeriod}
            />
          }
        >
          <ChartBar data={consultData} color="#a855f7" valueSuffix=" consults" />
        </SectionCard>

        <SectionCard
          title="Revenue"
          action={
            <PeriodTabs
              active={revPeriod}
              options={["Daily", "Weekly", "Monthly"]}
              onChange={setRevPeriod}
            />
          }
        >
          <ChartLine data={revData} color="#14b8a6" valuePrefix="₹" />
        </SectionCard>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* System status */}
        <SectionCard title="System Status">
          <div className="space-y-2.5">
            {SYSTEM_HEALTH_STATS.services.slice(0, 5).map((svc) => (
              <div key={svc.name} className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  svc.status === "healthy"  ? "bg-success-500" :
                  svc.status === "degraded" ? "bg-warning-500" :
                  "bg-danger-500"}`}
                />
                <span className="text-sm text-neutral-700 flex-1 truncate">{svc.name}</span>
                <span className={`text-xs font-semibold ${
                  svc.status === "healthy"  ? "text-success-600" :
                  svc.status === "degraded" ? "text-warning-500" :
                  "text-danger-600"}`}
                >
                  {svc.status}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Consultation mode breakdown */}
        <SectionCard title="Consult Mode Split">
          <div className="space-y-3">
            {(["ai", "video", "in-person"] as const).map((mode) => {
              const val = CONSULTATION_STATS.byMode[mode];
              const total = Object.values(CONSULTATION_STATS.byMode).reduce((a, b) => a + b, 0);
              const pct = Math.round((val / total) * 100);
              const colors = { ai: "#0a84ff", video: "#a855f7", "in-person": "#22c55e" };
              const labels = { ai: "AI Consult", video: "Video Call", "in-person": "In-Person" };
              return (
                <div key={mode}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-600 font-medium">{labels[mode]}</span>
                    <span className="text-neutral-500">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: colors[mode] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Payment method split */}
        <SectionCard title="Payment Methods">
          <div className="space-y-3">
            {(["upi", "card", "netbanking", "wallet"] as const).map((method) => {
              const val = PAYMENT_STATS.byMethod[method];
              const total = Object.values(PAYMENT_STATS.byMethod).reduce((a, b) => a + b, 0);
              const pct = Math.round((val / total) * 100);
              const colors = { upi: "#0a84ff", card: "#a855f7", netbanking: "#22c55e", wallet: "#f59e0b" };
              return (
                <div key={method}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-600 font-medium capitalize">{method}</span>
                    <span className="text-neutral-500">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: colors[method] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}