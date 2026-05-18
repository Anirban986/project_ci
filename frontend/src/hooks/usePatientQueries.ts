import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService } from "@/src/services/patient.service";

const KEYS = {
  profile:      ["patient", "profile"] as const,
  appointments: (id: string) => ["patient", "appointments", id] as const,
  documents:    (id: string) => ["patient", "documents", id] as const,
  medicines:    (q?: string) => ["medicines", q ?? ""] as const,
  pharmacies:   ["pharmacies"] as const,
  reservations: (id: string) => ["patient", "reservations", id] as const,
};

export function usePatientProfile() {
  return useQuery({
    queryKey: KEYS.profile,
    queryFn: () => patientService.getProfile(),
  });
}

export function usePatientAppointments(patientId: string) {
  return useQuery({
    queryKey: KEYS.appointments(patientId),
    queryFn: () => patientService.getAppointments(patientId),
    enabled: !!patientId,
  });
}

export function usePatientDocuments(patientId: string) {
  return useQuery({
    queryKey: KEYS.documents(patientId),
    queryFn: () => patientService.getDocuments(patientId),
    enabled: !!patientId,
  });
}

export function useMedicines(query?: string) {
  return useQuery({
    queryKey: KEYS.medicines(query),
    queryFn: () => patientService.getMedicines(query),
    staleTime: 30_000,
  });
}

export function usePharmacies() {
  return useQuery({
    queryKey: KEYS.pharmacies,
    queryFn: () => patientService.getPharmacies(),
    staleTime: 60_000,
  });
}

export function usePatientReservations(patientId: string) {
  return useQuery({
    queryKey: KEYS.reservations(patientId),
    queryFn: () => patientService.getReservations(patientId),
    enabled: !!patientId,
  });
}

export function useReserveMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      medicineId,
      pharmacyId,
      quantity,
    }: {
      medicineId: string;
      pharmacyId: string;
      quantity: number;
    }) => patientService.reserveMedicine(medicineId, pharmacyId, quantity),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patient", "reservations"] });
    },
  });
}
