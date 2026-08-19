import { Exercise } from "./types";

export interface ExerciseBlockItem {
  exercise: Exercise;
  label: string; // "1", "2", "3a", "3b" — see buildExerciseBlocks
  isFirst: boolean;
  isLast: boolean;
}

export interface ExerciseBlock {
  groupId: string | null; // null = standalone exercise, single-item block
  items: ExerciseBlockItem[];
}

// Splits a treino's exercise list into rendering blocks for
// "exercícios conjugados" (supersets): each standalone exercise forms its
// own single-item block, while a run of exercises sharing a
// conjugadoGroupId forms one multi-item block. Groups are assumed
// contiguous by construction — lib/store.tsx's groupExercises() places
// newly grouped exercises next to each other, and moveExercise()
// auto-ungroups an exercise the moment a drag would split its group apart
// — so this function only ever needs to merge *contiguous* runs; it never
// has to reassemble a split group.
//
// Also assigns the "1", "2", "3a", "3b" display numbering used
// consistently across Montador, Revisao and Pdf: the counter advances once
// per block (standalone exercise or whole group), and members of a group
// get a/b/c... suffixes in their stored order.
export function buildExerciseBlocks(exercises: Exercise[]): ExerciseBlock[] {
  const blocks: ExerciseBlock[] = [];
  let counter = 0;
  let i = 0;
  while (i < exercises.length) {
    const ex = exercises[i];
    const gid = ex.conjugadoGroupId ?? null;
    if (gid) {
      const group: Exercise[] = [];
      let j = i;
      while (j < exercises.length && exercises[j].conjugadoGroupId === gid) {
        group.push(exercises[j]);
        j++;
      }
      counter++;
      blocks.push({
        groupId: gid,
        items: group.map((exercise, k) => ({
          exercise,
          label: `${counter}${String.fromCharCode(97 + k)}`,
          isFirst: k === 0,
          isLast: k === group.length - 1,
        })),
      });
      i = j;
    } else {
      counter++;
      blocks.push({ groupId: null, items: [{ exercise: ex, label: `${counter}`, isFirst: true, isLast: true }] });
      i++;
    }
  }
  return blocks;
}

// Rest-time display rule for a conjugado group (item 4 of the feature):
// no rest between the paired/tri-set exercises — rest only happens after
// the group's last exercise — so only that last one shows its own
// `descanso` value; the rest display "Sem descanso" for the others.
export function restLabelFor(exercise: Exercise, isLast: boolean): string {
  return isLast ? exercise.descanso : "Sem descanso";
}
