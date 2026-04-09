-- ============================================
-- MISSIONI GIORNALIERE
-- ============================================

CREATE TABLE IF NOT EXISTS daily_missions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          VARCHAR(64) NOT NULL REFERENCES users(twitch_user_id),
  mission_type     VARCHAR(32) NOT NULL,  -- 'dungeon', 'pvp', 'capture', 'raid', 'equip', 'shop'
  description      TEXT NOT NULL,
  target           INTEGER NOT NULL DEFAULT 1,
  progress         INTEGER NOT NULL DEFAULT 0,
  reward_gold      INTEGER NOT NULL DEFAULT 0,
  reward_exp       INTEGER NOT NULL DEFAULT 0,
  claimed          BOOLEAN DEFAULT FALSE,
  created_at       DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at     TIMESTAMPTZ,
  UNIQUE(user_id, mission_type, created_at)
);

CREATE INDEX IF NOT EXISTS idx_daily_missions_user_date ON daily_missions(user_id, created_at);

-- ============================================
-- ACHIEVEMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS user_achievements (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          VARCHAR(64) NOT NULL REFERENCES users(twitch_user_id),
  achievement_id   VARCHAR(64) NOT NULL,
  unlocked_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
