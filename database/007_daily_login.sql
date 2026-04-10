-- ============================================
-- DAILY LOGIN + STREAK
-- ============================================

-- Colonne streak sulla tabella users
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS best_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_date DATE;

-- Log dei login giornalieri (per storico e anti-exploit)
CREATE TABLE IF NOT EXISTS daily_logins (
  id               BIGSERIAL PRIMARY KEY,
  twitch_user_id   VARCHAR(64) NOT NULL REFERENCES users(twitch_user_id),
  login_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  streak_day       INTEGER NOT NULL DEFAULT 1,  -- giorno nel ciclo 1-7
  reward_gold      INTEGER NOT NULL DEFAULT 0,
  reward_energy    INTEGER NOT NULL DEFAULT 0,
  reward_essences  INTEGER NOT NULL DEFAULT 0,
  claimed_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(twitch_user_id, login_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_logins_user ON daily_logins(twitch_user_id);
CREATE INDEX IF NOT EXISTS idx_daily_logins_date ON daily_logins(login_date);
