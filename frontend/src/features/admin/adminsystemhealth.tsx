"use client";

import { useState } from "react";
import {
  Activity, Server, Globe, Shield, Bot, Video,
  Database, CreditCard, HardDrive, Bell, Search,
  CheckCircle, AlertTriangle, XCircle, Clock,
  Cpu, MemoryStick, Wifi, RefreshCw,
} from "lucide-react";
import { StatCard } from "@/src/components/admin/Statcard";
import { SectionCard } from "@/src/components/admin/Sectioncard ";
import { AdminHeader } from "@/src/components/admin/Adminheader ";
import { SYSTEM_HEALTH_STATS } from "@/src/services/admin/mock-admin-data";
import { formatTime, cn } from "@/src/lib/utils";
import type { ServiceHealth, ServiceStatus, SystemMetric } from "@/src/types/admin";

// ─── Icon map for services ─────────────────────────────────────────────────────
const SERVICE_ICON_MAP: Record<string, React.ElementType> = {
  Globe: Globe, Shield: Shield, Bot: Bot, Video: Video,
  Database: Database, CreditCard: CreditCard, HardDrive: HardDrive,
  Bell: Bell, Search: Search, Server: Server,
};

// ─── Status helpers ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ServiceStatus, {
  color: string; bg: string; label: string; dotColor: string; icon: React.ElementType;
}> = {
  healthy:  { color: "text-success-600", bg: "bg-success-50",  label: "Healthy",  dotColor: "bg-success-500",  icon: CheckCircle   },
  degraded: { color: "text-warning-500", bg: "bg-warning-50",  label: "Degraded", dotColor: "bg-warning-500",  icon: AlertTriangle },
  down:     { color: "text-danger-600",  bg: "bg-danger-50",   label: "Down",     dotColor: "bg-danger-500",   icon: XCircle       },
};

const METRIC_ICON_MAP: Record<string, React.ElementType> = {
  "CPU Usage":    Cpu,
  "Memory":       MemoryStick,
  "Disk Usage":   HardDrive,
  "Network I/O":  Wifi,
  "DB Conn Pool": Database,
};

const LOG_LEVEL_CONFIG = {
  error: { color: "text-danger-600",  bg: "bg-danger-50",  icon: XCircle       },
  warn:  { color: "text-warning-600", bg: "bg-warning-50", icon: AlertTriangle  },
  info:  { color: "text-brand-600",   bg: "bg-brand-50",   icon: CheckCircle    },
};

// ─── Service card ──────────────────────────────────────────────────────────────
function ServiceCard({ service }: { service: ServiceHealth }) {
  const Icon   = SERVICE_ICON_MAP[service.icon] ?? Server;
  const config = STATUS_CONFIG[service.status];
  const StatusIcon = config.icon;

  return (
    <div className="bg-white border border-neutral-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-neutral-600" />
        </div>
        <span className={cn("flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full", config.bg, config.color)}>
          <StatusIcon className="w-3 h-3" />
          {config.label}
        </span>
      </div>

      <p className="font-semibold text-neutral-900 text-sm font-display mb-3">{service.name}</p>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-neutral-400">Uptime</span>
          <span className={cn("font-semibold", service.uptime >= 99 ? "text-success-600" : service.uptime >= 98 ? "text-warning-500" : "text-danger-500")}>
            {service.uptime}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className={cn("h-1.5 rounded-full transition-all", config.dotColor)}
            style={{ width: `${service.uptime}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-neutral-400">Response</span>
          <span className={cn(
            "font-medium",
            service.responseMs === 0 ? "text-danger-500" :
            service.responseMs < 100  ? "text-success-600" :
            service.responseMs < 500  ? "text-brand-500" :
            "text-warning-500"
          )}>
            {service.responseMs === 0 ? "Timeout" : `${service.responseMs}ms`}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Server metric bar ─────────────────────────────────────────────────────────
function MetricBar({ metric }: { metric: SystemMetric }) {
  const Icon = METRIC_ICON_MAP[metric.label] ?? Cpu;
  const pct  = (metric.value / metric.max) * 100;
  const config = STATUS_CONFIG[metric.status];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-sm font-medium text-neutral-700">{metric.label}</span>
        </div>
        <span className={cn("text-sm font-bold", config.color)}>
          {metric.value}{metric.unit}
        </span>
      </div>
      <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-2.5 rounded-full transition-all duration-500",
            pct >= 90 ? "bg-danger-500" :
            pct >= 75 ? "bg-warning-500" :
            "bg-success-500"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export function AdminSystemHealth() {
  const stats = SYSTEM_HEALTH_STATS;
  const overallConfig = STATUS_CONFIG[stats.overallStatus];
  const OverallIcon = overallConfig.icon;

  const healthyCount  = stats.services.filter((s) => s.status === "healthy").length;
  const degradedCount = stats.services.filter((s) => s.status === "degraded").length;
  const downCount     = stats.services.filter((s) => s.status === "down").length;

  return (
    <div>
      <AdminHeader
        title="System Health"
        subtitle="Infrastructure status, metrics and error logs"
        actions={
          <button className="flex items-center gap-2 text-xs font-medium text-neutral-600 bg-white border border-neutral-200 px-3 py-2 rounded-xl hover:bg-neutral-50 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        }
      />

      {/* Overall status banner */}
      <div className={cn(
        "flex items-center gap-4 p-5 rounded-2xl border mb-6",
        stats.overallStatus === "healthy"  ? "bg-success-50 border-success-200" :
        stats.overallStatus === "degraded" ? "bg-warning-50 border-warning-200" :
        "bg-danger-50 border-danger-200"
      )}>
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0", overallConfig.bg)}>
          <OverallIcon className={cn("w-6 h-6", overallConfig.color)} />
        </div>
        <div className="flex-1">
          <p className={cn("font-bold font-display", overallConfig.color)}>
            System {stats.overallStatus === "healthy" ? "Operational" :
                    stats.overallStatus === "degraded" ? "Partially Degraded" : "Major Outage"}
          </p>
          <p className="text-sm text-neutral-500 mt-0.5">
            {healthyCount} healthy · {degradedCount} degraded · {downCount} down
          </p>
        </div>
        <div className="text-right flex-shrink-0 hidden sm:block">
          <p className="text-xs text-neutral-400">Uptime</p>
          <p className="font-bold text-neutral-900 text-lg">{stats.uptimeDays}d</p>
        </div>
        <div className="text-right flex-shrink-0 hidden sm:block">
          <p className="text-xs text-neutral-400">Req/min</p>
          <p className="font-bold text-neutral-900 text-lg">{stats.requestsPerMinute}</p>
        </div>
        <div className="text-right flex-shrink-0 hidden sm:block">
          <p className="text-xs text-neutral-400">Error rate</p>
          <p className={cn("font-bold text-lg", stats.errorRate < 1 ? "text-success-600" : "text-danger-600")}>
            {stats.errorRate}%
          </p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Uptime"
          value={`${stats.uptimeDays}d`}
          color="success"
          icon={<Activity className="w-5 h-5" />}
        />
        <StatCard
          label="Req / Minute"
          value={stats.requestsPerMinute}
          change={4.2}
          changeLabel="vs last hour"
          color="brand"
          icon={<Globe className="w-5 h-5" />}
        />
        <StatCard
          label="Error Rate"
          value={`${stats.errorRate}%`}
          change={-12.4}
          changeLabel="vs yesterday"
          color="danger"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <StatCard
          label="Services Up"
          value={`${healthyCount}/${stats.services.length}`}
          color={downCount > 0 ? "danger" : degradedCount > 0 ? "warning" : "success"}
          icon={<Server className="w-5 h-5" />}
        />
      </div>

      {/* Services grid */}
      <SectionCard
        title="Service Status"
        subtitle={`Last checked: ${formatTime(stats.services[0].lastChecked)}`}
        className="mb-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pt-1">
          {stats.services.map((svc) => (
            <ServiceCard key={svc.name} service={svc} />
          ))}
        </div>
      </SectionCard>

      {/* Server metrics + error log */}
      <div className="grid lg:grid-cols-2 gap-5 mb-6">

        {/* Server metrics */}
        <SectionCard title="Server Metrics" subtitle="Real-time resource utilisation">
          <div className="space-y-5 pt-1">
            {stats.serverMetrics.map((metric) => (
              <MetricBar key={metric.label} metric={metric} />
            ))}

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span>Last deployment</span>
              <span className="font-medium text-neutral-700">
                {formatTime(stats.lastDeployment)} · {new Date(stats.lastDeployment).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            </div>
          </div>
        </SectionCard>

        {/* Uptime breakdown */}
        <SectionCard title="Uptime Breakdown" subtitle="Per-service uptime percentage">
          <div className="space-y-2.5 pt-1">
            {stats.services
              .sort((a, b) => a.uptime - b.uptime)
              .map((svc) => {
                const Icon   = SERVICE_ICON_MAP[svc.icon] ?? Server;
                const cfg    = STATUS_CONFIG[svc.status];
                return (
                  <div key={svc.name} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-neutral-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-600 truncate">{svc.name}</span>
                        <span className={cn("font-semibold ml-2 flex-shrink-0", cfg.color)}>
                          {svc.uptime}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-1.5 rounded-full",
                            svc.uptime >= 99 ? "bg-success-500" :
                            svc.uptime >= 98 ? "bg-warning-500" : "bg-danger-500"
                          )}
                          style={{ width: `${svc.uptime}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </SectionCard>
      </div>

      {/* Error log */}
      <SectionCard title="Error Log" subtitle="Recent system events" noPad>
        <div className="divide-y divide-neutral-50">
          {stats.errorLog.map((entry, i) => {
            const cfg  = LOG_LEVEL_CONFIG[entry.level];
            const Icon = cfg.icon;
            return (
              <div key={i} className="flex items-start gap-3 px-5 py-3.5 hover:bg-neutral-50 transition-colors">
                <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", cfg.bg)}>
                  <Icon className={cn("w-3.5 h-3.5", cfg.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-800 leading-snug">{entry.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("text-[10px] font-bold uppercase tracking-wide", cfg.color)}>
                      {entry.level}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {formatTime(entry.timestamp)} · {new Date(entry.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
                <span className={cn(
                  "flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full",
                  cfg.bg, cfg.color
                )}>
                  {entry.level}
                </span>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}