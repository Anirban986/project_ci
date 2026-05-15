"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X, Mail, Lock, Eye, EyeOff, Loader2,
  ShieldCheck, ShieldAlert, Clock, AlertTriangle,
  CheckCircle2, ArrowRight, Smartphone, RefreshCw,
  KeyRound,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  adminLogin,
  adminVerifyMFA,
} from "@/src/services/admin/admin-auth.service";
import { useAdminAuthStore } from "@/src/store/admin-auth.store";
import { useAdminRateLimit } from "@/src/hooks/useAdminRateLimits";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "credentials" | "mfa" | "success";

interface MFASession {
  token:   string;
  adminId: string;
  name:    string;
  email:   string;
}

// ─── OTP input ────────────────────────────────────────────────────────────────

const MFA_LENGTH = 6;

function MFAInput({
  value,
  onChange,
  error,
  disabled,
}: {
  value:    string;
  onChange: (v: string) => void;
  error:    boolean;
  disabled: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, char: string) => {
    const digit  = char.replace(/\D/g, "").slice(-1);
    const arr    = value.split("");
    arr[i]       = digit;
    const joined = arr.join("").slice(0, MFA_LENGTH);
    onChange(joined);
    if (digit && i < MFA_LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      const arr = value.split("");
      if (!arr[i] && i > 0) {
        arr[i - 1] = "";
        onChange(arr.join(""));
        refs.current[i - 1]?.focus();
      } else {
        arr[i] = "";
        onChange(arr.join(""));
      }
    }
    if (e.key === "ArrowLeft"  && i > 0)              refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < MFA_LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, MFA_LENGTH);
    onChange(pasted.padEnd(MFA_LENGTH, "").slice(0, MFA_LENGTH));
    refs.current[Math.min(pasted.length, MFA_LENGTH - 1)]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: MFA_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={cn(
            "w-11 text-center text-lg font-bold rounded-xl border-2 outline-none transition-all",
            "focus:ring-2 disabled:opacity-40 disabled:cursor-not-allowed",
            "h-[52px]",
            error
              ? "border-danger-400 bg-danger-50 text-danger-700 focus:border-danger-500 focus:ring-danger-200"
              : value[i]
              ? "border-neutral-800 bg-neutral-900 text-white focus:border-neutral-700 focus:ring-neutral-300"
              : "border-neutral-300 bg-neutral-50 text-neutral-900 focus:border-neutral-600 focus:ring-neutral-200"
          )}
        />
      ))}
    </div>
  );
}

// ─── Lockout screen ───────────────────────────────────────────────────────────

function LockoutScreen({
  secondsLeft,
  formatTime,
  onClose,
}: {
  secondsLeft: number;
  formatTime:  (s: number) => string;
  onClose:     () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center py-4 px-2">
      <div className="w-16 h-16 rounded-2xl bg-danger-50 flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8 text-danger-500" />
      </div>
      <h3 className="font-bold text-neutral-900 font-display mb-2 text-lg">
        Admin Access Locked
      </h3>
      <p className="text-sm text-neutral-500 mb-5 leading-relaxed">
        Too many failed admin login attempts. This session has been locked for security.
      </p>
      <div className="w-full flex items-center justify-center gap-2 bg-danger-50 border border-danger-200 rounded-2xl px-4 py-3 mb-4">
        <Clock className="w-4 h-4 text-danger-500 flex-shrink-0" />
        <span className="text-sm font-bold text-danger-600">
          Locked for {formatTime(secondsLeft)}
        </span>
      </div>
      <p className="text-xs text-neutral-400 leading-relaxed">
        If you believe this is a mistake, contact your system administrator or wait for the lockout to expire.
      </p>
      <button
        onClick={onClose}
        className="mt-5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
      >
        Close
      </button>
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

interface AdminAuthModalProps {
  open:    boolean;
  onClose: () => void;
}

export function AdminAuthModal({ open, onClose }: AdminAuthModalProps) {
  const router     = useRouter();
  const setSession = useAdminAuthStore((s) => s.setSession);
  const rl         = useAdminRateLimit();

  // Step state
  const [step, setStep]           = useState<Step>("credentials");
  const [mfaSession, setMfaSession] = useState<MFASession | null>(null);

  // Credentials form
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);

  // MFA form
  const [mfaCode, setMfaCode]     = useState("");
  const [mfaError, setMfaError]   = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Shared
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const submittingRef             = useRef(false);
  const lastSubmitRef             = useRef(0);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStep("credentials");
      setEmail("");
      setPassword("");
      setShowPw(false);
      setMfaCode("");
      setMfaError(false);
      setMfaSession(null);
      setError("");
      setLoading(false);
      submittingRef.current = false;
    }
  }, [open]);

  // Auto-submit MFA when all digits entered
  useEffect(() => {
    if (mfaCode.length === MFA_LENGTH && step === "mfa") {
      handleVerifyMFA();
    }
  }, [mfaCode]);

  useEffect(() => () => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
  }, []);

  const startResendCooldown = () => {
    setResendCooldown(60);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((p) => {
        if (p <= 1) { if (cooldownRef.current) clearInterval(cooldownRef.current); return 0; }
        return p - 1;
      });
    }, 1000);
  };

  if (!open) return null;

  // ── Step 1: Credentials ──────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (submittingRef.current) return;
    if (Date.now() - lastSubmitRef.current < 800) {
      setError("Please wait a moment before trying again.");
      return;
    }
    if (rl.isLocked) return;

    if (!email || !password) { setError("Email and password are required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email address."); return; }

    submittingRef.current = true;
    lastSubmitRef.current = Date.now();
    setLoading(true);
    setError("");

    const res = await adminLogin({ email, password });

    if (!res.success) {
      rl.recordFailure();
      const left = rl.attemptsLeft - 1;
      setError(
        rl.isLocked
          ? `Too many attempts. Locked for ${rl.lockoutMinutes} minutes.`
          : `${res.error}${left > 0 ? ` ${left} attempt${left !== 1 ? "s" : ""} left.` : ""}`
      );
      setLoading(false);
      submittingRef.current = false;
      return;
    }

    setMfaSession({
      token:   res.mfaSessionToken,
      adminId: res.adminId,
      name:    res.name,
      email:   res.email,
    });
    setStep("mfa");
    startResendCooldown();
    setLoading(false);
    submittingRef.current = false;
  };

  // ── Step 2: Verify MFA ───────────────────────────────────────────────────────
  const handleVerifyMFA = async () => {
    if (!mfaSession || mfaCode.length < MFA_LENGTH || submittingRef.current) return;

    submittingRef.current = true;
    setLoading(true);
    setMfaError(false);
    setError("");

    const res = await adminVerifyMFA({
      mfaSessionToken: mfaSession.token,
      code:            mfaCode,
    });

    if (!res.success) {
      rl.recordFailure();
      setMfaError(true);
      setMfaCode("");
      setError(res.error ?? "Invalid MFA code.");
      setLoading(false);
      submittingRef.current = false;
      return;
    }

    // Success — persist session
    rl.reset();
    setSession(mfaSession.adminId, mfaSession.name, mfaSession.email, res.accessToken!);
    setStep("success");
    setLoading(false);
    submittingRef.current = false;

    // Navigate after brief success flash
    setTimeout(() => {
      onClose();
      router.push("/admin/dashboard");
    }, 1200);
  };

  const handleResendMFA = async () => {
    if (resendCooldown > 0 || !mfaSession) return;
    setMfaCode("");
    setMfaError(false);
    setError("");
    // In production: call your resend-otp / setup-mfa endpoint here
    startResendCooldown();
  };

  const showAttemptsWarning =
    !rl.isLocked && rl.attemptsLeft <= 2 && rl.attemptsLeft < rl.maxAttempts;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={step === "success" ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[95dvh] overflow-y-auto">

        {/* Dark header bar */}
        <div className="bg-neutral-900 px-6 pt-6 pb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-sm font-display">Admin Portal</p>
                <p className="text-[10px] text-neutral-400 font-medium tracking-widest uppercase">
                  MedLink
                </p>
              </div>
            </div>
            {step !== "success" && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Step labels */}
          <div className="flex items-center gap-3">
            {(["credentials", "mfa", "success"] as Step[]).map((s, i) => {
              const reached = ["credentials", "mfa", "success"].indexOf(step) >= i;
              const labels  = ["Password", "2FA", "Access"];
              return (
                <div key={s} className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors",
                      step === s
                        ? "bg-brand-500 text-white"
                        : reached
                        ? "bg-success-500 text-white"
                        : "bg-neutral-700 text-neutral-400"
                    )}>
                      {reached && step !== s ? "✓" : i + 1}
                    </div>
                    <span className={cn(
                      "text-xs font-medium transition-colors",
                      step === s ? "text-white" : reached ? "text-success-400" : "text-neutral-500"
                    )}>
                      {labels[i]}
                    </span>
                  </div>
                  {i < 2 && <div className="flex-1 h-px bg-neutral-700 w-6" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">

          {/* ── LOCKOUT ── */}
          {rl.isLocked && step !== "success" ? (
            <LockoutScreen
              secondsLeft={rl.secondsLeft}
              formatTime={rl.formatTime}
              onClose={onClose}
            />
          ) : (

            <>
              {/* ── STEP 1: Credentials ── */}
              {step === "credentials" && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 font-display">
                      Admin Sign In
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1">
                      This area is restricted to platform administrators only.
                    </p>
                  </div>

                  {/* Demo hint */}
                  <div className="flex items-center gap-2.5 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3">
                    <KeyRound className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-neutral-600">Demo credentials</p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        admin@medlink.in · Admin@123
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      className="input pl-10"
                      type="email"
                      placeholder="Admin email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      autoFocus
                    />
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      className="input pl-10 pr-11"
                      type={showPw ? "text" : "password"}
                      placeholder="Admin password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Attempts warning */}
                  {showAttemptsWarning && (
                    <div className="flex items-start gap-2 px-3 py-2.5 bg-warning-50 border border-warning-100 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-warning-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-warning-600 font-medium">
                        {rl.attemptsLeft} attempt{rl.attemptsLeft !== 1 ? "s" : ""} left.
                        Account locks for {rl.lockoutMinutes} minutes after that.
                      </p>
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="flex items-start gap-2 px-3 py-2.5 bg-danger-50 border border-danger-100 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-danger-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-danger-600 font-medium">{error}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    onClick={handleLogin}
                    disabled={loading || rl.isLocked}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <>Continue to 2FA <ArrowRight className="w-4 h-4" /></>
                    }
                  </button>

                  <p className="text-[11px] text-neutral-400 text-center">
                    {rl.maxAttempts} failed attempts locks this session for {rl.lockoutMinutes} minutes.
                  </p>
                </div>
              )}

              {/* ── STEP 2: MFA ── */}
              {step === "mfa" && mfaSession && (
                <div className="space-y-5">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-3">
                      <Smartphone className="w-7 h-7 text-neutral-700" />
                    </div>
                    <h2 className="text-lg font-bold text-neutral-900 font-display">
                      Two-Factor Authentication
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed">
                      Enter the 6-digit code from your authenticator app
                      {mfaSession.email && (
                        <> for <span className="font-medium text-neutral-700">{mfaSession.email}</span></>
                      )}.
                    </p>
                  </div>

                  {/* MFA input */}
                  <MFAInput
                    value={mfaCode}
                    onChange={(v) => { setMfaCode(v); setMfaError(false); setError(""); }}
                    error={mfaError}
                    disabled={loading}
                  />

                  {/* Demo hint */}
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl">
                    <ShieldCheck className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                    <p className="text-xs text-neutral-500">
                      Demo code: <span className="font-bold text-neutral-800 tracking-widest">123456</span>
                    </p>
                  </div>

                  {/* Attempts warning */}
                  {showAttemptsWarning && (
                    <div className="flex items-start gap-2 px-3 py-2.5 bg-warning-50 border border-warning-100 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-warning-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-warning-600 font-medium">
                        {rl.attemptsLeft} MFA attempt{rl.attemptsLeft !== 1 ? "s" : ""} left before lockout.
                      </p>
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="flex items-start gap-2 px-3 py-2.5 bg-danger-50 border border-danger-100 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-danger-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-danger-600 font-medium">{error}</p>
                    </div>
                  )}

                  {/* Verify button */}
                  <button
                    onClick={handleVerifyMFA}
                    disabled={loading || mfaCode.length < MFA_LENGTH}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <>Verify &amp; Sign In <ShieldCheck className="w-4 h-4" /></>
                    }
                  </button>

                  {/* Resend + back */}
                  <div className="flex items-center justify-between text-xs">
                    <button
                      onClick={() => { setStep("credentials"); setMfaCode(""); setError(""); }}
                      className="text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleResendMFA}
                      disabled={resendCooldown > 0}
                      className={cn(
                        "flex items-center gap-1 font-medium transition-colors",
                        resendCooldown > 0
                          ? "text-neutral-300 cursor-not-allowed"
                          : "text-brand-500 hover:text-brand-600"
                      )}
                    >
                      <RefreshCw className="w-3 h-3" />
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 3: Success ── */}
              {step === "success" && (
                <div className="text-center py-4 space-y-4">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="w-20 h-20 rounded-full bg-success-50 flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-success-500" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-4 border-success-200 animate-ping opacity-40" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 font-display">
                      Access Granted
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1">
                      Welcome, {mfaSession?.name ?? "Admin"}. Redirecting to dashboard…
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-3 rounded-xl justify-center">
                    <ShieldCheck className="w-4 h-4 text-success-400" />
                    <span className="text-sm font-medium">2FA verified · Session active</span>
                  </div>

                  <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-1.5 bg-success-400 rounded-full"
                      style={{ animation: "progress 1.2s linear forwards" }}
                    />
                  </div>
                  <style>{`@keyframes progress { from { width: 0% } to { width: 100% } }`}</style>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
