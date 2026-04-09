-- ============================================
-- RAID BOSS SETTIMANALE
-- ============================================

CREATE TABLE raid_boss (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(64) NOT NULL,
  emoji            VARCHAR(8) NOT NULL DEFAULT '🐉',
  max_hp           BIGINT NOT NULL,
  current_hp       BIGINT NOT NULL,
  atk              INTEGER NOT NULL,
  def              INTEGER NOT NULL,
  spd              INTEGER NOT NULL,
  crit             INTEGER DEFAULT 10,
  crit_dmg         INTEGER DEFAULT 160,
  ability_ids      TEXT[] NOT NULL DEFAULT '{}',
  loot_table       JSONB DEFAULT '[]',
  is_active        BOOLEAN DEFAULT TRUE,
  week_number      INTEGER NOT NULL,
  season           INTEGER DEFAULT 1,
  defeated         BOOLEAN DEFAULT FALSE,
  defeated_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE raid_contributions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raid_id          UUID NOT NULL REFERENCES raid_boss(id),
  user_id          VARCHAR(64) NOT NULL REFERENCES users(twitch_user_id),
  damage_dealt     BIGINT DEFAULT 0,
  attempts         INTEGER DEFAULT 0,
  best_damage      BIGINT DEFAULT 0,
  last_attempt     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(raid_id, user_id)
);

CREATE INDEX idx_raid_contrib_raid ON raid_contributions(raid_id);
CREATE INDEX idx_raid_contrib_user ON raid_contributions(user_id);

-- ============================================
-- SHOP ITEMS (inventario negozio rotante)
-- ============================================

CREATE TABLE shop_listings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id          VARCHAR(64) REFERENCES item_definitions(id),
  item_type        VARCHAR(32) NOT NULL, -- 'equipment', 'consumable', 'reroll', 'energy'
  name             VARCHAR(64) NOT NULL,
  description      TEXT,
  price_gold       INTEGER NOT NULL,
  price_channel_points INTEGER DEFAULT 0,
  stock            INTEGER DEFAULT -1, -- -1 = infinito
  is_active        BOOLEAN DEFAULT TRUE,
  refresh_date     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHANNEL POINTS REDEMPTIONS LOG
-- ============================================

CREATE TABLE channel_point_redemptions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          VARCHAR(64) NOT NULL REFERENCES users(twitch_user_id),
  reward_type      VARCHAR(32) NOT NULL,
  twitch_reward_id VARCHAR(128),
  amount           INTEGER DEFAULT 1,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
