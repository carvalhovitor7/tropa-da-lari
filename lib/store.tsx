"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ALUNAS, DEMO_EXERCISES, TRIAGENS_SEED } from "./data";
import { AppState, Exercise, ScreenKey, TRIAGEM_STEPS, Treino, TriagemDraft, emptyDraft } from "./types";
import { TriagemFormApi, TriagemFormContext } from "./triagemForm";

const STORAGE_KEY = "tropa-da-lari-state-v1";

function initialState(): AppState {
  return {
    screen: "dashboard",
    history: [],
    alunaId: "juliana",
    alunaSearch: "",
    toast: "",
    treinoName: "Treino A",
    treinoFoco: "Inferiores",
    exercises: DEMO_EXERCISES.map((e) => ({ ...e })),
    lastDefaults: { series: 4, reps: "10", descanso: "90s" },
    searchQuery: "",
    cfg: { exerciseName: "", series: 4, reps: "10", carga: "", descanso: "90s", obs: "", editingId: null },
    iniciarNome: "Treino B",
    iniciarFoco: "Corpo inteiro",
    triagens: { ...TRIAGENS_SEED },
    triagemAlunaId: null,
    triagemDraft: emptyDraft(),
    triagemViewOnly: false,
  };
}

function loadState(): AppState {
  if (typeof window === "undefined") return initialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw);
    return { ...initialState(), ...parsed, screen: "dashboard", history: [], toast: "" };
  } catch {
    return initialState();
  }
}

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
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
  applyTemplate: (t: { name: string }) => void;
  openBusca: () => void;
  setSearchQuery: (v: string) => void;
  selectExercise: (name: string) => void;
  editExercise: (ex: Exercise) => void;
  duplicateExercise: (ex: Exercise) => void;
  deleteExercise: (id: string) => void;
  addToTreino: () => void;
  approve: () => void;
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
  navTo: (screen: ScreenKey) => void;
  syncTriagens: () => void;
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

  const openPerfil = useCallback(
    (id: string) => {
      setState((s) => ({ ...s, alunaId: id, screen: "perfil", history: [...s.history, s.screen] }));
    },
    []
  );

  const openTreino = useCallback((tr: Treino) => {
    if (tr.demo) {
      goTo("montador", { treinoName: tr.name, treinoFoco: tr.foco, exercises: DEMO_EXERCISES.map((e) => ({ ...e, id: makeId() })) });
    } else {
      goTo("montador", { treinoName: tr.name, treinoFoco: tr.foco, exercises: [] });
    }
  }, [goTo]);

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
      exercises: [],
    }));
  }, []);

  const onDuplicarAnterior = useCallback(() => {
    setState((s) => ({
      ...s,
      screen: "montador",
      history: [...s.history, s.screen],
      treinoName: s.treinoName + " (cópia)",
      exercises: s.exercises.map((e) => ({ ...e, id: makeId() })),
    }));
    toast("Treino duplicado.");
  }, [toast]);

  const onUsarModelo = useCallback(() => goTo("modelos"), [goTo]);

  const applyTemplate = useCallback(
    (t: { name: string }) => {
      goTo("montador", {
        treinoName: t.name,
        treinoFoco: "Personalizado",
        exercises: DEMO_EXERCISES.slice(0, 3).map((e) => ({ ...e, id: makeId() })),
      });
    },
    [goTo]
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

  const approve = useCallback(() => goTo("finalizado"), [goTo]);

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

  // Pulls the latest screening answers from Postgres (via /api/alunas) and
  // merges them into local state. This is how a triagem submitted by a
  // student on her own phone (see app/triagem/[token]) shows up in
  // Larissa's app: called on mount from Dashboard and Perfil. Silently
  // no-ops if the API/DB isn't reachable (e.g. no local Postgres configured)
  // so it never blocks the rest of the app.
  const syncTriagens = useCallback(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/alunas", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          alunas: { aluna: { id: string }; triagem: TriagemDraft | null }[];
        };
        if (cancelled || !Array.isArray(data.alunas)) return;
        setState((s) => {
          const triagens = { ...s.triagens };
          for (const entry of data.alunas) {
            if (entry.triagem) triagens[entry.aluna.id] = entry.triagem;
          }
          return { ...s, triagens };
        });
      } catch {
        // offline / no DB configured yet — local seed data stays as-is
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
    navTo,
    syncTriagens,
  };

  const triagemFormApi: TriagemFormApi = useMemo(
    () => ({ draft: state.triagemDraft, toggleArr, setDraft, setIntensidade }),
    [state.triagemDraft, toggleArr, setDraft, setIntensidade]
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
  return ALUNAS.find((a) => a.id === state.alunaId) || ALUNAS[0];
}

export { ALUNAS };
