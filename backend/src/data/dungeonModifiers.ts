import { BattleFighter } from '../services/battleEngine';

export interface DungeonModifier {
  id: string;
  name: string;
  emoji: string;
  description: string;
  difficulty: 'facile' | 'normale' | 'difficile';
  goldMultiplier: number;
  expMultiplier: number;
  apply: (fighters: BattleFighter[], team: 'attacker' | 'defender') => void;
}

export const DUNGEON_MODIFIERS: DungeonModifier[] = [
  {
    id: 'furia',
    name: 'Furia Primordiale',
    emoji: '🔥',
    description: 'Tutti gli attacchi fanno +30% danno',
    difficulty: 'normale',
    goldMultiplier: 1.0,
    expMultiplier: 1.0,
    apply: (fighters) => {
      for (const f of fighters) {
        f.stats.atk = Math.floor(f.stats.atk * 1.3);
      }
    },
  },
  {
    id: 'fortezza',
    name: 'Fortezza',
    emoji: '🛡️',
    description: 'Tutti hanno +40% DEF ma -20% SPD',
    difficulty: 'normale',
    goldMultiplier: 1.0,
    expMultiplier: 1.0,
    apply: (fighters) => {
      for (const f of fighters) {
        f.stats.def = Math.floor(f.stats.def * 1.4);
        f.stats.spd = Math.floor(f.stats.spd * 0.8);
      }
    },
  },
  {
    id: 'velocita',
    name: 'Iperspazio',
    emoji: '⚡',
    description: '+50% velocita a tutti, turni frenetici',
    difficulty: 'facile',
    goldMultiplier: 0.9,
    expMultiplier: 0.9,
    apply: (fighters) => {
      for (const f of fighters) {
        f.stats.spd = Math.floor(f.stats.spd * 1.5);
      }
    },
  },
  {
    id: 'incubo',
    name: 'Incubo',
    emoji: '💀',
    description: 'Nemici +50% HP ma doppio loot e EXP',
    difficulty: 'difficile',
    goldMultiplier: 2.0,
    expMultiplier: 2.0,
    apply: (fighters, team) => {
      if (team === 'defender') {
        for (const f of fighters) {
          f.maxHp = Math.floor(f.maxHp * 1.5);
          f.currentHp = f.maxHp;
        }
      }
    },
  },
  {
    id: 'ricchezza',
    name: 'Febbre dell\'Oro',
    emoji: '💰',
    description: 'Triplo gold ma nemici +20% ATK',
    difficulty: 'difficile',
    goldMultiplier: 3.0,
    expMultiplier: 1.0,
    apply: (fighters, team) => {
      if (team === 'defender') {
        for (const f of fighters) {
          f.stats.atk = Math.floor(f.stats.atk * 1.2);
        }
      }
    },
  },
  {
    id: 'vetro',
    name: 'Cannone di Vetro',
    emoji: '💎',
    description: '+60% ATK a tutti ma -40% DEF',
    difficulty: 'normale',
    goldMultiplier: 1.2,
    expMultiplier: 1.2,
    apply: (fighters) => {
      for (const f of fighters) {
        f.stats.atk = Math.floor(f.stats.atk * 1.6);
        f.stats.def = Math.floor(f.stats.def * 0.6);
      }
    },
  },
  {
    id: 'critico',
    name: 'Colpo Fortunato',
    emoji: '🎯',
    description: '+25% CRIT e +30% danno critico a tutti',
    difficulty: 'facile',
    goldMultiplier: 1.0,
    expMultiplier: 1.1,
    apply: (fighters) => {
      for (const f of fighters) {
        f.stats.crit = Math.floor(f.stats.crit + 25);
        f.stats.critDmg = Math.floor(f.stats.critDmg + 30);
      }
    },
  },
  {
    id: 'colossi',
    name: 'Terra dei Giganti',
    emoji: '🗿',
    description: 'Tutti hanno il doppio degli HP',
    difficulty: 'facile',
    goldMultiplier: 1.0,
    expMultiplier: 1.0,
    apply: (fighters) => {
      for (const f of fighters) {
        f.maxHp = Math.floor(f.maxHp * 2);
        f.currentHp = f.maxHp;
      }
    },
  },
  {
    id: 'elitario',
    name: 'Sfida Elitaria',
    emoji: '👑',
    description: 'Nemici hanno +30% a tutte le stats ma tripla EXP',
    difficulty: 'difficile',
    goldMultiplier: 1.5,
    expMultiplier: 3.0,
    apply: (fighters, team) => {
      if (team === 'defender') {
        for (const f of fighters) {
          f.stats.atk = Math.floor(f.stats.atk * 1.3);
          f.stats.def = Math.floor(f.stats.def * 1.3);
          f.stats.spd = Math.floor(f.stats.spd * 1.3);
          f.maxHp = Math.floor(f.maxHp * 1.3);
          f.currentHp = f.maxHp;
        }
      }
    },
  },
  {
    id: 'vampirismo',
    name: 'Vampirismo',
    emoji: '🧛',
    description: 'Ogni colpo cura il 15% del danno inflitto',
    difficulty: 'facile',
    goldMultiplier: 1.0,
    expMultiplier: 1.0,
    apply: () => {
      // Questo modificatore viene gestito dal battle engine
      // tramite il flag passato al dungeon
    },
  },
];

export function rollModifier(): DungeonModifier {
  const idx = Math.floor(Math.random() * DUNGEON_MODIFIERS.length);
  return DUNGEON_MODIFIERS[idx];
}
