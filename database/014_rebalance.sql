-- ============================================
-- REBALANCE Phase 2 — CAP ACQUISTI GIORNALIERI SHOP
-- ============================================
-- Traccia gli acquisti per utente/tipo/giorno per applicare i cap giornalieri
-- (energia 5/g, elisir 2/g, pergamena EXP 3/g) in shopService.purchaseItem.
-- Idempotente: IF NOT EXISTS per consentire re-apply senza errori.

CREATE TABLE IF NOT EXISTS daily_purchases (
  user_id     VARCHAR(64) NOT NULL REFERENCES users(twitch_user_id),
  item_type   VARCHAR(32) NOT NULL,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  count       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, item_type, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_purchases_date ON daily_purchases(date);
