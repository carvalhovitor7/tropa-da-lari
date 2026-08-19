import { sql } from "./db";
import { Treino } from "./types";
import { generateScreeningToken } from "./triagemToken";

export interface TreinoShareSnapshot {
  token: string;
  alunaId: string;
  alunaName: string;
  alunaGenero: string;
  treino: Treino;
  createdAt: string;
}

// Item 8: persists a read-only snapshot of a finalized/sent treino so the
// WhatsApp deep link has something the aluna can actually open on her own
// phone (treinos otherwise live only in Larissa's local browser storage —
// see lib/store.tsx). Reuses generateScreeningToken() for a random,
// URL-safe token; each call creates a NEW share row (new token) rather than
// updating a previous one, so an old shared link keeps showing the treino
// as it was at that moment even if it's edited again later.
export async function createTreinoShare(input: {
  alunaId: string;
  alunaName: string;
  alunaGenero: string;
  treino: Treino;
}): Promise<string> {
  const token = generateScreeningToken();
  await sql`
    INSERT INTO treino_shares (token, aluna_id, treino_json)
    VALUES (${token}, ${input.alunaId}, ${JSON.stringify({
      treino: input.treino,
      alunaName: input.alunaName,
      alunaGenero: input.alunaGenero,
    })})
  `;
  return token;
}

// Used by app/ficha/[token]/page.tsx — public, PIN-exempt read-only route.
export async function getTreinoShare(token: string): Promise<TreinoShareSnapshot | null> {
  const { rows } = await sql`SELECT * FROM treino_shares WHERE token = ${token} LIMIT 1`;
  if (rows.length === 0) return null;
  const row = rows[0];
  const payload = row.treino_json as { treino: Treino; alunaName: string; alunaGenero: string };
  return {
    token: row.token as string,
    alunaId: row.aluna_id as string,
    alunaName: payload.alunaName,
    alunaGenero: payload.alunaGenero,
    treino: payload.treino,
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
  };
}
