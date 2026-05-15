import { ResetPasswordPage } from "@/src/features/auth/Resetpasswordpage";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reset Password" };

export default function Page() {
  return <ResetPasswordPage />;
}