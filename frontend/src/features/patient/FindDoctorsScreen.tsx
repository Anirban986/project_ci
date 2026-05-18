"use client";

import { useState } from "react";
import { Search, Star, Clock, MapPin, Video, SlidersHorizontal } from "lucide-react";
import { Avatar } from "@/src/components/ui/Avatar";
import { Badge } from "@/src/components/ui/Badge";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { BookAppointmentModal } from "./BookAppointmentModal";
import { MOCK_DOCTORS } from "@/src/services/mock-data";
import { SPECIALIZATIONS } from "@/src/lib/constants";
import { formatCurrency, cn } from "@/src/lib/utils";
import type { Doctor } from "@/src/types";

export function FindDoctorsScreen() {
  const [query, setQuery]               = useState("");
  const [specFilter, setSpecFilter]     = useState("All");
  const [showFilters, setShowFilters]   = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [bookedIds, setBookedIds]       = useState<string[]>([]);

  const specs = ["All", ...SPECIALIZATIONS.slice(0, 6)];

  const filtered = MOCK_DOCTORS.filter((d) => {
    const matchQuery =
      !query ||
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.specialization.toLowerCase().includes(query.toLowerCase());
    const matchSpec = specFilter === "All" || d.specialization === specFilter;
    return matchQuery && matchSpec;
  });

  return (
    <div className="space-y-4 px-4 pt-2 pb-4">

      {/* Search + filter row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            className="input pl-10 !py-2.5"
            placeholder="Search doctor or specialty…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center border-2 transition-colors flex-shrink-0",
            showFilters
              ? "border-brand-400 bg-brand-50 text-brand-500"
              : "border-neutral-200 bg-white text-neutral-500"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Specialization chips */}
      {showFilters && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
          {specs.map((s) => (
            <button
              key={s}
              onClick={() => setSpecFilter(s)}
              className={cn(
                "flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all snap-start",
                specFilter === s
                  ? "bg-brand-500 text-white border-brand-500"
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-brand-300"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Count */}
      <p className="text-xs text-neutral-400">
        {filtered.length} doctor{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Doctor cards */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="w-6 h-6" />}
          title="No doctors found"
          description="Try a different name or specialty"
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((doctor) => {
            const booked = bookedIds.includes(doctor.id);
            return (
              <div key={doctor.id} className="card">
                {/* Top row */}
                <div className="flex items-start gap-3 mb-3">
                  <Avatar name={doctor.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-neutral-900 text-sm font-display leading-tight">
                          {doctor.name}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">{doctor.specialization}</p>
                        <p className="text-xs text-neutral-400">{doctor.qualification}</p>
                      </div>
                      <Badge variant={doctor.available ? "success" : "neutral"} dot>
                        {doctor.available ? "Online" : "Offline"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 text-xs text-neutral-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {doctor.rating} ({doctor.reviewCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {doctor.experience}y exp
                  </span>
                  {doctor.hospital && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{doctor.hospital}</span>
                    </span>
                  )}
                </div>

                {/* Consult types */}
                <div className="flex gap-1.5 mb-3">
                  <span className="flex items-center gap-1 text-xs bg-brand-50 text-brand-600 rounded-lg px-2.5 py-1.5 font-medium">
                    <Video className="w-3 h-3" /> Video
                  </span>
                  <span className="flex items-center gap-1 text-xs bg-neutral-100 text-neutral-600 rounded-lg px-2.5 py-1.5 font-medium">
                    <MapPin className="w-3 h-3" /> In-Person
                  </span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <div>
                    <span className="font-bold text-neutral-900 text-sm">
                      {formatCurrency(doctor.consultationFee)}
                    </span>
                    <span className="text-xs text-neutral-400"> / consult</span>
                  </div>
                  {booked ? (
                    <span className="flex items-center gap-1.5 text-xs text-success-600 font-semibold bg-success-50 px-3 py-2 rounded-xl">
                      ✓ Booked
                    </span>
                  ) : (
                    <button
                      onClick={() => setBookingDoctor(doctor)}
                      disabled={!doctor.available}
                      className={cn(
                        "text-sm font-semibold px-4 py-2 rounded-xl transition-all active:scale-95",
                        doctor.available
                          ? "bg-brand-500 text-white hover:bg-brand-600"
                          : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                      )}
                    >
                      {doctor.available ? "Book Now" : "Unavailable"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking modal */}
      <BookAppointmentModal
        open={!!bookingDoctor}
        doctor={bookingDoctor}
        onClose={() => setBookingDoctor(null)}
        onSuccess={(doc) => {
          setBookedIds((prev) => [...prev, doc.id]);
          setBookingDoctor(null);
        }}
      />
    </div>
  );
}