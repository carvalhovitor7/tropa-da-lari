import jsPDF from "jspdf";
import { Aluna, Genero, TriagemDraft, Treino } from "./types";
import { alunoNoun } from "./gender";
import { summarizeRestricoes } from "./screening";
import { buildExerciseBlocks, restLabelFor } from "./conjugado";
import { treinoLetterFor } from "./dates";

const PURPLE: [number, number, number] = [76, 58, 158];
const PURPLE_SOFT: [number, number, number] = [124, 77, 189];
const INK: [number, number, number] = [40, 34, 60];
const INK_SOFT: [number, number, number] = [110, 102, 130];
const TERRACOTTA: [number, number, number] = [193, 108, 74];
const SAGE_BG: [number, number, number] = [232, 236, 225];
const SAGE_TEXT: [number, number, number] = [74, 61, 130];
const ROW_ALT: [number, number, number] = [246, 242, 252];
const BORDER: [number, number, number] = [228, 218, 246];

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 14;
const CONTENT_W = PAGE_W - MARGIN * 2;

// Builds one consolidated PDF for an aluna with every treino she has
// (Treino A, B, C, ...) as its own section, one after another, instead of a
// separate document per treino — so Larissa hands over one complete file.
export function buildFichaPdf(aluna: Aluna, triagem: TriagemDraft | undefined): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const noun = alunoNoun(aluna.genero);
  let y = MARGIN;

  y = drawHeader(doc, aluna, noun, y);
  y = drawAlunaCard(doc, aluna, triagem, noun, y);

  const treinos = aluna.treinos.filter((t) => t.exercises.length > 0);
  if (treinos.length === 0) {
    y = ensureSpace(doc, y, 20);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10.5);
    doc.setTextColor(...INK_SOFT);
    doc.text("Nenhum treino cadastrado ainda.", MARGIN, y + 6);
    y += 14;
  } else {
    treinos.forEach((treino) => {
      y = drawTreinoSection(doc, treino, treinos, y);
    });
  }

  drawFooterOnAllPages(doc);
  return doc;
}

export function fichaPdfFilename(aluna: Aluna): string {
  const slug = aluna.name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase();
  return `ficha-treino-${slug || "aluna"}.pdf`;
}

export function downloadFichaPdf(aluna: Aluna, triagem: TriagemDraft | undefined) {
  const doc = buildFichaPdf(aluna, triagem);
  doc.save(fichaPdfFilename(aluna));
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_H - MARGIN - 8) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function drawHeader(doc: jsPDF, aluna: Aluna, noun: string, y: number): number {
  doc.setFillColor(...PURPLE);
  doc.roundedRect(MARGIN, y, CONTENT_W, 16, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text("Tropa da Lari — Ficha de Treino", MARGIN + 5, y + 10.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const rightLabel = `Ficha completa d${noun === "aluna" ? "a" : "o"} ${noun}`;
  doc.text(rightLabel, MARGIN + CONTENT_W - 5, y + 10.5, { align: "right" });
  return y + 22;
}

function drawAlunaCard(doc: jsPDF, aluna: Aluna, triagem: TriagemDraft | undefined, noun: string, y: number): number {
  const restricoes = summarizeRestricoes(triagem);
  const fields: [string, string][] = [
    ["Nome", aluna.name],
    ["Gênero", aluna.genero === "feminino" ? "Feminino" : aluna.genero === "masculino" ? "Masculino" : "—"],
    ["Idade", aluna.idade ? `${aluna.idade} anos` : "—"],
    ["Objetivo", aluna.goal || "—"],
    ["Nível", aluna.level || "—"],
    ["Frequência", aluna.freq || "—"],
    ["Local", aluna.local || "—"],
    ["Restrições", restricoes],
  ];

  const rowH = 6.5;
  const rows = Math.ceil(fields.length / 2);
  const cardH = 8 + rows * rowH;
  y = ensureSpace(doc, y, cardH + 4);

  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, y, CONTENT_W, cardH, 2.5, 2.5, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...PURPLE);
  doc.text(`Dados d${noun === "aluna" ? "a" : "o"} ${noun}`, MARGIN + 4, y + 6);

  const colW = CONTENT_W / 2;
  fields.forEach(([label, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = MARGIN + 4 + col * colW;
    const cy = y + 11 + row * rowH;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...INK_SOFT);
    doc.text(label.toUpperCase(), cx, cy);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    const wrapped = doc.splitTextToSize(value, colW - 8);
    doc.text(wrapped[0] || "—", cx, cy + 4.2);
  });

  return y + cardH + 8;
}

function drawTreinoSection(doc: jsPDF, treino: Treino, allTreinos: Treino[], y: number): number {
  y = ensureSpace(doc, y, 20);
  const letter = treinoLetterFor(allTreinos, treino.id);

  doc.setFillColor(...PURPLE_SOFT);
  doc.roundedRect(MARGIN, y, CONTENT_W, 11, 2.5, 2.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(255, 255, 255);
  const title = `Treino ${letter} — ${(treino.foco || "Treino").toUpperCase()}`;
  doc.text(title, MARGIN + 4, y + 7.5);
  if (treino.enfase?.trim()) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.text(`(${treino.enfase})`, MARGIN + CONTENT_W - 4, y + 7.5, { align: "right" });
  }
  y += 15;

  const colX = [MARGIN, MARGIN + 62, MARGIN + 80, MARGIN + 100, MARGIN + 124, MARGIN + 150];
  const colW = [62, 18, 20, 24, 26, CONTENT_W - 150];

  const drawTableHeader = () => {
    doc.setFillColor(...PURPLE);
    doc.rect(MARGIN, y, CONTENT_W, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    ["Exercício", "Séries", "Reps", "Carga", "Descanso", "Obs."].forEach((h, i) => {
      doc.text(h, colX[i] + 1.5, y + 4.8);
    });
    y += 7;
  };

  drawTableHeader();

  const blocks = buildExerciseBlocks(treino.exercises);
  blocks.forEach((block, bi) => {
    block.items.forEach(({ exercise: ex, label, isLast }) => {
      const obsLines = doc.splitTextToSize(ex.obs || "", colW[5] - 3);
      const nameLines = doc.splitTextToSize(ex.name, colW[0] - 3);
      const lineCount = Math.max(1, obsLines.length, nameLines.length);
      const rowH = 5.2 * lineCount + 1.5;

      if (y + rowH > PAGE_H - MARGIN - 8) {
        doc.addPage();
        y = MARGIN;
        drawTableHeader();
      }

      doc.setFillColor(...(bi % 2 === 0 ? ([255, 255, 255] as [number, number, number]) : ROW_ALT));
      doc.rect(MARGIN, y, CONTENT_W, rowH, "F");
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.2);
      doc.line(MARGIN, y + rowH, MARGIN + CONTENT_W, y + rowH);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.3);
      doc.setTextColor(...INK);
      doc.text(`${label}. ${nameLines[0] || ""}`, colX[0] + 1.5, y + 4);
      nameLines.slice(1).forEach((line: string, i: number) => doc.text(line, colX[0] + 1.5, y + 4 + (i + 1) * 5.2));

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.3);
      doc.text(String(ex.series), colX[1] + 1.5, y + 4);
      doc.text(ex.reps || "—", colX[2] + 1.5, y + 4);
      if (ex.carga) {
        doc.setTextColor(...TERRACOTTA);
        doc.text(ex.carga, colX[3] + 1.5, y + 4);
        doc.setTextColor(...INK);
      } else {
        doc.text("—", colX[3] + 1.5, y + 4);
      }
      doc.text(restLabelFor(ex, isLast), colX[4] + 1.5, y + 4);

      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.6);
      doc.setTextColor(...INK_SOFT);
      obsLines.forEach((line: string, i: number) => doc.text(line, colX[5] + 1.5, y + 4 + i * 5.2));

      y += rowH;
    });
  });

  if (treino.exercises.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(...INK_SOFT);
    doc.text("Nenhum exercício neste treino.", MARGIN + 2, y + 5);
    y += 9;
  }

  y += 3;

  if (treino.observacoesTreinadora?.trim()) {
    const noteLines = doc.splitTextToSize(treino.observacoesTreinadora.trim(), CONTENT_W - 8);
    const noteH = 6 + noteLines.length * 4.6;
    y = ensureSpace(doc, y, noteH + 4);
    doc.setFillColor(...SAGE_BG);
    doc.roundedRect(MARGIN, y, CONTENT_W, noteH, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...SAGE_TEXT);
    doc.text("OBSERVAÇÃO DA TREINADORA", MARGIN + 4, y + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.3);
    noteLines.forEach((line: string, i: number) => doc.text(line, MARGIN + 4, y + 9.5 + i * 4.6));
    y += noteH + 6;
  } else {
    y += 4;
  }

  return y;
}

function drawFooterOnAllPages(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...PURPLE);
    doc.rect(0, PAGE_H - 10, PAGE_W, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("✧ DISCIPLINA QUE TRANSFORMA. FOCO QUE GERA RESULTADOS! ♡", PAGE_W / 2, PAGE_H - 4.5, { align: "center" });
    doc.setFontSize(7);
    doc.text(`${i}/${pageCount}`, PAGE_W - MARGIN, PAGE_H - 4.5, { align: "right" });
  }
}
