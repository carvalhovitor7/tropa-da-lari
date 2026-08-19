// Gates the whole Larissa-facing app behind the PIN cookie (item 1).
//
// Next.js 16 renamed `middleware.ts` to `proxy.ts` (functionally identical —
// see node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md).
//
// Exempt, by design, because students reach them without ever logging in:
//   /triagem/[token]      — standalone screening flow
//   /api/triagem/[token]  — its GET/POST API
//   /ficha/[token]        — read-only shared treino snapshot (item 8)
//   /entrar, /api/auth/login — the PIN entry screen itself
// Everything else (the app shell at "/", and every other /api/* route,
// including alunas/evolucao/financeiro/settings mutations) requires a valid
// session cookie, checked server-side here — not just hidden behind UI.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionCookieValue } from "@/lib/auth";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|sw\\.js|icons/|brand/|triagem/|ficha/|entrar|api/auth/login|api/triagem/).*)",
  ],
};

export async function proxy(request: NextRequest) {
  const cookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const ok = await verifySessionCookieValue(cookie);
  if (ok) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/entrar";
  url.search = "";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}
