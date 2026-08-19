export type ScreenKey =
  | "dashboard"
  | "alunas"
  | "treinos-ph"
  | "biblioteca-ph"
  | "perfil"
  | "iniciar"
  | "modelos"
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

export interface Treino {
  id: string;
  name: string;
  foco: string;
  demo?: boolean;
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
  hasTreinos: boolean;
  treinos: Treino[];
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

export interface AppState {
  screen: ScreenKey;
  history: ScreenKey[];
  alunaId: string;
  alunaSearch: string;
  toast: string;
  treinoName: string;
  treinoFoco: string;
  exercises: Exercise[];
  lastDefaults: { series: number; reps: string; descanso: string };
  searchQuery: string;
  cfg: CfgDraft;
  iniciarNome: string;
  iniciarFoco: string;
  triagens: Record<string, TriagemDraft>;
  triagemAlunaId: string | null;
  triagemDraft: TriagemDraft;
  triagemViewOnly: boolean;
}
