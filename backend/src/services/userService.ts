import { query } from '../config/database';
import { UserProfile } from '../types';

/**
 * Trova o crea un utente nel database.
 */
export async function findOrCreateUser(
  twitchUserId: string,
  twitchUsername: string,
  displayName: string
): Promise<UserProfile> {
  // Cerca utente esistente
  const existing = await query(
    'SELECT * FROM users WHERE twitch_user_id = $1',
    [twitchUserId]
  );

  if (existing.rows.length > 0) {
    return rowToUser(existing.rows[0]);
  }

  // Crea nuovo utente
  const result = await query(
    `INSERT INTO users (twitch_user_id, twitch_username, display_name)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [twitchUserId, twitchUsername, displayName]
  );

  return rowToUser(result.rows[0]);
}

/**
 * Opt-in: l'utente accetta di diventare un eroe.
 */
export async function optIn(twitchUserId: string): Promise<void> {
  await query(
    'UPDATE users SET opted_in = TRUE, updated_at = NOW() WHERE twitch_user_id = $1',
    [twitchUserId]
  );
}

/**
 * Aggiorna i contatori di attività.
 */
export async function addActivity(
  twitchUserId: string,
  eventType: 'chat' | 'sub' | 'watch' | 'follow',
  value: number = 1
): Promise<void> {
  // Log dell'evento
  await query(
    'INSERT INTO activity_log (twitch_user_id, event_type, value) VALUES ($1, $2, $3)',
    [twitchUserId, eventType, value]
  );

  // Aggiorna contatori sull'utente
  const columnMap: Record<string, string> = {
    chat: 'chat_messages',
    sub: 'sub_months',
    watch: 'watch_time_min',
    follow: 'follow_age_days',
  };
  const column = columnMap[eventType];

  await query(
    `UPDATE users SET ${column} = ${column} + $1, updated_at = NOW()
     WHERE twitch_user_id = $2`,
    [value, twitchUserId]
  );
}

/**
 * Aggiorna l'activity score di un utente e restituisce il nuovo punteggio.
 */
export async function refreshActivityScore(twitchUserId: string): Promise<number> {
  const { calculateActivityScore } = await import('./heroGenerator');

  const result = await query(
    'SELECT chat_messages, watch_time_min, sub_months, follow_age_days FROM users WHERE twitch_user_id = $1',
    [twitchUserId]
  );

  if (result.rows.length === 0) return 0;

  const row = result.rows[0];
  const score = calculateActivityScore({
    chatMessages: row.chat_messages,
    watchTimeMinutes: row.watch_time_min,
    subMonths: row.sub_months,
    followAgeDays: row.follow_age_days,
  });

  await query(
    'UPDATE users SET activity_score = $1, updated_at = NOW() WHERE twitch_user_id = $2',
    [score, twitchUserId]
  );

  return score;
}

/**
 * Consuma energia di un utente. Restituisce true se aveva abbastanza energia.
 */
export async function consumeEnergy(twitchUserId: string, amount: number): Promise<boolean> {
  // Prima rigenera l'energia passata
  await refreshEnergy(twitchUserId);

  const result = await query(
    `UPDATE users SET energy = energy - $1, updated_at = NOW()
     WHERE twitch_user_id = $2 AND energy >= $1
     RETURNING energy`,
    [amount, twitchUserId]
  );

  return result.rows.length > 0;
}

/**
 * Rigenera l'energia basandosi sul tempo passato (1 energia ogni 10 minuti).
 */
async function refreshEnergy(twitchUserId: string): Promise<void> {
  await query(
    `UPDATE users SET
       energy = LEAST(max_energy, energy + EXTRACT(EPOCH FROM NOW() - last_energy_refresh) / 600),
       last_energy_refresh = NOW()
     WHERE twitch_user_id = $1`,
    [twitchUserId]
  );
}

/**
 * Aggiungi gold a un utente.
 */
export async function addGold(twitchUserId: string, amount: number): Promise<void> {
  await query(
    'UPDATE users SET gold = gold + $1, updated_at = NOW() WHERE twitch_user_id = $2',
    [amount, twitchUserId]
  );
}

/**
 * Ottieni profilo utente.
 */
export async function getUserProfile(twitchUserId: string): Promise<UserProfile | null> {
  const result = await query(
    'SELECT * FROM users WHERE twitch_user_id = $1',
    [twitchUserId]
  );
  if (result.rows.length === 0) return null;
  return rowToUser(result.rows[0]);
}

/**
 * Lista utenti che hanno fatto opt-in (per il catalogo eroi).
 */
export async function getOptedInUsers(): Promise<UserProfile[]> {
  const result = await query(
    'SELECT * FROM users WHERE opted_in = TRUE ORDER BY activity_score DESC'
  );
  return result.rows.map(rowToUser);
}

// Helper per convertire riga DB in tipo TypeScript
function rowToUser(row: any): UserProfile {
  return {
    twitchUserId: row.twitch_user_id,
    twitchUsername: row.twitch_username,
    displayName: row.display_name,
    optedIn: row.opted_in,
    activityScore: row.activity_score,
    chatMessages: row.chat_messages,
    watchTimeMinutes: row.watch_time_min,
    subscriptionMonths: row.sub_months,
    followAgedays: row.follow_age_days,
    gold: row.gold,
    energy: row.energy,
    maxEnergy: row.max_energy,
    lastEnergyRefresh: row.last_energy_refresh,
    createdAt: row.created_at,
  };
}
