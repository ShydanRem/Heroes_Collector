-- ============================================
-- 4 NUOVE CLASSI: Dragoon, Samurai, Necromante, Alchimista
-- ============================================

ALTER TYPE hero_class ADD VALUE IF NOT EXISTS 'dragoon';
ALTER TYPE hero_class ADD VALUE IF NOT EXISTS 'samurai';
ALTER TYPE hero_class ADD VALUE IF NOT EXISTS 'necromante';
ALTER TYPE hero_class ADD VALUE IF NOT EXISTS 'alchimista';
