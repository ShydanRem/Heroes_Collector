-- ============================================
-- ZONE DUNGEON — Progressione
-- ============================================

CREATE TABLE IF NOT EXISTS zone_progress (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          VARCHAR(64) NOT NULL REFERENCES users(twitch_user_id),
  zone_id          VARCHAR(32) NOT NULL,
  cleared          BOOLEAN DEFAULT FALSE,
  best_waves       INTEGER DEFAULT 0,
  total_clears     INTEGER DEFAULT 0,
  first_cleared_at TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, zone_id)
);

CREATE INDEX IF NOT EXISTS idx_zone_progress_user ON zone_progress(user_id);

-- Zona massima sbloccata per ogni utente
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='max_zone_unlocked') THEN
    ALTER TABLE users ADD COLUMN max_zone_unlocked VARCHAR(32) DEFAULT 'forest';
  END IF;
END $$;

-- Zona in cui si e combattuto
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='battles' AND column_name='zone_id') THEN
    ALTER TABLE battles ADD COLUMN zone_id VARCHAR(32);
  END IF;
END $$;
