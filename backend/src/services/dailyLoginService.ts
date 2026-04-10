import { query } from '../config/database';

// Reward progressivi per ogni giorno del ciclo (1-7)
// Giorno 7 = jackpot
const DAILY_REWARDS = [
  { day: 1, gold: 25,  energy: 10, essences: 0, label: '25 Gold + 10 Energia' },
  { day: 2, gold: 35,  energy: 10, essences: 0, label: '35 Gold + 10 Energia' },
  { day: 3, gold: 50,  energy: 15, essences: 1, label: '50 Gold + 15 Energia + 1 Essenza' },
  { day: 4, gold: 65,  energy: 15, essences: 1, label: '65 Gold + 15 Energia + 1 Essenza' },
  { day: 5, gold: 80,  energy: 20, essences: 1, label: '80 Gold + 20 Energia + 1 Essenza' },
  { day: 6, gold: 120, energy: 25, essences: 2, label: '120 Gold + 25 Energia + 2 Essenze' },
  { day: 7, gold: 200, energy: 40, essences: 3, label: '200 Gold + 40 Energia + 3 Essenze' },
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
 * Calcola se l'utente ha perso una live (= c'e' stata una live e lui non c'era).
 * Se si, la streak si resetta.
 */
async function calculateStreak(userId: string, currentStreak: number): Promise<number> {
  // Controlla se c'e' stata una live (altri claim) in un giorno passato in cui l'utente non c'era
  // Tutto fatto in SQL per evitare problemi timezone
  const result = await query(
    `SELECT d.login_date FROM daily_logins d
     WHERE d.login_date < CURRENT_DATE
       AND d.login_date NOT IN (
         SELECT login_date FROM daily_logins WHERE twitch_user_id = $1
       )
     ORDER BY d.login_date DESC LIMIT 1`,
    [userId]
  );

  // Se c'e' almeno una data di live passata dove l'utente non c'era, streak persa
  if (result.rows.length > 0) {
    // Ma solo se e' piu' recente dell'ultimo claim dell'utente
    const missedDate = new Date(result.rows[0].login_date);
    const lastClaimResult = await query(
      `SELECT MAX(login_date) as last_claim FROM daily_logins WHERE twitch_user_id = $1`,
      [userId]
    );
    const lastClaim = lastClaimResult.rows[0]?.last_claim;
    if (!lastClaim || missedDate > new Date(lastClaim)) {
      return 0;
    }
  }

  return currentStreak;
}

/**
 * Ottieni lo stato del daily login per un utente.
 */
export async function getDailyLoginStatus(userId: string): Promise<DailyLoginStatus> {
  await ensureColumns();

  // Usa CURRENT_DATE di PostgreSQL per evitare problemi di timezone
  const userResult = await query(
    `SELECT login_streak, best_streak, last_login_date,
       (last_login_date = CURRENT_DATE) as claimed_today
     FROM users WHERE twitch_user_id = $1`,
    [userId]
  );

  if (userResult.rows.length === 0) {
    throw new Error('Utente non trovato');
  }

  const user = userResult.rows[0];
  const claimedToday = user.claimed_today === true;

  // Calcola streak tenendo conto solo dei giorni di live
  let currentStreak = user.login_streak || 0;
  if (!claimedToday && currentStreak > 0) {
    currentStreak = await calculateStreak(userId, currentStreak);
    // Se la streak e' stata resettata, aggiorna il DB
    if (currentStreak === 0 && (user.login_streak || 0) > 0) {
      await query(
        'UPDATE users SET login_streak = 0 WHERE twitch_user_id = $1',
        [userId]
      );
    }
  }

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

  // Aggiorna utente: streak, gold, energia — usa CURRENT_DATE di Postgres
  await query(
    `UPDATE users SET
       login_streak = $1,
       best_streak = $2,
       last_login_date = CURRENT_DATE,
       gold = gold + $3,
       energy = LEAST(max_energy, energy + $4),
       updated_at = NOW()
     WHERE twitch_user_id = $5`,
    [newStreak, bestStreak, reward.gold, reward.energy, userId]
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

  // Punti classifica settimanale
  try {
    const { addWeeklyPointsGeneric, POINTS } = await import('./weeklyService');
    await addWeeklyPointsGeneric(userId, POINTS.DAILY_LOGIN);
  } catch { /* */ }

  // Log nel diario
  await query(
    `INSERT INTO daily_logins (twitch_user_id, login_date, streak_day, reward_gold, reward_energy, reward_essences)
     VALUES ($1, CURRENT_DATE, $2, $3, $4, $5)
     ON CONFLICT (twitch_user_id, login_date) DO NOTHING`,
    [userId, streakDay, reward.gold, reward.energy, reward.essences]
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
