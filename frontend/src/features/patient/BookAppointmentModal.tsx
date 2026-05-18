"use client";

import { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn, formatCurrency } from "@/src/lib/utils";
import { Avatar } from "@/src/components/ui/Avatar";
import type { Doctor } from "@/src/types";

interface BookAppointmentModalProps {
  open: boolean;
  doctor: Doctor | null;
  onClose: () => void;
  onSuccess: (doctor: Doctor) => void;
}

type ConsultType = "video" | "in-person";
type Step = "type" | "slot" | "confirm" | "success";

const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "05:00 PM",
];

const UNAVAILABLE_SLOTS = ["09:30 AM", "10:30 AM", "03:00 PM"];

// Generate next 7 days
function getNext7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().split("T")[0],
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }),
      dayNum: d.getDate(),
      dayName: i === 0 ? "Today" : d.toLocaleDateString("en-IN", { weekday: "short" }),
    };
  });
}

export function BookAppointmentModal({
  open,
  doctor,
  onClose,
  onSuccess,
}: BookAppointmentModalProps) {
  const [step, setStep] = useState<Step>("type");
  const [consultType, setConsultType] = useState<ConsultType>("video");
  const [selectedDate, setSelectedDate] = useState(getNext7Days()[0].date);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState(false);

  const days = getNext7Days();

  const reset = () => {
    setStep("type");
    setConsultType("video");
    setSelectedDate(days[0].date);
    setSelectedTime(null);
    setNotes("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleConfirm = async () => {
    setBooking(true);
    await new Promise((r) => setTimeout(r, 1400));
    setBooking(false);
    setStep("success");
  };

  if (!open || !doctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92dvh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-100 px-5 py-4 flex items-center justify-between z-10 rounded-t-3xl">
          <div className="flex items-center gap-2">
            {step !== "type" && step !== "success" && (
              <button
                onClick={() => setStep(step === "slot" ? "type" : "slot")}
                className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 mr-1"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <p className="font-semibold text-neutral-900 font-display text-sm">
              {step === "type"    && "Book Appointment"}
              {step === "slot"    && "Choose a Slot"}
              {step === "confirm" && "Confirm Booking"}
              {step === "success" && "Booking Confirmed!"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">

          {/* Doctor mini card — shown on all steps except success */}
          {step !== "success" && (
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-2xl mb-5">
              <Avatar name={doctor.name} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-900 text-sm font-display">{doctor.name}</p>
                <p className="text-xs text-neutral-500">{doctor.specialization} · {doctor.hospital}</p>
              </div>
              <p className="text-sm font-bold text-neutral-900 flex-shrink-0">
                {formatCurrency(doctor.consultationFee)}
              </p>
            </div>
          )}

          {/* ── STEP 1: Type ───────────────────────────────────────── */}
          {step === "type" && (
            <div className="space-y-4">
              <p className="text-xs font-medium text-neutral-500">Select consultation type</p>

              <div className="space-y-2.5">
                {(["video", "in-person"] as ConsultType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setConsultType(type)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                      consultType === type
                        ? "border-brand-400 bg-brand-50"
                        : "border-neutral-200 hover:border-neutral-300 bg-white"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                      consultType === type ? "bg-brand-500" : "bg-neutral-100"
                    )}>
                      {type === "video"
                        ? <Video className={cn("w-5 h-5", consultType === type ? "text-white" : "text-neutral-500")} />
                        : <MapPin className={cn("w-5 h-5", consultType === type ? "text-white" : "text-neutral-500")} />
                      }
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-neutral-900 text-sm font-display">
                        {type === "video" ? "Video Consultation" : "In-Person Visit"}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {type === "video"
                          ? "Consult from anywhere via video call"
                          : `Visit at ${doctor.hospital ?? "clinic"}`}
                      </p>
                    </div>
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      consultType === type ? "border-brand-500 bg-brand-500" : "border-neutral-300"
                    )}>
                      {consultType === type && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep("slot")}
                className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── STEP 2: Slot ───────────────────────────────────────── */}
          {step === "slot" && (
            <div className="space-y-5">
              {/* Date picker */}
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-3">Select date</p>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                  {days.map((day) => (
                    <button
                      key={day.date}
                      onClick={() => { setSelectedDate(day.date); setSelectedTime(null); }}
                      className={cn(
                        "flex-shrink-0 flex flex-col items-center gap-0.5 w-14 py-3 rounded-2xl border-2 transition-all",
                        selectedDate === day.date
                          ? "border-brand-500 bg-brand-500 text-white"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-brand-300"
                      )}
                    >
                      <span className={cn("text-[10px] font-medium", selectedDate === day.date ? "text-brand-100" : "text-neutral-400")}>
                        {day.dayName}
                      </span>
                      <span className="text-base font-bold leading-tight">{day.dayNum}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slots */}
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-3">Select time</p>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const unavailable = UNAVAILABLE_SLOTS.includes(slot);
                    const selected = selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        onClick={() => !unavailable && setSelectedTime(slot)}
                        disabled={unavailable}
                        className={cn(
                          "py-2.5 rounded-xl text-xs font-medium border-2 transition-all",
                          unavailable
                            ? "border-neutral-100 bg-neutral-50 text-neutral-300 cursor-not-allowed line-through"
                            : selected
                            ? "border-brand-500 bg-brand-500 text-white"
                            : "border-neutral-200 bg-white text-neutral-700 hover:border-brand-300"
                        )}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => setStep("confirm")}
                disabled={!selectedTime}
                className="btn-primary w-full disabled:opacity-40 flex items-center justify-center gap-2"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── STEP 3: Confirm ────────────────────────────────────── */}
          {step === "confirm" && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="space-y-2.5">
                {[
                  {
                    label: "Type",
                    value: consultType === "video" ? "Video Consultation" : "In-Person Visit",
                    icon: consultType === "video" ? Video : MapPin,
                  },
                  {
                    label: "Date",
                    value: new Date(selectedDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }),
                    icon: Calendar,
                  },
                  {
                    label: "Time",
                    value: selectedTime ?? "",
                    icon: Clock,
                  },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                    <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-brand-500" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400">{label}</p>
                      <p className="text-sm font-semibold text-neutral-800">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-1.5">Notes for doctor (optional)</p>
                <textarea
                  className="input resize-none text-sm"
                  rows={3}
                  placeholder="Describe your symptoms or reason for visit…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Fee */}
              <div className="flex items-center justify-between p-3 bg-brand-50 rounded-xl">
                <span className="text-sm font-medium text-neutral-700">Consultation Fee</span>
                <span className="font-bold text-neutral-900">{formatCurrency(doctor.consultationFee)}</span>
              </div>

              <button
                onClick={handleConfirm}
                disabled={booking}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {booking
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Confirming…</>
                  : "Confirm & Pay"
                }
              </button>
            </div>
          )}

          {/* ── STEP 4: Success ────────────────────────────────────── */}
          {step === "success" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-success-500" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 font-display mb-1">
                Appointment Booked!
              </h3>
              <p className="text-sm text-neutral-500 mb-5">
                Your appointment with <span className="font-medium text-neutral-700">{doctor.name}</span> has been confirmed.
              </p>

              <div className="bg-neutral-50 rounded-2xl p-4 text-left space-y-2.5 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Date</span>
                  <span className="font-medium text-neutral-800">
                    {new Date(selectedDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Time</span>
                  <span className="font-medium text-neutral-800">{selectedTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Type</span>
                  <span className="font-medium text-neutral-800">{consultType === "video" ? "Video" : "In-Person"}</span>
                </div>
              </div>

              <button
                onClick={() => { onSuccess(doctor); handleClose(); }}
                className="btn-primary w-full"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}