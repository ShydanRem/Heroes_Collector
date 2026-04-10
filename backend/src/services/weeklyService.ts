import { query } from '../config/database';

// Punti per attivita
const POINTS = {
  DUNGEON_CLEAR: 10,
  PVP_WIN: 8,
  PVP_LOSS: 2,
  RAID_ATTACK: 5,
  CAPTURE: 3,
  DAILY_LOGIN: 2,
};

/**
 * Ottieni il numero della settimana corrente (YYYYWW).
 */
export function getCurrentWeek(): number {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - jan1.getTime()) / 86400000);
  const week = Math.ceil((days + jan1.getDay() + 1) / 7);
  return now.getFullYear() * 100 + week;
}

/**
 * Aggiungi punti settimanali a un utente.
 */
export async function addWeeklyPoints(
  userId: string,
  points: number,
  category: 'dungeons_cleared' | 'pvp_wins' | 'raid_damage' | 'captures'
): Promise<void> {
  await ensureTables();
  const week = getCurrentWeek();

  await query(
    `INSERT INTO weekly_scores (twitch_user_id, week_number, points, ${category})
     VALUES ($1, $2, $3, 1)
     ON CONFLICT (twitch_user_id, week_number) DO UPDATE SET
       points = weekly_scores.points + $3,
       ${category} = weekly_scores.${category} + 1,
       updated_at = NOW()`,
    [userId, week, points]
  );
}

/**
 * Aggiungi punti generici (es. daily login).
 */
export async function addWeeklyPointsGeneric(userId: string, points: number): Promise<void> {
  await ensureTables();
  const week = getCurrentWeek();

  await query(
    `INSERT INTO weekly_scores (twitch_user_id, week_number, points)
     VALUES ($1, $2, $3)
     ON CONFLICT (twitch_user_id, week_number) DO UPDATE SET
       points = weekly_scores.points + $3,
       updated_at = NOW()`,
    [userId, week, points]
  );
}

/**
 * Ottieni la classifica settimanale corrente.
 */
export async function getWeeklyLeaderboard(limit: number = 10): Promise<any[]> {
  await ensureTables();
  const week = getCurrentWeek();

  const result = await query(
    `SELECT ws.twitch_user_id, u.display_name, ws.points,
       ws.dungeons_cleared, ws.pvp_wins, ws.raid_damage, ws.captures,
       h.hero_class, h.rarity, h.level
     FROM weekly_scores ws
     JOIN users u ON u.twitch_user_id = ws.twitch_user_id
     LEFT JOIN heroes h ON h.twitch_user_id = ws.twitch_user_id
     WHERE ws.week_number = $1
     ORDER BY ws.points DESC
     LIMIT $2`,
    [week, limit]
  );

  return result.rows.map((r: any, i: number) => ({
    rank: i + 1,
    userId: r.twitch_user_id,
    displayName: r.display_name,
    points: r.points,
    dungeonsCleared: r.dungeons_cleared,
    pvpWins: r.pvp_wins,
    raidDamage: r.raid_damage,
    captures: r.captures,
    heroClass: r.hero_class,
    rarity: r.rarity,
    level: r.level,
  }));
}

/**
 * Ottieni il punteggio settimanale di un utente.
 */
export async function getMyWeeklyScore(userId: string): Promise<any | null> {
  await ensureTables();
  const week = getCurrentWeek();

  const result = await query(
    `SELECT points, dungeons_cleared, pvp_wins, raid_damage, captures,
       (SELECT COUNT(*) + 1 FROM weekly_scores ws2
        WHERE ws2.week_number = $2 AND ws2.points > ws.points) as rank
     FROM weekly_scores ws
     WHERE twitch_user_id = $1 AND week_number = $2`,
    [userId, week]
  );

  if (result.rows.length === 0) return null;
  const r = result.rows[0];
  return {
    rank: parseInt(r.rank),
    points: r.points,
    dungeonsCleared: r.dungeons_cleared,
    pvpWins: r.pvp_wins,
    raidDamage: r.raid_damage,
    captures: r.captures,
  };
}

/**
 * Ottieni il campione della settimana scorsa.
 */
export async function getLastChampion(): Promise<any | null> {
  await ensureTables();
  const lastWeek = getCurrentWeek() - 1;

  // Prima controlla se il campione e' gia stato assegnato
  const existing = await query(
    `SELECT wc.*, u.display_name FROM weekly_champions wc
     JOIN users u ON u.twitch_user_id = wc.twitch_user_id
     WHERE wc.week_number = $1`,
    [lastWeek]
  );

  if (existing.rows.length > 0) {
    const r = existing.rows[0];
    return { displayName: r.display_name, points: r.points, title: r.title, weekNumber: r.week_number };
  }

  // Assegna il campione della settimana scorsa
  const top = await query(
    `SELECT twitch_user_id, points FROM weekly_scores
     WHERE week_number = $1
     ORDER BY points DESC LIMIT 1`,
    [lastWeek]
  );

  if (top.rows.length > 0 && top.rows[0].points > 0) {
    const winner = top.rows[0];
    await query(
      `INSERT INTO weekly_champions (week_number, twitch_user_id, points)
       VALUES ($1, $2, $3)
       ON CONFLICT (week_number) DO NOTHING`,
      [lastWeek, winner.twitch_user_id, winner.points]
    );

    // Ricompensa: 500 gold + 10 essenze
    try {
      await query('UPDATE users SET gold = gold + 500 WHERE twitch_user_id = $1', [winner.twitch_user_id]);
      await query('UPDATE users SET essences = COALESCE(essences, 0) + 10 WHERE twitch_user_id = $1', [winner.twitch_user_id]);
    } catch { /* */ }

    const user = await query('SELECT display_name FROM users WHERE twitch_user_id = $1', [winner.twitch_user_id]);
    return {
      displayName: user.rows[0]?.display_name || 'Sconosciuto',
      points: winner.points,
      title: 'Campione della Settimana',
      weekNumber: lastWeek,
    };
  }

  return null;
}

export { POINTS };

// Ensure tables exist
let tablesEnsured = false;
async function ensureTables(): Promise<void> {
  if (tablesEnsured) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS weekly_scores (
        id BIGSERIAL PRIMARY KEY,
        twitch_user_id VARCHAR(64) NOT NULL REFERENCES users(twitch_user_id),
        week_number INTEGER NOT NULL,
        points INTEGER DEFAULT 0,
        dungeons_cleared INTEGER DEFAULT 0,
        pvp_wins INTEGER DEFAULT 0,
        raid_damage INTEGER DEFAULT 0,
        captures INTEGER DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(twitch_user_id, week_number)
      )
    `);
    await query(`
      CREATE TABLE IF NOT EXISTS weekly_champions (
        id BIGSERIAL PRIMARY KEY,
        week_number INTEGER NOT NULL UNIQUE,
        twitch_user_id VARCHAR(64) NOT NULL REFERENCES users(twitch_user_id),
        points INTEGER NOT NULL,
        title VARCHAR(64) NOT NULL DEFAULT 'Campione della Settimana',
        awarded_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    tablesEnsured = true;
  } catch { /* */ }
}
