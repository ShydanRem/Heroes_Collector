-- ============================================
-- LIVELLO CATTURA NEL ROSTER
-- Il livello dell'eroe catturato e' fisso al momento della cattura
-- ============================================

ALTER TABLE roster ADD COLUMN IF NOT EXISTS capture_level INTEGER DEFAULT 1;

-- Aggiorna gli eroi gia catturati col livello corrente dell'originale
UPDATE roster r SET capture_level = h.level
FROM heroes h WHERE r.hero_id = h.id AND r.capture_level = 1;
