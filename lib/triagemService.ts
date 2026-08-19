import { sql } from "./db";
import { Aluna, Genero, TriagemDraft } from "./types";
import { computeAlert } from "./screening";
import { generateScreeningToken } from "./triagemToken";

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

const GENEROS: Genero[] = ["feminino", "masculino", "nao_informado"];

function normalizeGenero(value: unknown): Genero {
  return GENEROS.includes(value as Genero) ? (value as Genero) : "nao_informado";
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
    instagram: (row.instagram as string) ?? "",
    genero: normalizeGenero(row.genero),
    hasTreinos: Boolean(row.has_treinos),
    treinos: [],
    idade: typeof row.idade === "number" ? row.idade : undefined,
    local: (row.local as string) || undefined,
    screeningToken: row.screening_token as string,
  };
}

const DIACRITICS_RE = new RegExp("[" + String.fromCharCode(0x0300) + "-" + String.fromCharCode(0x036f) + "]", "g");

function slugify(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(DIACRITICS_RE, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "aluna"
  );
}

async function uniqueAlunaId(name: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let n = 1;
  // Small tables (a handful of alunas), so a simple existence-check loop is
  // fine here — no need for a DB-side uniqueness generator.
  for (;;) {
    const { rows } = await sql`SELECT 1 FROM alunas WHERE id = ${candidate} LIMIT 1`;
    if (rows.length === 0) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}

export interface NewAlunaInput {
  name: string;
  goal?: string;
  freq?: string;
  level?: string;
  notes?: string;
  instagram?: string;
  genero?: Genero;
  idade?: number;
  local?: string;
}

// Used by POST /api/alunas — item 1 "Adicionar aluna". Covers both paths:
// "Convidar por link" passes only `name` (rest of the profile stays empty
// until the aluna does her own triagem); "Cadastro manual" passes the full
// profile Larissa filled in herself. Either way a fresh unique
// screening_token is generated so /triagem/[token] works immediately.
export async function createAluna(input: NewAlunaInput): Promise<AlunaRecord> {
  const name = input.name.trim();
  if (!name) throw new Error("name_required");
  const firstName = name.split(" ")[0] || name;
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
  const id = await uniqueAlunaId(name);
  const token = generateScreeningToken();
  const genero = normalizeGenero(input.genero);

  const idade = typeof input.idade === "number" && Number.isFinite(input.idade) ? input.idade : null;

  const { rows } = await sql`
    INSERT INTO alunas (id, name, first_name, initials, goal, freq, last_session, level, notes, instagram, genero, has_treinos, screening_token, idade, local)
    VALUES (${id}, ${name}, ${firstName}, ${initials}, ${input.goal ?? ""}, ${input.freq ?? ""}, ${""}, ${input.level ?? ""}, ${input.notes ?? ""}, ${input.instagram ?? ""}, ${genero}, FALSE, ${token}, ${idade}, ${input.local ?? ""})
    RETURNING *
  `;
  return alunaFromRow(rows[0]);
}

// Used by PATCH /api/alunas/[id] — lets Larissa edit idade/local (and
// instagram, already handled client-side/locally) from Perfil.tsx.
export async function updateAluna(
  id: string,
  patch: { idade?: number | null; local?: string }
): Promise<AlunaRecord | null> {
  const { rows } = await sql`
    UPDATE alunas SET
      idade = COALESCE(${patch.idade ?? null}, idade),
      local = COALESCE(${patch.local ?? null}, local)
    WHERE id = ${id}
    RETURNING *
  `;
  if (rows.length === 0) return null;
  return alunaFromRow(rows[0]);
}

// Used by DELETE /api/alunas/[id] — item "Excluir aluno". Deleting the row
// cascades to her screening (screenings.aluna_id REFERENCES alunas(id) ON
// DELETE CASCADE), a single id-scoped statement, never a bulk delete.
export async function deleteAluna(id: string): Promise<boolean> {
  const { rowCount } = await sql`DELETE FROM alunas WHERE id = ${id}`;
  return (rowCount ?? 0) > 0;
}

// --- public API ---------------------------------------------------------

// Used by GET /api/triagem/[token] — deliberately returns only the aluna's
// name, never anything else (dor/lesões/other alunas), since the token is
// the only access control on that route.
export async function getAlunaByToken(
  token: string
): Promise<{ id: string; name: string; firstName: string; genero: Genero } | null> {
  const { rows } = await sql`SELECT id, name, first_name, genero FROM alunas WHERE screening_token = ${token} LIMIT 1`;
  if (rows.length === 0) return null;
  const row = rows[0];
  return { id: row.id as string, name: row.name as string, firstName: row.first_name as string, genero: normalizeGenero(row.genero) };
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
