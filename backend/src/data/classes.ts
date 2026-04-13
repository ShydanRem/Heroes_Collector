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
    hp: 120, atk: 55, def: 20, spd: 55, crit: 23, critDmg: 168,
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
  [HeroClass.DRAGOON]: {
    hp: 200, atk: 50, def: 42, spd: 22, crit: 10, critDmg: 175,
  },
  [HeroClass.SAMURAI]: {
    hp: 155, atk: 58, def: 38, spd: 38, crit: 22, critDmg: 165,
  },
  [HeroClass.NECROMANTE]: {
    hp: 125, atk: 60, def: 22, spd: 32, crit: 12, critDmg: 155,
  },
  [HeroClass.ALCHIMISTA]: {
    hp: 150, atk: 30, def: 30, spd: 35, crit: 8, critDmg: 135,
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
    hp: 12, atk: 6, def: 1, spd: 4, crit: 0.5, critDmg: 1.2,
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
  [HeroClass.DRAGOON]: {
    hp: 24, atk: 5.5, def: 4, spd: 1, crit: 0.3, critDmg: 1.2,
  },
  [HeroClass.SAMURAI]: {
    hp: 17, atk: 6.5, def: 3.5, spd: 2.5, crit: 0.5, critDmg: 1,
  },
  [HeroClass.NECROMANTE]: {
    hp: 13, atk: 7, def: 1.5, spd: 2, crit: 0.3, critDmg: 0.8,
  },
  [HeroClass.ALCHIMISTA]: {
    hp: 16, atk: 3, def: 2.5, spd: 2.5, crit: 0.2, critDmg: 0.4,
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
    name: 'Berserker',
    emoji: '⚔️',
    role: 'DPS Melee',
    description: 'Guerriero devastante in mischia. Alto ATK e buon CRIT.',
  },
  [HeroClass.ARCANO]: {
    name: 'Stregone',
    emoji: '🔮',
    role: 'DPS Magico',
    description: 'Mago potente. Il danno più alto ma fragile.',
  },
  [HeroClass.CUSTODE]: {
    name: 'Sacerdote',
    emoji: '✨',
    role: 'Healer',
    description: 'Guaritore del party. Tiene in vita tutti con cure e scudi.',
  },
  [HeroClass.OMBRA]: {
    name: 'Assassino',
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
    name: 'Cronomante',
    emoji: '⏳',
    role: 'Utility',
    description: 'Manipola la velocita. Rallenta nemici e accelera alleati.',
  },
  [HeroClass.DRAGOON]: {
    name: 'Dragoon',
    emoji: '🐲',
    role: 'Tank/DPS',
    description: 'Lanciere corazzato. Salta in aria e piomba sui nemici con colpi devastanti.',
  },
  [HeroClass.SAMURAI]: {
    name: 'Samurai',
    emoji: '⛩️',
    role: 'DPS Melee',
    description: 'Spadaccino disciplinato. Colpi precisi, buona difesa, onore sopra tutto.',
  },
  [HeroClass.NECROMANTE]: {
    name: 'Necromante',
    emoji: '💀',
    role: 'DPS/Debuffer',
    description: 'Mago oscuro. Drena vita, avvelena e maledice. Forte ma fragile.',
  },
  [HeroClass.ALCHIMISTA]: {
    name: 'Alchimista',
    emoji: '⚗️',
    role: 'Support',
    description: 'Maestro delle pozioni. Cura, buffa e lancia veleni. Molto versatile.',
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
    description: '+15% CRIT se nel party ci sono Berserker + Assassino',
    requiredClasses: [HeroClass.LAMA, HeroClass.OMBRA],
    minCount: 2,
    effect: { stat: 'crit', bonus: 15, description: '+15% CRIT al party' },
  },
  {
    name: 'Circolo Arcano',
    description: '+25% ATK per ogni Stregone nel party',
    requiredClasses: [HeroClass.ARCANO],
    minCount: 2,
    effect: { stat: 'atk', bonus: 25, description: '+25% ATK per Stregone' },
  },
  {
    name: 'Baluardo Sacro',
    description: '+30% HP al party se ci sono Sacerdote + Guardiano',
    requiredClasses: [HeroClass.CUSTODE, HeroClass.GUARDIANO],
    minCount: 2,
    effect: { stat: 'hp', bonus: 30, description: '+30% HP al party' },
  },
  {
    name: 'Imboscata',
    description: '+20% SPD se nel party ci sono Assassino + Ranger',
    requiredClasses: [HeroClass.OMBRA, HeroClass.RANGER],
    minCount: 2,
    effect: { stat: 'spd', bonus: 20, description: '+20% SPD al party' },
  },
  {
    name: 'Maledizione Ancestrale',
    description: '+20% ATK ai debuff se ci sono Sciamano + Stregone',
    requiredClasses: [HeroClass.SCIAMANO, HeroClass.ARCANO],
    minCount: 2,
    effect: { stat: 'atk', bonus: 20, description: '+20% potenza debuff' },
  },
  {
    name: 'Flusso Temporale',
    description: '+25% SPD a tutto il party se ci sono 2+ Cronomanti',
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
      HeroClass.DRAGOON, HeroClass.SAMURAI, HeroClass.NECROMANTE, HeroClass.ALCHIMISTA,
    ],
    minCount: 4,
    effect: { bonus: 15, description: '+15% a tutte le stats' },
  },
  {
    name: 'Assalto dal Cielo',
    description: '+20% ATK se nel party ci sono Dragoon + Berserker',
    requiredClasses: [HeroClass.DRAGOON, HeroClass.LAMA],
    minCount: 2,
    effect: { stat: 'atk', bonus: 20, description: '+20% ATK al party' },
  },
  {
    name: 'Via della Spada',
    description: '+15% CRIT DMG se nel party ci sono Samurai + Assassino',
    requiredClasses: [HeroClass.SAMURAI, HeroClass.OMBRA],
    minCount: 2,
    effect: { stat: 'critDmg', bonus: 15, description: '+15% CRIT DMG al party' },
  },
  {
    name: 'Patto Oscuro',
    description: '+20% ATK se nel party ci sono Necromante + Sciamano',
    requiredClasses: [HeroClass.NECROMANTE, HeroClass.SCIAMANO],
    minCount: 2,
    effect: { stat: 'atk', bonus: 20, description: '+20% potenza oscura' },
  },
  {
    name: 'Laboratorio da Campo',
    description: '+25% HP se nel party ci sono Alchimista + Sacerdote',
    requiredClasses: [HeroClass.ALCHIMISTA, HeroClass.CUSTODE],
    minCount: 2,
    effect: { stat: 'hp', bonus: 25, description: '+25% HP al party' },
  },
  {
    name: 'Cavalieri del Cielo',
    description: '+15% SPD se nel party ci sono Dragoon + Ranger',
    requiredClasses: [HeroClass.DRAGOON, HeroClass.RANGER],
    minCount: 2,
    effect: { stat: 'spd', bonus: 15, description: '+15% SPD al party' },
  },
  {
    name: 'Laboratorio Oscuro',
    description: '+20% ATK se nel party ci sono Alchimista + Necromante',
    requiredClasses: [HeroClass.ALCHIMISTA, HeroClass.NECROMANTE],
    minCount: 2,
    effect: { stat: 'atk', bonus: 20, description: '+20% ATK al party' },
  },
  {
    name: 'Scaglie Temporali',
    description: '+20% DEF se nel party ci sono Dragoon + Cronomante',
    requiredClasses: [HeroClass.DRAGOON, HeroClass.CRONO],
    minCount: 2,
    effect: { stat: 'def', bonus: 20, description: '+20% DEF al party' },
  },
];
