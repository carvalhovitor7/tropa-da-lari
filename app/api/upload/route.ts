import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

// Talks to Vercel Blob on every request — never statically generated.
export const dynamic = "force-dynamic";

// POST /api/upload — item 5 "Acompanhamento" photo storage. Accepts
// multipart/form-data with a single "file" field, uploads it to Vercel
// Blob (provisioned via `vercel blob create-store`, see BLOB_READ_WRITE_TOKEN
// in .env.local) and returns the public URL, which the client then stores
// in evolucao.fotos. Protected by proxy.ts like every other /api/* route
// (Larissa's app only — no public upload path).
export async function POST(req: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "blob_not_configured" }, { status: 503 });
  }
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file_required" }, { status: 400 });
    }
    const ext = file.name.split(".").pop() || "jpg";
    const key = `evolucao/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const blob = await put(key, file, { access: "public", addRandomSuffix: false });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("[api/upload] POST failed", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
