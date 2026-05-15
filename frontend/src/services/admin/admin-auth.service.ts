// ─── Admin Auth Service ───────────────────────────────────────────────────────
// Connects to your existing setup-mfa and verify-mfa services.
// Replace the simulated delays with real fetch() calls to your backend.

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  adminId: string;
  name: string;
  email: string;
  mfaRequired: boolean;       // always true for admin
  mfaSessionToken: string;    // short-lived token passed to verify-mfa
  error?: string;
}

export interface AdminMFAVerifyPayload {
  mfaSessionToken: string;    // from login step
  code: string;               // 6-digit TOTP or OTP
}

export interface AdminMFAVerifyResponse {
  success: boolean;
  accessToken?: string;       // JWT for admin session
  error?: string;
}

// ─── Step 1: Admin login ──────────────────────────────────────────────────────
export async function adminLogin(
  payload: AdminLoginPayload
): Promise<AdminLoginResponse> {
  // ── Replace with real call ──────────────────────────────────────────────────
  // const res  = await fetch("/api/admin/login", {
  //   method:  "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body:    JSON.stringify(payload),
  // });
  // return res.json();
  // ───────────────────────────────────────────────────────────────────────────

  // Demo simulation
  await new Promise((r) => setTimeout(r, 1200));

  const DEMO = { email: "admin@medlink.in", password: "Admin@123" };

  if (
    payload.email !== DEMO.email ||
    payload.password !== DEMO.password
  ) {
    return {
      success:         false,
      adminId:         "",
      name:            "",
      email:           "",
      mfaRequired:     false,
      mfaSessionToken: "",
      error:           "Invalid admin credentials.",
    };
  }

  return {
    success:         true,
    adminId:         "admin-001",
    name:            "Super Admin",
    email:           payload.email,
    mfaRequired:     true,
    mfaSessionToken: "demo-mfa-session-token-xyz",
  };
}

// ─── Step 2: Verify MFA ───────────────────────────────────────────────────────
// Calls your existing verify-mfa service
export async function adminVerifyMFA(
  payload: AdminMFAVerifyPayload
): Promise<AdminMFAVerifyResponse> {
  // ── Replace with your verify-mfa service endpoint ───────────────────────────
  // const res  = await fetch("/api/admin/verify-mfa", {
  //   method:  "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body:    JSON.stringify(payload),
  // });
  // return res.json();
  // ───────────────────────────────────────────────────────────────────────────

  // Demo simulation — correct code is 123456
  await new Promise((r) => setTimeout(r, 1000));

  if (payload.code !== "123456") {
    return { success: false, error: "Invalid MFA code. Please try again." };
  }

  return {
    success:     true,
    accessToken: "demo-admin-jwt-token",
  };
}

// ─── Session helpers ──────────────────────────────────────────────────────────
export function saveAdminSession(token: string) {
  if (typeof window === "undefined") return;
  // Use sessionStorage (cleared on tab close) — safer than localStorage for admin
  sessionStorage.setItem("medlink_admin_token", token);
}

export function getAdminSession(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("medlink_admin_token");
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("medlink_admin_token");
}

export function isAdminAuthenticated(): boolean {
  return !!getAdminSession();
}
