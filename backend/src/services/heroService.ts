import { query } from '../config/database';
import { Hero, HeroClass, Rarity, CAPTURE_ENERGY_COST, RARITY_ORDER, UPGRADE_ESSENCE_COST } from '../types';
import { generateHero, calculateStats, selectAbilities, tryLevelUp, scoreToRarity, calculateActivityScore } from './heroGenerator';
import { consumeEnergy, refreshActivityScore } from './userService';

/**
 * Crea l'eroe per un utente che ha fatto opt-in.
 */
export async function createHeroForUser(twitchUserId: string): Promise<Hero | null> {
  // Prendi dati utente
  const userResult = await query(
    'SELECT * FROM users WHERE twitch_user_id = $1 AND opted_in = TRUE',
    [twitchUserId]
  );

  if (userResult.rows.length === 0) return null;
  const user = userResult.rows[0];

  // Controlla se ha già un eroe
  const existingHero = await query(
    'SELECT id FROM heroes WHERE twitch_user_id = $1',
    [twitchUserId]
  );
  if (existingHero.rows.length > 0) return null;

  // Genera l'eroe
  const heroData = generateHero(
    user.twitch_user_id,
    user.twitch_username,
    user.display_name,
    {
      chatMessages: user.chat_messages,
      watchTimeMinutes: user.watch_time_min,
      subMonths: user.sub_months,
      followAgeDays: user.follow_age_days,
    }
  );

  // Salva nel database
  const result = await query(
    `INSERT INTO heroes (twitch_user_id, twitch_username, display_name, hero_class, rarity, level, exp, hp, atk, def, spd, crit, crit_dmg, ability_ids)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING *`,
    [
      heroData.twitchUserId, heroData.twitchUsername, heroData.displayName,
      heroData.heroClass, heroData.rarity, heroData.level, heroData.exp,
      heroData.stats.hp, heroData.stats.atk, heroData.stats.def,
      heroData.stats.spd, heroData.stats.crit, heroData.stats.critDmg,
      heroData.abilities,
    ]
  );

  return rowToHero(result.rows[0]);
}

/**
 * Ottieni l'eroe di un utente.
 */
export async function getHeroByUserId(twitchUserId: string): Promise<Hero | null> {
  const result = await query(
    'SELECT * FROM heroes WHERE twitch_user_id = $1',
    [twitchUserId]
  );
  if (result.rows.length === 0) return null;
  return rowToHero(result.rows[0]);
}

/**
 * Ottieni un eroe per ID.
 */
export async function getHeroById(heroId: string): Promise<Hero | null> {
  const result = await query(
    'SELECT * FROM heroes WHERE id = $1',
    [heroId]
  );
  if (result.rows.length === 0) return null;
  return rowToHero(result.rows[0]);
}

/**
 * Lista tutti gli eroi disponibili per la cattura (tutti gli opt-in).
 */
export async function listAvailableHeroes(
  page: number = 1,
  limit: number = 20,
  filterRarity?: Rarity,
  filterClass?: HeroClass
): Promise<{ heroes: Hero[]; total: number }> {
  let whereClause = 'WHERE 1=1';
  const params: any[] = [];

  if (filterRarity) {
    params.push(filterRarity);
    whereClause += ` AND rarity = $${params.length}`;
  }
  if (filterClass) {
    params.push(filterClass);
    whereClause += ` AND hero_class = $${params.length}`;
  }

  // Count totale
  const countResult = await query(
    `SELECT COUNT(*) FROM heroes ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Paginazione
  const offset = (page - 1) * limit;
  params.push(limit, offset);
  const result = await query(
    `SELECT * FROM heroes ${whereClause}
     ORDER BY rarity DESC, level DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return {
    heroes: result.rows.map(rowToHero),
    total,
  };
}

/**
 * Cattura un eroe: lo aggiunge al roster del giocatore.
 * Il giocatore sceglie a che rarità catturare (fino alla rarità dell'eroe).
 */
export async function captureHero(
  captorUserId: string,
  heroId: string,
  captureRarity?: Rarity
): Promise<{ success: boolean; message: string }> {
  // Prendi l'eroe
  const hero = await getHeroById(heroId);
  if (!hero) return { success: false, message: 'Eroe non trovato' };

  // Non puoi catturare te stesso
  if (hero.twitchUserId === captorUserId) {
    return { success: false, message: 'Non puoi catturare te stesso!' };
  }

  // Controlla se già catturato
  const existing = await query(
    'SELECT id FROM roster WHERE owner_user_id = $1 AND hero_id = $2',
    [captorUserId, heroId]
  );
  if (existing.rows.length > 0) {
    return { success: false, message: 'Hai già catturato questo eroe!' };
  }

  // Se non specificata, usa la rarità dell'eroe (backward compat)
  const chosenRarity = captureRarity || hero.rarity;

  // Valida che la rarità scelta non superi quella dell'eroe
  const heroRarityIdx = RARITY_ORDER.indexOf(hero.rarity);
  const chosenRarityIdx = RARITY_ORDER.indexOf(chosenRarity);
  if (chosenRarityIdx > heroRarityIdx) {
    return { success: false, message: 'Non puoi catturare a una rarità superiore a quella dell\'eroe!' };
  }
  if (chosenRarityIdx < 0) {
    return { success: false, message: 'Rarità non valida!' };
  }

  // Consuma energia in base alla rarità scelta
  const energyCost = CAPTURE_ENERGY_COST[chosenRarity];
  const hasEnergy = await consumeEnergy(captorUserId, energyCost);
  if (!hasEnergy) {
    return { success: false, message: `Energia insufficiente! Servono ${energyCost} energia.` };
  }

  // Aggiungi al roster con la rarità di cattura
  await query(
    'INSERT INTO roster (owner_user_id, hero_id, capture_rarity) VALUES ($1, $2, $3)',
    [captorUserId, heroId, chosenRarity]
  );

  // Punti classifica settimanale + missioni giornaliere
  try {
    const { addWeeklyPoints, POINTS } = await import('./weeklyService');
    await addWeeklyPoints(captorUserId, POINTS.CAPTURE, 'captures');
  } catch { /* */ }
  try {
    const { progressMission } = await import('./missionService');
    await progressMission(captorUserId, 'capture');
  } catch { /* */ }

  return { success: true, message: `Hai catturato ${hero.displayName}!` };
}

/**
 * Ottieni il roster di un giocatore.
 * Per ogni eroe catturato, usa la capture_rarity dal roster
 * e ricalcola le stats di conseguenza.
 */
export async function getRoster(userId: string): Promise<Hero[]> {
  const result = await query(
    `SELECT h.*, r.capture_rarity, r.id as roster_id FROM heroes h
     JOIN roster r ON r.hero_id = h.id
     WHERE r.owner_user_id = $1
     ORDER BY r.capture_rarity DESC, h.level DESC`,
    [userId]
  );
  return result.rows.map((row) => {
    const hero = rowToHero(row);
    // Sovrascrivi rarità e stats con la capture_rarity
    if (row.capture_rarity && row.capture_rarity !== row.rarity) {
      hero.rarity = row.capture_rarity;
      hero.stats = calculateStats(hero.heroClass, hero.rarity, hero.level);
    }
    return hero;
  });
}

/**
 * Upgrade della rarità di un eroe catturato nel roster.
 * Richiede Essenze Eroiche. La rarità massima è quella dell'eroe originale.
 */
export async function upgradeRosteredHero(
  userId: string,
  heroId: string
): Promise<{ success: boolean; message: string; hero?: Hero }> {
  // Trova la entry nel roster
  const rosterResult = await query(
    'SELECT r.*, h.rarity AS original_rarity, h.hero_class, h.level FROM roster r JOIN heroes h ON r.hero_id = h.id WHERE r.owner_user_id = $1 AND r.hero_id = $2',
    [userId, heroId]
  );
  if (rosterResult.rows.length === 0) {
    return { success: false, message: 'Eroe non trovato nel tuo roster!' };
  }

  const rosterEntry = rosterResult.rows[0];
  const currentRarity: Rarity = rosterEntry.capture_rarity;
  const originalRarity: Rarity = rosterEntry.original_rarity;

  // Trova la rarità successiva
  const currentIdx = RARITY_ORDER.indexOf(currentRarity);
  const originalIdx = RARITY_ORDER.indexOf(originalRarity);

  if (currentIdx < 0 || currentIdx >= RARITY_ORDER.length - 1) {
    return { success: false, message: 'Questo eroe è già alla rarità massima!' };
  }

  const nextRarity = RARITY_ORDER[currentIdx + 1];
  const nextIdx = currentIdx + 1;

  // Non può superare la rarità dell'eroe originale
  if (nextIdx > originalIdx) {
    return { success: false, message: 'Non puoi superare la rarità originale dell\'eroe!' };
  }

  // Controlla essenze
  const essenceCost = UPGRADE_ESSENCE_COST[nextRarity];
  const userResult = await query(
    'SELECT essences FROM users WHERE twitch_user_id = $1',
    [userId]
  );
  const userEssences = userResult.rows[0]?.essences || 0;
  if (userEssences < essenceCost) {
    return { success: false, message: `Essenze insufficienti! Servono ${essenceCost} Essenze Eroiche (ne hai ${userEssences}).` };
  }

  // Deduci essenze
  await query(
    'UPDATE users SET essences = essences - $1 WHERE twitch_user_id = $2',
    [essenceCost, userId]
  );

  // Aggiorna la rarità nel roster
  await query(
    'UPDATE roster SET capture_rarity = $1 WHERE owner_user_id = $2 AND hero_id = $3',
    [nextRarity, userId, heroId]
  );

  // Ritorna l'eroe aggiornato con le nuove stats
  const hero = await getHeroById(heroId);
  if (hero) {
    hero.rarity = nextRarity;
    hero.stats = calculateStats(hero.heroClass, nextRarity, hero.level);
  }

  return { success: true, message: `Rarità migliorata a ${nextRarity}!`, hero: hero || undefined };
}

/**
 * Aggiungi EXP a un eroe e gestisci il level up.
 */
export async function addExpToHero(
  heroId: string,
  expAmount: number
): Promise<{ leveled: boolean; newLevel: number }> {
  const hero = await getHeroById(heroId);
  if (!hero) return { leveled: false, newLevel: 0 };

  let totalExp = hero.exp + expAmount;
  let currentLevel = hero.level;
  let leveled = false;

  // Tenta level up multipli
  let result = tryLevelUp({
    level: currentLevel,
    exp: totalExp,
    heroClass: hero.heroClass,
    rarity: hero.rarity,
    abilities: hero.abilities,
  });

  while (result.leveled) {
    leveled = true;
    currentLevel = result.newLevel;
    totalExp = result.remainingExp;

    const stats = result.newStats!;
    const abilities = result.newAbilities || hero.abilities;

    await query(
      `UPDATE heroes SET level = $1, exp = $2,
       hp = $3, atk = $4, def = $5, spd = $6, crit = $7, crit_dmg = $8,
       ability_ids = $9, updated_at = NOW()
       WHERE id = $10`,
      [currentLevel, totalExp, stats.hp, stats.atk, stats.def, stats.spd,
       stats.crit, stats.critDmg, abilities, heroId]
    );

    // Continua a provare
    result = tryLevelUp({
      level: currentLevel,
      exp: totalExp,
      heroClass: hero.heroClass,
      rarity: hero.rarity,
      abilities,
    });
  }

  // Aggiorna solo l'exp se non c'è stato level up
  if (!leveled) {
    await query(
      'UPDATE heroes SET exp = $1, updated_at = NOW() WHERE id = $2',
      [totalExp, heroId]
    );
  }

  return { leveled, newLevel: currentLevel };
}

/**
 * Ricalcola rarità di un eroe basandosi sul nuovo activity score.
 */
export async function refreshHeroRarity(twitchUserId: string): Promise<Rarity | null> {
  const newScore = await refreshActivityScore(twitchUserId);
  const newRarity = scoreToRarity(newScore);

  const hero = await getHeroByUserId(twitchUserId);
  if (!hero) return null;

  if (hero.rarity !== newRarity) {
    const newStats = calculateStats(hero.heroClass, newRarity, hero.level);
    const newAbilities = selectAbilities(hero.heroClass, newRarity, hero.level, twitchUserId);

    await query(
      `UPDATE heroes SET rarity = $1,
       hp = $2, atk = $3, def = $4, spd = $5, crit = $6, crit_dmg = $7,
       ability_ids = $8, updated_at = NOW()
       WHERE twitch_user_id = $9`,
      [newRarity, newStats.hp, newStats.atk, newStats.def, newStats.spd,
       newStats.crit, newStats.critDmg, newAbilities, twitchUserId]
    );
  }

  return newRarity;
}

const REROLL_COST = 500;
const ALL_CLASSES: HeroClass[] = [
  HeroClass.GUARDIANO, HeroClass.LAMA, HeroClass.ARCANO, HeroClass.CUSTODE,
  HeroClass.OMBRA, HeroClass.RANGER, HeroClass.SCIAMANO, HeroClass.CRONO,
];

/**
 * Reroll della classe dell'eroe. Costa 500 gold, max 1 al giorno.
 * Il giocatore sceglie la nuova classe.
 */
export async function rerollHeroClass(
  twitchUserId: string,
  newClass: HeroClass
): Promise<Hero> {
  // Verifica che la classe sia valida
  if (!ALL_CLASSES.includes(newClass)) {
    throw new Error('Classe non valida!');
  }

  // Prendi l'eroe
  const hero = await getHeroByUserId(twitchUserId);
  if (!hero) throw new Error('Non hai un eroe!');

  if (hero.heroClass === newClass) {
    throw new Error('Hai gia questa classe!');
  }

  // Controlla gold
  const userResult = await query('SELECT gold FROM users WHERE twitch_user_id = $1', [twitchUserId]);
  const gold = userResult.rows[0]?.gold || 0;
  if (gold < REROLL_COST) {
    throw new Error(`Servono ${REROLL_COST} gold! Ne hai ${gold}.`);
  }

  // Ricalcola stats e abilita per la nuova classe
  const newStats = calculateStats(newClass, hero.rarity, hero.level);
  const newAbilities = selectAbilities(newClass, hero.rarity, hero.level, twitchUserId);

  // Applica
  await query('UPDATE users SET gold = gold - $1 WHERE twitch_user_id = $2', [REROLL_COST, twitchUserId]);
  await query(
    `UPDATE heroes SET hero_class = $1,
     hp = $2, atk = $3, def = $4, spd = $5, crit = $6, crit_dmg = $7,
     ability_ids = $8, updated_at = NOW()
     WHERE twitch_user_id = $9`,
    [newClass, newStats.hp, newStats.atk, newStats.def, newStats.spd,
     newStats.crit, newStats.critDmg, newAbilities, twitchUserId]
  );

  return (await getHeroByUserId(twitchUserId))!;
}

export { REROLL_COST };

// Helper
function rowToHero(row: any): Hero {
  return {
    id: row.id,
    twitchUserId: row.twitch_user_id,
    twitchUsername: row.twitch_username,
    displayName: row.display_name,
    heroClass: row.hero_class,
    rarity: row.rarity,
    level: row.level,
    exp: row.exp,
    stats: {
      hp: row.hp,
      atk: row.atk,
      def: row.def,
      spd: row.spd,
      crit: row.crit,
      critDmg: row.crit_dmg,
    },
    abilities: row.ability_ids || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
