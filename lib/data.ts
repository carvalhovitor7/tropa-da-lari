import { Aluna, Exercise, TriagemDraft } from "./types";

export const CATEGORIES: { name: string; items: string[] }[] = [
  { name: "Glúteos", items: ["Elevação pélvica", "Coice no cabo"] },
  { name: "Quadríceps", items: ["Agachamento livre", "Cadeira extensora"] },
  { name: "Posterior", items: ["Stiff", "Cadeira flexora"] },
  { name: "Panturrilha", items: ["Panturrilha em pé", "Panturrilha sentada"] },
  { name: "Costas", items: ["Puxada frente", "Remada baixa"] },
  { name: "Peito", items: ["Supino reto", "Crucifixo"] },
  { name: "Ombros", items: ["Desenvolvimento", "Elevação lateral"] },
  { name: "Bíceps", items: ["Rosca direta", "Rosca alternada"] },
  { name: "Tríceps", items: ["Tríceps corda", "Tríceps testa"] },
  { name: "Abdômen", items: ["Prancha", "Abdominal supra"] },
  { name: "Cardio", items: ["Esteira", "Bike"] },
  { name: "Mobilidade", items: ["Mobilidade de quadril", "Mobilidade de tornozelo"] },
];

export const RECENTES = ["Agachamento livre", "Leg press 45°", "Afundo", "Cadeira extensora"];
export const FAVORITOS = ["Cadeira extensora", "Stiff", "Prancha"];

export const TEMPLATES = [
  { id: "t1", name: "Feminino iniciante 3x", desc: "Corpo inteiro, cargas leves, foco em execução." },
  { id: "t2", name: "Emagrecimento 3x", desc: "Combina força e cardio, descansos curtos." },
  { id: "t3", name: "Hipertrofia inferiores", desc: "Volume alto para glúteos e pernas." },
  { id: "t4", name: "Full body iniciante", desc: "Um treino só, ideal para quem começou agora." },
  { id: "t5", name: "Treino 45 minutos", desc: "Enxuto, para dias corridos." },
  { id: "t6", name: "Mobilidade + força", desc: "Aquecimento ativo antes do treino de força." },
];

export const FOCOS = [
  "Corpo inteiro",
  "Inferiores",
  "Superiores",
  "Glúteos",
  "Pernas",
  "Costas",
  "Peito",
  "Braços",
  "Mobilidade",
  "Cardio",
];

export const DEMO_EXERCISES: Exercise[] = [
  { id: "ex-1", name: "Agachamento Livre", series: 4, reps: "10", carga: "40", descanso: "90s", obs: "" },
  { id: "ex-2", name: "Leg Press 45°", series: 4, reps: "12", carga: "100", descanso: "60s", obs: "" },
  { id: "ex-3", name: "Afundo", series: 3, reps: "10", carga: "", descanso: "60s", obs: "Descer controlando o movimento." },
  { id: "ex-4", name: "Cadeira Extensora", series: 3, reps: "12", carga: "30", descanso: "60s", obs: "" },
];

export const ALUNAS: Aluna[] = [
  {
    id: "juliana",
    name: "Juliana Ferreira",
    firstName: "Juliana",
    initials: "JF",
    goal: "Emagrecimento + fortalecimento",
    freq: "3x por semana",
    last: "14 ago",
    level: "Intermediária",
    notes: "Sem impacto no joelho direito.",
    hasTreinos: true,
    treinos: [
      { id: "A", name: "Treino A", foco: "Inferiores", demo: true },
      { id: "B", name: "Treino B", foco: "Superiores", demo: false },
      { id: "C", name: "Treino C", foco: "Corpo inteiro", demo: false },
    ],
  },
  {
    id: "camila",
    name: "Camila Souza",
    firstName: "Camila",
    initials: "CS",
    goal: "Hipertrofia",
    freq: "4x por semana",
    last: "10 ago",
    level: "Avançada",
    notes: "",
    hasTreinos: false,
    treinos: [],
  },
  {
    id: "renata",
    name: "Renata Alves",
    firstName: "Renata",
    initials: "RA",
    goal: "Condicionamento geral",
    freq: "2x por semana",
    last: "05 ago",
    level: "Iniciante",
    notes: "",
    hasTreinos: false,
    treinos: [],
  },
  {
    id: "beatriz",
    name: "Beatriz Lima",
    firstName: "Beatriz",
    initials: "BL",
    goal: "Retorno pós-parto",
    freq: "3x por semana",
    last: "12 ago",
    level: "Iniciante",
    notes: "Liberada para baixo impacto.",
    hasTreinos: false,
    treinos: [],
  },
];

export const OBJETIVOS = [
  "Emagrecimento",
  "Ganho de força",
  "Ganho de massa muscular",
  "Condicionamento",
  "Qualidade de vida",
  "Mobilidade",
  "Retorno à atividade física",
  "Fortalecimento",
  "Preparação esportiva",
  "Outro",
];
export const EXPERIENCIAS = ["Nunca pratiquei", "Estou retornando", "Menos de 6 meses", "6–12 meses", "1–3 anos", "Mais de 3 anos"];
export const FREQUENCIAS = ["2x", "3x", "4x", "5x", "Outro"];
export const TEMPOS = ["até 30 min", "30–45 min", "45–60 min", "mais de 60 min"];
export const REGIOES = [
  "Pescoço",
  "Ombro direito",
  "Ombro esquerdo",
  "Cotovelo",
  "Punho",
  "Coluna cervical",
  "Coluna torácica",
  "Lombar",
  "Quadril",
  "Virilha",
  "Joelho direito",
  "Joelho esquerdo",
  "Tornozelo",
  "Pé",
  "Outro",
];
export const QUANDOS = [
  "Em repouso",
  "Durante exercícios",
  "Depois do treino",
  "Ao caminhar",
  "Ao correr",
  "Ao subir/descer escadas",
  "Ao agachar",
  "Ao levantar peso",
  "Ao levantar o braço",
  "Ao sentar por muito tempo",
  "Ao ficar em pé",
  "Outro",
];
export const MOVIMENTOS_LISTA = [
  "Agachamento",
  "Agachamento profundo",
  "Leg press",
  "Afundo",
  "Corrida",
  "Desenvolvimento",
  "Supino",
  "Remada",
  "Levantamento terra",
  "Abdominal",
  "Outro",
];
export const LESAO_TIPOS = ["Muscular", "Ligamentar", "Tendão", "Articular", "Fratura", "Luxação", "Hérnia", "Não sei informar", "Outro"];
export const QUANDO_TEMPO = ["Menos de 3 meses", "3–6 meses", "6–12 meses", "1–3 anos", "Mais de 3 anos"];
export const SINTOMAS = ["Não", "Às vezes", "Frequentemente", "Sim"];
export const ACOMPANHAMENTOS = ["Não", "Médico", "Fisioterapeuta", "Outro profissional"];
export const ORIENTACOES = ["Não", "Sim", "Não sei"];
export const SAUDE_CONDICOES = [
  "Problema cardíaco diagnosticado",
  "Pressão arterial não controlada",
  "Episódios de desmaio ou perda de consciência",
  "Dor no peito relacionada ao esforço",
  "Falta de ar incomum",
  "Condição neurológica relevante",
  "Condição metabólica relevante",
  "Uso de medicamento que possa interferir",
  "Gravidez",
  "Pós-parto recente",
  "Outra condição relevante",
];

export const REPS_PRESETS = ["8–10", "10–12", "Até a falha", "30 segundos"];
export const DESCANSO_OPTIONS = ["30s", "45s", "60s", "90s", "120s"];
export const DURACAO_OPTIONS = ["30 min", "45 min", "60 min"];
export const QUICK_FILTERS = ["Para esta aluna", "Mais usados", "Favoritos", "Sem equipamentos", "Máquinas", "Peso livre", "Glúteos"];

export const TRIAGENS_SEED: Record<string, TriagemDraft> = {
  juliana: {
    objetivos: ["Emagrecimento", "Fortalecimento"],
    experiencia: "Menos de 6 meses",
    frequencia: "3x",
    duracao: "30–45 min",
    temDor: true,
    dorRegioes: ["Joelho direito", "Lombar"],
    dorIntensidade: { "Joelho direito": 3, Lombar: 2 },
    dorQuando: ["Ao subir/descer escadas", "Ao agachar", "Ao sentar por muito tempo"],
    movimentos: ["Agachamento profundo", "Corrida"],
    movimentosTexto: "Sinto um incômodo no joelho direito quando desço demais no agachamento.",
    temLesao: false,
    lesaoRegiao: "",
    lesaoTipo: "",
    lesaoQuando: "",
    lesaoSintoma: "",
    lesaoDiagnostico: "",
    temCirurgia: false,
    cirurgiaRegiao: "",
    cirurgiaQuando: "",
    cirurgiaRestricao: "",
    acompanhamento: "Não",
    orientacao: "",
    orientacaoTexto: "",
    restricaoProfissional: false,
    restricaoTexto: "",
    saude: [],
    observacaoLarissa:
      "Evitar agachamento profundo por enquanto. Priorizar leg press e cadeira extensora com amplitude controlada.",
    completedAt: "10 ago",
  },
};
