// Simple PIN-based access control for Larissa's app (item 1).
//
// The correct PIN comes from process.env.APP_PIN, read server-side only —
// it is never sent to the client and never hardcoded (this repo is public
// on GitHub). In production, if APP_PIN is unset, every check fails closed
// (nobody can log in) rather than falling back to a guessable default. In
// any other NODE_ENV (local dev), an unset APP_PIN falls back to "1234" so
// `npm run dev` works out of the box without a .env.local.
//
// The session cookie never stores the raw PIN — it stores an HMAC-signed
// payload (`${expiryTimestamp}.${signature}`) computed with a secret
// derived from the PIN. Only a server that knows APP_PIN can produce a
// signature that verifies, and changing APP_PIN invalidates all existing
// sessions.

export const AUTH_COOKIE_NAME = "tdl_auth";
const SESSION_DAYS = 30;
export const SESSION_MAX_AGE_SECONDS = SESSION_DAYS * 24 * 60 * 60;

const DEV_FALLBACK_PIN = "1234";

function getPin(): string | null {
  const pin = process.env.APP_PIN?.trim();
  if (pin) return pin;
  if (process.env.NODE_ENV !== "production") return DEV_FALLBACK_PIN;
  return null;
}

function getSecret(pin: string): string {
  return `tropa-da-lari:auth:${pin}`;
}

async function hmacSha256(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return Buffer.from(sig).toString("base64url");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Returns the signed cookie value to set on successful login, or null if
// APP_PIN isn't configured (production with no env var — fail closed).
export async function createSessionCookieValue(): Promise<string | null> {
  const pin = getPin();
  if (!pin) return null;
  const exp = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = String(exp);
  const sig = await hmacSha256(payload, getSecret(pin));
  return `${payload}.${sig}`;
}

// Verifies a cookie value produced by createSessionCookieValue. Used by
// proxy.ts (gates every page/API request) and, defensively, inside the new
// mutating API routes themselves.
export async function verifySessionCookieValue(value: string | undefined | null): Promise<boolean> {
  if (!value) return false;
  const pin = getPin();
  if (!pin) return false; // fail closed when unconfigured in production
  const parts = value.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const exp = Number(payload);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const expected = await hmacSha256(payload, getSecret(pin));
  return timingSafeEqual(expected, sig);
}

export async function verifyPin(candidate: string): Promise<boolean> {
  const pin = getPin();
  if (!pin) return false;
  return timingSafeEqual(candidate, pin);
}

export function isAppPinConfigured(): boolean {
  return getPin() !== null;
}
