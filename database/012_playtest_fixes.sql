-- ============================================
-- FIX PRE-PLAYTEST
-- ============================================

-- Colonne roster mancanti (erano ADD COLUMN inline nel codice)
-- NOTA: capture_rarity e' gia definita dalla migration 006 come enum `rarity`
-- NOT NULL. NON ridefinirla qui come VARCHAR: creerebbe schemi divergenti tra
-- ambienti a seconda dell'ordine di esecuzione.
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

-- NOTA: rimosso l'UPDATE one-time "energy = GREATEST(energy, 100)".
-- Era un boost una-tantum del playtest ma, eseguito a ogni deploy dal vecchio
-- migration runner, ri-flooizzava l'energia di tutti i giocatori a ogni rilascio
-- (bug di economia live). I nuovi utenti prendono comunque il DEFAULT 100 sopra.
