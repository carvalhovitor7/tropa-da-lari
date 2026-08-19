import { NextRequest, NextResponse } from "next/server";
import { deleteEvolucao } from "@/lib/evolucaoService";

export const dynamic = "force-dynamic";

// DELETE /api/evolucao/[id] — removes one evolução entry.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const removed = await deleteEvolucao(id);
    if (!removed) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/evolucao/:id] DELETE failed", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
