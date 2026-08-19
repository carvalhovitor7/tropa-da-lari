import { sql } from "@vercel/postgres";

/**
 * Thin wrapper around @vercel/postgres.
 *
 * Env var: POSTGRES_URL (see .env.example).
 * - Local dev: create `.env.local` with POSTGRES_URL pointing at a Postgres
 *   database (e.g. a free Neon/Supabase instance, or `vercel env pull` after
 *   linking a Vercel Postgres/Neon store to this project).
 * - Production: once the project is linked to a Postgres store on Vercel,
 *   POSTGRES_URL is injected automatically — nothing to configure here.
 *
 * Nothing in this module runs a query at import time, so `next build`
 * succeeds even when POSTGRES_URL is unset. Any route handler that queries
 * the database must export `dynamic = "force-dynamic"` so Next never tries
 * to execute it during static generation (see app/api/**\/route.ts).
 */
export { sql };

export function isDbConfigured(): boolean {
  return Boolean(process.env.POSTGRES_URL);
}
