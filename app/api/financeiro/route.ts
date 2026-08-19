import { NextRequest, NextResponse } from "next/server";
import { listFinanceiro, upsertFinanceiro } from "@/lib/financeiroService";
import { PlanoTipo } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/financeiro — item 6 "Financeiro". Every aluna's billing record.
export async function GET() {
  try {
    const entries = await listFinanceiro();
    return NextResponse.json({ entries });
  } catch (err) {
    console.error("[api/financeiro] GET failed", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// PUT /api/financeiro — body: { alunaId, plano, valor?, dataPagamento? }.
// Upserts the single billing row for that aluna.
export async function PUT(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const input = body as { alunaId?: string; plano?: PlanoTipo | ""; valor?: number | null; dataPagamento?: string | null };
  if (!input.alunaId) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  try {
    const entry = await upsertFinanceiro({
      alunaId: input.alunaId,
      plano: input.plano ?? "",
      valor: input.valor ?? null,
      dataPagamento: input.dataPagamento ?? null,
    });
    return NextResponse.json({ entry });
  } catch (err) {
    console.error("[api/financeiro] PUT failed", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
