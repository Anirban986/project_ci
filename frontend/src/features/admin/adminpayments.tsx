"use client";

import { useState } from "react";
import {
  CreditCard, TrendingUp, AlertCircle,
  CheckCircle, XCircle, RefreshCw, Search,
  IndianRupee,
} from "lucide-react";
import { StatCard } from "@/src/components/admin/Statcard";
import { SectionCard, PeriodTabs } from "@/src/components/admin/Sectioncard ";
import { ChartLine } from "@/src/components/admin/Chartline";
import { ChartBar } from "@/src/components/admin/Chartbar";
import { AdminTable } from "@/src/components/admin/Admintable";
import { AdminHeader } from "@/src/components/admin/Adminheader ";
import { Badge } from "@/src/components/ui/Badge";
import { PAYMENT_STATS } from "@/src/services/admin/mock-admin-data";
import { formatCurrency, formatTime, cn } from "@/src/lib/utils";
import type { AdminPayment, PaymentStatus, PaymentMethod } from "@/src/types/admin";

const STATUS_BADGE: Record<PaymentStatus, { variant: "success" | "danger" | "warning" | "neutral"; label: string; icon: React.ElementType }> = {
  success:  { variant: "success", label: "Success",  icon: CheckCircle },
  failed:   { variant: "danger",  label: "Failed",   icon: XCircle     },
  refunded: { variant: "warning", label: "Refunded", icon: RefreshCw   },
  pending:  { variant: "neutral", label: "Pending",  icon: CreditCard  },
};

const METHOD_COLORS: Record<PaymentMethod, string> = {
  upi:        "#0a84ff",
  card:       "#a855f7",
  netbanking: "#22c55e",
  wallet:     "#f59e0b",
};

export function AdminPayments() {
  const [revPeriod, setRevPeriod]         = useState("Weekly");
  const [statusFilter, setStatusFilter]   = useState<"all" | PaymentStatus>("all");
  const [search, setSearch]               = useState("");

  const revData =
    revPeriod === "Daily"   ? PAYMENT_STATS.dailyRevenue   :
    revPeriod === "Weekly"  ? PAYMENT_STATS.weeklyRevenue  :
    PAYMENT_STATS.monthlyRevenue;

  const filtered = PAYMENT_STATS.recentPayments.filter((p) => {
    const matchSearch = !search ||
      p.patientName.toLowerCase().includes(search.toLowerCase()) ||
      p.doctorName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <AdminHeader title="Payments" subtitle="Revenue, transactions and failure tracking" />

      {/* KPI row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Revenue Today"
          value={formatCurrency(PAYMENT_STATS.revenueToday)}
          change={8.4}
          changeLabel="vs yesterday"
          trend={PAYMENT_STATS.dailyRevenue}
          color="teal"
          icon={<IndianRupee className="w-5 h-5" />}
        />
        <StatCard
          label="This Week"
          value={formatCurrency(PAYMENT_STATS.revenueThisWeek)}
          change={PAYMENT_STATS.weeklyGrowth}
          changeLabel="vs last week"
          color="brand"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          label="This Month"
          value={`₹${(PAYMENT_STATS.revenueThisMonth / 100000).toFixed(1)}L`}
          change={PAYMENT_STATS.monthlyGrowth}
          changeLabel="vs last month"
          color="purple"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          label="Failed Today"
          value={PAYMENT_STATS.failedToday}
          change={-2.1}
          changeLabel="vs yesterday"
          color="danger"
          icon={<AlertCircle className="w-5 h-5" />}
        />
      </div>

      {/* KPI row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Success Rate"
          value={`${PAYMENT_STATS.successRate}%`}
          change={0.8}
          changeLabel="vs last week"
          color="success"
          size="sm"
          icon={<CheckCircle className="w-4 h-4" />}
        />
        <StatCard
          label="Avg Transaction"
          value={formatCurrency(PAYMENT_STATS.avgTransactionValue)}
          color="brand"
          size="sm"
          icon={<CreditCard className="w-4 h-4" />}
        />
        <StatCard
          label="Failed This Week"
          value={PAYMENT_STATS.failedThisWeek}
          change={-5.2}
          changeLabel="vs last week"
          color="warning"
          size="sm"
          icon={<XCircle className="w-4 h-4" />}
        />
      </div>

      {/* Revenue chart + method breakdown */}
      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        <SectionCard
          title="Revenue Trend"
          className="lg:col-span-2"
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

        <SectionCard title="By Payment Method">
          <div className="space-y-4 pt-1">
            {(["upi", "card", "netbanking", "wallet"] as PaymentMethod[]).map((method) => {
              const val   = PAYMENT_STATS.byMethod[method];
              const total = Object.values(PAYMENT_STATS.byMethod).reduce((a, b) => a + b, 0);
              const pct   = Math.round((val / total) * 100);
              const labels: Record<PaymentMethod, string> = {
                upi: "UPI", card: "Card", netbanking: "Net Banking", wallet: "Wallet"
              };
              return (
                <div key={method}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-neutral-700">{labels[method]}</span>
                    <span className="text-neutral-500">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: METHOD_COLORS[method] }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="pt-3 border-t border-neutral-100 grid grid-cols-2 gap-3">
              <div className="bg-success-50 rounded-xl p-3 text-center">
                <p className="text-xs text-success-600 font-medium">Success Rate</p>
                <p className="font-bold text-success-700 text-lg">{PAYMENT_STATS.successRate}%</p>
              </div>
              <div className="bg-danger-50 rounded-xl p-3 text-center">
                <p className="text-xs text-danger-600 font-medium">Failure Rate</p>
                <p className="font-bold text-danger-700 text-lg">
                  {(100 - PAYMENT_STATS.successRate).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Growth comparison */}
      <div className="grid lg:grid-cols-2 gap-5 mb-6">
        <SectionCard title="Weekly Revenue Growth">
          <ChartBar
            data={PAYMENT_STATS.weeklyRevenue}
            color="#0a84ff"
            valuePrefix="₹"
            title="Last 4 weeks"
          />
        </SectionCard>
        <SectionCard title="Monthly Revenue Growth">
          <ChartBar
            data={PAYMENT_STATS.monthlyRevenue}
            color="#a855f7"
            valuePrefix="₹"
            title="Last 12 months"
          />
        </SectionCard>
      </div>

      {/* Transactions table */}
      <SectionCard
        title="Recent Transactions"
        subtitle={`${filtered.length} transactions`}
        noPad
        action={
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 text-neutral-600 bg-white"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        }
      >
        <div className="px-5 py-3 border-b border-neutral-50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input
              className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-xl bg-neutral-50 placeholder:text-neutral-400 focus:outline-none focus:border-brand-400"
              placeholder="Search patient or doctor…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="px-5 pb-5 pt-2">
          <AdminTable
            data={filtered as unknown as Record<string, unknown>[]}
            keyField="id"
            columns={[
              {
                key: "patientName", label: "Patient",
                render: (row) => (
                  <span className="font-medium text-neutral-900">
                    {(row as unknown as AdminPayment).patientName}
                  </span>
                ),
              },
              {
                key: "doctorName", label: "Doctor",
                render: (row) => (
                  <span className="text-neutral-600">
                    {(row as unknown as AdminPayment).doctorName}
                  </span>
                ),
              },
              {
                key: "method", label: "Method",
                render: (row) => {
                  const p = row as unknown as AdminPayment;
                  const labels: Record<PaymentMethod, string> = {
                    upi: "UPI", card: "Card", netbanking: "Net Banking", wallet: "Wallet"
                  };
                  return (
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-lg"
                      style={{
                        backgroundColor: METHOD_COLORS[p.method] + "20",
                        color: METHOD_COLORS[p.method],
                      }}
                    >
                      {labels[p.method]}
                    </span>
                  );
                },
              },
              {
                key: "status", label: "Status",
                render: (row) => {
                  const p = row as unknown as AdminPayment;
                  const b = STATUS_BADGE[p.status];
                  const Icon = b.icon;
                  return (
                    <Badge variant={b.variant}>
                      <Icon className="w-3 h-3" />
                      {b.label}
                    </Badge>
                  );
                },
              },
              {
                key: "amount", label: "Amount",
                align: "right",
                render: (row) => {
                  const p = row as unknown as AdminPayment;
                  return (
                    <span className={cn(
                      "font-bold",
                      p.status === "failed" ? "text-danger-500 line-through" : "text-neutral-900"
                    )}>
                      {formatCurrency(p.amount)}
                    </span>
                  );
                },
              },
              {
                key: "failureReason", label: "Note",
                render: (row) => {
                  const p = row as unknown as AdminPayment;
                  return p.failureReason
                    ? <span className="text-xs text-danger-500">{p.failureReason}</span>
                    : <span className="text-neutral-300">—</span>;
                },
              },
              {
                key: "timestamp", label: "Time",
                render: (row) => (
                  <span className="text-xs text-neutral-400">
                    {formatTime((row as unknown as AdminPayment).timestamp)}
                  </span>
                ),
              },
            ]}
          />
        </div>
      </SectionCard>
    </div>
  );
}