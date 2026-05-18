import { DoctorLayout } from "@/src/components/layouts/DoctorLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DoctorLayout>{children}</DoctorLayout>;
}
