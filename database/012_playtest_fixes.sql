-- ============================================
-- FIX PRE-PLAYTEST
-- ============================================

-- Colonne roster mancanti (erano ADD COLUMN inline nel codice)
ALTER TABLE roster ADD COLUMN IF NOT EXISTS capture_rarity VARCHAR(32) DEFAULT 'comune';
ALTER TABLE roster ADD COLUMN IF NOT EXISTS capture_level INTEGER DEFAULT 1;
ALTER TABLE roster ADD COLUMN IF NOT EXISTS exp INTEGER DEFAULT 0;
ALTER TABLE roster ADD COLUMN IF NOT EXISTS ability_ids TEXT[];
ALTER TABLE roster ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Colonne raid_contributions mancanti
ALTER TABLE raid_contributions ADD COLUMN IF NOT EXISTS daily_attempts INTEGER DEFAULT 0;
ALTER TABLE raid_contributions ADD COLUMN IF NOT EXISTS last_attempt_date DATE;

-- Alzare energia iniziale per il playtest (da 30 a 100)
ALTER TABLE users ALTER COLUMN energy SET DEFAULT 100;

-- Alzare energia max per il playtest
ALTER TABLE users ALTER COLUMN max_energy SET DEFAULT 200;

-- Aggiornare utenti esistenti che hanno ancora i valori vecchi
UPDATE users SET energy = GREATEST(energy, 100) WHERE energy < 100;
