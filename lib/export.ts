// Client-side CSV export (item 7). No server dependency — builds CSV
// strings from data already fetched into the app and triggers a browser
// download via Blob + <a download>.
import { Aluna, EvolucaoEntry, Financeiro } from "./types";

function csvEscape(value: unknown): string {
  const s = value == null ? "" : String(value);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers.map(csvEscape).join(","), ...rows.map((r) => r.map(csvEscape).join(","))];
  // Leading BOM so Excel opens the accented Portuguese text as UTF-8.
  return "﻿" + lines.join("\r\n");
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportAlunosCsv(alunas: Aluna[]) {
  const headers = ["Nome", "Objetivo", "Frequência", "Nível", "Idade", "Local", "Instagram", "WhatsApp", "Gênero", "Notas"];
  const rows = alunas.map((a) => [a.name, a.goal, a.freq, a.level, a.idade ?? "", a.local ?? "", a.instagram, a.whatsapp, a.genero, a.notes]);
  downloadCsv(`alunos-${dateStamp()}.csv`, toCsv(headers, rows));
}

export function exportFinanceiroCsv(alunas: Aluna[], financeiro: Financeiro[]) {
  const byId = new Map(financeiro.map((f) => [f.alunaId, f]));
  const headers = ["Nome", "Plano", "Valor", "Data pagamento"];
  const rows = alunas.map((a) => {
    const f = byId.get(a.id);
    return [a.name, f?.plano ?? "", f?.valor ?? "", f?.dataPagamento ?? ""];
  });
  downloadCsv(`financeiro-${dateStamp()}.csv`, toCsv(headers, rows));
}

export function exportEvolucaoCsv(alunas: Aluna[], entries: EvolucaoEntry[]) {
  const nameById = new Map(alunas.map((a) => [a.id, a.name]));
  const headers = ["Nome", "Data", "Peso (kg)", "Cintura (cm)", "Quadril (cm)", "Braço (cm)", "Coxa (cm)", "Fotos"];
  const rows = entries.map((e) => [
    nameById.get(e.alunaId) ?? e.alunaId,
    e.data,
    e.peso ?? "",
    e.medidas.cintura ?? "",
    e.medidas.quadril ?? "",
    e.medidas.braco ?? "",
    e.medidas.coxa ?? "",
    e.fotos.length,
  ]);
  downloadCsv(`evolucao-${dateStamp()}.csv`, toCsv(headers, rows));
}

function dateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}
