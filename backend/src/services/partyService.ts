import { query } from '../config/database';
import { Party, MAX_PARTY_SIZE } from '../types';

/**
 * Crea un nuovo party per l'utente.
 */
export async function createParty(userId: string, name: string): Promise<Party> {
  // Max 3 party per utente
  const countResult = await query(
    'SELECT COUNT(*) FROM parties WHERE user_id = $1',
    [userId]
  );
  if (parseInt(countResult.rows[0].count, 10) >= 3) {
    throw new Error('Puoi avere massimo 3 party!');
  }

  const result = await query(
    `INSERT INTO parties (user_id, name, hero_ids, is_active)
     VALUES ($1, $2, '{}', FALSE)
     RETURNING *`,
    [userId, name]
  );

  return rowToParty(result.rows[0]);
}

/**
 * Ottieni tutti i party dell'utente.
 */
export async function getParties(userId: string): Promise<Party[]> {
  const result = await query(
    'SELECT * FROM parties WHERE user_id = $1 ORDER BY created_at',
    [userId]
  );
  return result.rows.map(rowToParty);
}

/**
 * Ottieni il party attivo dell'utente.
 */
export async function getActiveParty(userId: string): Promise<Party | null> {
  const result = await query(
    'SELECT * FROM parties WHERE user_id = $1 AND is_active = TRUE LIMIT 1',
    [userId]
  );
  if (result.rows.length === 0) return null;
  return rowToParty(result.rows[0]);
}

/**
 * Imposta un party come attivo (disattiva gli altri).
 */
export async function setActiveParty(userId: string, partyId: string): Promise<void> {
  await query(
    'UPDATE parties SET is_active = FALSE WHERE user_id = $1',
    [userId]
  );
  await query(
    'UPDATE parties SET is_active = TRUE WHERE id = $1 AND user_id = $2',
    [partyId, userId]
  );
}

/**
 * Aggiungi un eroe al party.
 * L'eroe deve essere nel roster dell'utente.
 */
export async function addHeroToParty(
  userId: string,
  partyId: string,
  heroId: string
): Promise<{ success: boolean; message: string }> {
  // Verifica che il party appartenga all'utente
  const partyResult = await query(
    'SELECT * FROM parties WHERE id = $1 AND user_id = $2',
    [partyId, userId]
  );
  if (partyResult.rows.length === 0) {
    return { success: false, message: 'Party non trovato' };
  }

  const party = rowToParty(partyResult.rows[0]);

  // Verifica dimensione party
  if (party.heroIds.length >= MAX_PARTY_SIZE) {
    return { success: false, message: `Il party puo avere massimo ${MAX_PARTY_SIZE} eroi!` };
  }

  // Verifica che l'eroe non sia gia nel party
  if (party.heroIds.includes(heroId)) {
    return { success: false, message: 'Questo eroe e gia nel party!' };
  }

  // Verifica che l'eroe sia nel roster dell'utente O sia il suo eroe personale
  const rosterCheck = await query(
    `SELECT 1 FROM roster WHERE owner_user_id = $1 AND hero_id = $2
     UNION
     SELECT 1 FROM heroes WHERE id = $2 AND twitch_user_id = $1`,
    [userId, heroId]
  );
  if (rosterCheck.rows.length === 0) {
    return { success: false, message: 'Questo eroe non e nel tuo roster!' };
  }

  // Aggiungi
  await query(
    'UPDATE parties SET hero_ids = array_append(hero_ids, $1::uuid) WHERE id = $2',
    [heroId, partyId]
  );

  return { success: true, message: 'Eroe aggiunto al party!' };
}

/**
 * Rimuovi un eroe dal party.
 */
export async function removeHeroFromParty(
  userId: string,
  partyId: string,
  heroId: string
): Promise<{ success: boolean; message: string }> {
  const partyResult = await query(
    'SELECT * FROM parties WHERE id = $1 AND user_id = $2',
    [partyId, userId]
  );
  if (partyResult.rows.length === 0) {
    return { success: false, message: 'Party non trovato' };
  }

  await query(
    'UPDATE parties SET hero_ids = array_remove(hero_ids, $1::uuid) WHERE id = $2',
    [heroId, partyId]
  );

  return { success: true, message: 'Eroe rimosso dal party' };
}

/**
 * Elimina un party.
 */
export async function deleteParty(userId: string, partyId: string): Promise<boolean> {
  const result = await query(
    'DELETE FROM parties WHERE id = $1 AND user_id = $2 RETURNING id',
    [partyId, userId]
  );
  return result.rows.length > 0;
}

/**
 * Ottieni gli eroi completi di un party (per il combattimento).
 */
export async function getPartyHeroes(partyId: string): Promise<any[]> {
  const result = await query(
    `SELECT h.* FROM heroes h
     JOIN parties p ON h.id = ANY(p.hero_ids)
     WHERE p.id = $1
     ORDER BY array_position(p.hero_ids, h.id)`,
    [partyId]
  );
  return result.rows;
}

function rowToParty(row: any): Party {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    heroIds: row.hero_ids || [],
    createdAt: row.created_at,
  };
}
