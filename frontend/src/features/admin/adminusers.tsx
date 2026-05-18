"use client";

import { useState } from "react";
import { Users, UserCheck, UserPlus, TrendingUp, Search, Filter } from "lucide-react";
import { StatCard } from "@/src/components/admin/Statcard";
import { SectionCard, PeriodTabs } from "@/src/components/admin/Sectioncard ";
import { ChartBar } from "@/src/components/admin/Chartbar";
import { ChartLine } from "@/src/components/admin/Chartline";
import { AdminTable } from "@/src/components/admin/Admintable";
import { AdminHeader } from "@/src/components/admin/Adminheader ";
import { Badge } from "@/src/components/ui/Badge";
import { Avatar } from "@/src/components/ui/Avatar";
import { USER_GROWTH_STATS, ADMIN_USERS } from "@/src/services/admin/mock-admin-data";
import { formatDate, cn } from "@/src/lib/utils";
import type { AdminUser } from "@/src/types/admin";

const STATUS_BADGE: Record<AdminUser["status"], { variant: "success" | "neutral" | "danger"; label: string }> = {
  active:   { variant: "success", label: "Active"   },
  inactive: { variant: "neutral", label: "Inactive" },
  banned:   { variant: "danger",  label: "Banned"   },
};

const ROLE_BADGE: Record<AdminUser["role"], { variant: "brand" | "success" | "warning"; label: string }> = {
  patient:  { variant: "brand",   label: "Patient"  },
  doctor:   { variant: "success", label: "Doctor"   },
  pharmacy: { variant: "warning", label: "Pharmacy" },
};

export function AdminUsers() {
  const [growthPeriod, setGrowthPeriod] = useState("Daily");
  const [search, setSearch]             = useState("");
  const [roleFilter, setRoleFilter]     = useState<"all" | AdminUser["role"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminUser["status"]>("all");

  const growthData =
    growthPeriod === "Daily"   ? USER_GROWTH_STATS.dailyGrowth   :
    growthPeriod === "Weekly"  ? USER_GROWTH_STATS.weeklyGrowth  :
    USER_GROWTH_STATS.monthlyGrowth;

  const filtered = ADMIN_USERS.filter((u) => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === "all"   || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div>
      <AdminHeader title="Users" subtitle="All registered patients, doctors, and pharmacies" />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users"       value={USER_GROWTH_STATS.totalUsers}   change={8.4}  changeLabel="vs last month" trend={USER_GROWTH_STATS.dailyGrowth}   color="brand"   icon={<Users className="w-5 h-5" />} />
        <StatCard label="Active Today"      value={USER_GROWTH_STATS.activeToday}  change={5.8}  changeLabel="vs yesterday"  color="success" icon={<UserCheck className="w-5 h-5" />} />
        <StatCard label="New This Week"     value={USER_GROWTH_STATS.newThisWeek}  change={11.2} changeLabel="vs last week"  color="purple"  icon={<UserPlus className="w-5 h-5" />} />
        <StatCard label="New This Month"    value={USER_GROWTH_STATS.newThisMonth} change={18.7} changeLabel="vs last month" color="teal"    icon={<TrendingUp className="w-5 h-5" />} />
      </div>

      {/* Growth chart + role breakdown */}
      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        <SectionCard
          title="User Growth"
          className="lg:col-span-2"
          action={
            <PeriodTabs
              active={growthPeriod}
              options={["Daily", "Weekly", "Monthly"]}
              onChange={setGrowthPeriod}
            />
          }
        >
          <ChartBar data={growthData} color="#0a84ff" valueSuffix=" users" />
        </SectionCard>

        <SectionCard title="Users by Role">
          <div className="space-y-4 pt-1">
            {[
              { label: "Patients",   value: USER_GROWTH_STATS.byRole.patient,  color: "#0a84ff", pct: Math.round((USER_GROWTH_STATS.byRole.patient  / USER_GROWTH_STATS.totalUsers) * 100) },
              { label: "Doctors",    value: USER_GROWTH_STATS.byRole.doctor,   color: "#22c55e", pct: Math.round((USER_GROWTH_STATS.byRole.doctor   / USER_GROWTH_STATS.totalUsers) * 100) },
              { label: "Pharmacies", value: USER_GROWTH_STATS.byRole.pharmacy, color: "#f59e0b", pct: Math.round((USER_GROWTH_STATS.byRole.pharmacy / USER_GROWTH_STATS.totalUsers) * 100) },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-neutral-700 font-medium">{item.label}</span>
                  <span className="text-neutral-500">{item.value.toLocaleString("en-IN")} ({item.pct}%)</span>
                </div>
                <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-2.5 rounded-full transition-all" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}

            <div className="pt-3 border-t border-neutral-100">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-xs text-neutral-400">New today</p>
                  <p className="font-bold text-neutral-900">{USER_GROWTH_STATS.newToday}</p>
                </div>
                <div className="text-center border-x border-neutral-100">
                  <p className="text-xs text-neutral-400">This week</p>
                  <p className="font-bold text-neutral-900">{USER_GROWTH_STATS.newThisWeek}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-neutral-400">This month</p>
                  <p className="font-bold text-neutral-900">{USER_GROWTH_STATS.newThisMonth.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* User table */}
      <SectionCard
        title="All Users"
        subtitle={`${filtered.length} of ${ADMIN_USERS.length} users`}
        noPad
        action={
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
              className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 text-neutral-600 bg-white"
            >
              <option value="all">All Roles</option>
              <option value="patient">Patients</option>
              <option value="doctor">Doctors</option>
              <option value="pharmacy">Pharmacies</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 text-neutral-600 bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        }
      >
        {/* Search */}
        <div className="px-5 py-3 border-b border-neutral-50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input
              className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-xl bg-neutral-50 placeholder:text-neutral-400 focus:outline-none focus:border-brand-400"
              placeholder="Search name or email…"
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
                key: "name", label: "User",
                render: (row) => {
                  const u = row as unknown as AdminUser;
                  return (
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} size="sm" />
                      <div>
                        <p className="font-medium text-neutral-900 text-sm">{u.name}</p>
                        <p className="text-xs text-neutral-400">{u.email}</p>
                      </div>
                    </div>
                  );
                },
              },
              {
                key: "role", label: "Role",
                render: (row) => {
                  const u = row as unknown as AdminUser;
                  const b = ROLE_BADGE[u.role];
                  return <Badge variant={b.variant}>{b.label}</Badge>;
                },
              },
              {
                key: "status", label: "Status",
                render: (row) => {
                  const u = row as unknown as AdminUser;
                  const b = STATUS_BADGE[u.status];
                  return <Badge variant={b.variant} dot>{b.label}</Badge>;
                },
              },
              { key: "consultations", label: "Consults", align: "center",
                render: (row) => <span className="font-medium text-neutral-700">{(row as unknown as AdminUser).consultations}</span> },
              { key: "joinedAt", label: "Joined",
                render: (row) => <span className="text-neutral-500">{formatDate((row as unknown as AdminUser).joinedAt)}</span> },
              { key: "lastActive", label: "Last Active",
                render: (row) => <span className="text-neutral-500">{formatDate((row as unknown as AdminUser).lastActive)}</span> },
              {
                key: "actions", label: "", align: "right",
                render: (row) => {
                  const u = row as unknown as AdminUser;
                  return (
                    <button className={cn(
                      "text-xs font-medium px-3 py-1.5 rounded-lg transition-colors",
                      u.status === "banned"
                        ? "bg-success-50 text-success-600 hover:bg-success-100"
                        : "bg-danger-50 text-danger-600 hover:bg-danger-100"
                    )}>
                      {u.status === "banned" ? "Unban" : "Ban"}
                    </button>
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