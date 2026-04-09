import { HeroClass } from '../types';

// ============================================
// DEFINIZIONI ZONE DUNGEON
// ============================================

export interface WaveComposition {
  wave: number;
  minions: number;
  elites: number;
  bosses: number;       // sub-boss random (non zone boss)
  isZoneBoss: boolean;  // true = spawn il boss dedicato della zona
}

export interface ZoneDefinition {
  id: string;
  name: string;
  emoji: string;
  order: number;
  totalWaves: number;
  baseScale: number;
  recommendedLevel: [number, number];
  monsterPool: {
    minions: string[];
    elites: string[];
    bosses: string[];  // sub-boss random per wave intermedie
  };
  zoneBossId: string;
  waveComposition: WaveComposition[];
  rewardMultiplier: number;
  nextZoneId: string | null;
}

export const ZONES: ZoneDefinition[] = [
  {
    id: 'forest',
    name: 'Foresta Oscura',
    emoji: '🌲',
    order: 0,
    totalWaves: 5,
    baseScale: 1.0,
    recommendedLevel: [1, 8],
    monsterPool: {
      minions: ['mob_slime', 'mob_goblin', 'mob_rat'],
      elites: ['mob_orc', 'mob_witch'],
      bosses: ['boss_golem'],
    },
    zoneBossId: 'boss_treant',
    waveComposition: [
      { wave: 1, minions: 2, elites: 0, bosses: 0, isZoneBoss: false },
      { wave: 2, minions: 3, elites: 0, bosses: 0, isZoneBoss: false },
      { wave: 3, minions: 2, elites: 1, bosses: 0, isZoneBoss: false },
      { wave: 4, minions: 1, elites: 2, bosses: 0, isZoneBoss: false },
      { wave: 5, minions: 0, elites: 0, bosses: 0, isZoneBoss: true },
    ],
    rewardMultiplier: 1.0,
    nextZoneId: 'plains',
  },
  {
    id: 'plains',
    name: 'Pianure Selvagge',
    emoji: '🌾',
    order: 1,
    totalWaves: 5,
    baseScale: 1.4,
    recommendedLevel: [6, 14],
    monsterPool: {
      minions: ['mob_skeleton', 'mob_bat', 'mob_goblin'],
      elites: ['mob_knight', 'mob_assassin'],
      bosses: ['boss_phantom'],
    },
    zoneBossId: 'boss_warlord',
    waveComposition: [
      { wave: 1, minions: 2, elites: 0, bosses: 0, isZoneBoss: false },
      { wave: 2, minions: 3, elites: 0, bosses: 0, isZoneBoss: false },
      { wave: 3, minions: 2, elites: 1, bosses: 0, isZoneBoss: false },
      { wave: 4, minions: 1, elites: 2, bosses: 0, isZoneBoss: false },
      { wave: 5, minions: 0, elites: 0, bosses: 0, isZoneBoss: true },
    ],
    rewardMultiplier: 1.5,
    nextZoneId: 'cavern',
  },
  {
    id: 'cavern',
    name: 'Caverna Profonda',
    emoji: '🪨',
    order: 2,
    totalWaves: 6,
    baseScale: 1.9,
    recommendedLevel: [12, 20],
    monsterPool: {
      minions: ['mob_slime', 'mob_skeleton', 'mob_wisp'],
      elites: ['mob_orc', 'mob_mage'],
      bosses: ['boss_golem'],
    },
    zoneBossId: 'boss_wyrm',
    waveComposition: [
      { wave: 1, minions: 2, elites: 0, bosses: 0, isZoneBoss: false },
      { wave: 2, minions: 3, elites: 0, bosses: 0, isZoneBoss: false },
      { wave: 3, minions: 2, elites: 1, bosses: 0, isZoneBoss: false },
      { wave: 4, minions: 1, elites: 2, bosses: 0, isZoneBoss: false },
      { wave: 5, minions: 0, elites: 3, bosses: 0, isZoneBoss: false },
      { wave: 6, minions: 0, elites: 0, bosses: 0, isZoneBoss: true },
    ],
    rewardMultiplier: 2.0,
    nextZoneId: 'swamp',
  },
  {
    id: 'swamp',
    name: 'Palude Maledetta',
    emoji: '🐊',
    order: 3,
    totalWaves: 6,
    baseScale: 2.5,
    recommendedLevel: [18, 28],
    monsterPool: {
      minions: ['mob_rat', 'mob_bat', 'mob_wisp'],
      elites: ['mob_witch', 'mob_mage'],
      bosses: ['boss_lich'],
    },
    zoneBossId: 'boss_hydra',
    waveComposition: [
      { wave: 1, minions: 2, elites: 0, bosses: 0, isZoneBoss: false },
      { wave: 2, minions: 3, elites: 0, bosses: 0, isZoneBoss: false },
      { wave: 3, minions: 2, elites: 1, bosses: 0, isZoneBoss: false },
      { wave: 4, minions: 1, elites: 2, bosses: 0, isZoneBoss: false },
      { wave: 5, minions: 0, elites: 3, bosses: 0, isZoneBoss: false },
      { wave: 6, minions: 0, elites: 0, bosses: 0, isZoneBoss: true },
    ],
    rewardMultiplier: 2.5,
    nextZoneId: 'volcano',
  },
  {
    id: 'volcano',
    name: 'Vulcano Infernale',
    emoji: '🌋',
    order: 4,
    totalWaves: 7,
    baseScale: 3.2,
    recommendedLevel: [26, 38],
    monsterPool: {
      minions: ['mob_wisp', 'mob_goblin', 'mob_skeleton'],
      elites: ['mob_orc', 'mob_knight', 'mob_assassin', 'mob_mage', 'mob_witch'],
      bosses: ['boss_dragon'],
    },
    zoneBossId: 'boss_ifrit',
    waveComposition: [
      { wave: 1, minions: 3, elites: 0, bosses: 0, isZoneBoss: false },
      { wave: 2, minions: 3, elites: 1, bosses: 0, isZoneBoss: false },
      { wave: 3, minions: 1, elites: 2, bosses: 0, isZoneBoss: false },
      { wave: 4, minions: 2, elites: 2, bosses: 0, isZoneBoss: false },
      { wave: 5, minions: 0, elites: 3, bosses: 0, isZoneBoss: false },
      { wave: 6, minions: 0, elites: 1, bosses: 1, isZoneBoss: false },
      { wave: 7, minions: 0, elites: 0, bosses: 0, isZoneBoss: true },
    ],
    rewardMultiplier: 3.0,
    nextZoneId: 'void',
  },
  {
    id: 'void',
    name: 'Il Vuoto',
    emoji: '🌀',
    order: 5,
    totalWaves: 7,
    baseScale: 4.2,
    recommendedLevel: [35, 50],
    monsterPool: {
      minions: ['mob_slime', 'mob_goblin', 'mob_bat', 'mob_skeleton', 'mob_wisp', 'mob_rat'],
      elites: ['mob_orc', 'mob_mage', 'mob_knight', 'mob_witch', 'mob_assassin'],
      bosses: ['boss_dragon', 'boss_lich', 'boss_phantom', 'boss_chrono'],
    },
    zoneBossId: 'boss_void_king',
    waveComposition: [
      { wave: 1, minions: 3, elites: 0, bosses: 0, isZoneBoss: false },
      { wave: 2, minions: 3, elites: 1, bosses: 0, isZoneBoss: false },
      { wave: 3, minions: 1, elites: 2, bosses: 0, isZoneBoss: false },
      { wave: 4, minions: 2, elites: 2, bosses: 0, isZoneBoss: false },
      { wave: 5, minions: 0, elites: 3, bosses: 0, isZoneBoss: false },
      { wave: 6, minions: 0, elites: 1, bosses: 1, isZoneBoss: false },
      { wave: 7, minions: 0, elites: 0, bosses: 0, isZoneBoss: true },
    ],
    rewardMultiplier: 3.5,
    nextZoneId: null,
  },
];

export const ZONE_MAP = new Map(ZONES.map(z => [z.id, z]));

export function getZoneByOrder(order: number): ZoneDefinition | undefined {
  return ZONES.find(z => z.order === order);
}

export function isZoneUnlocked(maxUnlocked: string, zoneId: string): boolean {
  const maxZone = ZONE_MAP.get(maxUnlocked);
  const targetZone = ZONE_MAP.get(zoneId);
  if (!maxZone || !targetZone) return false;
  return targetZone.order <= maxZone.order;
}
