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
