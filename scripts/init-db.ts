// One-off setup script: creates the alunas/screenings tables and seeds them
// with the same 4 alunas from lib/data.ts (Juliana keeps her existing
// completed screening; Camila, Renata and Beatriz start without one).
//
// Requires POSTGRES_URL to be set (see .env.example). Run with:
//   npm run db:init
//
// Safe to re-run: table creation is IF NOT EXISTS, and aluna/screening rows
// use ON CONFLICT DO NOTHING so it won't clobber real data from a later run.

import { readFileSync } from "fs";
import path from "path";
import { sql } from "@vercel/postgres";
import { ALUNAS, TRIAGENS_SEED } from "../lib/data";
import { computeAlert } from "../lib/screening";
import { generateScreeningToken } from "../lib/triagemToken";

async function main() {
  if (!process.env.POSTGRES_URL) {
    console.error(
      "POSTGRES_URL is not set. Create a .env.local with POSTGRES_URL pointing at a Postgres database (see .env.example), then re-run `npm run db:init`."
    );
    process.exit(1);
  }

  const schemaPath = path.join(__dirname, "..", "lib", "db", "schema.sql");
  const schema = readFileSync(schemaPath, "utf8");
  console.log("Applying schema...");
  await sql.query(schema);

  for (const aluna of ALUNAS) {
    const token = generateScreeningToken();
    await sql`
      INSERT INTO alunas (id, name, first_name, initials, goal, freq, last_session, level, notes, instagram, genero, has_treinos, screening_token)
      VALUES (${aluna.id}, ${aluna.name}, ${aluna.firstName}, ${aluna.initials}, ${aluna.goal}, ${aluna.freq}, ${aluna.last}, ${aluna.level}, ${aluna.notes}, ${aluna.instagram}, ${aluna.genero}, ${aluna.hasTreinos}, ${token})
      ON CONFLICT (id) DO NOTHING
    `;
    console.log(`  seeded aluna "${aluna.name}"`);

    const triagem = TRIAGENS_SEED[aluna.id];
    if (triagem) {
      const classification = computeAlert(triagem).level;
      await sql`
        INSERT INTO screenings (
          aluna_id, objetivos, experiencia, frequencia, duracao,
          tem_dor, dor_regioes, dor_intensidade, dor_quando, movimentos, movimentos_texto,
          tem_lesao, lesao_regiao, lesao_tipo, lesao_quando, lesao_sintoma, lesao_diagnostico,
          tem_cirurgia, cirurgia_regiao, cirurgia_quando, cirurgia_restricao,
          acompanhamento, orientacao, orientacao_texto,
          restricao_profissional, restricao_texto, saude, observacao_larissa,
          classification, completed_at
        ) VALUES (
          ${aluna.id}, ${JSON.stringify(triagem.objetivos)}, ${triagem.experiencia}, ${triagem.frequencia}, ${triagem.duracao},
          ${triagem.temDor}, ${JSON.stringify(triagem.dorRegioes)}, ${JSON.stringify(triagem.dorIntensidade)}, ${JSON.stringify(triagem.dorQuando)}, ${JSON.stringify(triagem.movimentos)}, ${triagem.movimentosTexto},
          ${triagem.temLesao}, ${triagem.lesaoRegiao}, ${triagem.lesaoTipo}, ${triagem.lesaoQuando}, ${triagem.lesaoSintoma}, ${triagem.lesaoDiagnostico},
          ${triagem.temCirurgia}, ${triagem.cirurgiaRegiao}, ${triagem.cirurgiaQuando}, ${triagem.cirurgiaRestricao},
          ${triagem.acompanhamento}, ${triagem.orientacao}, ${triagem.orientacaoTexto},
          ${triagem.restricaoProfissional}, ${triagem.restricaoTexto}, ${JSON.stringify(triagem.saude)}, ${triagem.observacaoLarissa},
          ${classification}, ${triagem.completedAt ?? null}
        )
        ON CONFLICT (aluna_id) DO NOTHING
      `;
      console.log(`  seeded screening for "${aluna.name}"`);
    }
  }

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
