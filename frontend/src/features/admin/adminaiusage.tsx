"use client";

import { useState } from "react";
import {
  Bot, Zap, Clock, AlertTriangle,
  TrendingUp, Activity, Search,
} from "lucide-react";
import { StatCard } from "@/src/components/admin/Statcard";
import { SectionCard, PeriodTabs } from "@/src/components/admin/Sectioncard ";
import { ChartBar } from "@/src/components/admin/Chartbar";
import { ChartLine } from "@/src/components/admin/Chartline";
import { AdminTable } from "@/src/components/admin/Admintable";
import { AdminHeader } from "@/src/components/admin/Adminheader ";
import { Badge } from "@/src/components/ui/Badge";
import { AI_USAGE_STATS } from "@/src/services/admin/mock-admin-data";
import { formatTime, cn } from "@/src/lib/utils";
import type { AIRequestLog } from "@/src/types/admin";

const RISK_BADGE: Record<"low" | "medium" | "high", { variant: "success" | "warning" | "danger"; label: string }> = {
  low:    { variant: "success", label: "Low"    },
  medium: { variant: "warning", label: "Medium" },
  high:   { variant: "danger",  label: "High"   },
};

export function AdminAIUsage() {
  const [period, setPeriod] = useState("Daily");
  const [search, setSearch] = useState("");

  const trendData =
    period === "Hourly"  ? AI_USAGE_STATS.hourlyTrend  :
    period === "Daily"   ? AI_USAGE_STATS.dailyTrend   :
    AI_USAGE_STATS.weeklyTrend;

  const filtered = AI_USAGE_STATS.recentRequests.filter((r) =>
    !search || r.patientName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <AdminHeader title="AI Usage" subtitle="AI consultation requests, costs and patterns" />

      {/* KPI row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Requests Today"
          value={AI_USAGE_STATS.requestsToday}
          change={15.2}
          changeLabel="vs yesterday"
          trend={AI_USAGE_STATS.dailyTrend}
          color="brand"
          icon={<Bot className="w-5 h-5" />}
        />
        <StatCard
          label="This Week"
          value={AI_USAGE_STATS.requestsThisWeek}
          change={9.4}
          changeLabel="vs last week"
          color="purple"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          label="Avg Response"
          value={`${AI_USAGE_STATS.avgResponseMs}ms`}
          change={-3.2}
          changeLabel="vs last week"
          color="success"
          icon={<Zap className="w-5 h-5" />}
        />
        <StatCard
          label="Est. Cost Today"
          value={`₹${AI_USAGE_STATS.estimatedCost.toLocaleString()}`}
          change={14.8}
          changeLabel="vs yesterday"
          color="warning"
          icon={<Activity className="w-5 h-5" />}
        />
      </div>

      {/* KPI row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="This Month"
          value={AI_USAGE_STATS.requestsThisMonth}
          change={22.1}
          changeLabel="vs last month"
          color="teal"
          size="sm"
          icon={<Bot className="w-4 h-4" />}
        />
        <StatCard
          label="Total Tokens Used"
          value={`${(AI_USAGE_STATS.totalTokensUsed / 1_000_000).toFixed(1)}M`}
          color="brand"
          size="sm"
          icon={<Zap className="w-4 h-4" />}
        />
        <StatCard
          label="High Risk Flags"
          value={AI_USAGE_STATS.byRiskLevel.high}
          change={-8.4}
          changeLabel="vs last week"
          color="danger"
          size="sm"
          icon={<AlertTriangle className="w-4 h-4" />}
        />
      </div>

      {/* Trend chart + risk breakdown */}
      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        <SectionCard
          title="AI Request Volume"
          className="lg:col-span-2"
          action={
            <PeriodTabs
              active={period}
              options={["Hourly", "Daily", "Weekly"]}
              onChange={setPeriod}
            />
          }
        >
          <ChartBar data={trendData} color="#0a84ff" valueSuffix=" requests" />
        </SectionCard>

        <SectionCard title="By Risk Level">
          <div className="space-y-4 pt-1">
            {(["low", "medium", "high"] as const).map((level) => {
              const val   = AI_USAGE_STATS.byRiskLevel[level];
              const total = Object.values(AI_USAGE_STATS.byRiskLevel).reduce((a, b) => a + b, 0);
              const pct   = Math.round((val / total) * 100);
              const colors = { low: "#22c55e", medium: "#f59e0b", high: "#f43f5e" };
              const labels = { low: "Low Risk", medium: "Moderate", high: "High Risk" };
              return (
                <div key={level}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-neutral-700">{labels[level]}</span>
                    <span className="text-neutral-500">{val.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-2.5 rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: colors[level] }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="pt-3 border-t border-neutral-100 text-center">
              <p className="text-xs text-neutral-400">Total requests this month</p>
              <p className="text-2xl font-bold text-neutral-900 font-display mt-0.5">
                {AI_USAGE_STATS.requestsThisMonth.toLocaleString()}
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Top symptoms + recent requests */}
      <div className="grid lg:grid-cols-2 gap-5 mb-6">

        {/* Top symptoms */}
        <SectionCard title="Top Reported Symptoms" subtitle="Most common AI consult triggers">
          <div className="space-y-2.5">
            {AI_USAGE_STATS.topSymptoms.map((item, i) => {
              const max = AI_USAGE_STATS.topSymptoms[0].count;
              const pct = Math.round((item.count / max) * 100);
              return (
                <div key={item.symptom} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-neutral-400 w-4 text-right flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-neutral-700">{item.symptom}</span>
                      <span className="text-neutral-400">{item.count.toLocaleString()}</span>
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

        {/* Response time distribution */}
        <SectionCard title="Response Time Distribution" subtitle="AI engine latency breakdown">
          <div className="space-y-3 pt-1">
            {[
              { label: "< 500ms",       count: 2840, color: "#22c55e" },
              { label: "500–800ms",     count: 8420, color: "#0a84ff" },
              { label: "800ms–1s",      count: 4210, color: "#f59e0b" },
              { label: "> 1 second",    count: 1120, color: "#f43f5e" },
            ].map((item) => {
              const total = 16590;
              const pct   = Math.round((item.count / total) * 100);
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-neutral-700">{item.label}</span>
                    <span className="text-neutral-500">{item.count.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400">Avg response time</p>
                <p className="font-bold text-neutral-900">{AI_USAGE_STATS.avgResponseMs}ms</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-400">SLA compliance</p>
                <p className="font-bold text-success-600">97.8%</p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Recent AI requests table */}
      <SectionCard title="Recent AI Requests" subtitle="Latest consultation logs" noPad>
        <div className="px-5 py-3 border-b border-neutral-50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input
              className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-xl bg-neutral-50 placeholder:text-neutral-400 focus:outline-none focus:border-brand-400"
              placeholder="Search patient…"
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
                    {(row as unknown as AIRequestLog).patientName}
                  </span>
                ),
              },
              {
                key: "symptoms", label: "Symptoms",
                render: (row) => {
                  const r = row as unknown as AIRequestLog;
                  return (
                    <div className="flex flex-wrap gap-1">
                      {r.symptoms.map((s) => (
                        <span key={s} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full capitalize">
                          {s}
                        </span>
                      ))}
                    </div>
                  );
                },
              },
              {
                key: "riskLevel", label: "Risk",
                render: (row) => {
                  const r = row as unknown as AIRequestLog;
                  const b = RISK_BADGE[r.riskLevel];
                  return <Badge variant={b.variant} dot>{b.label}</Badge>;
                },
              },
              {
                key: "responseMs", label: "Response",
                align: "center",
                render: (row) => {
                  const r = row as unknown as AIRequestLog;
                  return (
                    <span className={cn(
                      "text-sm font-medium",
                      r.responseMs < 800 ? "text-success-600" :
                      r.responseMs < 1000 ? "text-warning-500" : "text-danger-500"
                    )}>
                      {r.responseMs}ms
                    </span>
                  );
                },
              },
              {
                key: "tokensUsed", label: "Tokens",
                align: "center",
                render: (row) => (
                  <span className="text-neutral-500">
                    {(row as unknown as AIRequestLog).tokensUsed.toLocaleString()}
                  </span>
                ),
              },
              {
                key: "timestamp", label: "Time",
                render: (row) => (
                  <span className="text-neutral-400 text-xs">
                    {formatTime((row as unknown as AIRequestLog).timestamp)}
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