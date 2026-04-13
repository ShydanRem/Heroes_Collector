import { query } from '../config/database';
import { runBattle, createFighter, BattleLogEntry, applySynergies, applyTalentBonuses } from './battleEngine';
import { getActiveParty, getPartyHeroes } from './partyService';
import { addExpToHero } from './heroService';
import { addGold, addEssences } from './userService';
import { addWeeklyPoints, POINTS } from './weeklyService';
import { giveItem } from './itemService';
import { ITEMS } from '../data/items';
import { Rarity } from '../types';
import { getTalentStatBonuses, getTalentSpecialEffects } from './talentService';

// ============================================
// RAID BOSS TEMPLATES
// ============================================

interface RaidBossTemplate {
  name: string;
  emoji: string;
  hpMultiplier: number; // base HP * numero giocatori attivi * multiplier
  atk: number;
  def: number;
  spd: number;
  crit: number;
  critDmg: number;
  abilities: string[];
  lootPool: string[]; // item IDs speciali
}

const RAID_BOSSES: RaidBossTemplate[] = [
  {
    name: 'Idra delle Profondita',
    emoji: '🐍',
    hpMultiplier: 800,
    atk: 85, def: 40, spd: 35, crit: 15, critDmg: 170,
    abilities: ['atk_tempesta_arcana', 'atk_nube_tossica', 'deb_aoe_curse', 'sup_totem_guarigione'],
    lootPool: ['w_excalibur', 'a_armatura_void', 'acc_occhio_dio'],
  },
  {
    name: 'Titano di Cenere',
    emoji: '🌋',
    hpMultiplier: 1000,
    atk: 100, def: 60, spd: 20, crit: 8, critDmg: 200,
    abilities: ['atk_onda_urto', 'atk_turbine', 'deb_stordimento', 'def_scudo'],
    lootPool: ['w_falce_morte', 'a_egida_divina', 'acc_cuore_fenice'],
  },
  {
    name: 'Signore del Vuoto',
    emoji: '🕳️',
    hpMultiplier: 900,
    atk: 90, def: 30, spd: 50, crit: 25, critDmg: 185,
    abilities: ['atk_paradosso', 'atk_lame_ombra', 'deb_aoe_slow', 'deb_silenzio'],
    lootPool: ['w_arco_stelle', 'a_corazza_drago', 'acc_corona_saggia'],
  },
  {
    name: 'Fenice Oscura',
    emoji: '🔥',
    hpMultiplier: 850,
    atk: 95, def: 35, spd: 45, crit: 20, critDmg: 175,
    abilities: ['atk_tempesta_arcana', 'atk_pioggia_frecce', 'deb_bruciatura', 'sup_cura_party'],
    lootPool: ['w_bastone_eterno', 'w_lama_fiamma', 'acc_cuore_fenice'],
  },
];

// ============================================
// GESTIONE RAID
// ============================================

export interface RaidInfo {
  id: string;
  name: string;
  emoji: string;
  maxHp: number;
  currentHp: number;
  hpPercent: number;
  defeated: boolean;
  weekNumber: number;
  totalContributors: number;
  topContributors: RaidContributor[];
  myContribution?: RaidContributor;
}

export interface RaidContributor {
  userId: string;
  displayName: string;
  damageDealt: number;
  attempts: number;
  bestDamage: number;
}

interface PartyHeroData {
  id: string;
  name: string;
  heroClass: string;
  rarity: string;
  maxHp: number;
}

export interface RaidAttackResult {
  damageDealt: number;
  log: BattleLogEntry[];
  totalTurns: number;
  bossHpBefore: number;
  bossHpAfter: number;
  bossDefeated: boolean;
  rewards: {
    exp: number;
    gold: number;
    items: string[];
  };
  partyHeroes: PartyHeroData[];
  boss: { id: string; name: string; emoji: string; maxHp: number };
}

/**
 * Ottieni o crea il raid boss della settimana corrente.
 */
export async function getCurrentRaid(): Promise<RaidInfo | null> {
  const weekNumber = getWeekNumber();

  // Cerca raid attivo
  let result = await query(
    'SELECT * FROM raid_boss WHERE week_number = $1 AND season = 1 ORDER BY created_at DESC LIMIT 1',
    [weekNumber]
  );

  // Se non esiste, crealo
  if (result.rows.length === 0) {
    await spawnWeeklyBoss(weekNumber);
    result = await query(
      'SELECT * FROM raid_boss WHERE week_number = $1 AND season = 1 ORDER BY created_at DESC LIMIT 1',
      [weekNumber]
    );
  }

  if (result.rows.length === 0) return null;

  const boss = result.rows[0];

  // Contributori
  const contribResult = await query(
    `SELECT rc.*, u.display_name
     FROM raid_contributions rc
     JOIN users u ON u.twitch_user_id = rc.user_id
     WHERE rc.raid_id = $1
     ORDER BY rc.damage_dealt DESC
     LIMIT 10`,
    [boss.id]
  );

  const totalContrib = await query(
    'SELECT COUNT(*) FROM raid_contributions WHERE raid_id = $1',
    [boss.id]
  );

  return {
    id: boss.id,
    name: boss.name,
    emoji: boss.emoji,
    maxHp: parseInt(boss.max_hp, 10),
    currentHp: Math.max(0, parseInt(boss.current_hp, 10)),
    hpPercent: Math.max(0, Math.round((parseInt(boss.current_hp, 10) / parseInt(boss.max_hp, 10)) * 100)),
    defeated: boss.defeated,
    weekNumber: boss.week_number,
    totalContributors: parseInt(totalContrib.rows[0].count, 10),
    topContributors: contribResult.rows.map(r => ({
      userId: r.user_id,
      displayName: r.display_name,
      damageDealt: parseInt(r.damage_dealt, 10),
      attempts: r.attempts,
      bestDamage: parseInt(r.best_damage, 10),
    })),
  };
}

/**
 * Ottieni info raid con la contribuzione dell'utente.
 */
export async function getRaidWithContribution(userId: string): Promise<RaidInfo | null> {
  const raid = await getCurrentRaid();
  if (!raid) return null;

  const myContrib = await query(
    'SELECT * FROM raid_contributions WHERE raid_id = $1 AND user_id = $2',
    [raid.id, userId]
  );

  if (myContrib.rows.length > 0) {
    const r = myContrib.rows[0];
    raid.myContribution = {
      userId: r.user_id,
      displayName: '',
      damageDealt: parseInt(r.damage_dealt, 10),
      attempts: r.attempts,
      bestDamage: parseInt(r.best_damage, 10),
    };
  }

  return raid;
}

/**
 * Attacca il raid boss con il party attivo.
 */
const MAX_RAID_ATTEMPTS_PER_DAY = 5;

export async function attackRaid(userId: string): Promise<RaidAttackResult> {
  const raid = await getCurrentRaid();
  if (!raid) throw new Error('Nessun raid boss attivo questa settimana!');
  if (raid.defeated) throw new Error('Il raid boss e gia stato sconfitto! Aspetta la prossima settimana.');

  // Limite tentativi giornalieri
  try {
    await query('ALTER TABLE raid_contributions ADD COLUMN IF NOT EXISTS daily_attempts INTEGER DEFAULT 0');
    await query('ALTER TABLE raid_contributions ADD COLUMN IF NOT EXISTS last_attempt_date DATE');
  } catch { /* */ }

  const contribCheck = await query(
    `SELECT daily_attempts, last_attempt_date FROM raid_contributions
     WHERE raid_id = $1 AND user_id = $2`,
    [raid.id, userId]
  );
  if (contribCheck.rows.length > 0) {
    const c = contribCheck.rows[0];
    const isToday = c.last_attempt_date &&
      new Date(c.last_attempt_date).toISOString().split('T')[0] ===
      new Date().toISOString().split('T')[0];
    if (isToday && (c.daily_attempts || 0) >= MAX_RAID_ATTEMPTS_PER_DAY) {
      throw new Error(`Hai raggiunto il limite di ${MAX_RAID_ATTEMPTS_PER_DAY} tentativi raid oggi! Riprova domani.`);
    }
  }

  // Party attivo
  const party = await getActiveParty(userId);
  if (!party || party.heroIds.length === 0) {
    throw new Error('Devi avere un party attivo con almeno un eroe!');
  }

  const heroRows = await getPartyHeroes(party.id);
  if (heroRows.length === 0) throw new Error('Party vuoto!');

  // Crea fighter del party
  const partyFighters = heroRows.map((h: any) => createFighter(h, 'attacker'));

  // Applica talenti
  let talentEffects = new Set<string>();
  try {
    const talentBonuses = await getTalentStatBonuses(userId);
    talentEffects = await getTalentSpecialEffects(userId);
    for (const f of partyFighters) applyTalentBonuses(f, talentBonuses);
  } catch { /* */ }

  // Carica stats del boss dal DB
  const bossRow = await query('SELECT * FROM raid_boss WHERE id = $1', [raid.id]);
  const b = bossRow.rows[0];

  // Cap HP dinamico: 10% del max_hp del boss, min 3000, max 10000
  const bossMaxHp = b ? parseInt(b.max_hp, 10) : 50000;
  const hpCap = Math.max(3000, Math.min(10000, Math.floor(bossMaxHp * 0.1)));
  const combatHp = Math.min(raid.currentHp, hpCap);

  // Crea fighter del boss con stats corrette dal DB
  const bossFighter = createFighter({
    id: `raid_boss_${raid.id}`,
    display_name: `${raid.emoji} ${raid.name}`,
    hero_class: 'arcano',
    hp: combatHp,
    atk: b?.atk || 50,
    def: b?.def || 50,
    spd: b?.spd || 30,
    crit: b?.crit || 15,
    crit_dmg: b?.crit_dmg || 170,
    ability_ids: b?.ability_ids || ['atk_tempesta_arcana', 'atk_nube_tossica', 'deb_aoe_curse'],
  }, 'defender');

  // Applica sinergie party
  applySynergies(partyFighters);

  // Combatti
  const outcome = runBattle(partyFighters, [bossFighter], { talentEffects });

  // Calcola danno inflitto al boss
  const damageDealt = bossFighter.maxHp - Math.max(0, bossFighter.currentHp);
  const bossHpBefore = raid.currentHp;
  const bossHpAfter = Math.max(0, raid.currentHp - damageDealt);
  const bossDefeated = bossHpAfter <= 0;

  // Aggiorna HP del boss
  await query(
    `UPDATE raid_boss SET
       current_hp = GREATEST(0, current_hp - $1),
       defeated = $2,
       defeated_at = CASE WHEN $2 THEN NOW() ELSE defeated_at END
     WHERE id = $3`,
    [damageDealt, bossDefeated, raid.id]
  );

  // Aggiorna contribuzione
  await query(
    `INSERT INTO raid_contributions (raid_id, user_id, damage_dealt, attempts, best_damage, last_attempt, daily_attempts, last_attempt_date)
     VALUES ($1, $2, $3, 1, $3, NOW(), 1, CURRENT_DATE)
     ON CONFLICT (raid_id, user_id)
     DO UPDATE SET
       damage_dealt = raid_contributions.damage_dealt + $3,
       attempts = raid_contributions.attempts + 1,
       best_damage = GREATEST(raid_contributions.best_damage, $3),
       last_attempt = NOW(),
       daily_attempts = CASE
         WHEN raid_contributions.last_attempt_date = CURRENT_DATE
         THEN COALESCE(raid_contributions.daily_attempts, 0) + 1
         ELSE 1
       END,
       last_attempt_date = CURRENT_DATE`,
    [raid.id, userId, damageDealt]
  );

  // Rewards basati sul danno
  const expReward = Math.floor(damageDealt * 0.5) + 30;
  const goldReward = Math.floor(damageDealt * 0.1) + 10;
  const droppedItems: string[] = [];

  for (const heroRow of heroRows) {
    await addExpToHero(heroRow.id, expReward);
  }
  await addGold(userId, goldReward);

  // Essenze: 2-5 per attacco raid, bonus se uccidi il boss
  const essenceReward = Math.floor(1 + Math.random() * 2) + (bossDefeated ? 5 : 0);
  await addEssences(userId, essenceReward);

  // Punti classifica settimanale + missioni giornaliere
  try { await addWeeklyPoints(userId, POINTS.RAID_ATTACK, 'raid_damage'); } catch { /* */ }
  try { const { progressMission } = await import('./missionService'); await progressMission(userId, 'raid'); } catch { /* */ }
  try {
    const { checkProgressAchievements, checkAndUnlock } = await import('./achievementService');
    await checkProgressAchievements(userId);
    if (bossDefeated) await checkAndUnlock(userId, 'raid_slayer');
  } catch { /* */ }

  // Loot bonus se il boss e stato sconfitto
  if (bossDefeated) {
    // Chi lo uccide: item leggendario garantito
    const legendaryItems = ITEMS.filter(i => i.rarity === Rarity.LEGGENDARIO);
    if (legendaryItems.length > 0) {
      const drop = legendaryItems[Math.floor(Math.random() * legendaryItems.length)];
      await giveItem(userId, drop.id);
      droppedItems.push(drop.name);
    }
  } else {
    // Drop normale: chance epico/raro
    if (Math.random() < 0.15) {
      const rareItems = ITEMS.filter(i => i.rarity === Rarity.RARO || i.rarity === Rarity.MOLTO_RARO);
      if (rareItems.length > 0) {
        const drop = rareItems[Math.floor(Math.random() * rareItems.length)];
        await giveItem(userId, drop.id);
        droppedItems.push(drop.name);
      }
    }
  }

  return {
    damageDealt,
    log: outcome.log,
    totalTurns: outcome.totalTurns,
    bossHpBefore,
    bossHpAfter,
    bossDefeated,
    rewards: { exp: expReward, gold: goldReward, items: droppedItems },
    partyHeroes: partyFighters.map(f => ({
      id: f.id, name: f.name, heroClass: f.heroClass,
      rarity: (heroRows.find((h: any) => h.id === f.id) as any)?.rarity || 'comune',
      maxHp: f.maxHp,
    })),
    boss: { id: bossFighter.id, name: bossFighter.name, emoji: raid.emoji, maxHp: bossFighter.maxHp },
  };
}

/**
 * Genera il boss settimanale.
 */
async function spawnWeeklyBoss(weekNumber: number): Promise<void> {
  const template = RAID_BOSSES[weekNumber % RAID_BOSSES.length];

  // Conta giocatori attivi per scalare HP
  const playerCount = await query(
    'SELECT COUNT(*) FROM users WHERE opted_in = TRUE'
  );
  const activePlayers = Math.max(5, parseInt(playerCount.rows[0].count, 10));

  const maxHp = template.hpMultiplier * activePlayers;

  await query(
    `INSERT INTO raid_boss (name, emoji, max_hp, current_hp, atk, def, spd, crit, crit_dmg, ability_ids, week_number)
     VALUES ($1, $2, $3, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      template.name, template.emoji, maxHp,
      template.atk, template.def, template.spd,
      template.crit, template.critDmg, template.abilities,
      weekNumber,
    ]
  );
}

function getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
}

/**
 * Classifica contributori del raid corrente.
 */
export async function getRaidLeaderboard(raidId: string): Promise<RaidContributor[]> {
  const result = await query(
    `SELECT rc.*, u.display_name
     FROM raid_contributions rc
     JOIN users u ON u.twitch_user_id = rc.user_id
     WHERE rc.raid_id = $1
     ORDER BY rc.damage_dealt DESC
     LIMIT 20`,
    [raidId]
  );

  return result.rows.map(r => ({
    userId: r.user_id,
    displayName: r.display_name,
    damageDealt: parseInt(r.damage_dealt, 10),
    attempts: r.attempts,
    bestDamage: parseInt(r.best_damage, 10),
  }));
}
