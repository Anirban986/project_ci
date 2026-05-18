import { PatientLayout } from "@/src/components/layouts/PatientLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PatientLayout>{children}</PatientLayout>;
}
