-- Tropa da Lari: schema for alunas + triagem (screening) submissions.
-- Applied by scripts/init-db.ts. Safe to run multiple times (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS alunas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  initials TEXT NOT NULL,
  goal TEXT NOT NULL DEFAULT '',
  freq TEXT NOT NULL DEFAULT '',
  last_session TEXT NOT NULL DEFAULT '',
  level TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  has_treinos BOOLEAN NOT NULL DEFAULT FALSE,
  screening_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aluna's Instagram handle, stored without the leading "@" (item 3). Added
-- after the initial schema, so it uses ADD COLUMN IF NOT EXISTS to stay
-- safe to re-run against a database that already has the alunas table.
ALTER TABLE alunas ADD COLUMN IF NOT EXISTS instagram TEXT NOT NULL DEFAULT '';

-- Self-reported/entered gender ('feminino' | 'masculino' | 'nao_informado'),
-- used only to pick correct grammatical agreement in copy that names this
-- person (see lib/gender.ts). Defaults to 'nao_informado' so existing rows
-- stay valid without a backfill.
ALTER TABLE alunas ADD COLUMN IF NOT EXISTS genero TEXT NOT NULL DEFAULT 'nao_informado';

-- Age (years) and training location, shown on the printable ficha's "DADOS
-- DO ALUNO" card. Both optional/free-text so existing rows stay valid.
ALTER TABLE alunas ADD COLUMN IF NOT EXISTS idade INTEGER;
ALTER TABLE alunas ADD COLUMN IF NOT EXISTS local TEXT NOT NULL DEFAULT '';

-- Aluna's WhatsApp phone number (item 8), used for the direct wa.me deep
-- link share instead of the generic OS share sheet. Optional/free-text.
ALTER TABLE alunas ADD COLUMN IF NOT EXISTS whatsapp TEXT NOT NULL DEFAULT '';

-- One screening record per aluna. Submitting again (student resubmits, or
-- Larissa fills it manually) overwrites the previous answers (see
-- lib/triagemService.ts submitScreening -> ON CONFLICT (aluna_id) DO UPDATE).
CREATE TABLE IF NOT EXISTS screenings (
  id SERIAL PRIMARY KEY,
  aluna_id TEXT NOT NULL UNIQUE REFERENCES alunas(id) ON DELETE CASCADE,

  objetivos JSONB NOT NULL DEFAULT '[]',
  experiencia TEXT NOT NULL DEFAULT '',
  frequencia TEXT NOT NULL DEFAULT '',
  duracao TEXT NOT NULL DEFAULT '',

  tem_dor BOOLEAN,
  dor_regioes JSONB NOT NULL DEFAULT '[]',
  dor_intensidade JSONB NOT NULL DEFAULT '{}',
  dor_quando JSONB NOT NULL DEFAULT '[]',
  movimentos JSONB NOT NULL DEFAULT '[]',
  movimentos_texto TEXT NOT NULL DEFAULT '',

  tem_lesao BOOLEAN,
  lesao_regiao TEXT NOT NULL DEFAULT '',
  lesao_tipo TEXT NOT NULL DEFAULT '',
  lesao_quando TEXT NOT NULL DEFAULT '',
  lesao_sintoma TEXT NOT NULL DEFAULT '',
  lesao_diagnostico TEXT NOT NULL DEFAULT '',

  tem_cirurgia BOOLEAN,
  cirurgia_regiao TEXT NOT NULL DEFAULT '',
  cirurgia_quando TEXT NOT NULL DEFAULT '',
  cirurgia_restricao TEXT NOT NULL DEFAULT '',

  acompanhamento TEXT NOT NULL DEFAULT '',
  orientacao TEXT NOT NULL DEFAULT '',
  orientacao_texto TEXT NOT NULL DEFAULT '',
  restricao_profissional BOOLEAN,
  restricao_texto TEXT NOT NULL DEFAULT '',

  saude JSONB NOT NULL DEFAULT '[]',
  observacao_larissa TEXT NOT NULL DEFAULT '',

  -- Mirrors lib/screening.ts computeAlert(...).level, computed server-side
  -- at submit time so Larissa's app can filter/sort without recomputing.
  classification TEXT NOT NULL DEFAULT 'none',
  completed_at TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Item 5 "Acompanhamento": dated evolução entries per aluna (peso, medidas,
-- fotos). Real server-side data (never local-only), consistent with the
-- "sync should always reflect the server" theme of this task.
CREATE TABLE IF NOT EXISTS evolucao (
  id TEXT PRIMARY KEY,
  aluna_id TEXT NOT NULL REFERENCES alunas(id) ON DELETE CASCADE,
  data TEXT NOT NULL,
  peso NUMERIC,
  medidas JSONB NOT NULL DEFAULT '{}',
  fotos JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS evolucao_aluna_id_idx ON evolucao (aluna_id);

-- Item 5/6: single-row app-wide settings (renewal reminder threshold, PIX
-- key). id=1 is the only row that should ever exist.
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  renewal_weeks INTEGER NOT NULL DEFAULT 4,
  pix_key TEXT NOT NULL DEFAULT '',
  CONSTRAINT settings_singleton CHECK (id = 1)
);
INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Item 6 "Financeiro": one billing record per aluna.
CREATE TABLE IF NOT EXISTS financeiro (
  aluna_id TEXT PRIMARY KEY REFERENCES alunas(id) ON DELETE CASCADE,
  plano TEXT NOT NULL DEFAULT '',
  valor NUMERIC,
  data_pagamento TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Item 8: durable, shareable read-only snapshot of a finalized/sent treino,
-- so the WhatsApp deep link (wa.me) can point somewhere the aluna can open
-- on her own phone even though treinos otherwise live only in Larissa's
-- local browser storage. See app/ficha/[token]/page.tsx.
CREATE TABLE IF NOT EXISTS treino_shares (
  token TEXT PRIMARY KEY,
  aluna_id TEXT NOT NULL REFERENCES alunas(id) ON DELETE CASCADE,
  treino_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS treino_shares_aluna_id_idx ON treino_shares (aluna_id);
