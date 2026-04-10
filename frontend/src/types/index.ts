// Tipi condivisi frontend

export type Rarity =
  | 'comune' | 'non_comune' | 'raro' | 'molto_raro'
  | 'epico' | 'leggendario' | 'mitico' | 'master';

export type HeroClass =
  | 'guardiano' | 'lama' | 'arcano' | 'custode'
  | 'ombra' | 'ranger' | 'sciamano' | 'crono'
  | 'dragoon' | 'samurai' | 'necromante' | 'alchimista';

export interface HeroStats {
  hp: number;
  atk: number;
  def: number;
  spd: number;
  crit: number;
  critDmg: number;
}

export interface Hero {
  id: string;
  twitchUserId: string;
  twitchUsername: string;
  displayName: string;
  heroClass: HeroClass;
  rarity: Rarity;
  level: number;
  exp: number;
  stats: HeroStats;
  abilities: string[];
}

export interface UserProfile {
  twitchUserId: string;
  twitchUsername: string;
  displayName: string;
  optedIn: boolean;
  activityScore: number;
  gold: number;
  energy: number;
  maxEnergy: number;
  essences: number;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  type: string;
  target: string;
  power: number;
  cooldown: number;
  statusEffect?: string;
}

export interface ClassInfo {
  name: string;
  emoji: string;
  role: string;
  description: string;
}

// Colori per rarità
export const RARITY_COLORS: Record<Rarity, string> = {
  comune: '#9ca3af',
  non_comune: '#22c55e',
  raro: '#3b82f6',
  molto_raro: '#a855f7',
  epico: '#f59e0b',
  leggendario: '#ef4444',
  mitico: '#ec4899',
  master: '#fbbf24',
};

export const RARITY_LABELS: Record<Rarity, string> = {
  comune: 'Comune',
  non_comune: 'Non Comune',
  raro: 'Raro',
  molto_raro: 'Molto Raro',
  epico: 'Epico',
  leggendario: 'Leggendario',
  mitico: 'Mitico',
  master: 'Master',
};

export const CLASS_EMOJIS: Record<HeroClass, string> = {
  guardiano: '🛡️',
  lama: '⚔️',
  arcano: '🔮',
  custode: '✨',
  ombra: '🗡️',
  ranger: '🏹',
  sciamano: '🌿',
  crono: '⏳',
  dragoon: '🐲',
  samurai: '⛩️',
  necromante: '💀',
  alchimista: '⚗️',
};

export const CLASS_LABELS: Record<HeroClass, string> = {
  guardiano: 'Guardiano',
  lama: 'Berserker',
  arcano: 'Stregone',
  custode: 'Sacerdote',
  ombra: 'Assassino',
  ranger: 'Ranger',
  sciamano: 'Sciamano',
  crono: 'Cronomante',
  dragoon: 'Dragoon',
  samurai: 'Samurai',
  necromante: 'Necromante',
  alchimista: 'Alchimista',
};

// Ordine rarità dal più basso al più alto
export const RARITY_ORDER: Rarity[] = [
  'comune', 'non_comune', 'raro', 'molto_raro',
  'epico', 'leggendario', 'mitico', 'master',
];

// Costo energia per catturare a una data rarità
export const CAPTURE_ENERGY_COST: Record<Rarity, number> = {
  comune: 5,
  non_comune: 15,
  raro: 30,
  molto_raro: 50,
  epico: 80,
  leggendario: 120,
  mitico: 160,
  master: 200,
};

// Costo essenze per upgrade alla rarità indicata
export const UPGRADE_ESSENCE_COST: Record<Rarity, number> = {
  comune: 0,
  non_comune: 5,
  raro: 12,
  molto_raro: 25,
  epico: 45,
  leggendario: 80,
  mitico: 130,
  master: 200,
};
