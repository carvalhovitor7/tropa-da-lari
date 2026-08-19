// Pure billing-status logic (item 6), shared between the Financeiro screen
// and anywhere else that needs to know if an aluna is up to date.
import { Financeiro, FinanceiroStatus, PlanoTipo } from "./types";

// Days a payment covers per plan type, used to derive "próximo vencimento"
// from "data_pagamento".
const PLAN_DAYS: Record<PlanoTipo, number> = { diario: 1, semanal: 7, mensal: 30, trimestral: 90 };
// A payment due within this many days counts as "vence em breve" rather
// than "em dia".
const VENCENDO_WINDOW_DAYS = 3;

export function proximoVencimento(f: Pick<Financeiro, "plano" | "dataPagamento">): Date | null {
  if (!f.plano || !f.dataPagamento) return null;
  // dataPagamento is a bare YYYY-MM-DD date; appending a midday time avoids
  // the calendar day shifting when parsed as UTC in timezones behind it.
  const base = new Date(f.dataPagamento.length === 10 ? `${f.dataPagamento}T12:00:00` : f.dataPagamento);
  if (Number.isNaN(base.getTime())) return null;
  const days = PLAN_DAYS[f.plano];
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
}

export function computeFinanceiroStatus(f: Pick<Financeiro, "plano" | "dataPagamento"> | undefined | null): FinanceiroStatus {
  if (!f || !f.plano || !f.dataPagamento) return "sem_dados";
  const due = proximoVencimento(f);
  if (!due) return "sem_dados";
  const now = Date.now();
  if (now > due.getTime()) return "atrasado";
  if (due.getTime() - now <= VENCENDO_WINDOW_DAYS * 24 * 60 * 60 * 1000) return "vencendo";
  return "em_dia";
}

export const STATUS_LABELS: Record<FinanceiroStatus, string> = {
  em_dia: "Em dia",
  vencendo: "Vence em breve",
  atrasado: "Atrasado",
  sem_dados: "Sem dados",
};

export const STATUS_COLORS: Record<FinanceiroStatus, { bg: string; text: string; dot: string }> = {
  em_dia: { bg: "#E8ECE1", text: "#6F7D5E", dot: "#6F7D5E" },
  vencendo: { bg: "#FBF0DC", text: "#B08628", dot: "#B08628" },
  atrasado: { bg: "#F6DEDA", text: "#8A3B2C", dot: "#B5473A" },
  sem_dados: { bg: "#ECE1F9", text: "#6C6390", dot: "#8B81AB" },
};

// atrasado/vencendo first, per item 6 "sorted with atrasado/vencendo first".
export const STATUS_ORDER: Record<FinanceiroStatus, number> = { atrasado: 0, vencendo: 1, sem_dados: 2, em_dia: 3 };
