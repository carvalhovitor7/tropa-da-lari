import { Exercise } from "./types";

// Builds a human-readable, reverse-chronological-friendly list of what
// changed between two saved snapshots of a treino's exercise list (item 4).
// Compares by exercise id: new ids => added, missing ids => removed,
// matching ids with different fields => field-level "changed from X to Y".
export function diffExercises(prev: Exercise[], next: Exercise[]): string[] {
  const changes: string[] = [];
  const prevById = new Map(prev.map((e) => [e.id, e]));
  const nextById = new Map(next.map((e) => [e.id, e]));

  for (const ex of next) {
    if (!prevById.has(ex.id)) {
      changes.push(`Adicionado ${ex.name}.`);
    }
  }
  for (const ex of prev) {
    if (!nextById.has(ex.id)) {
      changes.push(`Removido ${ex.name}.`);
    }
  }
  for (const ex of next) {
    const before = prevById.get(ex.id);
    if (!before) continue;
    if (before.series !== ex.series) {
      changes.push(`${ex.name} — séries alteradas de ${before.series} para ${ex.series}.`);
    }
    if (before.reps !== ex.reps) {
      changes.push(`${ex.name} — repetições alteradas de ${before.reps || "—"} para ${ex.reps || "—"}.`);
    }
    if (before.carga !== ex.carga) {
      changes.push(`${ex.name} — carga alterada de ${before.carga || "—"}kg para ${ex.carga || "—"}kg.`);
    }
    if (before.descanso !== ex.descanso) {
      changes.push(`${ex.name} — descanso alterado de ${before.descanso || "—"} para ${ex.descanso || "—"}.`);
    }
    if (before.obs !== ex.obs) {
      changes.push(`${ex.name} — observação atualizada.`);
    }
  }
  return changes;
}
