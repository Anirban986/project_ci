"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail, Lock, Eye, EyeOff, Loader2,
  ShieldCheck, ShieldAlert, Clock, AlertTriangle,
  CheckCircle2, ArrowRight, Smartphone, RefreshCw,
  KeyRound, Heart, X, Check,
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

// ─── MFA digit input ──────────────────────────────────────────────────────────

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
    <div className="flex gap-2.5 justify-center">
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
            "w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none",
            "transition-all focus:ring-2 disabled:opacity-40 disabled:cursor-not-allowed",
            error
              ? "border-danger-400 bg-danger-50 text-danger-700 focus:border-danger-500 focus:ring-danger-200"
              : value[i]
              ? "border-neutral-700 bg-neutral-900 text-white focus:border-neutral-600 focus:ring-neutral-300"
              : "border-neutral-200 bg-neutral-50 text-neutral-900 focus:border-neutral-700 focus:ring-neutral-200"
          )}
        />
      ))}
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "credentials", label: "Password" },
    { id: "mfa",         label: "2FA Code" },
    { id: "success",     label: "Access"   },
  ];
  const currentIdx = steps.findIndex((s) => s.id === current);

  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((step, i) => {
        const done   = currentIdx > i;
        const active = currentIdx === i;
        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                active ? "bg-brand-500 text-white ring-4 ring-brand-100" :
                done   ? "bg-success-500 text-white" :
                "bg-neutral-100 text-neutral-400"
              )}>
                {done ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn(
                "text-[10px] font-medium mt-1.5 transition-colors",
                active ? "text-brand-600" :
                done   ? "text-success-600" :
                "text-neutral-400"
              )}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                "h-0.5 flex-1 mx-1 mb-4 rounded-full transition-colors",
                done ? "bg-success-300" : "bg-neutral-200"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function AdminLoginPage() {
  const router     = useRouter();
  const setSession = useAdminAuthStore((s) => s.setSession);
  const rl         = useAdminRateLimit();

  const [step, setStep]             = useState<Step>("credentials");
  const [mfaSession, setMfaSession] = useState<MFASession | null>(null);

  // Credentials
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]   = useState(false);

  // MFA
  const [mfaCode, setMfaCode]     = useState("");
  const [mfaError, setMfaError]   = useState(false);
  const [resendCooldown, setResend] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Shared
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const submittingRef         = useRef(false);
  const lastSubmitRef         = useRef(0);

  // Auto-submit MFA
  useEffect(() => {
    if (mfaCode.length === MFA_LENGTH && step === "mfa") handleVerifyMFA();
  }, [mfaCode]);

  useEffect(() => () => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
  }, []);

  const startResend = () => {
    setResend(60);
    cooldownRef.current = setInterval(() => {
      setResend((p) => {
        if (p <= 1) { if (cooldownRef.current) clearInterval(cooldownRef.current); return 0; }
        return p - 1;
      });
    }, 1000);
  };

  // ── Step 1: Login ────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (submittingRef.current) return;
    if (Date.now() - lastSubmitRef.current < 800) {
      setError("Please wait a moment before trying again.");
      return;
    }
    if (rl.isLocked) return;
    if (!email || !password) { setError("Email and password are required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email."); return; }

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
          ? `Too many failed attempts. Locked for ${rl.lockoutMinutes} minutes.`
          : `${res.error}${left > 0 ? ` ${left} attempt${left !== 1 ? "s" : ""} left.` : ""}`
      );
      setLoading(false);
      submittingRef.current = false;
      return;
    }

    setMfaSession({ token: res.mfaSessionToken, adminId: res.adminId, name: res.name, email: res.email });
    setStep("mfa");
    startResend();
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

    const res = await adminVerifyMFA({ mfaSessionToken: mfaSession.token, code: mfaCode });

    if (!res.success) {
      rl.recordFailure();
      setMfaError(true);
      setMfaCode("");
      setError(res.error ?? "Invalid MFA code. Please try again.");
      setLoading(false);
      submittingRef.current = false;
      return;
    }

    rl.reset();
    setSession(mfaSession.adminId, mfaSession.name, mfaSession.email, res.accessToken!);
    setStep("success");
    setLoading(false);
    submittingRef.current = false;

    setTimeout(() => router.push("/admin/dashboard"), 1400);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !mfaSession) return;
    setMfaCode("");
    setMfaError(false);
    setError("");
    startResend();
    // In production: call your resend / setup-mfa endpoint here
  };

  const showAttemptsWarning = !rl.isLocked && rl.attemptsLeft <= 2 && rl.attemptsLeft < rl.maxAttempts;

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-dvh bg-neutral-950 flex flex-col items-center justify-center px-4 py-12">

      {/* Back to app — subtle, not prominent */}
      <Link
        href="/"
        className="absolute top-5 left-5 flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
      >
        ← Back to app
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-900 mb-3">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <p className="text-base font-bold text-white font-display tracking-tight">MedLink</p>
          <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3" />
            Admin Portal
          </p>
        </div>

        {/* ── LOCKOUT ── */}
        {rl.isLocked && step !== "success" ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-7 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-danger-900 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8 text-danger-400" />
            </div>
            <div>
              <h2 className="font-bold text-white font-display text-lg">Access Locked</h2>
              <p className="text-sm text-neutral-400 mt-1 leading-relaxed">
                Too many failed attempts. This session is temporarily locked.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 bg-danger-900/50 border border-danger-800 rounded-2xl px-4 py-3">
              <Clock className="w-4 h-4 text-danger-400 flex-shrink-0" />
              <span className="text-sm font-bold text-danger-400">
                {rl.formatTime(rl.secondsLeft)}
              </span>
            </div>
            <p className="text-xs text-neutral-600">
              Contact your system administrator if you need immediate access.
            </p>
          </div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">

            {/* Step indicator */}
            <div className="px-7 pt-7 pb-4">
              <StepIndicator current={step} />
            </div>

            <div className="px-7 pb-7 space-y-5">

              {/* ── STEP 1: Credentials ── */}
              {step === "credentials" && (
                <>
                  <div>
                    <h1 className="text-xl font-bold text-white font-display">Sign in</h1>
                    <p className="text-sm text-neutral-400 mt-1">
                      Administrator access only. All logins are audited.
                    </p>
                  </div>

                  {/* Demo hint */}
                  <div className="flex items-center gap-3 bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3">
                    <KeyRound className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-neutral-300">Demo credentials</p>
                      <p className="text-xs text-neutral-500 mt-0.5 font-mono">
                        admin@medlink.in · Admin@123
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      className={cn(
                        "w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-10 pr-4 py-3",
                        "text-sm text-white placeholder:text-neutral-500",
                        "focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                      )}
                      type="email"
                      placeholder="admin@company.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      autoFocus
                    />
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      className={cn(
                        "w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-10 pr-11 py-3",
                        "text-sm text-white placeholder:text-neutral-500",
                        "focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                      )}
                      type={showPw ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Attempts warning */}
                  {showAttemptsWarning && (
                    <div className="flex items-start gap-2 bg-warning-900/30 border border-warning-800 rounded-xl px-3 py-2.5">
                      <AlertTriangle className="w-4 h-4 text-warning-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-warning-300 font-medium">
                        {rl.attemptsLeft} attempt{rl.attemptsLeft !== 1 ? "s" : ""} remaining before {rl.lockoutMinutes}-minute lockout.
                      </p>
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="flex items-start gap-2 bg-danger-900/30 border border-danger-800 rounded-xl px-3 py-2.5">
                      <AlertTriangle className="w-4 h-4 text-danger-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-danger-300 font-medium">{error}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    onClick={handleLogin}
                    disabled={loading || rl.isLocked}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white bg-brand-500 hover:bg-brand-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <>Continue to 2FA <ArrowRight className="w-4 h-4" /></>
                    }
                  </button>

                  <p className="text-[11px] text-neutral-600 text-center">
                    {rl.maxAttempts} failed attempts locks this session for {rl.lockoutMinutes} minutes.
                    All access attempts are logged.
                  </p>
                </>
              )}

              {/* ── STEP 2: MFA ── */}
              {step === "mfa" && mfaSession && (
                <>
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-neutral-800 flex items-center justify-center mx-auto mb-3">
                      <Smartphone className="w-7 h-7 text-neutral-300" />
                    </div>
                    <h1 className="text-xl font-bold text-white font-display">
                      Two-Factor Auth
                    </h1>
                    <p className="text-sm text-neutral-400 mt-1.5 leading-relaxed">
                      Enter the 6-digit code from your authenticator app for{" "}
                      <span className="text-neutral-200 font-medium">{mfaSession.email}</span>
                    </p>
                  </div>

                  {/* MFA boxes */}
                  <MFAInput
                    value={mfaCode}
                    onChange={(v) => { setMfaCode(v); setMfaError(false); setError(""); }}
                    error={mfaError}
                    disabled={loading}
                  />

                  {/* Demo hint */}
                  <div className="flex items-center justify-center gap-2 bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5">
                    <ShieldCheck className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                    <p className="text-xs text-neutral-500">
                      Demo code:{" "}
                      <span className="font-bold text-neutral-300 tracking-[0.25em]">123456</span>
                    </p>
                  </div>

                  {/* Attempts warning */}
                  {showAttemptsWarning && (
                    <div className="flex items-start gap-2 bg-warning-900/30 border border-warning-800 rounded-xl px-3 py-2.5">
                      <AlertTriangle className="w-4 h-4 text-warning-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-warning-300 font-medium">
                        {rl.attemptsLeft} MFA attempt{rl.attemptsLeft !== 1 ? "s" : ""} remaining.
                      </p>
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="flex items-start gap-2 bg-danger-900/30 border border-danger-800 rounded-xl px-3 py-2.5">
                      <AlertTriangle className="w-4 h-4 text-danger-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-danger-300 font-medium">{error}</p>
                    </div>
                  )}

                  {/* Verify button */}
                  <button
                    onClick={handleVerifyMFA}
                    disabled={loading || mfaCode.length < MFA_LENGTH}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white bg-brand-500 hover:bg-brand-600 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <>Verify &amp; Sign In <ShieldCheck className="w-4 h-4" /></>
                    }
                  </button>

                  {/* Resend + back */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => { setStep("credentials"); setMfaCode(""); setError(""); }}
                      className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleResend}
                      disabled={resendCooldown > 0}
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-medium transition-colors",
                        resendCooldown > 0
                          ? "text-neutral-600 cursor-not-allowed"
                          : "text-brand-400 hover:text-brand-300"
                      )}
                    >
                      <RefreshCw className="w-3 h-3" />
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                    </button>
                  </div>
                </>
              )}

              {/* ── STEP 3: Success ── */}
              {step === "success" && (
                <div className="text-center space-y-5 py-2">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="w-20 h-20 rounded-full bg-success-900/50 flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-success-400" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-4 border-success-700 animate-ping opacity-30" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-white font-display">Access Granted</h2>
                    <p className="text-sm text-neutral-400 mt-1.5">
                      Welcome, {mfaSession?.name ?? "Admin"}.<br />
                      Redirecting to dashboard…
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 bg-success-900/30 border border-success-800 text-success-300 px-4 py-3 rounded-xl text-sm font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    2FA verified · Session active
                  </div>

                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-1.5 bg-brand-500 rounded-full"
                      style={{ animation: "progress 1.4s linear forwards" }}
                    />
                  </div>
                  <style>{`@keyframes progress { from { width: 0% } to { width: 100% } }`}</style>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Security note */}
        {step !== "success" && !rl.isLocked && (
          <p className="text-center text-xs text-neutral-700 mt-6">
            🔒 Secured with end-to-end encryption · All sessions are logged
          </p>
        )}
      </div>
    </main>
  );
}
