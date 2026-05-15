import { MOCK_MEDICINES, MOCK_RESERVATIONS } from "./mock-data";
import type { Medicine, MedicineReservation, StockStatus } from "@/src/types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const pharmacyService = {
  async getInventory(pharmacyId: string): Promise<Medicine[]> {
    await delay(400);
    return MOCK_MEDICINES;
  },

  async updateStockStatus(medicineId: string, status: StockStatus): Promise<void> {
    await delay(500);
    // No-op
  },

  async getReservations(pharmacyId: string): Promise<MedicineReservation[]> {
    await delay(400);
    return MOCK_RESERVATIONS.filter((r) => r.pharmacyId === pharmacyId);
  },

  async markReservationReady(reservationId: string): Promise<void> {
    await delay(600);
    // No-op
  },

  async markReservationCollected(reservationId: string): Promise<void> {
    await delay(600);
    // No-op
  },

  async addMedicine(medicine: Omit<Medicine, "id">): Promise<Medicine> {
    await delay(700);
    return { ...medicine, id: `m${Date.now()}` };
  },
};
