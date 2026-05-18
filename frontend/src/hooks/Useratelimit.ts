"use client";

import { useState, useEffect, useRef } from "react";

interface RateLimitOptions {
  maxAttempts: number;   // max fails before lockout
  windowMs: number;      // rolling window in ms (e.g. 5 * 60_000 = 5 min)
  lockoutMs: number;     // how long lockout lasts in ms
  storageKey: string;    // localStorage key (scoped per form)
}

interface RateLimitState {
  attempts: number;
  lockedUntil: number | null;   // timestamp ms, or null
}

interface RateLimitReturn {
  isLocked: boolean;
  attemptsLeft: number;
  secondsLeft: number;
  recordAttempt: () => void;      // call on every failed attempt
  resetAttempts: () => void;      // call on success
}

export function useRateLimit({
  maxAttempts,
  windowMs,
  lockoutMs,
  storageKey,
}: RateLimitOptions): RateLimitReturn {
  const key = `medlink_rl_${storageKey}`;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const readState = (): RateLimitState => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return { attempts: 0, lockedUntil: null };
      return JSON.parse(raw) as RateLimitState;
    } catch {
      return { attempts: 0, lockedUntil: null };
    }
  };

  const writeState = (state: RateLimitState) => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  };

  const [state, setState] = useState<RateLimitState>(readState);
  const [now, setNow] = useState(Date.now());

  // Tick every second so countdown updates in real-time
  useEffect(() => {
    timerRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Sync from localStorage on mount (handles page refresh)
  useEffect(() => {
    setState(readState());
  }, []);

  const isLocked =
    state.lockedUntil !== null && now < state.lockedUntil;

  const secondsLeft = isLocked
    ? Math.ceil((state.lockedUntil! - now) / 1000)
    : 0;

  const attemptsLeft = Math.max(0, maxAttempts - state.attempts);

  const recordAttempt = () => {
    const current = readState();
    const newAttempts = current.attempts + 1;

    let newState: RateLimitState;
    if (newAttempts >= maxAttempts) {
      // Lock out
      newState = {
        attempts: newAttempts,
        lockedUntil: Date.now() + lockoutMs,
      };
    } else {
      newState = { attempts: newAttempts, lockedUntil: null };
      // Auto-clear attempt count after windowMs
      setTimeout(() => {
        const s = readState();
        if (s.lockedUntil === null) {
          writeState({ attempts: 0, lockedUntil: null });
          setState({ attempts: 0, lockedUntil: null });
        }
      }, windowMs);
    }

    writeState(newState);
    setState(newState);
  };

  const resetAttempts = () => {
    const fresh: RateLimitState = { attempts: 0, lockedUntil: null };
    writeState(fresh);
    setState(fresh);
  };

  return { isLocked, attemptsLeft, secondsLeft, recordAttempt, resetAttempts };
}