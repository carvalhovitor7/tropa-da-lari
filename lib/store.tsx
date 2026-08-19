"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ALUNAS as SEED_ALUNAS, DEMO_EXERCISES, TEMPLATES, TRIAGENS_SEED } from "./data";
import {
  AddAlunaDraft,
  Aluna,
  AppSettings,
  AppState,
  DEFAULT_SETTINGS,
  Exercise,
  Genero,
  Modelo,
  ScreenKey,
  TRIAGEM_STEPS,
  Treino,
  TriagemDraft,
  WeeklyRepTarget,
  emptyAddAlunaDraft,
  emptyDraft,
} from "./types";
import { TriagemFormApi, TriagemFormContext } from "./triagemForm";
import { diffExercises } from "./treinoHistory";
import { agree } from "./gender";

const STORAGE_KEY = "tropa-da-lari-state-v2";

function initialState(): AppState {
  return {
    screen: "dashboard",
    history: [],
    alunaId: "juliana",
    alunaSearch: "",
    toast: "",
    alunas: SEED_ALUNAS.map((a) => ({ ...a, treinos: a.treinos.map((t) => ({ ...t, exercises: t.exercises.map((e) => ({ ...e })) })) })),
    treinoName: "Treino A",
    treinoFoco: "Inferiores",
    treinoEnfase: "",
    treinoObsTreinadora: "",
    treinoId: null,
    treinoCreatedAt: "",
    treinoSentAt: null,
    treinoVersions: [],
    weeklyRepTargets: [],
    exercises: DEMO_EXERCISES.slice(0, 4).map((e) => ({ ...e })),
    lastDefaults: { series: 4, reps: "10", descanso: "90s" },
    searchQuery: "",
    cfg: { exerciseName: "", series: 4, reps: "10", carga: "", descanso: "90s", obs: "", videoUrl: "", editingId: null },
    iniciarNome: "Treino B",
    iniciarFoco: "Corpo inteiro",
    iniciarWeeklyTargets: [],
    triagens: { ...TRIAGENS_SEED },
    triagemAlunaId: null,
    triagemDraft: emptyDraft(),
    triagemViewOnly: false,
    customTemplates: [],
    modeloBuilding: false,
    modeloDraft: { name: "", desc: "" },
    addAlunaMode: "closed",
    addAlunaDraft: emptyAddAlunaDraft(),
    addAlunaLinkUrl: null,
    addAlunaBusy: false,
    settings: DEFAULT_SETTINGS,
    alunaFilterObjetivo: null,
    alunaFilterNivel: null,
    alunaFilterVencido: false,
    alunaFilterFoco: null,
  };
}

function loadState(): AppState {
  if (typeof window === "undefined") return initialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw);
    return {
      ...initialState(),
      ...parsed,
      screen: "dashboard",
      history: [],
      toast: "",
      addAlunaMode: "closed",
      addAlunaBusy: false,
    };
  } catch {
    return initialState();
  }
}

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function initialsFor(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

interface AppApi {
  state: AppState;
  goTo: (screen: ScreenKey, extra?: Partial<AppState>) => void;
  goBack: () => void;
  toast: (msg: string) => void;
  setAlunaId: (id: string) => void;
  setAlunaSearch: (v: string) => void;
  openPerfil: (id: string) => void;
  openTreino: (tr: Treino) => void;
  onNovoTreino: () => void;
  onComecarZero: () => void;
  onDuplicarAnterior: () => void;
  onUsarModelo: () => void;
  applyTemplate: (t: Modelo) => void;
  openBusca: () => void;
  setSearchQuery: (v: string) => void;
  selectExercise: (name: string) => void;
  editExercise: (ex: Exercise) => void;
  duplicateExercise: (ex: Exercise) => void;
  deleteExercise: (id: string) => void;
  // Moves the exercise currently at `from` to index `to`, preserving the
  // rest of the order — backs the Montador drag-to-reorder interaction.
  // This is the single source of truth for exercise order: Revisão and the
  // PDF both just render state.exercises directly, and approve() copies
  // s.exercises verbatim into the saved Treino, so whatever order lands
  // here is exactly what shows up downstream.
  moveExercise: (from: number, to: number) => void;
  // "Exercícios conjugados" (supersets): group 2+ exercises (by id) into a
  // shared conjugado, remove one exercise from its group, or dissolve a
  // whole group back into standalone exercises.
  groupExercises: (ids: string[]) => void;
  ungroupExercise: (id: string) => void;
  dissolveGroup: (groupId: string) => void;
  addToTreino: () => void;
  approve: () => void;
  markSent: () => void;
  setCfg: (patch: Partial<AppState["cfg"]>) => void;
  setTreinoEnfase: (v: string) => void;
  setTreinoObsTreinadora: (v: string) => void;
  toggleArr: (field: keyof AppState["triagemDraft"], item: string) => void;
  setDraft: (field: keyof AppState["triagemDraft"], value: unknown) => void;
  setIntensidade: (regiao: string, n: number) => void;
  onFazerTriagem: () => void;
  onVerTriagem: () => void;
  onTriagemIniciar: () => void;
  onTriagemPular: () => void;
  onTriagemAvancar: () => void;
  setIniciarNome: (v: string) => void;
  setIniciarFoco: (v: string) => void;
  setIniciarWeeklyTarget: (grupo: string, reps: number | null) => void;
  navTo: (screen: ScreenKey) => void;
  syncTriagens: () => void;
  // item 4: Alunos search/filter chips.
  setAlunaFilterObjetivo: (v: string | null) => void;
  setAlunaFilterNivel: (v: string | null) => void;
  setAlunaFilterVencido: (v: boolean) => void;
  setAlunaFilterFoco: (v: string | null) => void;
  // items 5/6: settings (renewal threshold, PIX key).
  syncSettings: () => void;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  // item 8: persists a read-only snapshot of the treino currently in
  // state.exercises/treinoName/etc. and returns its public /ficha/{token}
  // URL, or null if it couldn't be created (offline / no DB).
  createShareLink: () => Promise<string | null>;
  // "Adicionar aluna" (item 1)
  openAddAluna: () => void;
  closeAddAluna: () => void;
  chooseAddAlunaMode: (mode: "link" | "manual") => void;
  setAddAlunaDraft: (patch: Partial<AddAlunaDraft>) => void;
  submitAddAlunaLink: () => Promise<void>;
  submitAddAlunaManual: () => Promise<void>;
  updateAlunaInstagram: (id: string, instagram: string) => void;
  updateAlunaProfile: (id: string, patch: { idade?: number; local?: string; whatsapp?: string; genero?: Genero }) => void;
  deleteAluna: (id: string) => Promise<boolean>;
  // "Criar modelo" (item 2)
  onCriarModelo: () => void;
  setModeloDraft: (patch: Partial<AppState["modeloDraft"]>) => void;
  saveModelo: () => void;
}

const AppContext = createContext<AppApi | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const { screen, history, toast, ...persisted } = state;
      void screen;
      void history;
      void toast;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // ignore quota errors
    }
  }, [state, hydrated]);

  const toast = useCallback((msg: string) => {
    setState((s) => ({ ...s, toast: msg }));
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setState((s) => ({ ...s, toast: "" })), 2200);
  }, []);

  const goTo = useCallback((screen: ScreenKey, extra?: Partial<AppState>) => {
    setState((s) => ({ ...s, screen, history: [...s.history, s.screen], ...(extra || {}) }));
  }, []);

  const goBack = useCallback(() => {
    setState((s) => {
      const h = [...s.history];
      const prev = (h.pop() as ScreenKey) ?? "dashboard";
      return { ...s, screen: prev, history: h };
    });
  }, []);

  const navTo = useCallback((screen: ScreenKey) => {
    setState((s) => ({ ...s, screen, history: [] }));
  }, []);

  const setAlunaId = useCallback((id: string) => setState((s) => ({ ...s, alunaId: id })), []);
  const setAlunaSearch = useCallback((v: string) => setState((s) => ({ ...s, alunaSearch: v })), []);

  const openPerfil = useCallback((id: string) => {
    setState((s) => ({ ...s, alunaId: id, screen: "perfil", history: [...s.history, s.screen] }));
  }, []);

  const openTreino = useCallback((tr: Treino) => {
    goTo("montador", {
      treinoName: tr.name,
      treinoFoco: tr.foco,
      treinoEnfase: tr.enfase || "",
      treinoObsTreinadora: tr.observacoesTreinadora || "",
      treinoId: tr.id,
      treinoCreatedAt: tr.createdAt || new Date().toISOString(),
      treinoSentAt: tr.sentAt ?? null,
      treinoVersions: tr.versions ? [...tr.versions] : [],
      weeklyRepTargets: tr.weeklyRepTargets ? [...tr.weeklyRepTargets] : [],
      exercises: tr.demo ? DEMO_EXERCISES.map((e) => ({ ...e, id: makeId() })) : tr.exercises.map((e) => ({ ...e })),
      modeloBuilding: false,
    });
  }, [goTo]);

  const startNewTreino = useCallback(
    (name: string, foco: string, exercises: Exercise[]) => {
      goTo("montador", {
        treinoName: name,
        treinoFoco: foco,
        treinoEnfase: "",
        treinoObsTreinadora: "",
        treinoId: makeId(),
        treinoCreatedAt: new Date().toISOString(),
        treinoSentAt: null,
        treinoVersions: [],
        weeklyRepTargets: [],
        exercises,
        modeloBuilding: false,
      });
    },
    [goTo]
  );

  const onNovoTreino = useCallback(() => {
    setState((s) => {
      if (!s.triagens[s.alunaId]) {
        return {
          ...s,
          triagemAlunaId: s.alunaId,
          triagemDraft: emptyDraft(),
          triagemViewOnly: false,
          screen: "triagem-intro",
          history: [...s.history, s.screen],
        };
      }
      return { ...s, screen: "iniciar", history: [...s.history, s.screen] };
    });
  }, []);

  const onComecarZero = useCallback(() => {
    setState((s) => ({
      ...s,
      screen: "montador",
      history: [...s.history, s.screen],
      treinoName: s.iniciarNome,
      treinoFoco: s.iniciarFoco,
      treinoEnfase: "",
      treinoObsTreinadora: "",
      treinoId: makeId(),
      treinoCreatedAt: new Date().toISOString(),
      treinoSentAt: null,
      treinoVersions: [],
      weeklyRepTargets: s.iniciarWeeklyTargets,
      exercises: [],
      modeloBuilding: false,
    }));
  }, []);

  const onDuplicarAnterior = useCallback(() => {
    setState((s) => ({
      ...s,
      screen: "montador",
      history: [...s.history, s.screen],
      treinoName: s.treinoName + " (cópia)",
      treinoId: makeId(),
      treinoCreatedAt: new Date().toISOString(),
      treinoSentAt: null,
      treinoVersions: [],
      exercises: s.exercises.map((e) => ({ ...e, id: makeId() })),
      modeloBuilding: false,
    }));
    toast("Treino duplicado.");
  }, [toast]);

  const onUsarModelo = useCallback(() => goTo("modelos"), [goTo]);

  const applyTemplate = useCallback(
    (t: Modelo) => {
      startNewTreino(t.name, t.objetivos[0] || "Personalizado", t.exercises.map((e) => ({ ...e, id: makeId() })));
    },
    [startNewTreino]
  );

  const openBusca = useCallback(() => goTo("busca"), [goTo]);
  const setSearchQuery = useCallback((v: string) => setState((s) => ({ ...s, searchQuery: v })), []);

  const selectExercise = useCallback((name: string) => {
    setState((s) => ({
      ...s,
      cfg: {
        exerciseName: name,
        series: s.lastDefaults.series,
        reps: s.lastDefaults.reps,
        carga: "",
        descanso: s.lastDefaults.descanso,
        obs: "",
        videoUrl: "",
        editingId: null,
      },
      screen: "config",
      history: [...s.history, s.screen],
    }));
  }, []);

  const editExercise = useCallback((ex: Exercise) => {
    setState((s) => ({
      ...s,
      cfg: {
        exerciseName: ex.name,
        series: ex.series,
        reps: ex.reps,
        carga: ex.carga,
        descanso: ex.descanso,
        obs: ex.obs,
        videoUrl: ex.videoUrl || "",
        editingId: ex.id,
      },
      screen: "config",
      history: [...s.history, s.screen],
    }));
  }, []);

  const duplicateExercise = useCallback(
    (ex: Exercise) => {
      // The duplicate is appended at the end of the list, not next to `ex`
      // — so if `ex` belongs to a conjugado group it must NOT inherit
      // conjugadoGroupId, or it'd violate the "group members are
      // contiguous" invariant every other screen relies on. It's added as
      // a standalone exercise instead.
      setState((s) => ({ ...s, exercises: [...s.exercises, { ...ex, id: makeId(), conjugadoGroupId: undefined }] }));
      toast(ex.name + " duplicado.");
    },
    [toast]
  );

  const deleteExercise = useCallback((id: string) => {
    setState((s) => {
      const removed = s.exercises.find((e) => e.id === id);
      let exercises = s.exercises.filter((e) => e.id !== id);
      // Deleting one member of a conjugado group can leave only one behind
      // — a "group" of one doesn't make sense, so dissolve it too (same
      // invariant enforced by ungroupExercise/moveExercise above).
      const gid = removed?.conjugadoGroupId;
      if (gid) {
        const remaining = exercises.filter((e) => e.conjugadoGroupId === gid);
        if (remaining.length === 1) {
          exercises = exercises.map((e) => (e.conjugadoGroupId === gid ? { ...e, conjugadoGroupId: undefined } : e));
        }
      }
      return { ...s, exercises };
    });
  }, []);

  const moveExercise = useCallback((from: number, to: number) => {
    setState((s) => {
      if (from === to || from < 0 || to < 0 || from >= s.exercises.length || to >= s.exercises.length) return s;
      const next = [...s.exercises];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);

      // "Exercícios conjugados": dragging one member of a group to a
      // non-adjacent spot (i.e. the move breaks the group's contiguous
      // run) auto-ungroups just that exercise, per the feature spec — we
      // never let a group render split apart in the list. Runs on every
      // incremental drag step (moveExercise fires per neighbor crossed),
      // which is cheap on these small lists.
      if (item.conjugadoGroupId) {
        const gid = item.conjugadoGroupId;
        const idxs: number[] = [];
        next.forEach((e, i) => {
          if (e.conjugadoGroupId === gid) idxs.push(i);
        });
        const contiguous = idxs.every((v, i) => i === 0 || v === idxs[i - 1] + 1);
        if (!contiguous) {
          const movedIdx = next.findIndex((e) => e.id === item.id);
          if (movedIdx !== -1) next[movedIdx] = { ...next[movedIdx], conjugadoGroupId: undefined };
          // A "group" of one exercise isn't a group — dissolve it too.
          const remaining = next.filter((e) => e.conjugadoGroupId === gid);
          if (remaining.length === 1) {
            const soleIdx = next.findIndex((e) => e.conjugadoGroupId === gid);
            if (soleIdx !== -1) next[soleIdx] = { ...next[soleIdx], conjugadoGroupId: undefined };
          }
        }
      }

      return { ...s, exercises: next };
    });
  }, []);

  // Groups 2+ exercises (by id) into a new conjugado (superset) — moves
  // them to be contiguous in state.exercises (inserted at the position of
  // the earliest-selected one, preserving their relative order and the
  // relative order of everything else) and stamps them all with a shared
  // conjugadoGroupId. Contiguity here is what lets every downstream reader
  // (Montador/Revisao/Pdf via lib/conjugado.ts, and moveExercise above)
  // treat "same conjugadoGroupId" and "adjacent run" as equivalent.
  const groupExercises = useCallback((ids: string[]) => {
    setState((s) => {
      if (ids.length < 2) return s;
      const selected = new Set(ids);
      const firstIdx = s.exercises.findIndex((e) => selected.has(e.id));
      if (firstIdx === -1) return s;
      const groupId = makeId();
      const rest = s.exercises.filter((e) => !selected.has(e.id));
      const insertAt = s.exercises.slice(0, firstIdx).filter((e) => !selected.has(e.id)).length;
      const grouped = s.exercises.filter((e) => selected.has(e.id)).map((e) => ({ ...e, conjugadoGroupId: groupId }));
      const next = [...rest.slice(0, insertAt), ...grouped, ...rest.slice(insertAt)];
      return { ...s, exercises: next };
    });
  }, []);

  // Removes a single exercise from its conjugado group, leaving the rest of
  // the group intact — unless that leaves only one member, in which case a
  // "group" of one no longer makes sense and it's dissolved too.
  const ungroupExercise = useCallback((id: string) => {
    setState((s) => {
      const ex = s.exercises.find((e) => e.id === id);
      const gid = ex?.conjugadoGroupId;
      if (!gid) return s;
      let next = s.exercises.map((e) => (e.id === id ? { ...e, conjugadoGroupId: undefined } : e));
      const remaining = next.filter((e) => e.conjugadoGroupId === gid);
      if (remaining.length === 1) {
        next = next.map((e) => (e.conjugadoGroupId === gid ? { ...e, conjugadoGroupId: undefined } : e));
      }
      return { ...s, exercises: next };
    });
  }, []);

  // Dissolves an entire conjugado group back into standalone exercises.
  const dissolveGroup = useCallback((groupId: string) => {
    setState((s) => ({
      ...s,
      exercises: s.exercises.map((e) => (e.conjugadoGroupId === groupId ? { ...e, conjugadoGroupId: undefined } : e)),
    }));
  }, []);

  const addToTreino = useCallback(() => {
    setState((s) => {
      const obj = {
        name: s.cfg.exerciseName,
        series: s.cfg.series,
        reps: s.cfg.reps,
        carga: s.cfg.carga,
        descanso: s.cfg.descanso,
        obs: s.cfg.obs,
        videoUrl: s.cfg.videoUrl.trim() || undefined,
      };
      let exercises: Exercise[];
      if (s.cfg.editingId) {
        exercises = s.exercises.map((e) => (e.id === s.cfg.editingId ? { ...e, ...obj } : e));
      } else {
        exercises = [...s.exercises, { ...obj, id: makeId() }];
      }
      return {
        ...s,
        exercises,
        lastDefaults: { series: obj.series, reps: obj.reps, descanso: obj.descanso },
        screen: "montador",
      };
    });
    setState((s) => {
      toast(s.cfg.editingId ? "Exercício atualizado." : s.cfg.exerciseName + " adicionado.");
      return s;
    });
  }, [toast]);

  // Persists the in-progress treino (state.exercises + metadata) into the
  // aluna's treinos list, computing a version-history diff against whatever
  // was saved before under the same treinoId (item 4).
  const approve = useCallback(() => {
    setState((s) => {
      const aluna = s.alunas.find((a) => a.id === s.alunaId);
      const prevTreino = aluna?.treinos.find((t) => t.id === s.treinoId);
      const changes = diffExercises(prevTreino?.exercises ?? [], s.exercises);
      const versions = changes.length > 0 ? [{ at: new Date().toISOString(), changes }, ...s.treinoVersions] : s.treinoVersions;
      const treinoId = s.treinoId || makeId();
      const savedTreino: Treino = {
        id: treinoId,
        name: s.treinoName,
        foco: s.treinoFoco,
        exercises: s.exercises.map((e) => ({ ...e })),
        createdAt: s.treinoCreatedAt || new Date().toISOString(),
        sentAt: s.treinoSentAt ?? undefined,
        weeklyRepTargets: s.weeklyRepTargets,
        versions,
        enfase: s.treinoEnfase || undefined,
        observacoesTreinadora: s.treinoObsTreinadora || undefined,
      };

      const alunas = s.alunas.map((a) => {
        if (a.id !== s.alunaId) return a;
        const exists = a.treinos.some((t) => t.id === treinoId);
        const treinos = exists ? a.treinos.map((t) => (t.id === treinoId ? savedTreino : t)) : [...a.treinos, savedTreino];
        return { ...a, treinos, hasTreinos: true };
      });

      return {
        ...s,
        alunas,
        treinoId,
        treinoVersions: versions,
        screen: "finalizado",
        history: [...s.history, s.screen],
      };
    });
  }, []);

  // Sets sentAt on the current treino, called from the WhatsApp / Instagram
  // share actions and "Salvar e finalizar" (item 4).
  const markSent = useCallback(() => {
    setState((s) => {
      const sentAt = new Date().toISOString();
      const alunas = s.alunas.map((a) => {
        if (a.id !== s.alunaId) return a;
        return { ...a, treinos: a.treinos.map((t) => (t.id === s.treinoId ? { ...t, sentAt } : t)) };
      });
      return { ...s, alunas, treinoSentAt: sentAt };
    });
  }, []);

  const setCfg = useCallback((patch: Partial<AppState["cfg"]>) => {
    setState((s) => ({ ...s, cfg: { ...s.cfg, ...patch } }));
  }, []);

  const setTreinoEnfase = useCallback((v: string) => setState((s) => ({ ...s, treinoEnfase: v })), []);
  const setTreinoObsTreinadora = useCallback((v: string) => setState((s) => ({ ...s, treinoObsTreinadora: v })), []);

  const toggleArr = useCallback((field: keyof AppState["triagemDraft"], item: string) => {
    setState((s) => {
      const arr = s.triagemDraft[field] as unknown as string[];
      const next = arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
      return { ...s, triagemDraft: { ...s.triagemDraft, [field]: next } };
    });
  }, []);

  const setDraft = useCallback((field: keyof AppState["triagemDraft"], value: unknown) => {
    setState((s) => ({ ...s, triagemDraft: { ...s.triagemDraft, [field]: value } }));
  }, []);

  const setIntensidade = useCallback((regiao: string, n: number) => {
    setState((s) => ({
      ...s,
      triagemDraft: { ...s.triagemDraft, dorIntensidade: { ...s.triagemDraft.dorIntensidade, [regiao]: n } },
    }));
  }, []);

  const onFazerTriagem = useCallback(() => {
    setState((s) => ({
      ...s,
      triagemAlunaId: s.alunaId,
      triagemDraft: emptyDraft(),
      triagemViewOnly: false,
      screen: "triagem-intro",
      history: [...s.history, s.screen],
    }));
  }, []);

  const onVerTriagem = useCallback(() => {
    setState((s) => {
      const t = s.triagens[s.alunaId];
      return {
        ...s,
        triagemAlunaId: s.alunaId,
        triagemDraft: t || emptyDraft(),
        triagemViewOnly: true,
        screen: "triagem-resumo",
        history: [...s.history, s.screen],
      };
    });
  }, []);

  const onTriagemIniciar = useCallback(() => goTo(TRIAGEM_STEPS[0]), [goTo]);
  const onTriagemPular = useCallback(() => goTo("iniciar"), [goTo]);

  const onTriagemAvancar = useCallback(() => {
    setState((s) => {
      if (s.screen === "triagem-resumo" && s.triagemViewOnly) {
        const h = [...s.history];
        const prev = (h.pop() as ScreenKey) ?? "dashboard";
        return { ...s, screen: prev, history: h };
      }
      if (s.screen === "triagem-revisao") {
        const triagens = { ...s.triagens, [s.triagemAlunaId as string]: { ...s.triagemDraft, completedAt: "agora" } };
        return { ...s, triagens, screen: "iniciar", history: [...s.history, s.screen] };
      }
      const idx = TRIAGEM_STEPS.indexOf(s.screen);
      const next = TRIAGEM_STEPS[idx + 1];
      return { ...s, screen: next, history: [...s.history, s.screen] };
    });
  }, []);

  const setIniciarNome = useCallback((v: string) => setState((s) => ({ ...s, iniciarNome: v })), []);
  const setIniciarFoco = useCallback((v: string) => setState((s) => ({ ...s, iniciarFoco: v })), []);

  const setIniciarWeeklyTarget = useCallback((grupo: string, reps: number | null) => {
    setState((s) => {
      const rest = s.iniciarWeeklyTargets.filter((w) => w.grupo !== grupo);
      const next: WeeklyRepTarget[] = reps == null || Number.isNaN(reps) ? rest : [...rest, { grupo, reps }];
      return { ...s, iniciarWeeklyTargets: next };
    });
  }, []);

  // Pulls alunas + latest screening answers from Postgres (via /api/alunas)
  // and REPLACES local state with the server's list (item 3 "robust sync").
  // The server is authoritative for aluna existence and every
  // server-persisted profile field — this is what makes a deletion or edit
  // made elsewhere (another device, or the student's own /triagem/[token]
  // submission) show up here without a manual localStorage clear. The only
  // fields preserved from local state are the ones that only ever live in
  // localStorage per this app's architecture (treinos + their version
  // history, hasTreinos) — nothing server-authoritative is merged in a
  // stale-preserving way. Silently no-ops if the API/DB isn't reachable so
  // it never blocks the rest of the app (e.g. offline).
  const syncTriagens = useCallback(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/alunas", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          alunas: { aluna: Omit<Aluna, "treinos" | "hasTreinos">; triagem: TriagemDraft | null }[];
        };
        if (cancelled || !Array.isArray(data.alunas)) return;
        setState((s) => {
          const triagens: Record<string, TriagemDraft> = {};
          const localById = new Map(s.alunas.map((a) => [a.id, a]));
          const alunas: Aluna[] = data.alunas.map((entry) => {
            if (entry.triagem) triagens[entry.aluna.id] = entry.triagem;
            const local = localById.get(entry.aluna.id);
            return {
              id: entry.aluna.id,
              name: entry.aluna.name,
              firstName: entry.aluna.firstName,
              initials: entry.aluna.initials,
              goal: entry.aluna.goal,
              freq: entry.aluna.freq,
              last: entry.aluna.last ?? "",
              level: entry.aluna.level,
              notes: entry.aluna.notes,
              instagram: entry.aluna.instagram ?? "",
              genero: entry.aluna.genero ?? "nao_informado",
              idade: entry.aluna.idade,
              local: entry.aluna.local,
              whatsapp: entry.aluna.whatsapp ?? "",
              // Local-only fields (never persisted server-side) — carried
              // over from whatever we had locally for this aluna, or empty
              // for one that's new to this device.
              hasTreinos: local?.hasTreinos ?? false,
              treinos: local?.treinos ?? [],
            };
          });
          return { ...s, triagens, alunas };
        });
      } catch {
        // offline / no DB configured yet — local state stays as-is
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // item 3: also re-sync whenever the tab regains focus/visibility, so
  // switching back to the app after it was edited elsewhere (another
  // device, or a student's own triagem submission) picks up changes without
  // a manual reload.
  useEffect(() => {
    if (!hydrated) return;
    const onFocusOrVisible = () => {
      if (document.visibilityState === "hidden") return;
      syncTriagens();
      syncSettings();
    };
    // Settings has no per-screen mount effect of its own (unlike
    // syncTriagens, which Dashboard/Perfil already call on mount), so fetch
    // it once here.
    syncSettings();
    window.addEventListener("focus", onFocusOrVisible);
    document.addEventListener("visibilitychange", onFocusOrVisible);
    return () => {
      window.removeEventListener("focus", onFocusOrVisible);
      document.removeEventListener("visibilitychange", onFocusOrVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- syncTriagens/syncSettings are stable useCallbacks
  }, [hydrated]);

  // item 4: Alunos search/filter chips.
  const setAlunaFilterObjetivo = useCallback((v: string | null) => setState((s) => ({ ...s, alunaFilterObjetivo: v })), []);
  const setAlunaFilterNivel = useCallback((v: string | null) => setState((s) => ({ ...s, alunaFilterNivel: v })), []);
  const setAlunaFilterVencido = useCallback((v: boolean) => setState((s) => ({ ...s, alunaFilterVencido: v })), []);
  const setAlunaFilterFoco = useCallback((v: string | null) => setState((s) => ({ ...s, alunaFilterFoco: v })), []);

  // items 5/6: settings (renewal threshold, PIX key) — fetched from
  // Postgres so the "Treino vencido" filter (item 4), the Acompanhamento
  // banner (item 5) and the Financeiro PIX field (item 6) all agree.
  const syncSettings = useCallback(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { settings: AppSettings };
        if (data.settings) setState((s) => ({ ...s, settings: data.settings }));
      } catch {
        // offline / no DB configured — keep whatever we had
      }
    })();
  }, []);

  const updateSettingsApi = useCallback(async (patch: Partial<AppSettings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const data = (await res.json()) as { settings: AppSettings };
        if (data.settings) setState((s) => ({ ...s, settings: data.settings }));
      }
    } catch {
      // offline — local optimistic update already applied
    }
  }, []);

  // item 8: persists a read-only snapshot of the current in-progress treino
  // (state.exercises + metadata), mirroring the shape `approve()` saves
  // locally, so the WhatsApp deep link has a real page the aluna can open.
  const createShareLink = useCallback(async (): Promise<string | null> => {
    const s = state;
    const aluna = currentAluna(s);
    const treino: Treino = {
      id: s.treinoId || makeId(),
      name: s.treinoName,
      foco: s.treinoFoco,
      exercises: s.exercises.map((e) => ({ ...e })),
      createdAt: s.treinoCreatedAt || new Date().toISOString(),
      sentAt: s.treinoSentAt ?? undefined,
      weeklyRepTargets: s.weeklyRepTargets,
      versions: s.treinoVersions,
      enfase: s.treinoEnfase || undefined,
      observacoesTreinadora: s.treinoObsTreinadora || undefined,
    };
    try {
      const res = await fetch("/api/treino-shares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alunaId: aluna.id, alunaName: aluna.name, alunaGenero: aluna.genero, treino }),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { token: string };
      return typeof window !== "undefined" ? `${window.location.origin}/ficha/${data.token}` : null;
    } catch {
      return null;
    }
  }, [state]);

  // --- item 1: "Adicionar aluna" ------------------------------------------

  const openAddAluna = useCallback(() => {
    setState((s) => ({ ...s, addAlunaMode: "choose", addAlunaDraft: emptyAddAlunaDraft(), addAlunaLinkUrl: null }));
  }, []);
  const closeAddAluna = useCallback(() => {
    setState((s) => ({ ...s, addAlunaMode: "closed", addAlunaDraft: emptyAddAlunaDraft(), addAlunaLinkUrl: null, addAlunaBusy: false }));
  }, []);
  const chooseAddAlunaMode = useCallback((mode: "link" | "manual") => {
    setState((s) => ({ ...s, addAlunaMode: mode, addAlunaLinkUrl: null }));
  }, []);
  const setAddAlunaDraft = useCallback((patch: Partial<AddAlunaDraft>) => {
    setState((s) => ({ ...s, addAlunaDraft: { ...s.addAlunaDraft, ...patch } }));
  }, []);

  const createAlunaRemote = useCallback(
    async (
      body: Partial<Omit<AddAlunaDraft, "idade">> & { name: string; idade?: number }
    ): Promise<{ id: string; screeningToken: string } | null> => {
      try {
        const res = await fetch("/api/alunas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) return null;
        const data = (await res.json()) as { aluna: { id: string; name: string; screeningToken: string } };
        return { id: data.aluna.id, screeningToken: data.aluna.screeningToken };
      } catch {
        return null;
      }
    },
    []
  );

  const addLocalAluna = useCallback((id: string, draft: AddAlunaDraft) => {
    setState((s) => {
      const idadeNum = Number.parseInt(draft.idade, 10);
      const newAluna: Aluna = {
        id,
        name: draft.name.trim(),
        firstName: draft.name.trim().split(" ")[0] || draft.name.trim(),
        initials: initialsFor(draft.name.trim()) || "??",
        goal: draft.goal,
        freq: draft.freq,
        last: "",
        level: draft.level,
        notes: "",
        instagram: draft.instagram,
        genero: draft.genero,
        hasTreinos: false,
        treinos: [],
        idade: Number.isFinite(idadeNum) && idadeNum > 0 ? idadeNum : undefined,
        local: draft.local || undefined,
        whatsapp: draft.whatsapp || "",
      };
      return { ...s, alunas: [...s.alunas.filter((a) => a.id !== id), newAluna] };
    });
  }, []);

  const submitAddAlunaLink = useCallback(async () => {
    setState((s) => ({ ...s, addAlunaBusy: true }));
    const name = state.addAlunaDraft.name.trim();
    if (!name) {
      setState((s) => ({ ...s, addAlunaBusy: false }));
      toast("Digite o nome do aluno.");
      return;
    }
    const created = await createAlunaRemote({ name, genero: state.addAlunaDraft.genero });
    if (!created) {
      setState((s) => ({ ...s, addAlunaBusy: false }));
      toast("Não foi possível criar o aluno agora.");
      return;
    }
    addLocalAluna(created.id, { ...emptyAddAlunaDraft(), name, genero: state.addAlunaDraft.genero });
    const url = typeof window !== "undefined" ? `${window.location.origin}/triagem/${created.screeningToken}` : "";
    setState((s) => ({ ...s, addAlunaBusy: false, addAlunaLinkUrl: url }));
  }, [state.addAlunaDraft.name, state.addAlunaDraft.genero, createAlunaRemote, addLocalAluna, toast]);

  const submitAddAlunaManual = useCallback(async () => {
    setState((s) => ({ ...s, addAlunaBusy: true }));
    const draft = state.addAlunaDraft;
    const name = draft.name.trim();
    if (!name) {
      setState((s) => ({ ...s, addAlunaBusy: false }));
      toast("Digite o nome do aluno.");
      return;
    }
    const idadeNum = Number.parseInt(draft.idade, 10);
    const created = await createAlunaRemote({
      ...draft,
      idade: Number.isFinite(idadeNum) && idadeNum > 0 ? idadeNum : undefined,
    });
    if (!created) {
      setState((s) => ({ ...s, addAlunaBusy: false }));
      toast("Não foi possível salvar o aluno agora.");
      return;
    }
    addLocalAluna(created.id, draft);
    setState((s) => ({ ...s, addAlunaBusy: false, addAlunaMode: "closed", addAlunaDraft: emptyAddAlunaDraft() }));
    toast(`${name.split(" ")[0]} ${agree(draft.genero, "adicionado", "adicionada")}.`);
  }, [state.addAlunaDraft, createAlunaRemote, addLocalAluna, toast]);

  const updateAlunaInstagram = useCallback((id: string, instagram: string) => {
    setState((s) => ({ ...s, alunas: s.alunas.map((a) => (a.id === id ? { ...a, instagram } : a)) }));
  }, []);

  // Updates idade/local locally and best-effort persists to Postgres via
  // PATCH /api/alunas/[id] (item: printable ficha "DADOS DO ALUNO" fields).
  const updateAlunaProfile = useCallback((id: string, patch: { idade?: number; local?: string; whatsapp?: string; genero?: Genero }) => {
    setState((s) => ({ ...s, alunas: s.alunas.map((a) => (a.id === id ? { ...a, ...patch } : a)) }));
    fetch(`/api/alunas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).catch(() => {
      // offline / no DB configured — local state already updated
    });
  }, []);

  // Item "Excluir aluno": deletes the aluna from Postgres (cascades to her
  // screening row via ON DELETE CASCADE) and, on success, removes her from
  // local state too. Returns whether the delete actually happened so the
  // caller (Perfil.tsx) can navigate away only on success.
  const deleteAluna = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/alunas/${id}`, { method: "DELETE" });
      if (!res.ok) return false;
    } catch {
      return false;
    }
    setState((s) => {
      const { [id]: _removed, ...triagens } = s.triagens;
      void _removed;
      return { ...s, alunas: s.alunas.filter((a) => a.id !== id), triagens };
    });
    return true;
  }, []);

  // --- item 2: "Criar modelo" ---------------------------------------------

  const onCriarModelo = useCallback(() => {
    goTo("montador", {
      treinoName: "Novo modelo",
      treinoFoco: "Personalizado",
      treinoId: null,
      treinoCreatedAt: new Date().toISOString(),
      treinoSentAt: null,
      treinoVersions: [],
      weeklyRepTargets: [],
      exercises: [],
      modeloBuilding: true,
      modeloDraft: { name: "", desc: "" },
    });
  }, [goTo]);

  const setModeloDraft = useCallback((patch: Partial<AppState["modeloDraft"]>) => {
    setState((s) => ({ ...s, modeloDraft: { ...s.modeloDraft, ...patch } }));
  }, []);

  const saveModelo = useCallback(() => {
    setState((s) => {
      const name = s.modeloDraft.name.trim() || "Meu modelo";
      const modelo: Modelo = {
        id: makeId(),
        name,
        desc: s.modeloDraft.desc.trim(),
        objetivos: [],
        niveis: [],
        exercises: s.exercises.map((e) => ({ ...e })),
        isCustom: true,
      };
      return {
        ...s,
        customTemplates: [...s.customTemplates, modelo],
        modeloBuilding: false,
        screen: "modelos",
        history: [...s.history, s.screen],
      };
    });
    toast("Modelo salvo.");
  }, [toast]);

  const api: AppApi = {
    state,
    goTo,
    goBack,
    toast,
    setAlunaId,
    setAlunaSearch,
    openPerfil,
    openTreino,
    onNovoTreino,
    onComecarZero,
    onDuplicarAnterior,
    onUsarModelo,
    applyTemplate,
    openBusca,
    setSearchQuery,
    selectExercise,
    editExercise,
    duplicateExercise,
    deleteExercise,
    moveExercise,
    groupExercises,
    ungroupExercise,
    dissolveGroup,
    addToTreino,
    approve,
    markSent,
    setCfg,
    setTreinoEnfase,
    setTreinoObsTreinadora,
    toggleArr,
    setDraft,
    setIntensidade,
    onFazerTriagem,
    onVerTriagem,
    onTriagemIniciar,
    onTriagemPular,
    onTriagemAvancar,
    setIniciarNome,
    setIniciarFoco,
    setIniciarWeeklyTarget,
    navTo,
    syncTriagens,
    setAlunaFilterObjetivo,
    setAlunaFilterNivel,
    setAlunaFilterVencido,
    setAlunaFilterFoco,
    syncSettings,
    updateSettings: updateSettingsApi,
    createShareLink,
    openAddAluna,
    closeAddAluna,
    chooseAddAlunaMode,
    setAddAlunaDraft,
    submitAddAlunaLink,
    submitAddAlunaManual,
    updateAlunaInstagram,
    updateAlunaProfile,
    deleteAluna,
    onCriarModelo,
    setModeloDraft,
    saveModelo,
  };

  const triagemFormApi: TriagemFormApi = useMemo(
    () => ({
      draft: state.triagemDraft,
      toggleArr,
      setDraft,
      setIntensidade,
      genero: state.alunas.find((a) => a.id === state.triagemAlunaId)?.genero,
    }),
    [state.triagemDraft, state.alunas, state.triagemAlunaId, toggleArr, setDraft, setIntensidade]
  );

  return (
    <AppContext.Provider value={api}>
      <TriagemFormContext.Provider value={triagemFormApi}>{children}</TriagemFormContext.Provider>
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function currentAluna(state: AppState) {
  return state.alunas.find((a) => a.id === state.alunaId) || state.alunas[0];
}

export function allTemplates(state: AppState): Modelo[] {
  return [...TEMPLATES, ...state.customTemplates];
}

// SEED_ALUNAS kept available for anything that still needs the static seed
// (e.g. scripts); prefer state.alunas / currentAluna within the app.
export { SEED_ALUNAS as ALUNAS };
