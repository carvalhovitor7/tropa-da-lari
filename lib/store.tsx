"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ALUNAS as SEED_ALUNAS, DEMO_EXERCISES, TEMPLATES, TRIAGENS_SEED } from "./data";
import {
  AddAlunaDraft,
  Aluna,
  AppState,
  Exercise,
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
    treinoId: null,
    treinoCreatedAt: "",
    treinoSentAt: null,
    treinoVersions: [],
    weeklyRepTargets: [],
    exercises: DEMO_EXERCISES.slice(0, 4).map((e) => ({ ...e })),
    lastDefaults: { series: 4, reps: "10", descanso: "90s" },
    searchQuery: "",
    cfg: { exerciseName: "", series: 4, reps: "10", carga: "", descanso: "90s", obs: "", editingId: null },
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
  addToTreino: () => void;
  approve: () => void;
  markSent: () => void;
  setCfg: (patch: Partial<AppState["cfg"]>) => void;
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
  // "Adicionar aluna" (item 1)
  openAddAluna: () => void;
  closeAddAluna: () => void;
  chooseAddAlunaMode: (mode: "link" | "manual") => void;
  setAddAlunaDraft: (patch: Partial<AddAlunaDraft>) => void;
  submitAddAlunaLink: () => Promise<void>;
  submitAddAlunaManual: () => Promise<void>;
  updateAlunaInstagram: (id: string, instagram: string) => void;
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage after mount, unavoidable for client-only persistence
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
      cfg: { exerciseName: name, series: s.lastDefaults.series, reps: s.lastDefaults.reps, carga: "", descanso: s.lastDefaults.descanso, obs: "", editingId: null },
      screen: "config",
      history: [...s.history, s.screen],
    }));
  }, []);

  const editExercise = useCallback((ex: Exercise) => {
    setState((s) => ({
      ...s,
      cfg: { exerciseName: ex.name, series: ex.series, reps: ex.reps, carga: ex.carga, descanso: ex.descanso, obs: ex.obs, editingId: ex.id },
      screen: "config",
      history: [...s.history, s.screen],
    }));
  }, []);

  const duplicateExercise = useCallback(
    (ex: Exercise) => {
      setState((s) => ({ ...s, exercises: [...s.exercises, { ...ex, id: makeId() }] }));
      toast(ex.name + " duplicado.");
    },
    [toast]
  );

  const deleteExercise = useCallback((id: string) => {
    setState((s) => ({ ...s, exercises: s.exercises.filter((e) => e.id !== id) }));
  }, []);

  const addToTreino = useCallback(() => {
    setState((s) => {
      const obj = { name: s.cfg.exerciseName, series: s.cfg.series, reps: s.cfg.reps, carga: s.cfg.carga, descanso: s.cfg.descanso, obs: s.cfg.obs };
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
  // and merges them into local state. This is how a triagem submitted by a
  // student on her own phone (see app/triagem/[token]) shows up in
  // Larissa's app, and how an aluna added from another session/device shows
  // up here too. Local-only fields (treinos, and treino history) are
  // preserved for alunas that already exist locally. Silently no-ops if the
  // API/DB isn't reachable so it never blocks the rest of the app.
  const syncTriagens = useCallback(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/alunas", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          alunas: { aluna: Omit<Aluna, "treinos" | "hasTreinos"> & { hasTreinos: boolean }; triagem: TriagemDraft | null }[];
        };
        if (cancelled || !Array.isArray(data.alunas)) return;
        setState((s) => {
          const triagens = { ...s.triagens };
          const byId = new Map(s.alunas.map((a) => [a.id, a]));
          for (const entry of data.alunas) {
            if (entry.triagem) triagens[entry.aluna.id] = entry.triagem;
            const existing = byId.get(entry.aluna.id);
            if (existing) {
              byId.set(entry.aluna.id, {
                ...existing,
                name: entry.aluna.name,
                firstName: entry.aluna.firstName,
                initials: entry.aluna.initials,
                goal: entry.aluna.goal,
                freq: entry.aluna.freq,
                level: entry.aluna.level,
                notes: entry.aluna.notes,
                instagram: entry.aluna.instagram ?? existing.instagram ?? "",
                genero: entry.aluna.genero ?? existing.genero ?? "nao_informado",
              });
            } else {
              byId.set(entry.aluna.id, {
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
                hasTreinos: false,
                treinos: [],
              });
            }
          }
          return { ...s, triagens, alunas: Array.from(byId.values()) };
        });
      } catch {
        // offline / no DB configured yet — local seed data stays as-is
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
    async (body: Partial<AddAlunaDraft> & { name: string }): Promise<{ id: string; screeningToken: string } | null> => {
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
    const created = await createAlunaRemote(draft);
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
    addToTreino,
    approve,
    markSent,
    setCfg,
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
    openAddAluna,
    closeAddAluna,
    chooseAddAlunaMode,
    setAddAlunaDraft,
    submitAddAlunaLink,
    submitAddAlunaManual,
    updateAlunaInstagram,
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
