"use client";

import { useState, useEffect, useRef } from "react";

// Admin lockout is stricter: 3 attempts → 30 min lockout
const MAX_ATTEMPTS  = 3;
const LOCKOUT_MS    = 30 * 60_000;
const STORAGE_KEY   = "medlink_admin_rl";

interface RLState {
  attempts:    number;
  lockedUntil: number | null;
}

function read(): RLState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { attempts: 0, lockedUntil: null };
  } catch {
    return { attempts: 0, lockedUntil: null };
  }
}

function write(state: RLState) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export function useAdminRateLimit() {
  const [state, setState] = useState<RLState>(read);
  const [now, setNow]     = useState(Date.now());
  const timerRef          = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setState(read());
    timerRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const isLocked     = state.lockedUntil !== null && now < state.lockedUntil;
  const secondsLeft  = isLocked ? Math.ceil((state.lockedUntil! - now) / 1000) : 0;
  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - state.attempts);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  const recordFailure = () => {
    const cur         = read();
    const newAttempts = cur.attempts + 1;
    const newState: RLState =
      newAttempts >= MAX_ATTEMPTS
        ? { attempts: newAttempts, lockedUntil: Date.now() + LOCKOUT_MS }
        : { attempts: newAttempts, lockedUntil: null };
    write(newState);
    setState(newState);
  };

  const reset = () => {
    const fresh: RLState = { attempts: 0, lockedUntil: null };
    write(fresh);
    setState(fresh);
  };

  return {
    isLocked,
    attemptsLeft,
    secondsLeft,
    lockoutMinutes: LOCKOUT_MS / 60_000,
    maxAttempts:    MAX_ATTEMPTS,
    formatTime,
    recordFailure,
    reset,
  };
}
