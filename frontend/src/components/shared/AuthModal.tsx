"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/src/utils/api";
import Link from "next/link";

import {
  X,
  Eye,
  EyeOff,
  Heart,
  Stethoscope,
  Store,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Loader2,
  ShieldAlert,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { cn } from "@/src/lib/utils";
import { useRateLimit } from "@/src/hooks/Useratelimit";
import type { UserRole } from "@/src/types";

// ─────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<
  UserRole,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    iconBg: string;
    redirectTo: string;
    description: string;
  }
> = {
  patient: {
    label: "Patient",
    icon: Heart,
    color: "text-brand-500",
    iconBg: "bg-brand-50",
    redirectTo: "/patient/dashboard",
    description: "Access your health dashboard",
  },

  doctor: {
    label: "Doctor",
    icon: Stethoscope,
    color: "text-success-600",
    iconBg: "bg-success-50",
    redirectTo: "/doctor/dashboard",
    description: "Manage your patients & appointments",
  },

  pharmacy: {
    label: "Pharmacy",
    icon: Store,
    color: "text-warning-500",
    iconBg: "bg-warning-50",
    redirectTo: "/pharmacy/dashboard",
    description: "Manage inventory & reservations",
  },
};

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60_000;
const LOCKOUT_MS = 15 * 60_000;
const SUBMIT_DELAY = 800;

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function formatSeconds(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;

  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface AuthModalProps {
  open: boolean;
  role: UserRole | null;
  onClose: () => void;
}

type AuthTab = "login" | "register";

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export function AuthModal({ open, role, onClose }: AuthModalProps) {
  const router = useRouter();

  // ───────────────────────────────────────────────────────────
  // State
  // ───────────────────────────────────────────────────────────

  const [tab, setTab] = useState<AuthTab>("login");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState(false);

  const [showOTP, setShowOTP] = useState(false);

  const [code, setCode] = useState("");

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
  });

  const lastSubmitRef = useRef<number>(0);

  const submittingRef = useRef(false);

  // ───────────────────────────────────────────────────────────
  // Rate limit
  // ───────────────────────────────────────────────────────────

  const rl = useRateLimit({
    maxAttempts: MAX_ATTEMPTS,
    windowMs: WINDOW_MS,
    lockoutMs: LOCKOUT_MS,
    storageKey: `auth_${role ?? "unknown"}`,
  });

  // ───────────────────────────────────────────────────────────
  // Reset on close
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!open) {
      setForm({
        name: "",
        username: "",
        email: "",
        phone_number: "",
        password: "",
        confirmPassword: "",
      });

      setError("");
      setSuccess(false);
      setLoading(false);
      setShowOTP(false);
      setCode("");

      submittingRef.current = false;
    }
  }, [open]);

  // ───────────────────────────────────────────────────────────
  // Early return
  // ───────────────────────────────────────────────────────────

  if (!open || !role) return null;

  // ───────────────────────────────────────────────────────────
  // Config
  // ───────────────────────────────────────────────────────────

  const config = ROLE_CONFIG[role];

  const Icon = config.icon;

  // ───────────────────────────────────────────────────────────
  // Helpers
  // ───────────────────────────────────────────────────────────

  const update = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setError("");
  };

  const resetForm = () => {
    setForm({
      name: "",
      username: "",
      email: "",
      phone_number: "",
      password: "",
      confirmPassword: "",
    });

    setError("");
  };

  // ───────────────────────────────────────────────────────────
  // Validation
  // ───────────────────────────────────────────────────────────

  const validate = (): string | null => {
    if (!form.email || !form.password) {
      return "Please fill in all required fields.";
    }

    if (!isValidEmail(form.email)) {
      return "Please enter a valid email address.";
    }

    if (form.password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (tab === "register") {
      if (!form.name.trim()) {
        return "Full name is required.";
      }

      if (!form.username.trim()) {
        return "Username is required.";
      }

      if (form.password !== form.confirmPassword) {
        return "Passwords do not match.";
      }
    }

    return null;
  };

  // ───────────────────────────────────────────────────────────
  // Submit
  // ───────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (submittingRef.current) return;

    const now = Date.now();

    const msSinceLast = now - lastSubmitRef.current;

    if (msSinceLast < SUBMIT_DELAY) {
      setError("Please wait a moment before trying again.");
      return;
    }

    if (rl.isLocked) return;

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    submittingRef.current = true;

    lastSubmitRef.current = now;

    setLoading(true);

    setError("");

    try {
      // ───────────────── LOGIN ─────────────────

      if (tab === "login") {
        const response = await api.post("/api/auth/login", {
          email: form.email,
          password: form.password,
          role,
        });

        const data = response.data;

        rl.resetAttempts();

        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        setSuccess(true);

        setTimeout(() => {
          onClose();
          router.push(config.redirectTo);
        }, 700);
      }

      // ───────────────── REGISTER ─────────────────
      else {
        const response = await api.post("/api/auth/register", {
          name: form.name,
          username: form.username,
          email: form.email,
          phone_number: form.phone_number,
          password: form.password,
          role,
        });

        const data = response.data;

        console.log(data.message);

        setShowOTP(true);
      }
    } catch (err: any) {
      // ───────────────── LOGIN ERROR ─────────────────

      if (tab === "login") {
        rl.recordAttempt();

        if (rl.isLocked) {
          setError(
            `Too many failed attempts. Try again in ${formatSeconds(
              rl.secondsLeft,
            )}.`,
          );
        } else {
          const left = rl.attemptsLeft - 1;

          setError(
            err.response?.data?.message ||
              `Incorrect email or password.${
                left > 0 ? ` ${left} attempt${left !== 1 ? "s" : ""} left.` : ""
              }`,
          );
        }
      }

      // ───────────────── REGISTER ERROR ─────────────────
      else {
        setError(err.response?.data?.message || "Registration failed");
      }
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  // ───────────────────────────────────────────────────────────
  // Verify OTP
  // ───────────────────────────────────────────────────────────

  const handleVerifyOTP = async () => {
    try {
      setLoading(true);

      setError("");

      console.log("EMAIL:", form.email);
      console.log("OTP:", code);

      const response = await api.post("/api/auth/verify-code", {
        email: form.email,
        code,
      });

      const data = response.data;

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      setSuccess(true);

      setTimeout(() => {
        onClose();
        router.push(config.redirectTo);
      }, 700);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  // ───────────────────────────────────────────────────────────
  // Enter key
  // ───────────────────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !rl.isLocked && !loading) {
      handleSubmit();
    }
  };

  // ───────────────────────────────────────────────────────────
  // UI states
  // ───────────────────────────────────────────────────────────

  const submitDisabled = loading || rl.isLocked || success;

  const showWarning =
    !rl.isLocked && rl.attemptsLeft <= 2 && rl.attemptsLeft < MAX_ATTEMPTS;

  // ───────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[95dvh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-5">
            <div
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-2xl",
                config.iconBg,
              )}
            >
              <Icon className={cn("w-4 h-4", config.color)} />

              <span className={cn("text-sm font-semibold", config.color)}>
                {config.label}
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-xl font-bold text-neutral-900">
            {tab === "login" ? "Welcome back" : "Create account"}
          </h2>

          <p className="text-sm text-neutral-500 mt-1">{config.description}</p>
        </div>

        {/* LOCKOUT */}
        {rl.isLocked ? (
          <div className="px-6 pb-8">
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-danger-50 flex items-center justify-center mb-4">
                <ShieldAlert className="w-8 h-8 text-danger-500" />
              </div>

              <h3 className="font-bold text-neutral-900 mb-2">
                Account Temporarily Locked
              </h3>

              <p className="text-sm text-neutral-500 mb-5">
                Too many failed login attempts.
              </p>

              <div className="w-full flex items-center justify-center gap-2 bg-danger-50 border border-danger-100 rounded-2xl px-4 py-3">
                <Clock className="w-4 h-4 text-danger-500" />

                <span className="text-sm font-semibold text-danger-600">
                  Try again in {formatSeconds(rl.secondsLeft)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="px-6 mb-5">
              <div className="flex bg-neutral-100 rounded-xl p-1">
                {(["login", "register"] as AuthTab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTab(t);
                      resetForm();
                    }}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                      tab === t
                        ? "bg-white text-neutral-900 shadow-sm"
                        : "text-neutral-500 hover:text-neutral-700",
                    )}
                  >
                    {t === "login" ? "Log In" : "Sign Up"}
                  </button>
                ))}
              </div>
            </div>

            {/* OTP SCREEN */}
            {showOTP ? (
              <div className="px-6 pb-6 space-y-4">
                <h3 className="text-lg font-semibold">Verify Email</h3>

                <p className="text-sm text-neutral-500">
                  Enter the verification code sent to {form.email}
                </p>

                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="input"
                />

                {error && <div className="text-sm text-red-500">{error}</div>}

                <button
                  onClick={handleVerifyOTP}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-brand-500 text-white"
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </button>
              </div>
            ) : (
              // FORM
              <div className="px-6 pb-6 space-y-3">
                {tab === "register" && (
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />

                    <input
                      className="input pl-10"
                      type="text"
                      placeholder="Full name"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                    />
                  </div>
                )}

                {tab === "register" && (
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />

                    <input
                      className="input pl-10"
                      type="text"
                      placeholder="Username"
                      value={form.username}
                      onChange={(e) => update("username", e.target.value)}
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />

                  <input
                    className="input pl-10"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>

                {tab === "register" && (
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />

                    <input
                      className="input pl-10"
                      type="tel"
                      placeholder="Phone"
                      value={form.phone_number}
                      onChange={(e) => update("phone_number", e.target.value)}
                    />
                  </div>
                )}

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />

                  <input
                    className="input pl-10 pr-11"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    onKeyDown={handleKeyDown}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {tab === "register" && (
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />

                    <input
                      className="input pl-10"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={form.confirmPassword}
                      onChange={(e) =>
                        update("confirmPassword", e.target.value)
                      }
                    />
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2 px-3 py-2.5 bg-danger-50 border border-danger-100 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-danger-500 mt-0.5" />

                    <p className="text-xs text-danger-600 font-medium">
                      {error}
                    </p>
                  </div>
                )}

                {/* Warning */}
                {showWarning && (
                  <div className="flex items-start gap-2 px-3 py-2.5 bg-warning-50 border border-warning-100 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-warning-500 mt-0.5" />

                    <p className="text-xs text-warning-600 font-medium">
                      {rl.attemptsLeft} attempts left before lockout.
                    </p>
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={submitDisabled}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white transition-all",
                    "disabled:opacity-60 disabled:cursor-not-allowed",
                    role === "patient" && "bg-brand-500 hover:bg-brand-600",
                    role === "doctor" && "bg-success-600 hover:bg-success-700",
                    role === "pharmacy" && "bg-warning-500 hover:bg-amber-600",
                  )}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Success
                    </>
                  ) : (
                    <>
                      {tab === "login" ? "Log In" : "Create Account"}

                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                {tab === "login" && (
                  <Link href="/auth/forgot-password" className="text-sm text-brand-500 hover:underline block text-center">
                    Forgot Password?
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
