import { Genero } from "./types";

// Small grammatical-agreement helpers for copy that names a specific
// person (e.g. "Fazer triagem de {nome}", "Perfil do aluno"). When genero
// is "nao_informado" (or missing), these fall back to the neutral
// masculine form — the same default used app-wide for mixed-gender groups
// (the "Alunos" tab, "Nenhum aluno encontrado", etc.) — rather than
// guessing at someone's gender.

export function alunoNoun(genero?: Genero): "aluno" | "aluna" {
  return genero === "feminino" ? "aluna" : "aluno";
}

export function artigoDef(genero?: Genero): "o" | "a" {
  return genero === "feminino" ? "a" : "o";
}

export function pronomeObliquo(genero?: Genero): "ele" | "ela" {
  return genero === "feminino" ? "ela" : "ele";
}

// Generic -o/-a adjective agreement, e.g. agree(genero, "pronto", "pronta").
export function agree(genero: Genero | undefined, masc: string, fem: string): string {
  return genero === "feminino" ? fem : masc;
}
