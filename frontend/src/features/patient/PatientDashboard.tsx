"use client";

import Link from "next/link";
import {
  MessageCircle,
  Pill,
  Upload,
  Stethoscope,
  FolderOpen,
  MapPin,
  Clock,
  ChevronRight,
  Video,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Avatar } from "@/src/components/ui/Avatar";
import { Badge } from "@/src/components/ui/Badge";
import { getGreeting, formatDate } from "@/src/lib/utils";
import { MOCK_PATIENT, MOCK_APPOINTMENTS, MOCK_RESERVATIONS } from "@/src/services/mock-data";

const QUICK_ACTIONS = [
  { href: "/patient/consult",  icon: MessageCircle, label: "AI Consult",    color: "bg-brand-50 text-brand-500" },
  { href: "/patient/pharmacy", icon: Pill,          label: "Medicines",     color: "bg-purple-50 text-purple-500" },
  { href: "/patient/vault",    icon: Upload,         label: "Upload Rx",     color: "bg-amber-50 text-amber-500" },
  { href: "/patient/consult",  icon: Stethoscope,   label: "Book Doctor",   color: "bg-success-50 text-success-600" },
  { href: "/patient/vault",    icon: FolderOpen,    label: "Med Vault",     color: "bg-rose-50 text-rose-500" },
  { href: "/patient/pharmacy", icon: MapPin,         label: "Pharmacies",    color: "bg-teal-50 text-teal-500" },
];

export function PatientDashboard() {
  const patient = MOCK_PATIENT;
  const upcomingAppt = MOCK_APPOINTMENTS.find((a) => a.status === "confirmed");
  const reservation = MOCK_RESERVATIONS[0];

  return (
    <div className="px-4 pt-6 pb-4 space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">{getGreeting()},</p>
          <h1 className="text-xl font-bold text-neutral-900 font-display leading-tight">
            {patient.name.split(" ")[0]} 👋
          </h1>
        </div>
        <Link href="/patient/profile">
          <Avatar name={patient.name} size="md" />
        </Link>
      </div>

      {/* Health card */}
      <div className="rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 p-5 text-white shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-brand-100 text-xs font-medium mb-0.5">Health Status</p>
            <p className="font-semibold text-lg font-display">All Good</p>
          </div>
          <Badge className="bg-white/20 text-white border-0">
            Blood: {patient.bloodGroup}
          </Badge>
        </div>
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-brand-200 text-xs">Appointments</p>
            <p className="font-semibold mt-0.5">1 upcoming</p>
          </div>
          <div>
            <p className="text-brand-200 text-xs">Medicines</p>
            <p className="font-semibold mt-0.5">1 reserved</p>
          </div>
          <div>
            <p className="text-brand-200 text-xs">Documents</p>
            <p className="font-semibold mt-0.5">4 files</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <p className="section-title mb-3">Quick Actions</p>
        <div className="grid grid-cols-3 gap-3">
          {QUICK_ACTIONS.map(({ href, icon: Icon, label, color }) => (
            <Link key={label} href={href}>
              <div className="card flex flex-col items-center gap-2.5 py-4 cursor-pointer active:scale-95 transition-transform text-center card-hover">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-neutral-700 leading-tight">{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming appointment */}
      {upcomingAppt && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="section-title">Upcoming Appointment</p>
            <Link href="/patient/consult" className="text-xs text-brand-500 font-medium">
              View all
            </Link>
          </div>
          <div className="card border border-brand-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                {upcomingAppt.type === "video" ? (
                  <Video className="w-5 h-5 text-brand-500" />
                ) : (
                  <Stethoscope className="w-5 h-5 text-brand-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-900 text-sm font-display">
                  {upcomingAppt.doctorName}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {upcomingAppt.doctorSpecialization}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs text-neutral-600">
                    <Clock className="w-3.5 h-3.5" />
                    {upcomingAppt.time}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {formatDate(upcomingAppt.date)}
                  </span>
                </div>
              </div>
              <Badge variant="brand" dot>
                {upcomingAppt.type === "video" ? "Video" : "In-Person"}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Medicine reservation */}
      {reservation && (
        <div>
          <p className="section-title mb-3">Medicine Reservation</p>
          <div className="card">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  reservation.status === "ready"
                    ? "bg-success-50"
                    : "bg-neutral-100"
                }`}
              >
                {reservation.status === "ready" ? (
                  <CheckCircle2 className="w-5 h-5 text-success-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-neutral-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-900 text-sm font-display truncate">
                  {reservation.medicineName}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {reservation.pharmacyName} · Qty: {reservation.quantity}
                </p>
              </div>
              <Badge
                variant={reservation.status === "ready" ? "success" : "warning"}
                dot
              >
                {reservation.status === "ready" ? "Ready" : "Pending"}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="section-title">Recent Activity</p>
        </div>
        <div className="card divide-y divide-neutral-100">
          {MOCK_APPOINTMENTS.filter((a) => a.status === "completed")
            .slice(0, 2)
            .map((appt) => (
              <div key={appt.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-success-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate">
                    Consultation – {appt.doctorName}
                  </p>
                  <p className="text-xs text-neutral-500">{formatDate(appt.date)}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-300 flex-shrink-0" />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
