import {
  MOCK_APPOINTMENTS,
  MOCK_DOCTORS,
  MOCK_PRESCRIPTIONS,
} from "./mock-data";
import type { Appointment, Doctor, Prescription } from "@/src/types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const doctorService = {
  async getAppointments(doctorId: string): Promise<Appointment[]> {
    await delay(500);
    return MOCK_APPOINTMENTS.filter((a) => a.doctorId === doctorId);
  },

  async getDoctors(): Promise<Doctor[]> {
    await delay(400);
    return MOCK_DOCTORS;
  },

  async confirmAppointment(appointmentId: string): Promise<void> {
    await delay(600);
    // No-op
  },

  async declineAppointment(appointmentId: string): Promise<void> {
    await delay(600);
    // No-op
  },

  async getPrescriptions(doctorId: string): Promise<Prescription[]> {
    await delay(400);
    return MOCK_PRESCRIPTIONS.filter((p) => p.doctorId === doctorId);
  },

  async savePrescription(prescription: Omit<Prescription, "id" | "issuedAt">): Promise<Prescription> {
    await delay(800);
    return {
      ...prescription,
      id: `presc${Date.now()}`,
      issuedAt: new Date().toISOString(),
    };
  },
};
