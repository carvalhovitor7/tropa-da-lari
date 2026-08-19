const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

// Formats an ISO date string as "12 ago" to match the app's existing short
// date style (see lib/data.ts seed data).
export function formatDatePt(iso: string | undefined | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${String(d.getDate()).padStart(2, "0")} ${MESES[d.getMonth()]}`;
}

// "Criado em 12 ago · Enviado em 14 ago" style summary for a treino card.
export function treinoDateSummary(createdAt?: string, sentAt?: string): string {
  const parts: string[] = [];
  if (createdAt) parts.push(`Criado em ${formatDatePt(createdAt)}`);
  if (sentAt) parts.push(`Enviado em ${formatDatePt(sentAt)}`);
  else if (createdAt) parts.push("Ainda não enviado");
  return parts.join(" · ");
}

// Most recent treino's createdAt for an aluna, or undefined if she has none
// yet (item 4/5 "vencido" logic).
export function latestTreinoDate(treinos: { createdAt?: string }[]): string | undefined {
  const dates = treinos.map((t) => t.createdAt).filter((d): d is string => Boolean(d));
  if (!dates.length) return undefined;
  return dates.sort().slice(-1)[0];
}

// An aluna is "vencida" (overdue for a treino refresh) when her most recent
// treino's createdAt is older than `renewalWeeks` (items 4 "Treino vencido"
// filter and 5 "Lembrete de renovação" — same threshold, same logic, so the
// Alunos filter and the Acompanhamento/Dashboard banner always agree). An
// aluna with no treino yet is never flagged — there's nothing to renew.
export function isAlunaVencida(treinos: { createdAt?: string }[], renewalWeeks: number): boolean {
  const latest = latestTreinoDate(treinos);
  if (!latest) return false;
  const thresholdMs = renewalWeeks * 7 * 24 * 60 * 60 * 1000;
  return Date.now() - new Date(latest).getTime() > thresholdMs;
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Derives the "TREINO A/B/C..." letter shown on the printable ficha from
// this treino's order among the aluna's treinos (by creation date), so a
// treino keeps a stable, predictable letter even though its id is a random
// string (see lib/store.tsx makeId).
export function treinoLetterFor(treinos: { id: string; createdAt?: string }[], treinoId: string | null): string {
  const sorted = [...treinos].sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
  const idx = sorted.findIndex((t) => t.id === treinoId);
  if (idx < 0) return LETTERS[sorted.length] || "?";
  return LETTERS[idx] || "?";
}
