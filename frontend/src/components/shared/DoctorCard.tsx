import { Star, Clock, MapPin } from "lucide-react";
import { Avatar } from "@/src/components/ui/Avatar";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { formatCurrency } from "@/src/lib/utils";
import type { Doctor } from "@/src/types";

interface DoctorCardProps {
  doctor: Doctor;
  onBook?: (doctor: Doctor) => void;
}

export function DoctorCard({ doctor, onBook }: DoctorCardProps) {
  return (
    <div className="card card-hover">
      <div className="flex items-start gap-3 mb-3">
        <Avatar name={doctor.name} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-neutral-900 text-sm font-display leading-tight">
                {doctor.name}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">{doctor.specialization}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{doctor.qualification}</p>
            </div>
            <Badge variant={doctor.available ? "success" : "neutral"} dot>
              {doctor.available ? "Online" : "Offline"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3 text-xs text-neutral-600">
        <span className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          {doctor.rating} ({doctor.reviewCount})
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-neutral-400" />
          {doctor.experience}y exp
        </span>
        {doctor.hospital && (
          <span className="flex items-center gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
            <span className="truncate">{doctor.hospital}</span>
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="font-bold text-neutral-900">
          {formatCurrency(doctor.consultationFee)}
          <span className="text-xs font-normal text-neutral-400"> / consult</span>
        </p>
        <Button
          size="sm"
          variant={doctor.available ? "primary" : "ghost"}
          disabled={!doctor.available}
          onClick={() => onBook?.(doctor)}
        >
          {doctor.available ? "Book Now" : "Unavailable"}
        </Button>
      </div>
    </div>
  );
}
