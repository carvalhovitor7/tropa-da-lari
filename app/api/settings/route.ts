import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/settingsService";

export const dynamic = "force-dynamic";

// GET /api/settings — renewal reminder threshold + PIX key (items 5/6).
export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({ settings });
  } catch (err) {
    console.error("[api/settings] GET failed", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// PATCH /api/settings — body: { renewalWeeks?, pixKey? }.
export async function PATCH(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const input = (body ?? {}) as { renewalWeeks?: number; pixKey?: string };
  try {
    const settings = await updateSettings(input);
    return NextResponse.json({ settings });
  } catch (err) {
    console.error("[api/settings] PATCH failed", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
