"use client";

import { createContext, useContext } from "react";
import { TriagemDraft } from "./types";

// Minimal surface the components/screening/Step* components need to read
// and edit the in-progress screening draft. AppProvider (lib/store.tsx)
// implements this on top of its global state for Larissa's in-app manual
// triagem flow; StudentTriagemFlow (components/screening/StudentTriagemFlow.tsx)
// implements it on top of local useState for the standalone /triagem/[token]
// flow. Either way the Step components themselves stay identical.
export interface TriagemFormApi {
  draft: TriagemDraft;
  toggleArr: (field: keyof TriagemDraft, item: string) => void;
  setDraft: (field: keyof TriagemDraft, value: unknown) => void;
  setIntensidade: (regiao: string, n: number) => void;
}

export const TriagemFormContext = createContext<TriagemFormApi | null>(null);

export function useTriagemForm(): TriagemFormApi {
  const ctx = useContext(TriagemFormContext);
  if (!ctx) throw new Error("useTriagemForm must be used within a TriagemFormContext.Provider");
  return ctx;
}
