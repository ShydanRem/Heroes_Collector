import { HeroClass, HeroStats } from '../types';

// Stats base per classe (livello 1, prima del moltiplicatore rarità)
export const CLASS_BASE_STATS: Record<HeroClass, HeroStats> = {
  [HeroClass.GUARDIANO]: {
    hp: 220, atk: 35, def: 55, spd: 25, crit: 5, critDmg: 130,
  },
  [HeroClass.LAMA]: {
    hp: 150, atk: 60, def: 30, spd: 40, crit: 20, critDmg: 160,
  },
  [HeroClass.ARCANO]: {
    hp: 130, atk: 65, def: 25, spd: 35, crit: 15, critDmg: 170,
  },
  [HeroClass.CUSTODE]: {
    hp: 170, atk: 25, def: 40, spd: 30, crit: 5, critDmg: 130,
  },
  [HeroClass.OMBRA]: {
    hp: 120, atk: 55, def: 20, spd: 55, crit: 30, critDmg: 180,
  },
  [HeroClass.RANGER]: {
    hp: 140, atk: 50, def: 28, spd: 50, crit: 25, critDmg: 155,
  },
  [HeroClass.SCIAMANO]: {
    hp: 160, atk: 40, def: 35, spd: 30, crit: 10, critDmg: 140,
  },
  [HeroClass.CRONO]: {
    hp: 145, atk: 35, def: 32, spd: 60, crit: 12, critDmg: 145,
  },
};

// Crescita stats per livello (aggiunta per livello)
export const CLASS_GROWTH: Record<HeroClass, HeroStats> = {
  [HeroClass.GUARDIANO]: {
    hp: 28, atk: 3, def: 6, spd: 1, crit: 0.2, critDmg: 0.5,
  },
  [HeroClass.LAMA]: {
    hp: 16, atk: 7, def: 2, spd: 3, crit: 0.5, critDmg: 1,
  },
  [HeroClass.ARCANO]: {
    hp: 14, atk: 8, def: 1.5, spd: 2, crit: 0.4, critDmg: 1.2,
  },
  [HeroClass.CUSTODE]: {
    hp: 20, atk: 2.5, def: 4, spd: 2, crit: 0.1, critDmg: 0.3,
  },
  [HeroClass.OMBRA]: {
    hp: 12, atk: 6, def: 1, spd: 4, crit: 0.8, critDmg: 1.5,
  },
  [HeroClass.RANGER]: {
    hp: 15, atk: 5.5, def: 2, spd: 3.5, crit: 0.6, critDmg: 0.8,
  },
  [HeroClass.SCIAMANO]: {
    hp: 18, atk: 4, def: 3, spd: 2, crit: 0.3, critDmg: 0.5,
  },
  [HeroClass.CRONO]: {
    hp: 15, atk: 3.5, def: 2.5, spd: 5, crit: 0.3, critDmg: 0.6,
  },
};

// Descrizioni classi per UI
export const CLASS_INFO: Record<HeroClass, { name: string; emoji: string; role: string; description: string }> = {
  [HeroClass.GUARDIANO]: {
    name: 'Guardiano',
    emoji: '🛡️',
    role: 'Tank',
    description: 'Difensore del party. Alta HP e DEF, protegge gli alleati.',
  },
  [HeroClass.LAMA]: {
    name: 'Lama',
    emoji: '⚔️',
    role: 'DPS Melee',
    description: 'Guerriero devastante in mischia. Alto ATK e buon CRIT.',
  },
  [HeroClass.ARCANO]: {
    name: 'Arcano',
    emoji: '🔮',
    role: 'DPS Magico',
    description: 'Mago potente. Il danno più alto ma fragile.',
  },
  [HeroClass.CUSTODE]: {
    name: 'Custode',
    emoji: '✨',
    role: 'Healer',
    description: 'Guaritore del party. Tiene in vita tutti con cure e scudi.',
  },
  [HeroClass.OMBRA]: {
    name: 'Ombra',
    emoji: '🗡️',
    role: 'Assassino',
    description: 'Colpisce per primo e colpisce forte. CRIT devastante ma fragile.',
  },
  [HeroClass.RANGER]: {
    name: 'Ranger',
    emoji: '🏹',
    role: 'DPS Ranged',
    description: 'Cecchino agile. Buon danno, alta velocità e evasione.',
  },
  [HeroClass.SCIAMANO]: {
    name: 'Sciamano',
    emoji: '🌿',
    role: 'Support/Debuffer',
    description: 'Indebolisce i nemici e supporta gli alleati. Versatile.',
  },
  [HeroClass.CRONO]: {
    name: 'Crono',
    emoji: '⏳',
    role: 'Utility',
    description: 'Manipola la velocità. Rallenta nemici e accelera alleati.',
  },
};

// Sinergie di classe
export interface Synergy {
  name: string;
  description: string;
  requiredClasses: HeroClass[];
  minCount: number; // quanti eroi delle classi richieste servono
  effect: {
    stat?: keyof HeroStats;
    bonus: number; // percentuale
    description: string;
  };
}

export const SYNERGIES: Synergy[] = [
  {
    name: 'Muro di Ferro',
    description: '+20% DEF a tutto il party se ci sono 2+ Guardiani',
    requiredClasses: [HeroClass.GUARDIANO],
    minCount: 2,
    effect: { stat: 'def', bonus: 20, description: '+20% DEF al party' },
  },
  {
    name: 'Danza delle Lame',
    description: '+15% CRIT se nel party ci sono Lama + Ombra',
    requiredClasses: [HeroClass.LAMA, HeroClass.OMBRA],
    minCount: 2,
    effect: { stat: 'crit', bonus: 15, description: '+15% CRIT al party' },
  },
  {
    name: 'Circolo Arcano',
    description: '+25% ATK per ogni Arcano nel party',
    requiredClasses: [HeroClass.ARCANO],
    minCount: 2,
    effect: { stat: 'atk', bonus: 25, description: '+25% ATK per Arcano' },
  },
  {
    name: 'Baluardo Sacro',
    description: '+30% HP al party se ci sono Custode + Guardiano',
    requiredClasses: [HeroClass.CUSTODE, HeroClass.GUARDIANO],
    minCount: 2,
    effect: { stat: 'hp', bonus: 30, description: '+30% HP al party' },
  },
  {
    name: 'Imboscata',
    description: '+20% SPD se nel party ci sono Ombra + Ranger',
    requiredClasses: [HeroClass.OMBRA, HeroClass.RANGER],
    minCount: 2,
    effect: { stat: 'spd', bonus: 20, description: '+20% SPD al party' },
  },
  {
    name: 'Maledizione Ancestrale',
    description: '+20% ATK ai debuff se ci sono Sciamano + Arcano',
    requiredClasses: [HeroClass.SCIAMANO, HeroClass.ARCANO],
    minCount: 2,
    effect: { stat: 'atk', bonus: 20, description: '+20% potenza debuff' },
  },
  {
    name: 'Flusso Temporale',
    description: '+25% SPD a tutto il party se ci sono 2+ Crono',
    requiredClasses: [HeroClass.CRONO],
    minCount: 2,
    effect: { stat: 'spd', bonus: 25, description: '+25% SPD al party' },
  },
  {
    name: 'Armata Completa',
    description: '+10% a TUTTE le stats se il party ha 4 classi diverse',
    requiredClasses: [
      HeroClass.GUARDIANO, HeroClass.LAMA, HeroClass.ARCANO, HeroClass.CUSTODE,
      HeroClass.OMBRA, HeroClass.RANGER, HeroClass.SCIAMANO, HeroClass.CRONO,
    ],
    minCount: 4,
    effect: { bonus: 10, description: '+10% a tutte le stats' },
  },
];
