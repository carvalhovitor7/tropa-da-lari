import { randomBytes } from "crypto";

// Unguessable per-aluna slug used in /triagem/[token]. The token itself is
// the access control for that route — anyone with the link can view the
// aluna's first name and submit her screening, nothing else.
export function generateScreeningToken(bytes = 16): string {
  return randomBytes(bytes).toString("base64url");
}
