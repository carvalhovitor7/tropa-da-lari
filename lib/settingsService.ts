import { sql } from "./db";
import { AppSettings, DEFAULT_SETTINGS } from "./types";

// Single-row app-wide settings (items 5/6): renewal reminder threshold (in
// weeks) and the shared PIX key/link. lib/db/schema.sql seeds row id=1 on
// init, but getSettings() also falls back to defaults if that row is
// somehow missing (e.g. a DB that predates this migration and hasn't been
// re-initialized yet).
export async function getSettings(): Promise<AppSettings> {
  const { rows } = await sql`SELECT renewal_weeks, pix_key FROM settings WHERE id = 1 LIMIT 1`;
  if (rows.length === 0) return DEFAULT_SETTINGS;
  const row = rows[0];
  return {
    renewalWeeks: typeof row.renewal_weeks === "number" ? row.renewal_weeks : DEFAULT_SETTINGS.renewalWeeks,
    pixKey: (row.pix_key as string) ?? "",
  };
}

export async function updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  await sql`
    INSERT INTO settings (id, renewal_weeks, pix_key)
    VALUES (1, ${patch.renewalWeeks ?? DEFAULT_SETTINGS.renewalWeeks}, ${patch.pixKey ?? ""})
    ON CONFLICT (id) DO UPDATE SET
      renewal_weeks = COALESCE(${patch.renewalWeeks ?? null}, settings.renewal_weeks),
      pix_key = COALESCE(${patch.pixKey ?? null}, settings.pix_key)
  `;
  return getSettings();
}
