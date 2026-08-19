import { NextRequest, NextResponse } from "next/server";
import { createTreinoShare } from "@/lib/treinoShareService";
import { Treino } from "@/lib/types";

export const dynamic = "force-dynamic";

// POST /api/treino-shares — item 8. Called by Larissa's app (never
// publicly) at the moment a treino is shared/finalized, to persist a
// read-only snapshot the aluna can open on her own phone at
// /ficha/[token]. Body: { alunaId, alunaName, alunaGenero, treino }.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const input = body as { alunaId?: string; alunaName?: string; alunaGenero?: string; treino?: Treino };
  if (!input.alunaId || !input.treino) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  try {
    const token = await createTreinoShare({
      alunaId: input.alunaId,
      alunaName: input.alunaName ?? "",
      alunaGenero: input.alunaGenero ?? "nao_informado",
      treino: input.treino,
    });
    return NextResponse.json({ token }, { status: 201 });
  } catch (err) {
    console.error("[api/treino-shares] POST failed", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
