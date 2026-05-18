"use client";

import { create } from "zustand";
import { clearAdminSession, saveAdminSession } from "@/src/services/admin/admin-auth.service";

interface AdminAuthState {
  isAuthenticated: boolean;
  adminId: string | null;
  name: string | null;
  email: string | null;
  setSession: (adminId: string, name: string, email: string, token: string) => void;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()((set) => ({
  isAuthenticated: false,
  adminId:         null,
  name:            null,
  email:           null,

  setSession: (adminId, name, email, token) => {
    saveAdminSession(token);
    set({ isAuthenticated: true, adminId, name, email });
  },

  logout: () => {
    clearAdminSession();
    set({ isAuthenticated: false, adminId: null, name: null, email: null });
  },
}));
