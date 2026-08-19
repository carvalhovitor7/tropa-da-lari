import { TriagemDraft } from "./types";

export interface AlertInfo {
  level: "vermelho" | "amarelo" | "verde" | "none";
  bg: string;
  dot: string;
  title: string;
  text: string;
}

// The screening never diagnoses — classification only reflects whether the
// student's own reports need review, not what condition they might have.
export function computeAlert(t: TriagemDraft | undefined | null): AlertInfo {
  if (!t) return { level: "none", bg: "", dot: "", title: "", text: "" };
  const red = (t.saude || []).length > 0;
  const yellow = t.temDor === true || t.temLesao === true || t.temCirurgia === true || t.restricaoProfissional === true;
  if (red) {
    return {
      level: "vermelho",
      bg: "#F6DEDA",
      dot: "#B5473A",
      title: "Revisão profissional necessária",
      text: "Existem respostas que demandam avaliação adicional antes de uma prescrição automatizada.",
    };
  }
  if (yellow) {
    return {
      level: "amarelo",
      bg: "#FBF0DC",
      dot: "#B08628",
      title: "Considerar na montagem",
      text: "Existem informações que devem ser consideradas na montagem do treino.",
    };
  }
  return {
    level: "verde",
    bg: "#E8ECE1",
    dot: "#6F7D5E",
    title: "Sem alertas importantes",
    text: "Nenhuma restrição relevante foi informada.",
  };
}

export function computeWarnings(t: TriagemDraft | undefined | null): string[] {
  if (!t) return [];
  return (t.dorRegioes || []).slice(0, 3);
}

export interface ExerciseSuggestions {
  avaliar: { name: string; reason: string }[];
  atencao: { name: string; reason: string }[];
}

export function computeSuggestions(t: TriagemDraft | undefined | null): ExerciseSuggestions | null {
  if (!t || !t.temDor) return null;
  const joelho =
    (t.dorRegioes || []).some((r) => r.toLowerCase().includes("joelho")) ||
    (t.movimentos || []).includes("Agachamento profundo");
  if (!joelho) return null;
  return {
    avaliar: [
      { name: "Leg Press 45°", reason: "Permite fácil controle de carga e menor exigência de flexão profunda de joelho." },
      { name: "Cadeira Extensora", reason: "Isola o quadríceps com boa estabilidade articular." },
    ],
    atencao: [{ name: "Agachamento Livre", reason: "Relatou desconforto neste padrão de movimento (agachamento profundo)." }],
  };
}
