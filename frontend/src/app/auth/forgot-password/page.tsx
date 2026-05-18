import { ForgotPasswordPage } from "@/src/features/auth/Forgotpasswordpage";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Forgot Password" };

export default function Page() {
  return <ForgotPasswordPage />;
}