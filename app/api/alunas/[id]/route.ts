import { NextRequest, NextResponse } from "next/server";
import { deleteAluna, getAluna, updateAluna } from "@/lib/triagemService";

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

// PATCH /api/alunas/[id] — updates idade/local for the printable ficha's
// "DADOS DO ALUNO" card (Perfil.tsx / manual-add flow).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const input = (body ?? {}) as { idade?: number; local?: string; whatsapp?: string };
  try {
    const aluna = await updateAluna(id, { idade: input.idade ?? null, local: input.local, whatsapp: input.whatsapp });
    if (!aluna) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ aluna });
  } catch (err) {
    console.error("[api/alunas/:id] PATCH failed", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// DELETE /api/alunas/[id] — item "Excluir aluno". A single id-scoped delete
// (never bulk); cascades to the aluna's screening row via the FK's ON
// DELETE CASCADE.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  try {
    const removed = await deleteAluna(id);
    if (!removed) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/alunas/:id] DELETE failed", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
