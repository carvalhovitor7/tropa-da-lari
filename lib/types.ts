export type ScreenKey =
  | "dashboard"
  | "alunas"
  | "acompanhamento"
  | "financeiro"
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
  // Optional link to a YouTube demonstration of the exercise, shown as a
  // "▶ Ver execução" link in the builder and as a clickable link on the
  // printable ficha (item: YouTube links per exercise).
  videoUrl?: string;
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
  // Short free-text muscle-group emphasis shown as the parenthetical
  // subtitle on the printable ficha, e.g. "Glúteos e posteriores" under a
  // "INFERIORES" foco. Optional — falls back to the foco alone when unset.
  enfase?: string;
  // Larissa's free-text notes for this specific treino, shown in the
  // "OBSERVAÇÃO DA TREINADORA" footer band of the printable ficha.
  observacoesTreinadora?: string;
}

// Self-reported/entered gender, used only to pick correct grammatical
// agreement ("aluno"/"aluna", "o"/"a", ...) in copy that names a specific
// person. "nao_informado" falls back to the app-wide neutral masculine
// default (see lib/gender.ts) rather than guessing.
export type Genero = "feminino" | "masculino" | "nao_informado";

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
  genero: Genero;
  hasTreinos: boolean;
  treinos: Treino[];
  // Age in years, shown on the printable ficha's "DADOS DO ALUNO" card.
  idade?: number;
  // Free-text training location (e.g. "Academia completa", "Casa", "Ar
  // livre"), also shown on the printable ficha.
  local?: string;
  // Phone number (digits, may include country/area code) used for the
  // direct wa.me deep-link share (item 8). Optional — falls back to the
  // generic Web Share sheet when empty.
  whatsapp: string;
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
  videoUrl: string;
  editingId: string | null;
}

export interface AddAlunaDraft {
  name: string;
  goal: string;
  freq: string;
  level: string;
  instagram: string;
  genero: Genero;
  idade: string;
  local: string;
  whatsapp: string;
}

export const emptyAddAlunaDraft = (): AddAlunaDraft => ({
  name: "",
  goal: "",
  freq: "",
  level: "",
  instagram: "",
  genero: "nao_informado",
  idade: "",
  local: "",
  whatsapp: "",
});

export interface ModeloDraft {
  name: string;
  desc: string;
}

// --- item 5: "Acompanhamento" (evolução) ------------------------------

export interface EvolucaoMedidas {
  cintura?: number;
  quadril?: number;
  braco?: number;
  coxa?: number;
}

export interface EvolucaoEntry {
  id: string;
  alunaId: string;
  data: string; // ISO date the measurement refers to
  peso?: number; // kg
  medidas: EvolucaoMedidas; // cm
  fotos: string[]; // Vercel Blob URLs, or base64 data URLs as a fallback
  createdAt: string;
}

// --- item 6: "Financeiro" -----------------------------------------------

export type PlanoTipo = "diario" | "semanal" | "mensal" | "trimestral";
export const PLANO_LABELS: Record<PlanoTipo, string> = {
  diario: "Diário",
  semanal: "Semanal",
  mensal: "Mensal",
  trimestral: "Trimestral",
};
export const PLANO_VALOR_PADRAO: Record<PlanoTipo, number> = {
  diario: 0,
  semanal: 0,
  mensal: 0,
  trimestral: 0,
};

export interface Financeiro {
  alunaId: string;
  plano: PlanoTipo | "";
  valor: number | null;
  dataPagamento: string | null; // ISO date of last payment
  updatedAt?: string;
}

export type FinanceiroStatus = "em_dia" | "vencendo" | "atrasado" | "sem_dados";

export interface AppSettings {
  renewalWeeks: number;
  pixKey: string;
}

export const DEFAULT_SETTINGS: AppSettings = { renewalWeeks: 4, pixKey: "" };

export interface AppState {
  screen: ScreenKey;
  history: ScreenKey[];
  alunaId: string;
  alunaSearch: string;
  toast: string;
  alunas: Aluna[];
  treinoName: string;
  treinoFoco: string;
  treinoEnfase: string;
  treinoObsTreinadora: string;
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
  // Items 4/5/6: app-wide settings (renewal reminder threshold, PIX key),
  // fetched from Postgres and shared across the Alunos filter, the
  // Acompanhamento "vencido" banner and the Financeiro tab.
  settings: AppSettings;
  // item 4: filter chips on the Alunos tab.
  alunaFilterObjetivo: string | null;
  alunaFilterNivel: string | null;
  alunaFilterVencido: boolean;
  // Filters alunos by the `foco` of any of their treinos (e.g. "Inferiores",
  // "Superiores", "Corpo inteiro"), reusing the same FOCOS option list used
  // when starting a new treino (lib/data.ts).
  alunaFilterFoco: string | null;
}
