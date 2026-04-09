-- ============================================
-- ESSENZE EROICHE + RIBILANCIAMENTO ECONOMIA
-- ============================================

-- Nuova risorsa: Essenze Eroiche
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='essences') THEN
    ALTER TABLE users ADD COLUMN essences INTEGER DEFAULT 0;
  END IF;
END $$;

-- Alza max energia a 200 per tutti
UPDATE users SET max_energy = 200 WHERE max_energy < 200;

-- Aggiorna default per nuovi utenti
ALTER TABLE users ALTER COLUMN max_energy SET DEFAULT 200;
ALTER TABLE users ALTER COLUMN energy SET DEFAULT 30;
