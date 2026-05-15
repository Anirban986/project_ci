// In a real app these would call your API. For now they return mock data with simulated delay.

import {
  MOCK_APPOINTMENTS,
  MOCK_DOCUMENTS,
  MOCK_MEDICINES,
  MOCK_PHARMACIES,
  MOCK_RESERVATIONS,
  MOCK_PATIENT,
} from "./mock-data";
import type { Appointment, MedicalDocument, Medicine, Pharmacy, MedicineReservation, Patient } from "@/src/types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const patientService = {
  async getProfile(): Promise<Patient> {
    await delay(400);
    return MOCK_PATIENT;
  },

  async getAppointments(patientId: string): Promise<Appointment[]> {
    await delay(500);
    return MOCK_APPOINTMENTS.filter((a) => a.patientId === patientId);
  },

  async getDocuments(patientId: string): Promise<MedicalDocument[]> {
    await delay(400);
    return MOCK_DOCUMENTS.filter((d) => d.patientId === patientId);
  },

  async getMedicines(query?: string): Promise<Medicine[]> {
    await delay(300);
    if (!query) return MOCK_MEDICINES;
    const q = query.toLowerCase();
    return MOCK_MEDICINES.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q)
    );
  },

  async getPharmacies(): Promise<Pharmacy[]> {
    await delay(400);
    return MOCK_PHARMACIES;
  },

  async getReservations(patientId: string): Promise<MedicineReservation[]> {
    await delay(350);
    return MOCK_RESERVATIONS.filter((r) => r.patientId === patientId);
  },

  async reserveMedicine(
    medicineId: string,
    pharmacyId: string,
    quantity: number
  ): Promise<MedicineReservation> {
    await delay(800);
    const reservation: MedicineReservation = {
      id: `r${Date.now()}`,
      medicineId,
      medicineName: MOCK_MEDICINES.find((m) => m.id === medicineId)?.name ?? "Unknown",
      pharmacyId,
      pharmacyName: MOCK_PHARMACIES.find((p) => p.id === pharmacyId)?.name ?? "Unknown",
      patientId: MOCK_PATIENT.id,
      quantity,
      status: "pending",
      reservedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    return reservation;
  },

  async uploadDocument(file: File, category: string): Promise<void> {
    await delay(1500);
    // No-op: simulate upload
  },
};
