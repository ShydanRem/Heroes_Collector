-- ============================================
-- RESET COMPLETO DATABASE
-- Droppa tutte le tabelle e tipi, poi ricrea tutto da zero
-- ATTENZIONE: tutti i dati verranno persi!
-- ============================================

-- Droppa tabelle in ordine (dipendenze inverse)
DROP TABLE IF EXISTS weekly_scores CASCADE;
DROP TABLE IF EXISTS weekly_champions CASCADE;
DROP TABLE IF EXISTS hero_talents CASCADE;
DROP TABLE IF EXISTS daily_login CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS daily_missions CASCADE;
DROP TABLE IF EXISTS shop_listings CASCADE;
DROP TABLE IF EXISTS raid_contributions CASCADE;
DROP TABLE IF EXISTS raid_boss CASCADE;
DROP TABLE IF EXISTS channel_point_redemptions CASCADE;
DROP TABLE IF EXISTS zone_progress CASCADE;
DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;
DROP TABLE IF EXISTS battles CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS item_definitions CASCADE;
DROP TABLE IF EXISTS parties CASCADE;
DROP TABLE IF EXISTS roster CASCADE;
DROP TABLE IF EXISTS heroes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Droppa tipi enum
DROP TYPE IF EXISTS rarity CASCADE;
DROP TYPE IF EXISTS hero_class CASCADE;
DROP TYPE IF EXISTS ability_type CASCADE;
DROP TYPE IF EXISTS battle_type CASCADE;
DROP TYPE IF EXISTS battle_status CASCADE;
