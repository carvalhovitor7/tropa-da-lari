import { NextRequest, NextResponse } from "next/server";
import { createAluna, listAlunas } from "@/lib/triagemService";

// Talks to Postgres on every request — must never be statically generated.
export const dynamic = "force-dynamic";

// GET /api/alunas — Larissa's app only. Used to refresh aluna + screening
// data (including anything a student submitted from her own phone via
// /triagem/[token]) on Dashboard/Perfil mount.
export async function GET() {
  try {
    const alunas = await listAlunas();
    return NextResponse.json({ alunas });
  } catch (err) {
    console.error("[api/alunas] GET failed", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// POST /api/alunas — item 1 "Adicionar aluna". Body: { name, goal?, freq?,
// level?, notes?, instagram? }. Used by both the "Convidar por link" path
// (only name is sent) and the "Cadastro manual" path (full profile).
// Always returns the new aluna including its screeningToken so the UI can
// build the /triagem/{token} link immediately.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || typeof (body as { name?: unknown }).name !== "string") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const input = body as { name: string; goal?: string; freq?: string; level?: string; notes?: string; instagram?: string };
  if (!input.name.trim()) {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
  }

  try {
    const aluna = await createAluna(input);
    return NextResponse.json({ aluna }, { status: 201 });
  } catch (err) {
    console.error("[api/alunas] POST failed", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
