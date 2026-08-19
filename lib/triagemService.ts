import { sql } from "./db";
import { Aluna, TriagemDraft } from "./types";
import { computeAlert } from "./screening";

export interface AlunaRecord extends Aluna {
  screeningToken: string;
}

// --- row <-> domain mapping -------------------------------------------------

// The pg driver already parses jsonb/boolean columns into native JS values,
// so no JSON.parse is needed when reading rows back.
type Row = Record<string, unknown>;

function draftFromRow(row: Row): TriagemDraft {
  return {
    objetivos: (row.objetivos as string[]) ?? [],
    experiencia: (row.experiencia as string) ?? "",
    frequencia: (row.frequencia as string) ?? "",
    duracao: (row.duracao as string) ?? "",
    temDor: (row.tem_dor as boolean | null) ?? null,
    dorRegioes: (row.dor_regioes as string[]) ?? [],
    dorIntensidade: (row.dor_intensidade as Record<string, number>) ?? {},
    dorQuando: (row.dor_quando as string[]) ?? [],
    movimentos: (row.movimentos as string[]) ?? [],
    movimentosTexto: (row.movimentos_texto as string) ?? "",
    temLesao: (row.tem_lesao as boolean | null) ?? null,
    lesaoRegiao: (row.lesao_regiao as string) ?? "",
    lesaoTipo: (row.lesao_tipo as string) ?? "",
    lesaoQuando: (row.lesao_quando as string) ?? "",
    lesaoSintoma: (row.lesao_sintoma as string) ?? "",
    lesaoDiagnostico: (row.lesao_diagnostico as string) ?? "",
    temCirurgia: (row.tem_cirurgia as boolean | null) ?? null,
    cirurgiaRegiao: (row.cirurgia_regiao as string) ?? "",
    cirurgiaQuando: (row.cirurgia_quando as string) ?? "",
    cirurgiaRestricao: (row.cirurgia_restricao as string) ?? "",
    acompanhamento: (row.acompanhamento as string) ?? "",
    orientacao: (row.orientacao as string) ?? "",
    orientacaoTexto: (row.orientacao_texto as string) ?? "",
    restricaoProfissional: (row.restricao_profissional as boolean | null) ?? null,
    restricaoTexto: (row.restricao_texto as string) ?? "",
    saude: (row.saude as string[]) ?? [],
    observacaoLarissa: (row.observacao_larissa as string) ?? "",
    completedAt: (row.completed_at as string | undefined) ?? undefined,
  };
}

function alunaFromRow(row: Row): AlunaRecord {
  return {
    id: row.id as string,
    name: row.name as string,
    firstName: row.first_name as string,
    initials: row.initials as string,
    goal: (row.goal as string) ?? "",
    freq: (row.freq as string) ?? "",
    last: (row.last_session as string) ?? "",
    level: (row.level as string) ?? "",
    notes: (row.notes as string) ?? "",
    hasTreinos: Boolean(row.has_treinos),
    treinos: [],
    screeningToken: row.screening_token as string,
  };
}

// --- public API ---------------------------------------------------------

// Used by GET /api/triagem/[token] — deliberately returns only the aluna's
// name, never anything else (dor/lesões/other alunas), since the token is
// the only access control on that route.
export async function getAlunaByToken(token: string): Promise<{ id: string; name: string; firstName: string } | null> {
  const { rows } = await sql`SELECT id, name, first_name FROM alunas WHERE screening_token = ${token} LIMIT 1`;
  if (rows.length === 0) return null;
  const row = rows[0];
  return { id: row.id as string, name: row.name as string, firstName: row.first_name as string };
}

// Used by POST /api/triagem/[token] — writes/overwrites the screening tied
// to whichever aluna owns this token. Computes the red/yellow/green
// classification server-side via the same pure logic Larissa's app uses
// (lib/screening.ts computeAlert) so it can't be spoofed by the client.
export async function submitScreening(token: string, draft: TriagemDraft): Promise<boolean> {
  const { rows } = await sql`SELECT id FROM alunas WHERE screening_token = ${token} LIMIT 1`;
  if (rows.length === 0) return false;
  const alunaId = rows[0].id as string;
  const classification = computeAlert(draft).level;
  const completedAt = draft.completedAt || new Date().toISOString();

  await sql`
    INSERT INTO screenings (
      aluna_id, objetivos, experiencia, frequencia, duracao,
      tem_dor, dor_regioes, dor_intensidade, dor_quando, movimentos, movimentos_texto,
      tem_lesao, lesao_regiao, lesao_tipo, lesao_quando, lesao_sintoma, lesao_diagnostico,
      tem_cirurgia, cirurgia_regiao, cirurgia_quando, cirurgia_restricao,
      acompanhamento, orientacao, orientacao_texto,
      restricao_profissional, restricao_texto, saude, observacao_larissa,
      classification, completed_at, updated_at
    ) VALUES (
      ${alunaId}, ${JSON.stringify(draft.objetivos ?? [])}, ${draft.experiencia ?? ""}, ${draft.frequencia ?? ""}, ${draft.duracao ?? ""},
      ${draft.temDor}, ${JSON.stringify(draft.dorRegioes ?? [])}, ${JSON.stringify(draft.dorIntensidade ?? {})}, ${JSON.stringify(draft.dorQuando ?? [])}, ${JSON.stringify(draft.movimentos ?? [])}, ${draft.movimentosTexto ?? ""},
      ${draft.temLesao}, ${draft.lesaoRegiao ?? ""}, ${draft.lesaoTipo ?? ""}, ${draft.lesaoQuando ?? ""}, ${draft.lesaoSintoma ?? ""}, ${draft.lesaoDiagnostico ?? ""},
      ${draft.temCirurgia}, ${draft.cirurgiaRegiao ?? ""}, ${draft.cirurgiaQuando ?? ""}, ${draft.cirurgiaRestricao ?? ""},
      ${draft.acompanhamento ?? ""}, ${draft.orientacao ?? ""}, ${draft.orientacaoTexto ?? ""},
      ${draft.restricaoProfissional}, ${draft.restricaoTexto ?? ""}, ${JSON.stringify(draft.saude ?? [])}, ${draft.observacaoLarissa ?? ""},
      ${classification}, ${completedAt}, now()
    )
    ON CONFLICT (aluna_id) DO UPDATE SET
      objetivos = EXCLUDED.objetivos,
      experiencia = EXCLUDED.experiencia,
      frequencia = EXCLUDED.frequencia,
      duracao = EXCLUDED.duracao,
      tem_dor = EXCLUDED.tem_dor,
      dor_regioes = EXCLUDED.dor_regioes,
      dor_intensidade = EXCLUDED.dor_intensidade,
      dor_quando = EXCLUDED.dor_quando,
      movimentos = EXCLUDED.movimentos,
      movimentos_texto = EXCLUDED.movimentos_texto,
      tem_lesao = EXCLUDED.tem_lesao,
      lesao_regiao = EXCLUDED.lesao_regiao,
      lesao_tipo = EXCLUDED.lesao_tipo,
      lesao_quando = EXCLUDED.lesao_quando,
      lesao_sintoma = EXCLUDED.lesao_sintoma,
      lesao_diagnostico = EXCLUDED.lesao_diagnostico,
      tem_cirurgia = EXCLUDED.tem_cirurgia,
      cirurgia_regiao = EXCLUDED.cirurgia_regiao,
      cirurgia_quando = EXCLUDED.cirurgia_quando,
      cirurgia_restricao = EXCLUDED.cirurgia_restricao,
      acompanhamento = EXCLUDED.acompanhamento,
      orientacao = EXCLUDED.orientacao,
      orientacao_texto = EXCLUDED.orientacao_texto,
      restricao_profissional = EXCLUDED.restricao_profissional,
      restricao_texto = EXCLUDED.restricao_texto,
      saude = EXCLUDED.saude,
      observacao_larissa = EXCLUDED.observacao_larissa,
      classification = EXCLUDED.classification,
      completed_at = EXCLUDED.completed_at,
      updated_at = now()
  `;
  return true;
}

// Used by GET /api/alunas — Larissa's app only. Includes screeningToken so
// Perfil.tsx can build the shareable link.
export async function listAlunas(): Promise<{ aluna: AlunaRecord; triagem: TriagemDraft | null }[]> {
  const [alunasRes, screeningsRes] = await Promise.all([
    sql`SELECT * FROM alunas ORDER BY name`,
    sql`SELECT * FROM screenings`,
  ]);
  const screeningByAluna = new Map(screeningsRes.rows.map((r) => [r.aluna_id as string, draftFromRow(r)]));
  return alunasRes.rows.map((row) => ({
    aluna: alunaFromRow(row),
    triagem: screeningByAluna.get(row.id as string) ?? null,
  }));
}

// Used by GET /api/alunas/[id] — Larissa's app only.
export async function getAluna(id: string): Promise<{ aluna: AlunaRecord; triagem: TriagemDraft | null } | null> {
  const alunaRes = await sql`SELECT * FROM alunas WHERE id = ${id} LIMIT 1`;
  if (alunaRes.rows.length === 0) return null;
  const screeningRes = await sql`SELECT * FROM screenings WHERE aluna_id = ${id} LIMIT 1`;
  return {
    aluna: alunaFromRow(alunaRes.rows[0]),
    triagem: screeningRes.rows.length ? draftFromRow(screeningRes.rows[0]) : null,
  };
}
