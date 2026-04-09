-- ============================================
-- TWITCH HEROES COLLECTOR - Schema Database
-- ============================================

-- Tipi enum
CREATE TYPE rarity AS ENUM (
  'comune', 'non_comune', 'raro', 'molto_raro',
  'epico', 'leggendario', 'mitico', 'master'
);

CREATE TYPE hero_class AS ENUM (
  'guardiano', 'lama', 'arcano', 'custode',
  'ombra', 'ranger', 'sciamano', 'crono'
);

CREATE TYPE ability_type AS ENUM (
  'attacco', 'difesa', 'supporto', 'debuff', 'ultimate'
);

CREATE TYPE battle_type AS ENUM ('pve', 'pvp');
CREATE TYPE battle_status AS ENUM ('in_progress', 'completed');

-- ============================================
-- UTENTI
-- ============================================
CREATE TABLE users (
  twitch_user_id   VARCHAR(64) PRIMARY KEY,
  twitch_username  VARCHAR(64) NOT NULL,
  display_name     VARCHAR(64) NOT NULL,
  opted_in         BOOLEAN DEFAULT FALSE,
  activity_score   FLOAT DEFAULT 0,
  chat_messages    INTEGER DEFAULT 0,
  watch_time_min   INTEGER DEFAULT 0,
  sub_months       INTEGER DEFAULT 0,
  follow_age_days  INTEGER DEFAULT 0,
  gold             INTEGER DEFAULT 0,
  energy           FLOAT DEFAULT 50,
  max_energy       FLOAT DEFAULT 50,
  last_energy_refresh TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EROI (ogni utente opt-in genera un eroe)
-- ============================================
CREATE TABLE heroes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twitch_user_id   VARCHAR(64) NOT NULL REFERENCES users(twitch_user_id),
  twitch_username  VARCHAR(64) NOT NULL,
  display_name     VARCHAR(64) NOT NULL,
  hero_class       hero_class NOT NULL,
  rarity           rarity NOT NULL,
  level            INTEGER DEFAULT 1,
  exp              INTEGER DEFAULT 0,
  hp               INTEGER NOT NULL,
  atk              INTEGER NOT NULL,
  def              INTEGER NOT NULL,
  spd              INTEGER NOT NULL,
  crit             INTEGER NOT NULL,
  crit_dmg         INTEGER DEFAULT 150,
  ability_ids      TEXT[] NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(twitch_user_id)
);

-- ============================================
-- ROSTER (eroi catturati da ogni giocatore)
-- ============================================
CREATE TABLE roster (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id    VARCHAR(64) NOT NULL REFERENCES users(twitch_user_id),
  hero_id          UUID NOT NULL REFERENCES heroes(id),
  caught_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_user_id, hero_id)
);

CREATE INDEX idx_roster_owner ON roster(owner_user_id);

-- ============================================
-- PARTY (squadre di max 4 eroi)
-- ============================================
CREATE TABLE parties (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          VARCHAR(64) NOT NULL REFERENCES users(twitch_user_id),
  name             VARCHAR(32) NOT NULL DEFAULT 'Party 1',
  hero_ids         UUID[] NOT NULL DEFAULT '{}',
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_parties_user ON parties(user_id);

-- ============================================
-- OGGETTI (definizioni)
-- ============================================
CREATE TABLE item_definitions (
  id               VARCHAR(64) PRIMARY KEY,
  name             VARCHAR(64) NOT NULL,
  description      TEXT,
  slot             VARCHAR(16), -- 'arma', 'armatura', 'accessorio'
  rarity           rarity NOT NULL,
  stat_bonuses     JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVENTARIO
-- ============================================
CREATE TABLE inventory (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          VARCHAR(64) NOT NULL REFERENCES users(twitch_user_id),
  item_id          VARCHAR(64) NOT NULL REFERENCES item_definitions(id),
  quantity         INTEGER DEFAULT 1,
  equipped_on      UUID REFERENCES heroes(id),
  UNIQUE(user_id, item_id, equipped_on)
);

CREATE INDEX idx_inventory_user ON inventory(user_id);

-- ============================================
-- BATTAGLIE
-- ============================================
CREATE TABLE battles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_type      battle_type NOT NULL,
  status           battle_status DEFAULT 'in_progress',
  attacker_user_id VARCHAR(64) REFERENCES users(twitch_user_id),
  defender_user_id VARCHAR(64) REFERENCES users(twitch_user_id),
  attacker_party   UUID REFERENCES parties(id),
  defender_party   UUID REFERENCES parties(id),
  winner_user_id   VARCHAR(64),
  battle_log       JSONB DEFAULT '[]',
  rewards          JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  completed_at     TIMESTAMPTZ
);

-- ============================================
-- CLASSIFICHE
-- ============================================
CREATE TABLE leaderboard (
  user_id          VARCHAR(64) PRIMARY KEY REFERENCES users(twitch_user_id),
  elo_rating       INTEGER DEFAULT 1000,
  wins             INTEGER DEFAULT 0,
  losses           INTEGER DEFAULT 0,
  season           INTEGER DEFAULT 1,
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LOG ATTIVITA' (per tracciamento incrementale)
-- ============================================
CREATE TABLE activity_log (
  id               BIGSERIAL PRIMARY KEY,
  twitch_user_id   VARCHAR(64) NOT NULL REFERENCES users(twitch_user_id),
  event_type       VARCHAR(32) NOT NULL, -- 'chat', 'sub', 'watch', 'follow'
  value            INTEGER DEFAULT 1,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON activity_log(twitch_user_id);
CREATE INDEX idx_activity_date ON activity_log(created_at);
