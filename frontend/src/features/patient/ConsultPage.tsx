"use client";

import { useState } from "react";
import { Bot, Stethoscope, Calendar, Clock, Video, MapPin, CheckCircle2, XCircle } from "lucide-react";
import { AIConsultScreen } from "./AIConsultScreen";
import { FindDoctorsScreen } from "./FindDoctorsScreen";
import { Badge } from "@/src/components/ui/Badge";
import { Avatar } from "@/src/components/ui/Avatar";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { MOCK_APPOINTMENTS } from "@/src/services/mock-data";
import { formatDate, cn } from "@/src/lib/utils";
import type { AppointmentStatus } from "@/src/types";

type Tab = "ai" | "doctors" | "appointments";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "ai",           label: "AI Consult",    icon: Bot         },
  { id: "doctors",      label: "Find Doctors",  icon: Stethoscope },
  { id: "appointments", label: "Appointments",  icon: Calendar    },
];

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { variant: "success" | "brand" | "warning" | "neutral" | "danger"; label: string; icon: React.ElementType }
> = {
  pending:   { variant: "warning", label: "Pending",   icon: Clock        },
  confirmed: { variant: "brand",   label: "Confirmed", icon: CheckCircle2 },
  ongoing:   { variant: "success", label: "Ongoing",   icon: CheckCircle2 },
  completed: { variant: "neutral", label: "Completed", icon: CheckCircle2 },
  cancelled: { variant: "danger",  label: "Cancelled", icon: XCircle      },
};

function AppointmentsTab() {
  const myAppts = MOCK_APPOINTMENTS.filter((a) => a.patientId === "p1");

  if (myAppts.length === 0) {
    return (
      <div className="px-4 pt-4">
        <EmptyState
          icon={<Calendar className="w-6 h-6" />}
          title="No appointments yet"
          description="Book a doctor from the Find Doctors tab"
        />
      </div>
    );
  }

  const upcoming  = myAppts.filter((a) => ["pending", "confirmed"].includes(a.status));
  const past      = myAppts.filter((a) => ["completed", "cancelled"].includes(a.status));

  return (
    <div className="px-4 pt-2 pb-4 space-y-5">
      {upcoming.length > 0 && (
        <div>
          <p className="section-title mb-3">Upcoming</p>
          <div className="space-y-3">
            {upcoming.map((appt) => {
              const sc = STATUS_CONFIG[appt.status];
              const StatusIcon = sc.icon;
              return (
                <div key={appt.id} className="card border border-brand-100">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                      appt.type === "video" ? "bg-brand-50" : "bg-success-50"
                    )}>
                      {appt.type === "video"
                        ? <Video className="w-5 h-5 text-brand-500" />
                        : <MapPin className="w-5 h-5 text-success-600" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-neutral-900 text-sm font-display">
                        {appt.doctorName}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">{appt.doctorSpecialization}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-neutral-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {formatDate(appt.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {appt.time}
                        </span>
                      </div>
                    </div>
                    <Badge variant={sc.variant} dot>{sc.label}</Badge>
                  </div>

                  {/* Actions */}
                  {appt.status === "confirmed" && appt.type === "video" && (
                    <div className="mt-3 pt-3 border-t border-neutral-100 flex gap-2">
                      <button className="flex-1 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-600 hover:bg-neutral-50 transition-colors">
                        Reschedule
                      </button>
                      <button className="flex-1 py-2 rounded-xl bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition-colors">
                        Join Video Call
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <p className="section-title mb-3">Past</p>
          <div className="space-y-2.5">
            {past.map((appt) => {
              const sc = STATUS_CONFIG[appt.status];
              return (
                <div key={appt.id} className="card opacity-80">
                  <div className="flex items-start gap-3">
                    <Avatar name={appt.doctorName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-neutral-700 text-sm font-display">
                        {appt.doctorName}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {formatDate(appt.date)} · {appt.time}
                      </p>
                      {appt.notes && (
                        <p className="text-xs text-neutral-500 mt-1 line-clamp-1">{appt.notes}</p>
                      )}
                    </div>
                    <Badge variant={sc.variant}>{sc.label}</Badge>
                  </div>
                  {appt.status === "completed" && (
                    <div className="mt-2.5 pt-2.5 border-t border-neutral-100">
                      <button className="text-xs text-brand-500 font-medium hover:text-brand-600">
                        Book follow-up →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function ConsultPage() {
  const [activeTab, setActiveTab] = useState<Tab>("ai");

  return (
    <div className="flex flex-col h-full">

      {/* Page header */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-lg font-bold text-neutral-900 font-display">Consult</h1>
        <p className="text-xs text-neutral-500 mt-0.5">AI-powered or book a real doctor</p>
      </div>

      {/* Tab bar */}
      <div className="px-4 mb-1">
        <div className="flex bg-neutral-100 rounded-2xl p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all",
                activeTab === id
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              <Icon className={cn(
                "w-3.5 h-3.5",
                activeTab === id ? "text-brand-500" : "text-neutral-400"
              )} />
              <span className="hidden xs:inline">{label}</span>
              <span className="xs:hidden">
                {id === "ai" ? "AI" : id === "doctors" ? "Doctors" : "Booked"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "ai"           && <AIConsultScreen />}
        {activeTab === "doctors"      && <FindDoctorsScreen />}
        {activeTab === "appointments" && <AppointmentsTab />}
      </div>
    </div>
  );
}