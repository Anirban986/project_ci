import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doctorService } from "@/src/services/doctor.service";

const KEYS = {
  appointments:  (id: string) => ["doctor", "appointments", id] as const,
  doctors:       ["doctors"] as const,
  prescriptions: (id: string) => ["doctor", "prescriptions", id] as const,
};

export function useDoctorAppointments(doctorId: string) {
  return useQuery({
    queryKey: KEYS.appointments(doctorId),
    queryFn: () => doctorService.getAppointments(doctorId),
    enabled: !!doctorId,
  });
}

export function useDoctors() {
  return useQuery({
    queryKey: KEYS.doctors,
    queryFn: () => doctorService.getDoctors(),
    staleTime: 5 * 60_000,
  });
}

export function useDoctorPrescriptions(doctorId: string) {
  return useQuery({
    queryKey: KEYS.prescriptions(doctorId),
    queryFn: () => doctorService.getPrescriptions(doctorId),
    enabled: !!doctorId,
  });
}

export function useConfirmAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: string) =>
      doctorService.confirmAppointment(appointmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctor", "appointments"] });
    },
  });
}

export function useDeclineAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: string) =>
      doctorService.declineAppointment(appointmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctor", "appointments"] });
    },
  });
}
