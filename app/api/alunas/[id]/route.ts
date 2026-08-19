import { NextRequest, NextResponse } from "next/server";
import { getAluna } from "@/lib/triagemService";

// Talks to Postgres on every request — must never be statically generated.
export const dynamic = "force-dynamic";

// GET /api/alunas/[id] — Larissa's app only. Includes screeningToken so
// Perfil.tsx can build the /triagem/[token] link to share with this aluna.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const result = await getAluna(id);
    if (!result) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/alunas/:id] GET failed", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
