import { Clock, Calendar, Video, MapPin } from "lucide-react";
import { Badge } from "@/src/components/ui/Badge";
import { formatDate } from "@/src/lib/utils";
import { cn } from "@/src/lib/utils";
import type { Appointment, AppointmentStatus } from "@/src/types/index";

const STATUS_BADGE: Record<AppointmentStatus, { variant: "success" | "brand" | "warning" | "neutral" | "danger"; label: string }> = {
  pending:   { variant: "warning", label: "Pending" },
  confirmed: { variant: "brand",   label: "Confirmed" },
  ongoing:   { variant: "success", label: "Ongoing" },
  completed: { variant: "neutral", label: "Completed" },
  cancelled: { variant: "danger",  label: "Cancelled" },
};

interface AppointmentCardProps {
  appointment: Appointment;
  perspective?: "patient" | "doctor";
  className?: string;
}

export function AppointmentCard({
  appointment,
  perspective = "patient",
  className,
}: AppointmentCardProps) {
  const statusInfo = STATUS_BADGE[appointment.status];
  const name =
    perspective === "patient"
      ? appointment.doctorName
      : appointment.patientName;
  const sub =
    perspective === "patient"
      ? appointment.doctorSpecialization
      : "Patient";

  return (
    <div className={cn("card", className)}>
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
            appointment.type === "video" ? "bg-brand-50" : "bg-success-50"
          )}
        >
          {appointment.type === "video" ? (
            <Video className="w-5 h-5 text-brand-500" />
          ) : (
            <MapPin className="w-5 h-5 text-success-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-neutral-900 text-sm font-display">{name}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{sub}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-neutral-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(appointment.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {appointment.time}
            </span>
          </div>
        </div>
        <Badge variant={statusInfo.variant} dot>
          {statusInfo.label}
        </Badge>
      </div>
      {appointment.notes && (
        <p className="text-xs text-neutral-500 mt-3 pt-3 border-t border-neutral-100 line-clamp-2">
          {appointment.notes}
        </p>
      )}
    </div>
  );
}
