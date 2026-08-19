import { sql } from "./db";
import { Financeiro, PlanoTipo } from "./types";

type Row = Record<string, unknown>;

const PLANOS: PlanoTipo[] = ["diario", "semanal", "mensal", "trimestral"];
function normalizePlano(v: unknown): PlanoTipo | "" {
  return PLANOS.includes(v as PlanoTipo) ? (v as PlanoTipo) : "";
}

function fromRow(row: Row): Financeiro {
  return {
    alunaId: row.aluna_id as string,
    plano: normalizePlano(row.plano),
    valor: row.valor == null ? null : Number(row.valor),
    dataPagamento: (row.data_pagamento as string) ?? null,
    updatedAt: (row.updated_at as string) ?? undefined,
  };
}

// Used by GET /api/financeiro — item 6. Returns every aluna with billing
// data set (alunas with none simply aren't in this map; the UI treats that
// as "sem_dados").
export async function listFinanceiro(): Promise<Financeiro[]> {
  const { rows } = await sql`SELECT * FROM financeiro`;
  return rows.map(fromRow);
}

export interface UpsertFinanceiroInput {
  alunaId: string;
  plano: PlanoTipo | "";
  valor?: number | null;
  dataPagamento?: string | null;
}

// Used by PUT /api/financeiro — upserts the one billing row per aluna.
export async function upsertFinanceiro(input: UpsertFinanceiroInput): Promise<Financeiro> {
  const { rows } = await sql`
    INSERT INTO financeiro (aluna_id, plano, valor, data_pagamento, updated_at)
    VALUES (${input.alunaId}, ${input.plano || ""}, ${input.valor ?? null}, ${input.dataPagamento ?? null}, now())
    ON CONFLICT (aluna_id) DO UPDATE SET
      plano = EXCLUDED.plano,
      valor = EXCLUDED.valor,
      data_pagamento = EXCLUDED.data_pagamento,
      updated_at = now()
    RETURNING *
  `;
  return fromRow(rows[0]);
}
