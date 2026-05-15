"use client";

import { create } from "zustand";
import type { AIConsultMessage, AIConsultResult, Symptom } from "@/src/types";

interface ConsultState {
  messages: AIConsultMessage[];
  selectedSymptoms: Symptom[];
  result: AIConsultResult | null;
  isLoading: boolean;
  addMessage: (message: AIConsultMessage) => void;
  toggleSymptom: (symptom: Symptom) => void;
  setResult: (result: AIConsultResult) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useConsultStore = create<ConsultState>()((set, get) => ({
  messages: [],
  selectedSymptoms: [],
  result: null,
  isLoading: false,

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  toggleSymptom: (symptom) =>
    set((state) => {
      const exists = state.selectedSymptoms.some((s) => s.id === symptom.id);
      return {
        selectedSymptoms: exists
          ? state.selectedSymptoms.filter((s) => s.id !== symptom.id)
          : [...state.selectedSymptoms, symptom],
      };
    }),

  setResult: (result) => set({ result }),
  setLoading: (isLoading) => set({ isLoading }),

  reset: () =>
    set({ messages: [], selectedSymptoms: [], result: null, isLoading: false }),
}));
