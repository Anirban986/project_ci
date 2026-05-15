"use client";

import Link from "next/link";
import {
  User,
  Phone,
  Droplets,
  AlertCircle,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit2,
} from "lucide-react";
import { Avatar } from "@/src/components/ui/Avatar";
import { Badge } from "@/src/components/ui/Badge";
import { MOCK_PATIENT } from "@/src/services/mock-data";
import { formatDate } from "@/src/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import  api  from "@/src/utils/api";
const MENU_ITEMS = [
  { icon: Shield,       label: "Privacy & Security",   href: "#" },
  { icon: Bell,         label: "Notifications",         href: "#" },
  { icon: HelpCircle,   label: "Help & Support",        href: "#" },
];

export function PatientProfile() {
  const patient = MOCK_PATIENT;
  const router = useRouter();
  const [loading, setLoading] = useState(false);


  const handlelogout = async () => {
    setLoading(true);
    try {
      await api.post("/api/auth/logout");
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 pt-5 pb-4 space-y-5">
      {/* Header card */}
      <div className="card text-center py-6">
        <div className="flex justify-center mb-3">
          <div className="relative">
            <Avatar name={patient.name} size="xl" />
            <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white shadow-md">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <h2 className="font-bold text-neutral-900 font-display text-lg">{patient.name}</h2>
        <p className="text-sm text-neutral-500 mt-0.5">{patient.email}</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <Badge variant="brand">{patient.bloodGroup}</Badge>
          <Badge variant="neutral">Patient</Badge>
        </div>
      </div>

      {/* Health details */}
      <div className="card space-y-4">
        <p className="section-title">Health Details</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-neutral-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Droplets className="w-3.5 h-3.5 text-danger-500" />
              <p className="text-xs text-neutral-500">Blood Group</p>
            </div>
            <p className="font-bold text-neutral-900">{patient.bloodGroup}</p>
          </div>
          <div className="bg-neutral-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <User className="w-3.5 h-3.5 text-brand-500" />
              <p className="text-xs text-neutral-500">Date of Birth</p>
            </div>
            <p className="font-bold text-neutral-900 text-sm">
              {patient.dateOfBirth ? formatDate(patient.dateOfBirth) : "—"}
            </p>
          </div>
        </div>

        {patient.allergies && patient.allergies.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <AlertCircle className="w-3.5 h-3.5 text-warning-500" />
              <p className="text-xs font-medium text-neutral-600">Allergies</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {patient.allergies.map((a) => (
                <Badge key={a} variant="warning">{a}</Badge>
              ))}
            </div>
          </div>
        )}

        {patient.emergencyContact && (
          <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
            <Phone className="w-4 h-4 text-success-500" />
            <div>
              <p className="text-xs text-neutral-500">Emergency Contact</p>
              <p className="text-sm font-medium text-neutral-800">
                {patient.emergencyContact}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="card divide-y divide-neutral-100">
        {MENU_ITEMS.map(({ icon: Icon, label, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0 hover:opacity-70 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-neutral-600" />
            </div>
            <span className="text-sm font-medium text-neutral-800 flex-1">{label}</span>
            <ChevronRight className="w-4 h-4 text-neutral-300" />
          </Link>
        ))}
      </div>

      {/* Logout */}
      <Link href="/">
        <div className="card flex items-center gap-3 text-danger-600 cursor-pointer hover:bg-danger-50 transition-colors">
          <div className="w-8 h-8 rounded-xl bg-danger-50 flex items-center justify-center flex-shrink-0">
            <LogOut className="w-4 h-4 text-danger-500" />
          </div>
          <span onClick={handlelogout} className="text-sm font-medium">
            Log Out
          </span>
        </div>
      </Link>
    </div>
  );
}
