-- ============================================
-- ALBERO TALENTI
-- ============================================

CREATE TABLE IF NOT EXISTS hero_talents (
  id               BIGSERIAL PRIMARY KEY,
  twitch_user_id   VARCHAR(64) NOT NULL REFERENCES users(twitch_user_id),
  talent_id        VARCHAR(64) NOT NULL,
  unlocked_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(twitch_user_id, talent_id)
);

CREATE INDEX IF NOT EXISTS idx_hero_talents_user ON hero_talents(twitch_user_id);

-- Punti talento disponibili = livello / 5 (arrotondato per difetto)
-- Punti spesi = COUNT di hero_talents per utente
-- Punti rimanenti = disponibili - spesi
