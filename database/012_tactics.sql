-- Aggiungi colonna tactics_json agli eroi del roster e al profilo utente

ALTER TABLE users ADD COLUMN IF NOT EXISTS tactics_json JSONB DEFAULT '[]'::jsonb;
ALTER TABLE roster ADD COLUMN IF NOT EXISTS tactics_json JSONB DEFAULT '[]'::jsonb;
