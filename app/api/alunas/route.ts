import { NextResponse } from "next/server";
import { listAlunas } from "@/lib/triagemService";

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
