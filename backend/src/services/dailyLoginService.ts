import { query } from '../config/database';

// Reward progressivi per ogni giorno del ciclo (1-7)
// Giorno 7 = jackpot
const DAILY_REWARDS = [
  { day: 1, gold: 50,  energy: 10, essences: 0, label: '50 Gold + 10 Energia' },
  { day: 2, gold: 75,  energy: 15, essences: 0, label: '75 Gold + 15 Energia' },
  { day: 3, gold: 100, energy: 20, essences: 1, label: '100 Gold + 20 Energia + 1 Essenza' },
  { day: 4, gold: 125, energy: 20, essences: 1, label: '125 Gold + 20 Energia + 1 Essenza' },
  { day: 5, gold: 150, energy: 25, essences: 2, label: '150 Gold + 25 Energia + 2 Essenze' },
  { day: 6, gold: 200, energy: 30, essences: 3, label: '200 Gold + 30 Energia + 3 Essenze' },
  { day: 7, gold: 400, energy: 50, essences: 5, label: '400 Gold + 50 Energia + 5 Essenze' },
];

export interface DailyLoginStatus {
  canClaim: boolean;
  currentStreak: number;
  bestStreak: number;
  todayReward: typeof DAILY_REWARDS[0];
  streakDay: number; // 1-7 (posizione nel ciclo)
  claimedToday: boolean;
  rewards: typeof DAILY_REWARDS;
}

export interface ClaimResult {
  gold: number;
  energy: number;
  essences: number;
  newStreak: number;
  streakDay: number;
}

/**
 * Ottieni lo stato del daily login per un utente.
 */
export async function getDailyLoginStatus(userId: string): Promise<DailyLoginStatus> {
  // Assicura che le colonne esistano
  await ensureColumns();

  const userResult = await query(
    `SELECT login_streak, best_streak, last_login_date FROM users WHERE twitch_user_id = $1`,
    [userId]
  );

  if (userResult.rows.length === 0) {
    throw new Error('Utente non trovato');
  }

  const user = userResult.rows[0];
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const lastLogin = user.last_login_date ? new Date(user.last_login_date).toISOString().split('T')[0] : null;

  // Controlla se ha gia riscosso oggi
  const claimedToday = lastLogin === today;

  // Calcola la streak corrente
  let currentStreak = user.login_streak || 0;

  // Se ha perso un giorno (non ieri e non oggi), streak torna a 0
  if (lastLogin && !claimedToday) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastLogin !== yesterdayStr) {
      // Ha saltato almeno un giorno: streak reset
      currentStreak = 0;
    }
  }

  // Il giorno nel ciclo (1-7), poi ricomincia
  const streakDay = claimedToday
    ? ((currentStreak - 1) % 7) + 1
    : (currentStreak % 7) + 1;

  const todayReward = DAILY_REWARDS[streakDay - 1];

  return {
    canClaim: !claimedToday,
    currentStreak,
    bestStreak: user.best_streak || 0,
    todayReward,
    streakDay,
    claimedToday,
    rewards: DAILY_REWARDS,
  };
}

/**
 * Riscuoti il reward giornaliero.
 */
export async function claimDailyLogin(userId: string): Promise<ClaimResult> {
  await ensureColumns();

  const status = await getDailyLoginStatus(userId);

  if (status.claimedToday) {
    throw new Error('Hai gia riscosso il premio giornaliero!');
  }

  const newStreak = status.currentStreak + 1;
  const streakDay = (status.currentStreak % 7) + 1;
  const reward = DAILY_REWARDS[streakDay - 1];
  const bestStreak = Math.max(status.bestStreak, newStreak);
  const today = new Date().toISOString().split('T')[0];

  // Aggiorna utente: streak, gold, energia
  await query(
    `UPDATE users SET
       login_streak = $1,
       best_streak = $2,
       last_login_date = $3,
       gold = gold + $4,
       energy = LEAST(max_energy, energy + $5),
       updated_at = NOW()
     WHERE twitch_user_id = $6`,
    [newStreak, bestStreak, today, reward.gold, reward.energy, userId]
  );

  // Essenze (se > 0)
  if (reward.essences > 0) {
    try {
      await query(
        'UPDATE users SET essences = COALESCE(essences, 0) + $1 WHERE twitch_user_id = $2',
        [reward.essences, userId]
      );
    } catch { /* colonna potrebbe non esistere */ }
  }

  // Log nel diario
  await query(
    `INSERT INTO daily_logins (twitch_user_id, login_date, streak_day, reward_gold, reward_energy, reward_essences)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (twitch_user_id, login_date) DO NOTHING`,
    [userId, today, streakDay, reward.gold, reward.energy, reward.essences]
  );

  return {
    gold: reward.gold,
    energy: reward.energy,
    essences: reward.essences,
    newStreak,
    streakDay,
  };
}

// Assicura che le colonne streak esistano (safe migration)
let columnsEnsured = false;
async function ensureColumns(): Promise<void> {
  if (columnsEnsured) return;
  try {
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS login_streak INTEGER DEFAULT 0`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS best_streak INTEGER DEFAULT 0`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_date DATE`);
    await query(`
      CREATE TABLE IF NOT EXISTS daily_logins (
        id BIGSERIAL PRIMARY KEY,
        twitch_user_id VARCHAR(64) NOT NULL REFERENCES users(twitch_user_id),
        login_date DATE NOT NULL DEFAULT CURRENT_DATE,
        streak_day INTEGER NOT NULL DEFAULT 1,
        reward_gold INTEGER NOT NULL DEFAULT 0,
        reward_energy INTEGER NOT NULL DEFAULT 0,
        reward_essences INTEGER NOT NULL DEFAULT 0,
        claimed_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(twitch_user_id, login_date)
      )
    `);
    columnsEnsured = true;
  } catch { /* gia esistono */ }
}
