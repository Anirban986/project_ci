"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Heart,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import api from "@/src/utils/api";
// ─── Password strength ────────────────────────────────────────────────────────

interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

const RULES: PasswordRule[] = [
  { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { label: "One uppercase letter (A–Z)", test: (pw) => /[A-Z]/.test(pw) },
  { label: "One lowercase letter (a–z)", test: (pw) => /[a-z]/.test(pw) },
  { label: "One number (0–9)", test: (pw) => /\d/.test(pw) },
  {
    label: "One special character (!@#$…)",
    test: (pw) => /[^A-Za-z0-9]/.test(pw),
  },
];

function getStrength(pw: string): 0 | 1 | 2 | 3 | 4 {
  const passed = RULES.filter((r) => r.test(pw)).length;
  if (passed <= 1) return 0;
  if (passed === 2) return 1;
  if (passed === 3) return 2;
  if (passed === 4) return 3;
  return 4;
}

const STRENGTH_CONFIG: Record<
  0 | 1 | 2 | 3 | 4,
  { label: string; color: string; barColor: string; bars: number }
> = {
  0: {
    label: "",
    color: "text-neutral-300",
    barColor: "bg-neutral-200",
    bars: 0,
  },
  1: {
    label: "Weak",
    color: "text-danger-500",
    barColor: "bg-danger-500",
    bars: 1,
  },
  2: {
    label: "Fair",
    color: "text-warning-500",
    barColor: "bg-warning-500",
    bars: 2,
  },
  3: {
    label: "Good",
    color: "text-brand-500",
    barColor: "bg-brand-400",
    bars: 3,
  },
  4: {
    label: "Strong",
    color: "text-success-600",
    barColor: "bg-success-500",
    bars: 4,
  },
};

function StrengthMeter({ password }: { password: string }) {
  const strength = getStrength(password);
  const cfg = STRENGTH_CONFIG[strength];

  if (!password) return null;

  return (
    <div className="space-y-2.5">
      {/* Bar */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                i <= cfg.bars ? cfg.barColor : "bg-neutral-100",
              )}
            />
          ))}
        </div>
        {strength > 0 && (
          <span className={cn("text-xs font-semibold", cfg.color)}>
            {cfg.label}
          </span>
        )}
      </div>

      {/* Rules checklist */}
      <div className="grid grid-cols-1 gap-1">
        {RULES.map((rule) => {
          const passed = rule.test(password);
          return (
            <div key={rule.label} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                  passed ? "bg-success-100" : "bg-neutral-100",
                )}
              >
                {passed ? (
                  <Check className="w-2.5 h-2.5 text-success-600" />
                ) : (
                  <X className="w-2.5 h-2.5 text-neutral-300" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs transition-colors",
                  passed ? "text-success-600 font-medium" : "text-neutral-400",
                )}
              >
                {rule.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const strength = getStrength(password);
  const allRulesPassed = RULES.every((r) => r.test(password));
  const passwordsMatch = password === confirm && confirm.length > 0;
  const canSubmit = allRulesPassed && passwordsMatch && !loading;

  // ================= SET NEW PASSWORD =================
  const handleSetNewPassword = async () => {
    try {
      setLoading(true);
      setError("");

      if (!password) {
        setError("Please enter a new password.");
        return;
      }

      if (!allRulesPassed) {
        setError("Your password doesn't meet all the requirements.");
        return;
      }

      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }

      const response = await api.post("/api/auth/set-new-password", {
        email,
        newPassword: password,
      });

      console.log(response.data);

      setDone(true);

      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // Auto redirect after success
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => router.push("/"), 3000);
    return () => clearTimeout(t);
  }, [done, router]);

  // ── Success screen ────────────────────────────────────────────────────────
  if (done) {
    return (
      <main className="min-h-dvh bg-gradient-to-br from-brand-50 via-white to-neutral-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-card p-8 text-center space-y-5">
          {/* Animated check */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-success-50 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-success-500" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-success-200 animate-ping opacity-40" />
            </div>
          </div>

          <div>
            <h1 className="text-xl font-bold text-neutral-900 font-display">
              Password reset!
            </h1>
            <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
              Your password has been updated successfully. You will be redirected
              to login in a moment.
            </p>
          </div>

          {/* Email */}
          <div className="bg-neutral-50 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-success-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-success-600" />
            </div>
            <div className="text-left">
              <p className="text-xs text-neutral-400">Account updated</p>
              <p className="text-sm font-semibold text-neutral-800">{email}</p>
            </div>
          </div>

          {/* Progress bar auto-redirect */}
          <div>
            <p className="text-xs text-neutral-400 mb-1.5">
              Redirecting to login…
            </p>
            <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-1.5 bg-success-400 rounded-full animate-[width_3s_linear_forwards]"
                style={{ animation: "progress 3s linear forwards" }}
              />
            </div>
          </div>

          <Link
            href="/"
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            Go to Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <style>{`
          @keyframes progress {
            from { width: 0% }
            to   { width: 100% }
          }
        `}</style>
      </main>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-dvh bg-gradient-to-br from-brand-50 via-white to-neutral-50 flex flex-col items-center justify-center px-4 py-12">
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

        <div className="bg-white rounded-3xl shadow-card p-7 space-y-5">
          {/* Header */}
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-brand-500" />
            </div>
            <h1 className="text-xl font-bold text-neutral-900 font-display">
              Set new password
            </h1>
            {email && (
              <p className="text-xs text-neutral-400 mt-1.5">
                for{" "}
                <span className="font-medium text-neutral-600">{email}</span>
              </p>
            )}
          </div>

          {/* New password */}
          <div className="space-y-1.5">
            <label className="label block">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                className={cn(
                  "input pl-10 pr-11",
                  password &&
                    !allRulesPassed &&
                    "border-warning-300 focus:border-warning-400",
                  allRulesPassed &&
                    "border-success-300 focus:border-success-400",
                )}
                type={showPw ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {showPw ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Strength meter */}
          {password && <StrengthMeter password={password} />}

          {/* Confirm password */}
          <div className="space-y-1.5">
            <label className="label block">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                className={cn(
                  "input pl-10 pr-11",
                  confirm &&
                    !passwordsMatch &&
                    "border-danger-300 focus:border-danger-400",
                  confirm &&
                    passwordsMatch &&
                    "border-success-300 focus:border-success-400",
                )}
                type={showCf ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) =>
                  e.key === "Enter" && canSubmit && handleSetNewPassword()
                }
              />
              <button
                type="button"
                onClick={() => setShowCf(!showCf)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {showCf ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Match indicator */}
            {confirm && (
              <p
                className={cn(
                  "text-xs flex items-center gap-1.5 font-medium",
                  passwordsMatch ? "text-success-600" : "text-danger-500",
                )}
              >
                {passwordsMatch ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Passwords match
                  </>
                ) : (
                  <>
                    <X className="w-3.5 h-3.5" /> Passwords do not match
                  </>
                )}
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-danger-50 border border-danger-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-danger-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-danger-600 font-medium">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSetNewPassword}
            disabled={!canSubmit}
            className={cn(
              "btn-primary w-full flex items-center justify-center gap-2",
              !canSubmit && "opacity-50 cursor-not-allowed",
            )}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Reset Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}
