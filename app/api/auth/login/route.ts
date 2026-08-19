import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, createSessionCookieValue, verifyPin } from "@/lib/auth";

// Never statically generated — always evaluates the PIN at request time.
export const dynamic = "force-dynamic";

// POST /api/auth/login — item 1 "PIN gate". Body: { pin: string }. On a
// correct PIN, sets the httpOnly/secure session cookie and returns { ok:
// true }; the client then navigates to `next` (or "/"). Never logs the PIN.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const pin = typeof (body as { pin?: unknown })?.pin === "string" ? (body as { pin: string }).pin.trim() : "";
  if (!pin) {
    return NextResponse.json({ error: "pin_required" }, { status: 400 });
  }

  const valid = await verifyPin(pin);
  if (!valid) {
    return NextResponse.json({ error: "invalid_pin" }, { status: 401 });
  }

  const cookieValue = await createSessionCookieValue();
  if (!cookieValue) {
    // Production with APP_PIN unset — fail closed, never issue a session.
    return NextResponse.json({ error: "server_not_configured" }, { status: 503 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
