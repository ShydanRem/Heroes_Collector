import {
  Hero, HeroClass, HeroStats, Rarity,
  RARITY_ORDER, RARITY_MULTIPLIERS,
  EXP_BASE, MAX_LEVEL,
} from '../types';
import { CLASS_BASE_STATS, CLASS_GROWTH } from '../data/classes';
import { getAvailableAbilities } from '../data/abilities';
import { AbilityType } from '../types';

// ============================================
// CALCOLO ACTIVITY SCORE
// ============================================

interface ActivityData {
  chatMessages: number;
  watchTimeMinutes: number;
  subMonths: number;
  followAgeDays: number;
}

/**
 * Calcola il punteggio di attività complessivo di un utente.
 * Ogni metrica ha un peso diverso e viene normalizzata.
 */
export function calculateActivityScore(data: ActivityData): number {
  // Pesi delle metriche
  const weights = {
    chat: 0.30,      // 30% - messaggi in chat
    watchTime: 0.25, // 25% - tempo di visione
    sub: 0.25,       // 25% - mesi di sub
    followAge: 0.20, // 20% - anzianità follow
  };

  // Normalizzazione (soft cap con logaritmo per evitare che valori estremi dominino)
  const chatScore = Math.log10(1 + data.chatMessages) / Math.log10(1 + 5000); // ~5000 msg = score 1.0
  const watchScore = Math.log10(1 + data.watchTimeMinutes) / Math.log10(1 + 50000); // ~833 ore = score 1.0
  const subScore = Math.log10(1 + data.subMonths) / Math.log10(1 + 36); // 3 anni = score 1.0
  const followScore = Math.log10(1 + data.followAgeDays) / Math.log10(1 + 1095); // 3 anni = score 1.0

  // Score pesato (0.0 - 1.0+, può superare 1.0 per utenti molto attivi)
  const score =
    chatScore * weights.chat +
    watchScore * weights.watchTime +
    subScore * weights.sub +
    followScore * weights.followAge;

  return Math.round(score * 1000) / 1000; // 3 decimali
}

// ============================================
// CALCOLO RARITA'
// ============================================

/**
 * Mappa l'activity score a un tier di rarità.
 * Le soglie sono calibrate perché:
 * - Comune: la maggior parte degli utenti occasionali
 * - Master: solo i top supporter del canale
 */
export function scoreToRarity(score: number): Rarity {
  if (score >= 0.90) return Rarity.MASTER;
  if (score >= 0.75) return Rarity.MITICO;
  if (score >= 0.60) return Rarity.LEGGENDARIO;
  if (score >= 0.48) return Rarity.EPICO;
  if (score >= 0.35) return Rarity.MOLTO_RARO;
  if (score >= 0.22) return Rarity.RARO;
  if (score >= 0.12) return Rarity.NON_COMUNE;
  return Rarity.COMUNE;
}

// ============================================
// GENERAZIONE EROE
// ============================================

// Override classe per utenti specifici (possono comunque cambiare con il reroll)
const CLASS_OVERRIDES: Record<string, HeroClass> = {
  'hollow90x': HeroClass.CRONO,
  'shydanrem': HeroClass.OMBRA,
};

/**
 * Assegna una classe pseudo-casuale basata sull'hash dello username.
 * Così ogni utente ha sempre la stessa classe (deterministica).
 * Alcuni utenti hanno un override manuale.
 */
export function assignClass(twitchUsername: string): HeroClass {
  const lower = twitchUsername.toLowerCase();
  if (CLASS_OVERRIDES[lower]) return CLASS_OVERRIDES[lower];

  const classes = Object.values(HeroClass);
  let hash = 0;
  for (let i = 0; i < twitchUsername.length; i++) {
    const char = twitchUsername.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return classes[Math.abs(hash) % classes.length];
}

/**
 * Calcola le stats di un eroe basandosi su classe, rarità e livello.
 */
export function calculateStats(
  heroClass: HeroClass,
  rarity: Rarity,
  level: number
): HeroStats {
  const base = CLASS_BASE_STATS[heroClass];
  const growth = CLASS_GROWTH[heroClass];
  const multiplier = RARITY_MULTIPLIERS[rarity];

  // Stats = (base + growth * (livello - 1)) * moltiplicatore rarità
  const lvlBonus = level - 1;

  return {
    hp: Math.floor((base.hp + growth.hp * lvlBonus) * multiplier),
    atk: Math.floor((base.atk + growth.atk * lvlBonus) * multiplier),
    def: Math.floor((base.def + growth.def * lvlBonus) * multiplier),
    spd: Math.floor((base.spd + growth.spd * lvlBonus) * multiplier),
    crit: Math.min(100, Math.floor((base.crit + growth.crit * lvlBonus) * multiplier)),
    critDmg: Math.floor((base.critDmg + growth.critDmg * lvlBonus) * multiplier),
  };
}

/**
 * Seleziona le abilità per un eroe:
 * - 1 abilità base della classe (sempre la stessa)
 * - 2 abilità random dal pool disponibile (classe + generiche)
 * - Se livello >= 20 e rarità >= Raro: sblocca la Ultimate
 */
export function selectAbilities(
  heroClass: HeroClass,
  rarity: Rarity,
  level: number,
  seed: string
): string[] {
  const available = getAvailableAbilities(heroClass, rarity);

  // Separa per tipo
  const classAttacks = available.filter(
    a => a.type === AbilityType.ATTACCO && a.heroClass === heroClass
  );
  const ultimates = available.filter(a => a.type === AbilityType.ULTIMATE);
  const nonUltimates = available.filter(
    a => a.type !== AbilityType.ULTIMATE &&
    !(a.type === AbilityType.ATTACCO && a.heroClass === heroClass && classAttacks.length > 0)
  );

  const abilities: string[] = [];

  // 1. Abilità base classe (primo attacco di classe, o attacco generico)
  if (classAttacks.length > 0) {
    abilities.push(classAttacks[0].id);
  } else {
    abilities.push('atk_colpo_base');
  }

  // 2. Due abilità random (usando seed per determinismo)
  const seededRandom = createSeededRandom(seed);
  const pool = nonUltimates.filter(a => !abilities.includes(a.id));
  const shuffled = pool.sort(() => seededRandom() - 0.5);

  for (const ability of shuffled) {
    if (abilities.length >= 3) break;
    if (!abilities.includes(ability.id)) {
      abilities.push(ability.id);
    }
  }

  // 3. Ultimate se qualificato (livello 20+ e rarità sufficiente)
  if (level >= 20 && ultimates.length > 0) {
    abilities.push(ultimates[0].id);
  }

  return abilities;
}

/**
 * Genera un eroe completo da dati utente.
 */
export function generateHero(
  twitchUserId: string,
  twitchUsername: string,
  displayName: string,
  activityData: ActivityData
): Omit<Hero, 'id' | 'createdAt' | 'updatedAt'> {
  const activityScore = calculateActivityScore(activityData);
  const rarity = scoreToRarity(activityScore);
  const heroClass = assignClass(twitchUsername);
  const level = 1;
  const stats = calculateStats(heroClass, rarity, level);
  const abilities = selectAbilities(heroClass, rarity, level, twitchUserId);

  return {
    twitchUserId,
    twitchUsername,
    displayName,
    heroClass,
    rarity,
    level,
    exp: 0,
    stats,
    abilities,
  };
}

/**
 * Calcola l'EXP necessaria per raggiungere il prossimo livello.
 */
export function expForLevel(level: number): number {
  return Math.floor(EXP_BASE * Math.pow(level, 1.5));
}

/**
 * Tenta di far salire di livello un eroe, restituisce il nuovo stato.
 */
export function tryLevelUp(hero: Pick<Hero, 'level' | 'exp' | 'heroClass' | 'rarity' | 'abilities'>): {
  leveled: boolean;
  newLevel: number;
  remainingExp: number;
  newStats?: HeroStats;
  newAbilities?: string[];
} {
  const required = expForLevel(hero.level);

  if (hero.exp < required || hero.level >= MAX_LEVEL) {
    return { leveled: false, newLevel: hero.level, remainingExp: hero.exp };
  }

  const newLevel = hero.level + 1;
  const remainingExp = hero.exp - required;
  const newStats = calculateStats(hero.heroClass, hero.rarity, newLevel);

  // Ricalcola abilità (potrebbe sbloccare la ultimate al livello 20)
  let newAbilities: string[] | undefined;
  if (newLevel === 20) {
    newAbilities = selectAbilities(
      hero.heroClass, hero.rarity, newLevel, hero.heroClass + newLevel
    );
  }

  return { leveled: true, newLevel, remainingExp, newStats, newAbilities };
}

// ============================================
// UTILITY
// ============================================

/**
 * Generatore di numeri pseudo-casuali con seed (per determinismo).
 */
function createSeededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 4294967296;
  };
}
