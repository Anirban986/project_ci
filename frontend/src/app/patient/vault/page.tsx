import { MedicalVaultScreen } from "@/src/features/patient/MedicalVaultScreen";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Medical Vault" };

export default function VaultPage() {
  return <MedicalVaultScreen />;
}
