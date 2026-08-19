import { NextRequest, NextResponse } from "next/server";
import { getAlunaByToken, submitScreening } from "@/lib/triagemService";
import { TriagemDraft } from "@/lib/types";

// Talks to Postgres on every request — must never be statically generated.
export const dynamic = "force-dynamic";

// GET /api/triagem/[token] — only the aluna's first name/name, so the
// student page can say "Olá, Juliana" without exposing anything else.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  try {
    const aluna = await getAlunaByToken(token);
    if (!aluna) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ firstName: aluna.firstName, name: aluna.name });
  } catch (err) {
    console.error("[api/triagem/:token] GET failed", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// POST /api/triagem/[token] — accepts the student's own screening answers
// and writes them for whichever aluna owns this token. The token is the
// only auth here by design (see requirements) — it never touches or
// reveals any other aluna's data.
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  try {
    const ok = await submitScreening(token, body as TriagemDraft);
    if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/triagem/:token] POST failed", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
