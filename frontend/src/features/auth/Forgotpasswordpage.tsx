"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Mail,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Smartphone,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import api from "@/src/utils/api";

// ─── Steps ────────────────────────────────────────────────────────────────────
type Step = "email" | "otp" | "success";

// ─── OTP length ───────────────────────────────────────────────────────────────
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepDots({ current }: { current: Step }) {
  const steps: Step[] = ["email", "otp", "success"];
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              current === s
                ? "bg-brand-500 w-5"
                : steps.indexOf(current) > i
                  ? "bg-brand-300"
                  : "bg-neutral-200",
            )}
          />
        </div>
      ))}
    </div>
  );
}

// ─── OTP Input ────────────────────────────────────────────────────────────────
function OtpInput({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, "").slice(-1);
    const newVal = value.split("");
    newVal[index] = digit;
    const joined = newVal.join("").slice(0, OTP_LENGTH);
    onChange(joined);
    if (digit && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
        const newVal = value.split("");
        newVal[index - 1] = "";
        onChange(newVal.join(""));
      } else {
        const newVal = value.split("");
        newVal[index] = "";
        onChange(newVal.join(""));
      }
    }
    if (e.key === "ArrowLeft" && index > 0)
      inputsRef.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1)
      inputsRef.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    onChange(pasted.padEnd(OTP_LENGTH, "").slice(0, OTP_LENGTH));
    const nextEmpty = Math.min(pasted.length, OTP_LENGTH - 1);
    inputsRef.current[nextEmpty]?.focus();
  };

  return (
    <div className="flex gap-2.5 justify-center">
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={cn(
            "w-11 h-13 text-center text-lg font-bold rounded-xl border-2 outline-none transition-all",
            "focus:ring-2 focus:ring-brand-200",
            error
              ? "border-danger-400 bg-danger-50 text-danger-700 focus:border-danger-500"
              : value[i]
                ? "border-brand-400 bg-brand-50 text-brand-700 focus:border-brand-500"
                : "border-neutral-200 bg-neutral-50 text-neutral-900 focus:border-brand-400",
          )}
          style={{ height: "52px" }}
        />
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpError, setOtpError] = useState(false);
  

  // Resend cooldown
  const [cooldown, setCooldown] = useState(0);
  

  

  useState(false);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(
    () => () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    },
    [],
  );

  // ── Step 1: send OTP ──────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    setError("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    await api.post("/api/auth/forgot-password", { email });
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    setStep("otp");
    startCooldown();
  };

  // ── Resend OTP ─────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (cooldown > 0) return;
    setOtp("");
    setOtpError(false);
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    startCooldown();
  };

  // ── Step 2: verify OTP ────────────────────────────────────────────────────
  // ================= VERIFY RESET OTP =================
  const handleVerifyResetOtp = async () => {
    try {
      setLoading(true);
      setError("");
      setOtpError(false);

      if (otp.length !== OTP_LENGTH) {
        setOtpError(true);
        setError("Please enter a valid 6-digit OTP");
        return;
      }

      const response = await api.post("/api/auth/verify-reset-otp", {
        email,
        otp,
      });

      console.log(response.data);

      setStep("success");
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to verify OTP";

      setError(message);

      if (
        message.toLowerCase().includes("otp") ||
        message.toLowerCase().includes("expired")
      ) {
        setOtpError(true);
      }
    } finally {
      setLoading(false);
    }
  };



  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <main className="min-h-dvh bg-gradient-to-br from-brand-50 via-white to-neutral-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Card */}
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-200 mb-3">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <p className="text-sm font-semibold text-neutral-900 font-display">
            MedLink
          </p>
        </div>

        {/* Step dots */}
        <StepDots current={step} />

        {/* ── STEP 1: Email ─────────────────────────────────────────────── */}
        {step === "email" && (
          <div className="bg-white rounded-3xl shadow-card p-7 space-y-5">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-brand-500" />
              </div>
              <h1 className="text-xl font-bold text-neutral-900 font-display">
                Forgot password?
              </h1>
              <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed">
                No worries. Enter your registered email and we'll send you a
                6-digit verification code.
              </p>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  className="input pl-10"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-danger-50 border border-danger-100 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-danger-500 flex-shrink-0" />
                  <p className="text-xs text-danger-600 font-medium">{error}</p>
                </div>
              )}

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Send Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <Link
              href="/"
              className="flex items-center justify-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors pt-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        )}

        {/* ── STEP 2: OTP ───────────────────────────────────────────────── */}
        {step === "otp" && (
          <div className="bg-white rounded-3xl shadow-card p-7 space-y-5">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-7 h-7 text-brand-500" />
              </div>
              <h1 className="text-xl font-bold text-neutral-900 font-display">
                Check your email
              </h1>
              <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed">
                We sent a 6-digit code to
              </p>
              <p className="text-sm font-semibold text-neutral-800 mt-0.5">
                {email}
              </p>
            </div>

            {/* OTP boxes */}
            <div className="space-y-4">
              <OtpInput
                value={otp}
                onChange={(v) => {
                  setOtp(v);
                  setOtpError(false);
                  setError("");
                }}
                error={otpError}
              />

              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-danger-50 border border-danger-100 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-danger-500 flex-shrink-0" />
                  <p className="text-xs text-danger-600 font-medium">{error}</p>
                </div>
              )}

              <button
                onClick={handleVerifyResetOtp}
                disabled={loading || otp.length < OTP_LENGTH}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Verify Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Resend */}
            <div className="text-center space-y-2">
              <p className="text-xs text-neutral-500">Did not receive it?</p>
              <button
                onClick={handleResend}
                disabled={cooldown > 0 || loading}
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium mx-auto transition-colors",
                  cooldown > 0 || loading
                    ? "text-neutral-300 cursor-not-allowed"
                    : "text-brand-500 hover:text-brand-600",
                )}
              >
                <RefreshCw
                  className={cn("w-3.5 h-3.5", loading && "animate-spin")}
                />
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </button>
            </div>

            <button
              onClick={() => {
                setStep("email");
                setOtp("");
                setOtpError(false);
                setError("");
              }}
              className="flex items-center justify-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors w-full pt-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Change email
            </button>
          </div>
        )}

        {/* ── STEP 3: Success ───────────────────────────────────────────── */}
        {step === "success" && (
          <div className="bg-white rounded-3xl shadow-card p-7 space-y-5 text-center">
            {/* Animated check */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-success-50 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-success-500" />
                </div>
                {/* Pulse ring */}
                <div className="absolute inset-0 rounded-full border-4 border-success-200 animate-ping opacity-40" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900 font-display">
                  Identity verified!
                </h1>
                <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed">
                  Your identity has been confirmed. You can now set a new
                  password for your account.
                </p>
              </div>
            </div>

            {/* Account info */}
            <div className="bg-neutral-50 rounded-2xl p-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-brand-600">
                    {email[0]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-neutral-400">Verified account</p>
                  <p className="text-sm font-semibold text-neutral-800">
                    {email}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                router.push(
                  `/auth/reset-password?email=${encodeURIComponent(email)}`,
                )
              }
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Set New Password <ArrowRight className="w-4 h-4" />
            </button>
           

          

            <Link
              href="/"
              className="block text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              Go back to login instead
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
