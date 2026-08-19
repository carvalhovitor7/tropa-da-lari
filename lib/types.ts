export type ScreenKey =
  | "dashboard"
  | "alunas"
  | "treinos-ph"
  | "biblioteca-ph"
  | "perfil"
  | "iniciar"
  | "modelos"
  | "criar-modelo"
  | "montador"
  | "busca"
  | "config"
  | "revisao"
  | "finalizado"
  | "pdf"
  | "whatsapp"
  | "triagem-intro"
  | "triagem-perfil"
  | "triagem-dor"
  | "triagem-lesoes"
  | "triagem-cirurgias"
  | "triagem-acompanhamento"
  | "triagem-saude"
  | "triagem-resumo"
  | "triagem-revisao";

export const TRIAGEM_STEPS: ScreenKey[] = [
  "triagem-perfil",
  "triagem-dor",
  "triagem-lesoes",
  "triagem-cirurgias",
  "triagem-acompanhamento",
  "triagem-saude",
  "triagem-resumo",
  "triagem-revisao",
];

export interface Exercise {
  id: string;
  name: string;
  series: number;
  reps: string;
  carga: string;
  descanso: string;
  obs: string;
}

// A weekly total-rep emphasis target for a muscle group, independent of the
// per-session sets×reps of any single exercise (item 6).
export interface WeeklyRepTarget {
  grupo: string;
  reps: number;
}

// One reverse-chronological entry in a treino's change history (item 4).
export interface TreinoVersion {
  at: string; // ISO date string
  changes: string[]; // human-readable lines, e.g. "Leg Press 45° — carga alterada de 40kg para 50kg"
}

export interface Treino {
  id: string;
  name: string;
  foco: string;
  demo?: boolean;
  exercises: Exercise[];
  createdAt?: string; // ISO date string — set when the treino is first started
  sentAt?: string; // ISO date string — set when actually shared with the aluna
  weeklyRepTargets?: WeeklyRepTarget[];
  versions?: TreinoVersion[];
}

export interface Aluna {
  id: string;
  name: string;
  firstName: string;
  initials: string;
  goal: string;
  freq: string;
  last: string;
  level: string;
  notes: string;
  instagram: string;
  hasTreinos: boolean;
  treinos: Treino[];
}

// A custom, Larissa-authored workout template (item 2 "Criar modelo").
// Seeded templates from lib/data.ts share the same shape (minus isCustom).
export interface Modelo {
  id: string;
  name: string;
  desc: string;
  objetivos: string[]; // target profile tags this template suits
  niveis: string[];
  exercises: Exercise[];
  isCustom?: boolean;
}

export interface TriagemDraft {
  objetivos: string[];
  experiencia: string;
  frequencia: string;
  duracao: string;
  temDor: boolean | null;
  dorRegioes: string[];
  dorIntensidade: Record<string, number>;
  dorQuando: string[];
  movimentos: string[];
  movimentosTexto: string;
  temLesao: boolean | null;
  lesaoRegiao: string;
  lesaoTipo: string;
  lesaoQuando: string;
  lesaoSintoma: string;
  lesaoDiagnostico: string;
  temCirurgia: boolean | null;
  cirurgiaRegiao: string;
  cirurgiaQuando: string;
  cirurgiaRestricao: string;
  acompanhamento: string;
  orientacao: string;
  orientacaoTexto: string;
  restricaoProfissional: boolean | null;
  restricaoTexto: string;
  saude: string[];
  observacaoLarissa: string;
  completedAt?: string;
}

export const emptyDraft = (): TriagemDraft => ({
  objetivos: [],
  experiencia: "",
  frequencia: "",
  duracao: "",
  temDor: null,
  dorRegioes: [],
  dorIntensidade: {},
  dorQuando: [],
  movimentos: [],
  movimentosTexto: "",
  temLesao: null,
  lesaoRegiao: "",
  lesaoTipo: "",
  lesaoQuando: "",
  lesaoSintoma: "",
  lesaoDiagnostico: "",
  temCirurgia: null,
  cirurgiaRegiao: "",
  cirurgiaQuando: "",
  cirurgiaRestricao: "",
  acompanhamento: "",
  orientacao: "",
  orientacaoTexto: "",
  restricaoProfissional: null,
  restricaoTexto: "",
  saude: [],
  observacaoLarissa: "",
});

export interface CfgDraft {
  exerciseName: string;
  series: number;
  reps: string;
  carga: string;
  descanso: string;
  obs: string;
  editingId: string | null;
}

export interface AddAlunaDraft {
  name: string;
  goal: string;
  freq: string;
  level: string;
  instagram: string;
}

export const emptyAddAlunaDraft = (): AddAlunaDraft => ({
  name: "",
  goal: "",
  freq: "",
  level: "",
  instagram: "",
});

export interface ModeloDraft {
  name: string;
  desc: string;
}

export interface AppState {
  screen: ScreenKey;
  history: ScreenKey[];
  alunaId: string;
  alunaSearch: string;
  toast: string;
  alunas: Aluna[];
  treinoName: string;
  treinoFoco: string;
  treinoId: string | null;
  treinoCreatedAt: string;
  treinoSentAt: string | null;
  treinoVersions: TreinoVersion[];
  weeklyRepTargets: WeeklyRepTarget[];
  exercises: Exercise[];
  lastDefaults: { series: number; reps: string; descanso: string };
  searchQuery: string;
  cfg: CfgDraft;
  iniciarNome: string;
  iniciarFoco: string;
  iniciarWeeklyTargets: WeeklyRepTarget[];
  triagens: Record<string, TriagemDraft>;
  triagemAlunaId: string | null;
  triagemDraft: TriagemDraft;
  triagemViewOnly: boolean;
  customTemplates: Modelo[];
  modeloBuilding: boolean;
  modeloDraft: ModeloDraft;
  addAlunaMode: "closed" | "choose" | "link" | "manual";
  addAlunaDraft: AddAlunaDraft;
  addAlunaLinkUrl: string | null;
  addAlunaBusy: boolean;
}
