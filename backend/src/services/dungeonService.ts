import { query } from '../config/database';
import { runBattle, createFighter, BattleLogEntry, BattleOutcome, applySynergies, ActiveSynergy } from './battleEngine';
import { generateWaveMonsters } from '../data/monsters';
import { getPartyHeroes, getActiveParty } from './partyService';
import { addExpToHero } from './heroService';
import { addGold, addEssences, consumeEnergy } from './userService';
import { addWeeklyPoints, POINTS } from './weeklyService';
import { rollLoot, ITEM_MAP } from '../data/items';
import { giveItem } from './itemService';
import { rollModifier, DungeonModifier } from '../data/dungeonModifiers';
import { ZONE_MAP, ZONES, isZoneUnlocked } from '../data/zones';

// ============================================
// RISULTATO DUNGEON COMPLETO
// ============================================

export interface DungeonResult {
  battleId: string;
  won: boolean;
  wavesCompleted: number;
  totalWaves: number;
  waveResults: WaveResult[];
  rewards: {
    exp: number;
    gold: number;
    essences: number;
    items: string[];
  };
  partyHeroes: PartyHeroData[];
  modifier: { id: string; name: string; emoji: string; description: string; difficulty: string } | null;
  synergies: ActiveSynergy[];
  zoneId: string;
  zoneName: string;
  zoneEmoji: string;
  isReplay: boolean;
  zoneCleared: boolean;
  nextZoneUnlocked?: string;
}

interface PartyHeroData {
  id: string;
  name: string;
  heroClass: string;
  rarity: string;
  maxHp: number;
}

interface WaveResult {
  wave: number;
  won: boolean;
  log: BattleLogEntry[];
  enemies: { name: string; tier: string; id: string; maxHp: number; displayName: string }[];
  totalTurns: number;
  heroHpStart: { id: string; currentHp: number; maxHp: number }[];
}

// ============================================
// DUNGEON PVE (ZONE-BASED)
// ============================================

/**
 * Avvia un dungeon completo per l'utente nella zona specificata.
 * Utilizza il party attivo, combatte le ondate della zona in sequenza.
 * Gli eroi conservano HP tra le ondate (regen parziale).
 */
export async function runDungeon(userId: string, zoneId: string = 'forest'): Promise<DungeonResult> {
  // Valida la zona
  const zone = ZONE_MAP.get(zoneId);
  if (!zone) throw new Error('Zona non trovata!');

  // Controlla che la zona sia sbloccata per l'utente
  let maxUnlocked = 'forest';
  try {
    const userRow = await query('SELECT max_zone_unlocked FROM users WHERE twitch_user_id = $1', [userId]);
    maxUnlocked = userRow.rows[0]?.max_zone_unlocked || 'forest';
  } catch { /* colonna non esiste ancora — default forest */ }
  if (!isZoneUnlocked(maxUnlocked, zoneId)) {
    throw new Error('Questa zona non e ancora sbloccata!');
  }

  // Controlla se la zona e gia stata completata (farm mode)
  let isReplay = false;
  try {
    const progressRow = await query(
      'SELECT cleared FROM zone_progress WHERE user_id = $1 AND zone_id = $2',
      [userId, zoneId]
    );
    isReplay = progressRow.rows[0]?.cleared || false;
  } catch { /* tabella non esiste ancora */ }

  // Prendi il party attivo
  const party = await getActiveParty(userId);
  if (!party) {
    throw new Error('Devi avere un party attivo per entrare nel dungeon!');
  }
  if (party.heroIds.length === 0) {
    throw new Error('Il tuo party e vuoto! Aggiungi almeno un eroe.');
  }

  // Costo energia per entrare (10 base + 5 per ordine zona)
  const dungeonEnergyCost = 10 + (zone.order - 1) * 5;
  const hasEnergy = await consumeEnergy(userId, dungeonEnergyCost);
  if (!hasEnergy) {
    throw new Error(`Energia insufficiente! Servono ${dungeonEnergyCost} energia per questa zona.`);
  }

  // Prendi gli eroi del party
  const heroRows = await getPartyHeroes(party.id);
  if (heroRows.length === 0) {
    throw new Error('Nessun eroe trovato nel party.');
  }

  // Calcola livello medio del party per scalare il dungeon
  const avgLevel = Math.floor(heroRows.reduce((sum: number, h: any) => sum + h.level, 0) / heroRows.length);

  // Crea i fighter (persistono tra le ondate)
  const partyFighters = heroRows.map((h: any) => createFighter(h, 'attacker'));

  // Rolla un modificatore per questa run
  const modifier = rollModifier();

  // Applica sinergie e modificatore agli eroi del party
  const activeSynergies = applySynergies(partyFighters);
  modifier.apply(partyFighters, 'attacker');

  // Salva i dati degli eroi per il frontend (dopo sinergie e modificatore)
  const partyHeroes: PartyHeroData[] = partyFighters.map(f => ({
    id: f.id,
    name: f.name,
    heroClass: f.heroClass,
    rarity: (heroRows.find((h: any) => h.id === f.id) as any)?.rarity || 'comune',
    maxHp: f.maxHp,
  }));

  const waveResults: WaveResult[] = [];
  let wavesCompleted = 0;
  let totalExpReward = 0;
  let totalGoldReward = 0;
  const droppedItems: string[] = [];

  for (let wave = 1; wave <= zone.totalWaves; wave++) {
    // Genera mostri per l'ondata (zone-aware)
    const monsters = generateWaveMonsters(zoneId, wave, avgLevel);
    const monsterFighters = monsters.map((m: any) => createFighter(m, 'defender'));

    // Applica modificatore ai mostri
    modifier.apply(monsterFighters, 'defender');

    // Regen parziale tra le ondate (20% HP recuperato)
    if (wave > 1) {
      for (const fighter of partyFighters) {
        if (fighter.isAlive) {
          fighter.currentHp = Math.min(
            fighter.maxHp,
            fighter.currentHp + Math.floor(fighter.maxHp * 0.2)
          );
        }
        // Reset cooldown parziale
        for (const [abilityId] of fighter.cooldowns) {
          fighter.cooldowns.set(abilityId, Math.max(0, (fighter.cooldowns.get(abilityId) || 0) - 1));
        }
        // Rimuovi status effects
        fighter.statusEffects = [];
      }
    }

    // Salva HP eroi all'inizio di questa ondata
    const heroHpStart = partyFighters.map(f => ({
      id: f.id,
      currentHp: f.currentHp,
      maxHp: f.maxHp,
    }));

    // Controlla che ci sia almeno un eroe vivo
    if (!partyFighters.some(f => f.isAlive)) break;

    // Combatti! Passiamo l'array completo (non filtrato) cosi checkBattleEnd
    // puo rilevare le morti in combattimento. resetHp: false mantiene gli HP del party.
    const outcome = runBattle(
      partyFighters,
      monsterFighters,
      { resetHp: false, vampirismo: modifier?.id === 'vampirismo' }
    );

    waveResults.push({
      wave,
      won: outcome.won,
      log: outcome.log,
      enemies: monsters.map((m: any) => ({
        name: m.name,
        tier: m.tier,
        id: m.id,
        maxHp: m.hp,
        displayName: m.display_name || m.name,
      })),
      totalTurns: outcome.totalTurns,
      heroHpStart,
    });

    if (outcome.won) {
      wavesCompleted = wave;

      // Reward per ondata (scalati per zona)
      const waveExp = calculateWaveExp(wave, avgLevel) * zone.rewardMultiplier;
      const waveGold = calculateWaveGold(wave, avgLevel) * zone.rewardMultiplier;
      totalExpReward += Math.floor(waveExp);
      totalGoldReward += Math.floor(waveGold);

      // Loot drop!
      const droppedItemIds = rollLoot(wave, false);
      for (const itemId of droppedItemIds) {
        await giveItem(userId, itemId);
        const item = ITEM_MAP.get(itemId);
        if (item) droppedItems.push(item.name);
      }
    } else {
      // Sconfitta: il dungeon finisce qui
      break;
    }
  }

  const won = wavesCompleted === zone.totalWaves;

  // Bonus completamento dungeon
  if (won) {
    totalExpReward = Math.floor(totalExpReward * 1.5);
    totalGoldReward = Math.floor(totalGoldReward * 1.5);

    // Loot bonus completamento (chance leggendari)
    const bonusDrops = rollLoot(zone.totalWaves, true);
    for (const itemId of bonusDrops) {
      await giveItem(userId, itemId);
      const item = ITEM_MAP.get(itemId);
      if (item) droppedItems.push(item.name);
    }
  }

  // Farm mode: riduzione reward se zona gia completata
  if (isReplay) {
    totalExpReward = Math.floor(totalExpReward * 0.8);
    totalGoldReward = Math.floor(totalGoldReward * 0.8);
  }

  // Applica moltiplicatori del modificatore ai reward
  totalExpReward = Math.floor(totalExpReward * modifier.expMultiplier);
  totalGoldReward = Math.floor(totalGoldReward * modifier.goldMultiplier);

  // Distribuisci reward
  for (const heroRow of heroRows) {
    await addExpToHero(heroRow.id, totalExpReward);
  }
  await addGold(userId, totalGoldReward);

  // Essenze Eroiche: 1-3 per zona completata, scale con la zona
  const essenceReward = won ? Math.min(3, Math.floor(1 + zone.order * 0.3 + Math.random())) : 0;
  if (essenceReward > 0) {
    await addEssences(userId, essenceReward);
  }

  // Punti classifica settimanale + missioni giornaliere + achievement
  if (won) {
    try { await addWeeklyPoints(userId, POINTS.DUNGEON_CLEAR, 'dungeons_cleared'); } catch { /* */ }
    try { const { progressMission } = await import('./missionService'); await progressMission(userId, 'dungeon'); } catch { /* */ }
    try {
      const { checkProgressAchievements, checkAndUnlock } = await import('./achievementService');
      await checkProgressAchievements(userId);
      // Impeccabile: nessun eroe morto durante tutto il dungeon
      const allSurvived = waveResults.every(w => w.heroHpStart?.every((h: any) => h.currentHp > 0) !== false);
      if (allSurvived) await checkAndUnlock(userId, 'flawless');
    } catch { /* */ }
  }

  // Gestisci progressi zona
  let nextZoneUnlocked: string | undefined;

  try {
    if (won) {
      // Aggiorna/crea zone_progress
      await query(
        `INSERT INTO zone_progress (user_id, zone_id, cleared, best_waves, total_clears, first_cleared_at)
         VALUES ($1, $2, TRUE, $3, 1, NOW())
         ON CONFLICT (user_id, zone_id)
         DO UPDATE SET cleared = TRUE, best_waves = GREATEST(zone_progress.best_waves, $3),
           total_clears = zone_progress.total_clears + 1, updated_at = NOW(),
           first_cleared_at = COALESCE(zone_progress.first_cleared_at, NOW())`,
        [userId, zoneId, zone.totalWaves]
      );

      // Sblocca zona successiva
      if (zone.nextZoneId) {
        const currentMaxOrder = ZONES.findIndex(z => z.id === maxUnlocked);
        const nextZone = ZONE_MAP.get(zone.nextZoneId);
        if (nextZone && nextZone.order > currentMaxOrder) {
          await query('UPDATE users SET max_zone_unlocked = $1 WHERE twitch_user_id = $2', [zone.nextZoneId, userId]);
          nextZoneUnlocked = zone.nextZoneId;
        }
      }
    } else if (wavesCompleted > 0) {
      // Salva best waves anche in caso di sconfitta
      await query(
        `INSERT INTO zone_progress (user_id, zone_id, best_waves)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, zone_id)
         DO UPDATE SET best_waves = GREATEST(zone_progress.best_waves, $3), updated_at = NOW()`,
        [userId, zoneId, wavesCompleted]
      );
    }
  } catch (err) {
    // Se le tabelle zone non esistono ancora, il dungeon funziona comunque
    console.warn('Zone progress non salvato (tabella mancante?):', err);
  }

  // Salva la battaglia nel DB
  const logJson = JSON.stringify(waveResults.map(w => ({
    wave: w.wave, won: w.won, enemies: w.enemies, turns: w.totalTurns, logLength: w.log.length,
  })));
  const rewardJson = JSON.stringify({ exp: totalExpReward, gold: totalGoldReward, items: droppedItems });

  let battleResult;
  try {
    battleResult = await query(
      `INSERT INTO battles (battle_type, status, attacker_user_id, attacker_party, winner_user_id, zone_id, battle_log, rewards, completed_at)
       VALUES ('pve', 'completed', $1, $2, $3, $4, $5, $6, NOW()) RETURNING id`,
      [userId, party.id, won ? userId : null, zoneId, logJson, rewardJson]
    );
  } catch {
    // Fallback senza zone_id se la colonna non esiste ancora
    battleResult = await query(
      `INSERT INTO battles (battle_type, status, attacker_user_id, attacker_party, winner_user_id, battle_log, rewards, completed_at)
       VALUES ('pve', 'completed', $1, $2, $3, $4, $5, NOW()) RETURNING id`,
      [userId, party.id, won ? userId : null, logJson, rewardJson]
    );
  }

  return {
    battleId: battleResult.rows[0].id,
    won,
    wavesCompleted,
    totalWaves: zone.totalWaves,
    waveResults,
    rewards: {
      exp: totalExpReward,
      gold: totalGoldReward,
      essences: essenceReward,
      items: droppedItems,
    },
    partyHeroes,
    modifier: {
      id: modifier.id,
      name: modifier.name,
      emoji: modifier.emoji,
      description: modifier.description,
      difficulty: modifier.difficulty,
    },
    synergies: activeSynergies,
    zoneId: zone.id,
    zoneName: zone.name,
    zoneEmoji: zone.emoji,
    isReplay,
    zoneCleared: won,
    nextZoneUnlocked,
  };
}

/**
 * EXP per ondata: cresce esponenzialmente.
 */
function calculateWaveExp(wave: number, avgLevel: number): number {
  const baseExp = 20 + avgLevel * 5;
  const waveMultiplier = 1 + (wave - 1) * 0.4;
  return Math.floor(baseExp * waveMultiplier);
}

/**
 * Gold per ondata.
 */
function calculateWaveGold(wave: number, avgLevel: number): number {
  const baseGold = 10 + avgLevel * 2;
  const waveMultiplier = 1 + (wave - 1) * 0.25;
  return Math.floor(baseGold * waveMultiplier);
}

/**
 * Storico battaglie dell'utente.
 */
export async function getBattleHistory(userId: string, limit: number = 10): Promise<any[]> {
  const result = await query(
    `SELECT id, battle_type, winner_user_id, rewards, zone_id, created_at, completed_at
     FROM battles
     WHERE attacker_user_id = $1 OR defender_user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );

  return result.rows.map(row => ({
    id: row.id,
    type: row.battle_type,
    won: row.winner_user_id === userId,
    rewards: row.rewards,
    zoneId: row.zone_id,
    date: row.completed_at || row.created_at,
  }));
}
