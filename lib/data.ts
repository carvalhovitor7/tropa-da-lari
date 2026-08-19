import { Aluna, Exercise, Modelo, TriagemDraft } from "./types";

// Exercise library used by the search screen (Busca.tsx), grouped by muscle
// group / equipment type. 40+ entries covering free weights, machines,
// bodyweight and cardio so the search screen is usable immediately.
export const CATEGORIES: { name: string; items: string[] }[] = [
  {
    name: "Glúteos",
    items: ["Elevação pélvica", "Coice no cabo", "Coice na máquina", "Abdução de quadril", "Glúteo em 4 apoios", "Hip thrust unilateral"],
  },
  {
    name: "Quadríceps",
    items: ["Agachamento livre", "Cadeira extensora", "Agachamento búlgaro", "Leg press 45°", "Hack machine", "Agachamento no smith"],
  },
  {
    name: "Posterior de coxa",
    items: ["Stiff", "Cadeira flexora", "Mesa flexora", "Levantamento terra romeno", "Flexora em pé"],
  },
  {
    name: "Panturrilha",
    items: ["Panturrilha em pé", "Panturrilha sentada", "Panturrilha no leg press"],
  },
  {
    name: "Costas",
    items: ["Puxada frente", "Remada baixa", "Remada curvada", "Puxada supinada", "Remada unilateral", "Pull-down"],
  },
  {
    name: "Peito",
    items: ["Supino reto", "Crucifixo", "Supino inclinado", "Crossover", "Peck deck", "Flexão de braço"],
  },
  {
    name: "Ombros",
    items: ["Desenvolvimento", "Elevação lateral", "Elevação frontal", "Crucifixo invertido", "Desenvolvimento Arnold"],
  },
  {
    name: "Bíceps",
    items: ["Rosca direta", "Rosca alternada", "Rosca martelo", "Rosca scott"],
  },
  {
    name: "Tríceps",
    items: ["Tríceps corda", "Tríceps testa", "Tríceps francês", "Mergulho no banco"],
  },
  {
    name: "Abdômen / Core",
    items: ["Prancha", "Abdominal supra", "Abdominal infra", "Prancha lateral", "Elevação de pernas", "Rotação de tronco no cabo"],
  },
  {
    name: "Cardio",
    items: ["Esteira", "Bike", "Elíptico", "Escada (stairmaster)", "Corda naval", "Pular corda"],
  },
  {
    name: "Funcional / Corpo inteiro",
    items: ["Burpee", "Agachamento com salto", "Mountain climber", "Kettlebell swing", "Afundo com passada"],
  },
  {
    name: "Mobilidade",
    items: ["Mobilidade de quadril", "Mobilidade de tornozelo", "Mobilidade torácica", "Alongamento posterior"],
  },
  {
    name: "Livre / Compostos",
    items: ["Afundo", "Levantamento terra", "Agachamento sumô", "Passada com halteres"],
  },
];

export const RECENTES = ["Agachamento livre", "Leg press 45°", "Afundo", "Cadeira extensora"];
export const FAVORITOS = ["Cadeira extensora", "Stiff", "Prancha"];

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

// 40+ seeded exercises used to hydrate demo/template workouts with real
// sets/reps/rest, covering all major muscle groups and equipment types.
export const DEMO_EXERCISES: Exercise[] = [
  { id: "ex-1", name: "Agachamento Livre", series: 4, reps: "10", carga: "40", descanso: "90s", obs: "" },
  { id: "ex-2", name: "Leg Press 45°", series: 4, reps: "12", carga: "100", descanso: "60s", obs: "" },
  { id: "ex-3", name: "Afundo", series: 3, reps: "10", carga: "", descanso: "60s", obs: "Descer controlando o movimento." },
  { id: "ex-4", name: "Cadeira Extensora", series: 3, reps: "12", carga: "30", descanso: "60s", obs: "" },
  { id: "ex-5", name: "Stiff", series: 3, reps: "10", carga: "30", descanso: "90s", obs: "" },
  { id: "ex-6", name: "Cadeira Flexora", series: 3, reps: "12", carga: "25", descanso: "60s", obs: "" },
  { id: "ex-7", name: "Elevação Pélvica", series: 4, reps: "12", carga: "50", descanso: "60s", obs: "" },
  { id: "ex-8", name: "Panturrilha em Pé", series: 4, reps: "15", carga: "40", descanso: "45s", obs: "" },
  { id: "ex-9", name: "Puxada Frente", series: 3, reps: "10", carga: "35", descanso: "90s", obs: "" },
  { id: "ex-10", name: "Remada Baixa", series: 3, reps: "12", carga: "30", descanso: "60s", obs: "" },
  { id: "ex-11", name: "Supino Reto", series: 4, reps: "10", carga: "20", descanso: "90s", obs: "" },
  { id: "ex-12", name: "Crucifixo", series: 3, reps: "12", carga: "10", descanso: "60s", obs: "" },
  { id: "ex-13", name: "Desenvolvimento", series: 3, reps: "10", carga: "8", descanso: "60s", obs: "" },
  { id: "ex-14", name: "Elevação Lateral", series: 3, reps: "15", carga: "5", descanso: "45s", obs: "" },
  { id: "ex-15", name: "Rosca Direta", series: 3, reps: "12", carga: "8", descanso: "45s", obs: "" },
  { id: "ex-16", name: "Tríceps Corda", series: 3, reps: "12", carga: "15", descanso: "45s", obs: "" },
  { id: "ex-17", name: "Prancha", series: 3, reps: "30 segundos", carga: "", descanso: "45s", obs: "" },
  { id: "ex-18", name: "Abdominal Supra", series: 3, reps: "15", carga: "", descanso: "45s", obs: "" },
  { id: "ex-19", name: "Esteira", series: 1, reps: "20 minutos", carga: "", descanso: "-", obs: "Ritmo moderado." },
  { id: "ex-20", name: "Bike", series: 1, reps: "15 minutos", carga: "", descanso: "-", obs: "" },
];

// A richer, tagged set of workout templates (item 2). Each carries the
// objetivo/nível tags it best suits, so Modelos.tsx can highlight the ones
// that match a given aluna's profile ("recomendado para características
// semelhantes").
export const TEMPLATES: Modelo[] = [
  {
    id: "t1",
    name: "Feminino iniciante 3x",
    desc: "Corpo inteiro, cargas leves, foco em execução.",
    objetivos: ["Fortalecimento", "Qualidade de vida"],
    niveis: ["Iniciante"],
    exercises: [
      { id: "m1-1", name: "Agachamento Livre", series: 3, reps: "12", carga: "", descanso: "60s", obs: "Priorizar execução." },
      { id: "m1-2", name: "Puxada Frente", series: 3, reps: "12", carga: "", descanso: "60s", obs: "" },
      { id: "m1-3", name: "Supino Reto", series: 3, reps: "10", carga: "", descanso: "60s", obs: "" },
      { id: "m1-4", name: "Elevação Pélvica", series: 3, reps: "15", carga: "", descanso: "45s", obs: "" },
      { id: "m1-5", name: "Prancha", series: 3, reps: "20 segundos", carga: "", descanso: "45s", obs: "" },
    ],
  },
  {
    id: "t2",
    name: "Emagrecimento 3x",
    desc: "Combina força e cardio, descansos curtos.",
    objetivos: ["Emagrecimento"],
    niveis: ["Iniciante", "Intermediária"],
    exercises: [
      { id: "m2-1", name: "Agachamento com Salto", series: 3, reps: "12", carga: "", descanso: "30s", obs: "" },
      { id: "m2-2", name: "Remada Baixa", series: 3, reps: "12", carga: "", descanso: "45s", obs: "" },
      { id: "m2-3", name: "Afundo", series: 3, reps: "10", carga: "", descanso: "30s", obs: "" },
      { id: "m2-4", name: "Burpee", series: 3, reps: "10", carga: "", descanso: "30s", obs: "" },
      { id: "m2-5", name: "Esteira", series: 1, reps: "15 minutos", carga: "", descanso: "-", obs: "Intervalado." },
    ],
  },
  {
    id: "t3",
    name: "Hipertrofia inferiores",
    desc: "Volume alto para glúteos e pernas.",
    objetivos: ["Ganho de massa muscular"],
    niveis: ["Intermediária", "Avançada"],
    exercises: [
      { id: "m3-1", name: "Agachamento Livre", series: 4, reps: "10", carga: "", descanso: "90s", obs: "" },
      { id: "m3-2", name: "Leg Press 45°", series: 4, reps: "12", carga: "", descanso: "90s", obs: "" },
      { id: "m3-3", name: "Cadeira Extensora", series: 3, reps: "12", carga: "", descanso: "60s", obs: "" },
      { id: "m3-4", name: "Stiff", series: 4, reps: "10", carga: "", descanso: "90s", obs: "" },
      { id: "m3-5", name: "Elevação Pélvica", series: 4, reps: "12", carga: "", descanso: "60s", obs: "" },
      { id: "m3-6", name: "Panturrilha em Pé", series: 4, reps: "15", carga: "", descanso: "45s", obs: "" },
    ],
  },
  {
    id: "t4",
    name: "Full body iniciante",
    desc: "Um treino só, ideal para quem começou agora.",
    objetivos: ["Fortalecimento", "Retorno à atividade física"],
    niveis: ["Iniciante"],
    exercises: [
      { id: "m4-1", name: "Agachamento Livre", series: 2, reps: "12", carga: "", descanso: "60s", obs: "" },
      { id: "m4-2", name: "Puxada Frente", series: 2, reps: "12", carga: "", descanso: "60s", obs: "" },
      { id: "m4-3", name: "Supino Reto", series: 2, reps: "10", carga: "", descanso: "60s", obs: "" },
      { id: "m4-4", name: "Abdominal Supra", series: 2, reps: "15", carga: "", descanso: "45s", obs: "" },
    ],
  },
  {
    id: "t5",
    name: "Treino 45 minutos",
    desc: "Enxuto, para dias corridos.",
    objetivos: ["Condicionamento", "Qualidade de vida"],
    niveis: ["Intermediária"],
    exercises: [
      { id: "m5-1", name: "Agachamento Livre", series: 3, reps: "10", carga: "", descanso: "60s", obs: "" },
      { id: "m5-2", name: "Remada Baixa", series: 3, reps: "12", carga: "", descanso: "60s", obs: "" },
      { id: "m5-3", name: "Desenvolvimento", series: 3, reps: "10", carga: "", descanso: "60s", obs: "" },
      { id: "m5-4", name: "Prancha", series: 3, reps: "30 segundos", carga: "", descanso: "45s", obs: "" },
    ],
  },
  {
    id: "t6",
    name: "Mobilidade + força",
    desc: "Aquecimento ativo antes do treino de força.",
    objetivos: ["Mobilidade"],
    niveis: ["Iniciante", "Intermediária", "Avançada"],
    exercises: [
      { id: "m6-1", name: "Mobilidade de Quadril", series: 2, reps: "10", carga: "", descanso: "30s", obs: "" },
      { id: "m6-2", name: "Mobilidade Torácica", series: 2, reps: "10", carga: "", descanso: "30s", obs: "" },
      { id: "m6-3", name: "Agachamento Livre", series: 3, reps: "10", carga: "", descanso: "60s", obs: "" },
      { id: "m6-4", name: "Remada Baixa", series: 3, reps: "10", carga: "", descanso: "60s", obs: "" },
    ],
  },
  {
    id: "t7",
    name: "Hipertrofia superiores",
    desc: "Peito, costas, ombros e braços com volume moderado.",
    objetivos: ["Ganho de massa muscular"],
    niveis: ["Intermediária", "Avançada"],
    exercises: [
      { id: "m7-1", name: "Supino Reto", series: 4, reps: "10", carga: "", descanso: "90s", obs: "" },
      { id: "m7-2", name: "Puxada Frente", series: 4, reps: "10", carga: "", descanso: "90s", obs: "" },
      { id: "m7-3", name: "Desenvolvimento", series: 3, reps: "10", carga: "", descanso: "60s", obs: "" },
      { id: "m7-4", name: "Rosca Direta", series: 3, reps: "12", carga: "", descanso: "45s", obs: "" },
      { id: "m7-5", name: "Tríceps Corda", series: 3, reps: "12", carga: "", descanso: "45s", obs: "" },
    ],
  },
  {
    id: "t8",
    name: "Pós-parto — retorno seguro",
    desc: "Baixo impacto, foco em core e reforço postural.",
    objetivos: ["Retorno à atividade física", "Qualidade de vida"],
    niveis: ["Iniciante"],
    exercises: [
      { id: "m8-1", name: "Mobilidade de Quadril", series: 2, reps: "10", carga: "", descanso: "30s", obs: "" },
      { id: "m8-2", name: "Elevação Pélvica", series: 3, reps: "12", carga: "", descanso: "60s", obs: "Amplitude controlada." },
      { id: "m8-3", name: "Prancha", series: 2, reps: "15 segundos", carga: "", descanso: "45s", obs: "Sem apneia." },
      { id: "m8-4", name: "Remada Baixa", series: 3, reps: "12", carga: "", descanso: "60s", obs: "" },
    ],
  },
  {
    id: "t9",
    name: "Condicionamento / Funcional",
    desc: "Circuito funcional para resistência e queima calórica.",
    objetivos: ["Condicionamento", "Preparação esportiva"],
    niveis: ["Intermediária", "Avançada"],
    exercises: [
      { id: "m9-1", name: "Kettlebell Swing", series: 4, reps: "15", carga: "", descanso: "30s", obs: "" },
      { id: "m9-2", name: "Mountain Climber", series: 4, reps: "20", carga: "", descanso: "30s", obs: "" },
      { id: "m9-3", name: "Afundo com Passada", series: 3, reps: "12", carga: "", descanso: "30s", obs: "" },
      { id: "m9-4", name: "Corda Naval", series: 4, reps: "30 segundos", carga: "", descanso: "30s", obs: "" },
    ],
  },
  {
    id: "t10",
    name: "Glúteos em foco",
    desc: "Sessão dedicada a glúteos com variação de ângulos.",
    objetivos: ["Ganho de massa muscular", "Fortalecimento"],
    niveis: ["Intermediária", "Avançada"],
    exercises: [
      { id: "m10-1", name: "Elevação Pélvica", series: 4, reps: "12", carga: "", descanso: "60s", obs: "" },
      { id: "m10-2", name: "Coice no Cabo", series: 3, reps: "15", carga: "", descanso: "45s", obs: "" },
      { id: "m10-3", name: "Agachamento Búlgaro", series: 3, reps: "10", carga: "", descanso: "60s", obs: "" },
      { id: "m10-4", name: "Abdução de Quadril", series: 3, reps: "15", carga: "", descanso: "45s", obs: "" },
    ],
  },
];

// Options shown as "foco" chips when starting a new treino (item 5).
export const FOCOS = [
  "Corpo inteiro",
  "Inferiores",
  "Superiores",
  "Glúteos",
  "Pernas",
  "Peito",
  "Costas",
  "Ombros",
  "Braços (Bíceps/Tríceps)",
  "Core/Abdômen",
  "Panturrilha",
  "Push (empurrar)",
  "Pull (puxar)",
  "Cardio/HIIT",
  "Mobilidade",
  "Pós-parto",
  "Funcional/Condicionamento",
];

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
    instagram: "",
    genero: "feminino",
    hasTreinos: true,
    treinos: [
      {
        id: "A",
        name: "Treino A",
        foco: "Inferiores",
        demo: true,
        exercises: DEMO_EXERCISES.slice(0, 4).map((e) => ({ ...e })),
        createdAt: "2026-08-05T12:00:00.000Z",
        sentAt: "2026-08-14T15:00:00.000Z",
        versions: [{ at: "2026-08-05T12:00:00.000Z", changes: ["Treino criado."] }],
      },
      {
        id: "B",
        name: "Treino B",
        foco: "Superiores",
        demo: false,
        exercises: DEMO_EXERCISES.slice(8, 13).map((e) => ({ ...e })),
        createdAt: "2026-08-08T12:00:00.000Z",
        sentAt: undefined,
        versions: [{ at: "2026-08-08T12:00:00.000Z", changes: ["Treino criado."] }],
      },
      {
        id: "C",
        name: "Treino C",
        foco: "Corpo inteiro",
        demo: false,
        exercises: [],
        createdAt: "2026-08-10T12:00:00.000Z",
        sentAt: undefined,
        versions: [],
      },
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
    instagram: "",
    genero: "feminino",
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
    instagram: "",
    genero: "feminino",
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
    instagram: "",
    genero: "feminino",
    hasTreinos: false,
    treinos: [],
  },
];

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
