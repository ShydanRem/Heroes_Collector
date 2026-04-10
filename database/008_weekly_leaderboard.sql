-- ============================================
-- CLASSIFICA SETTIMANALE CON RESET
-- ============================================

CREATE TABLE IF NOT EXISTS weekly_scores (
  id               BIGSERIAL PRIMARY KEY,
  twitch_user_id   VARCHAR(64) NOT NULL REFERENCES users(twitch_user_id),
  week_number      INTEGER NOT NULL,  -- YYYYWW (es. 202615)
  points           INTEGER DEFAULT 0,
  dungeons_cleared INTEGER DEFAULT 0,
  pvp_wins         INTEGER DEFAULT 0,
  raid_damage      INTEGER DEFAULT 0,
  captures         INTEGER DEFAULT 0,
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(twitch_user_id, week_number)
);

CREATE INDEX IF NOT EXISTS idx_weekly_scores_week ON weekly_scores(week_number);

-- Storico vincitori settimanali
CREATE TABLE IF NOT EXISTS weekly_champions (
  id               BIGSERIAL PRIMARY KEY,
  week_number      INTEGER NOT NULL UNIQUE,
  twitch_user_id   VARCHAR(64) NOT NULL REFERENCES users(twitch_user_id),
  points           INTEGER NOT NULL,
  title            VARCHAR(64) NOT NULL DEFAULT 'Campione della Settimana',
  awarded_at       TIMESTAMPTZ DEFAULT NOW()
);
