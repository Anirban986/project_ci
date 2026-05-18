"use client";

import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Video,
  MapPin,
  ChevronRight,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Avatar } from "@/src/components/ui/Avatar";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { MOCK_DOCTOR, MOCK_APPOINTMENTS } from "@/src/services/mock-data";
import { formatDate, getGreeting } from "@/src/lib/utils";

const TODAY_SLOTS = [
  { time: "09:00 AM", patient: "Arjun Mehta",     type: "video",     done: true },
  { time: "10:30 AM", patient: "Sonia Roy",        type: "video",     done: false },
  { time: "11:00 AM", patient: "Pradeep Kumar",    type: "in-person", done: false },
  { time: "02:00 PM", patient: "Lakshmi Devi",     type: "video",     done: false },
];

const STATS = [
  { label: "Today",     value: "4",   icon: Calendar,    color: "bg-brand-50 text-brand-500" },
  { label: "This Week", value: "18",  icon: TrendingUp,  color: "bg-success-50 text-success-600" },
  { label: "Patients",  value: "142", icon: Users,       color: "bg-purple-50 text-purple-500" },
  { label: "Pending",   value: "3",   icon: Clock,       color: "bg-warning-50 text-warning-500" },
];

export function DoctorDashboard() {
  const doctor = MOCK_DOCTOR;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500">{getGreeting()},</p>
          <h1 className="text-xl font-bold text-neutral-900 font-display">{doctor.name}</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            {doctor.specialization} · {doctor.hospital}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={doctor.available ? "success" : "neutral"} dot>
            {doctor.available ? "Available" : "Offline"}
          </Badge>
          <Avatar name={doctor.name} size="md" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {STATS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card text-center py-4 px-2">
            <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="font-bold text-neutral-900 text-lg leading-none">{value}</p>
            <p className="text-xs text-neutral-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Today's schedule */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="section-title">Today's Schedule</p>
          <p className="text-xs text-neutral-500">{formatDate(new Date().toISOString())}</p>
        </div>
        <div className="card divide-y divide-neutral-100">
          {TODAY_SLOTS.map((slot, i) => (
            <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="w-6 flex-shrink-0">
                {slot.done ? (
                  <CheckCircle2 className="w-5 h-5 text-success-500" />
                ) : (
                  <Circle className="w-5 h-5 text-neutral-300" />
                )}
              </div>
              <div className="flex-shrink-0 text-right w-16">
                <p className="text-xs font-semibold text-neutral-800">{slot.time}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${slot.done ? "text-neutral-400 line-through" : "text-neutral-800"}`}>
                  {slot.patient}
                </p>
              </div>
              <Badge variant={slot.type === "video" ? "brand" : "neutral"}>
                {slot.type === "video" ? (
                  <span className="flex items-center gap-1">
                    <Video className="w-3 h-3" /> Video
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> In-Person
                  </span>
                )}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Pending approvals */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="section-title">Pending Approvals</p>
          <span className="text-xs font-medium text-danger-600 bg-danger-50 px-2 py-0.5 rounded-full">
            3 new
          </span>
        </div>
        <div className="space-y-3">
          {MOCK_APPOINTMENTS.filter((a) => a.status === "pending")
            .slice(0, 2)
            .map((appt) => (
              <div key={appt.id} className="card">
                <div className="flex items-start gap-3">
                  <Avatar name={appt.patientName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900 text-sm font-display">
                      {appt.patientName}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {formatDate(appt.date)} · {appt.time}
                    </p>
                  </div>
                  <Badge variant="warning" dot>Pending</Badge>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="secondary" size="sm" fullWidth>
                    Decline
                  </Button>
                  <Button variant="primary" size="sm" fullWidth>
                    Confirm
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
