-- ============================================
-- ROSTER: aggiunta colonna capture_rarity
-- Permette di catturare eroi a una rarita scelta
-- e poi fare upgrade con Essenze Eroiche
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='roster' AND column_name='capture_rarity') THEN
    ALTER TABLE roster ADD COLUMN capture_rarity rarity;
  END IF;
END $$;

-- Popola le righe esistenti con la rarita dell'eroe originale
UPDATE roster r
SET capture_rarity = h.rarity
FROM heroes h
WHERE r.hero_id = h.id
  AND r.capture_rarity IS NULL;

-- Rendi la colonna NOT NULL dopo aver popolato i dati esistenti
ALTER TABLE roster ALTER COLUMN capture_rarity SET NOT NULL;
