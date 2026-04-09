import { query } from '../config/database';
import { addGold } from './userService';
import { addExpToHero } from './heroService';

// ============================================
// DAILY MISSIONS SYSTEM
// ============================================

export interface DailyMission {
  id: string;
  missionType: string;
  description: string;
  target: number;
  progress: number;
  rewardGold: number;
  rewardExp: number;
  claimed: boolean;
  completed: boolean;
}

// ============================================
// MISSION POOL
// ============================================

interface MissionTemplate {
  type: string;
  descriptionTemplate: string;
  targetMin: number;
  targetMax: number;
  goldMin: number;
  goldMax: number;
  expMin: number;
  expMax: number;
}

const MISSION_POOL: MissionTemplate[] = [
  {
    type: 'dungeon',
    descriptionTemplate: 'Completa {target} dungeon',
    targetMin: 1, targetMax: 3,
    goldMin: 30, goldMax: 80,
    expMin: 40, expMax: 100,
  },
  {
    type: 'pvp',
    descriptionTemplate: 'Vinci {target} combattimenti PVP',
    targetMin: 1, targetMax: 2,
    goldMin: 40, goldMax: 60,
    expMin: 50, expMax: 80,
  },
  {
    type: 'capture',
    descriptionTemplate: 'Cattura {target} eroi',
    targetMin: 1, targetMax: 2,
    goldMin: 25, goldMax: 50,
    expMin: 30, expMax: 60,
  },
  {
    type: 'raid',
    descriptionTemplate: 'Attacca il Raid Boss {target} volte',
    targetMin: 1, targetMax: 2,
    goldMin: 35, goldMax: 70,
    expMin: 45, expMax: 90,
  },
  {
    type: 'shop',
    descriptionTemplate: 'Compra {target} oggetti dal negozio',
    targetMin: 1, targetMax: 2,
    goldMin: 20, goldMax: 40,
    expMin: 25, expMax: 50,
  },
  {
    type: 'equip',
    descriptionTemplate: 'Equipaggia {target} oggetti',
    targetMin: 1, targetMax: 2,
    goldMin: 20, goldMax: 35,
    expMin: 20, expMax: 40,
  },
];

// ============================================
// HELPERS
// ============================================

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Scala la reward in base al target scelto rispetto al range */
function scaleReward(value: number, min: number, max: number, targetMin: number, targetMax: number, target: number): number {
  if (targetMax === targetMin) return randInt(min, max);
  const ratio = (target - targetMin) / (targetMax - targetMin);
  const scaled = Math.round(min + ratio * (max - min));
  return scaled;
}

function pickRandomMissions(count: number): MissionTemplate[] {
  const shuffled = [...MISSION_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function rowToMission(r: any): DailyMission {
  return {
    id: r.id,
    missionType: r.mission_type,
    description: r.description,
    target: r.target,
    progress: r.progress,
    rewardGold: r.reward_gold,
    rewardExp: r.reward_exp,
    claimed: r.claimed,
    completed: r.completed_at !== null,
  };
}

// ============================================
// SERVICE FUNCTIONS
// ============================================

/**
 * Restituisce le 3 missioni giornaliere dell'utente.
 * Se non esistono per oggi, ne genera 3 nuove dal pool.
 */
export async function getDailyMissions(userId: string): Promise<DailyMission[]> {
  // Controlla se esistono missioni per oggi
  const existing = await query(
    `SELECT * FROM daily_missions
     WHERE user_id = $1 AND created_at::date = CURRENT_DATE
     ORDER BY id`,
    [userId]
  );

  if (existing.rows.length > 0) {
    return existing.rows.map(rowToMission);
  }

  // Genera 3 nuove missioni
  const templates = pickRandomMissions(3);
  const missions: DailyMission[] = [];

  for (const tpl of templates) {
    const target = randInt(tpl.targetMin, tpl.targetMax);
    const rewardGold = scaleReward(target, tpl.goldMin, tpl.goldMax, tpl.targetMin, tpl.targetMax, target);
    const rewardExp = scaleReward(target, tpl.expMin, tpl.expMax, tpl.targetMin, tpl.targetMax, target);
    const description = tpl.descriptionTemplate.replace('{target}', target.toString());

    const result = await query(
      `INSERT INTO daily_missions (user_id, mission_type, description, target, progress, reward_gold, reward_exp, claimed)
       VALUES ($1, $2, $3, $4, 0, $5, $6, false)
       RETURNING *`,
      [userId, tpl.type, description, target, rewardGold, rewardExp]
    );

    missions.push(rowToMission(result.rows[0]));
  }

  return missions;
}

/**
 * Incrementa il progresso di 1 per la missione del tipo specificato (oggi).
 * Se progress >= target, segna come completata.
 * Ritorna la missione aggiornata o null se non trovata.
 */
export async function progressMission(userId: string, missionType: string): Promise<DailyMission | null> {
  // Trova la missione di oggi per questo tipo
  const missionResult = await query(
    `SELECT * FROM daily_missions
     WHERE user_id = $1 AND mission_type = $2 AND created_at::date = CURRENT_DATE
     LIMIT 1`,
    [userId, missionType]
  );

  if (missionResult.rows.length === 0) return null;

  const mission = missionResult.rows[0];
  const newProgress = mission.progress + 1;

  // Aggiorna progresso
  let updated;
  if (newProgress >= mission.target && mission.completed_at === null) {
    // Completa la missione
    updated = await query(
      `UPDATE daily_missions SET progress = $1, completed_at = NOW()
       WHERE id = $2 RETURNING *`,
      [newProgress, mission.id]
    );
  } else {
    updated = await query(
      `UPDATE daily_missions SET progress = $1
       WHERE id = $2 RETURNING *`,
      [newProgress, mission.id]
    );
  }

  return rowToMission(updated.rows[0]);
}

/**
 * Riscuoti i premi di una missione completata.
 * Controlla: appartiene all'utente, completata, non ancora riscossa.
 * Assegna gold e exp a tutti gli eroi dell'utente.
 */
export async function claimMission(
  userId: string,
  missionId: string
): Promise<{ gold: number; exp: number }> {
  // Recupera la missione
  const result = await query(
    'SELECT * FROM daily_missions WHERE id = $1',
    [missionId]
  );

  if (result.rows.length === 0) {
    throw new Error('Missione non trovata');
  }

  const mission = result.rows[0];

  if (mission.user_id !== userId) {
    throw new Error('Questa missione non appartiene a te');
  }

  if (mission.completed_at === null) {
    throw new Error('Missione non ancora completata');
  }

  if (mission.claimed) {
    throw new Error('Ricompensa gia riscossa');
  }

  // Segna come riscossa
  await query(
    'UPDATE daily_missions SET claimed = true WHERE id = $1',
    [missionId]
  );

  // Assegna gold
  await addGold(userId, mission.reward_gold);

  // Assegna exp a tutti gli eroi dell'utente
  const heroesResult = await query(
    'SELECT id FROM heroes WHERE twitch_user_id = $1',
    [userId]
  );

  for (const hero of heroesResult.rows) {
    await addExpToHero(hero.id, mission.reward_exp);
  }

  return { gold: mission.reward_gold, exp: mission.reward_exp };
}
