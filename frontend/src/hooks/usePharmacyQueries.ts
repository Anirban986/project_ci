import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pharmacyService } from "@/src/services/pharmacy.service";
import type { StockStatus } from "@/src/types";

const KEYS = {
  inventory:    (id: string) => ["pharmacy", "inventory", id] as const,
  reservations: (id: string) => ["pharmacy", "reservations", id] as const,
};

export function usePharmacyInventory(pharmacyId: string) {
  return useQuery({
    queryKey: KEYS.inventory(pharmacyId),
    queryFn: () => pharmacyService.getInventory(pharmacyId),
    enabled: !!pharmacyId,
  });
}

export function usePharmacyReservations(pharmacyId: string) {
  return useQuery({
    queryKey: KEYS.reservations(pharmacyId),
    queryFn: () => pharmacyService.getReservations(pharmacyId),
    enabled: !!pharmacyId,
  });
}

export function useUpdateStockStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ medicineId, status }: { medicineId: string; status: StockStatus }) =>
      pharmacyService.updateStockStatus(medicineId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pharmacy", "inventory"] });
    },
  });
}

export function useMarkReservationReady() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reservationId: string) =>
      pharmacyService.markReservationReady(reservationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pharmacy", "reservations"] });
    },
  });
}

export function useMarkReservationCollected() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reservationId: string) =>
      pharmacyService.markReservationCollected(reservationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pharmacy", "reservations"] });
    },
  });
}
