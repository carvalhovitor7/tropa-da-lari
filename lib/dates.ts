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
