import { sql } from "./db";
import { EvolucaoEntry, EvolucaoMedidas } from "./types";

type Row = Record<string, unknown>;

function fromRow(row: Row): EvolucaoEntry {
  return {
    id: row.id as string,
    alunaId: row.aluna_id as string,
    data: row.data as string,
    peso: row.peso == null ? undefined : Number(row.peso),
    medidas: (row.medidas as EvolucaoMedidas) ?? {},
    fotos: (row.fotos as string[]) ?? [],
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
  };
}

// Used by GET /api/evolucao?alunaId=... — item 5 "Acompanhamento". Ordered
// oldest-first so the UI can render a chronological history directly.
export async function listEvolucao(alunaId: string): Promise<EvolucaoEntry[]> {
  const { rows } = await sql`SELECT * FROM evolucao WHERE aluna_id = ${alunaId} ORDER BY data ASC, created_at ASC`;
  return rows.map(fromRow);
}

// Used by GET /api/evolucao (no alunaId) — Dashboard "vencido" banner needs
// every aluna's latest treino, not evolução, but we also expose the full
// set here for any screen that wants a cross-aluna view later.
export async function listAllEvolucao(): Promise<EvolucaoEntry[]> {
  const { rows } = await sql`SELECT * FROM evolucao ORDER BY data ASC, created_at ASC`;
  return rows.map(fromRow);
}

export interface NewEvolucaoInput {
  alunaId: string;
  data: string;
  peso?: number | null;
  medidas?: EvolucaoMedidas;
  fotos?: string[];
}

// Used by POST /api/evolucao.
export async function createEvolucao(input: NewEvolucaoInput): Promise<EvolucaoEntry> {
  const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const { rows } = await sql`
    INSERT INTO evolucao (id, aluna_id, data, peso, medidas, fotos)
    VALUES (${id}, ${input.alunaId}, ${input.data}, ${input.peso ?? null}, ${JSON.stringify(input.medidas ?? {})}, ${JSON.stringify(input.fotos ?? [])})
    RETURNING *
  `;
  return fromRow(rows[0]);
}

// Used by DELETE /api/evolucao/[id] — lets Larissa remove a mistaken entry
// (also used to clean up test data during QA).
export async function deleteEvolucao(id: string): Promise<boolean> {
  const { rowCount } = await sql`DELETE FROM evolucao WHERE id = ${id}`;
  return (rowCount ?? 0) > 0;
}
