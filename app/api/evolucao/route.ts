import { NextRequest, NextResponse } from "next/server";
import { createEvolucao, listAllEvolucao, listEvolucao } from "@/lib/evolucaoService";

export const dynamic = "force-dynamic";

// GET /api/evolucao?alunaId=... — item 5 "Acompanhamento". Without
// alunaId, returns every entry (used to compute cross-aluna views).
export async function GET(req: NextRequest) {
  const alunaId = req.nextUrl.searchParams.get("alunaId");
  try {
    const entries = alunaId ? await listEvolucao(alunaId) : await listAllEvolucao();
    return NextResponse.json({ entries });
  } catch (err) {
    console.error("[api/evolucao] GET failed", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// POST /api/evolucao — body: { alunaId, data, peso?, medidas?, fotos? }.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const input = body as { alunaId?: string; data?: string; peso?: number; medidas?: Record<string, number>; fotos?: string[] };
  if (!input.alunaId || !input.data) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  try {
    const entry = await createEvolucao({
      alunaId: input.alunaId,
      data: input.data,
      peso: input.peso ?? null,
      medidas: input.medidas ?? {},
      fotos: input.fotos ?? [],
    });
    return NextResponse.json({ entry }, { status: 201 });
  } catch (err) {
    console.error("[api/evolucao] POST failed", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
