// ============================================
// TIPI BASE DEL GIOCO
// ============================================

// Tier di rarità (dal più basso al più alto)
export enum Rarity {
  COMUNE = 'comune',
  NON_COMUNE = 'non_comune',
  RARO = 'raro',
  MOLTO_RARO = 'molto_raro',
  EPICO = 'epico',
  LEGGENDARIO = 'leggendario',
  MITICO = 'mitico',
  MASTER = 'master',
}

// Le 8 classi
export enum HeroClass {
  GUARDIANO = 'guardiano',
  LAMA = 'lama',
  ARCANO = 'arcano',
  CUSTODE = 'custode',
  OMBRA = 'ombra',
  RANGER = 'ranger',
  SCIAMANO = 'sciamano',
  CRONO = 'crono',
  DRAGOON = 'dragoon',
  SAMURAI = 'samurai',
  NECROMANTE = 'necromante',
  ALCHIMISTA = 'alchimista',
}

// Tipo di abilità
export enum AbilityType {
  ATTACCO = 'attacco',
  DIFESA = 'difesa',
  SUPPORTO = 'supporto',
  DEBUFF = 'debuff',
  ULTIMATE = 'ultimate',
}

// Target dell'abilità
export enum TargetType {
  SINGOLO_NEMICO = 'singolo_nemico',
  TUTTI_NEMICI = 'tutti_nemici',
  SE_STESSO = 'se_stesso',
  SINGOLO_ALLEATO = 'singolo_alleato',
  TUTTI_ALLEATI = 'tutti_alleati',
  CASUALE_NEMICO = 'casuale_nemico',
}

// Effetti di stato
export enum StatusEffect {
  VELENO = 'veleno',
  STORDIMENTO = 'stordimento',
  RALLENTAMENTO = 'rallentamento',
  SANGUINAMENTO = 'sanguinamento',
  BRUCIATURA = 'bruciatura',
  CONGELAMENTO = 'congelamento',
  CECITA = 'cecita',
  RIGENERAZIONE = 'rigenerazione',
  SCUDO = 'scudo',
  FURIA = 'furia',
  EVASIONE = 'evasione',
  RIFLESSO = 'riflesso',
  SILENZIO = 'silenzio',
  MALEDIZIONE = 'maledizione',
  BENEDIZIONE = 'benedizione',
}

// ============================================
// STRUTTURE DATI
// ============================================

export interface Ability {
  id: string;
  name: string;
  description: string;
  type: AbilityType;
  target: TargetType;
  heroClass: HeroClass | null; // null = disponibile per tutte le classi
  power: number; // moltiplicatore danno/heal base
  cooldown: number; // turni di ricarica
  statusEffect?: StatusEffect;
  statusDuration?: number;
  statusChance?: number; // 0-100
  minRarity?: Rarity; // rarità minima per sbloccare
}

export interface HeroStats {
  hp: number;
  atk: number;
  def: number;
  spd: number; // velocità (determina ordine turni)
  crit: number; // % critico (0-100)
  critDmg: number; // moltiplicatore critico (es. 150 = 150%)
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
  abilities: string[]; // ID delle abilità
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  twitchUserId: string;
  twitchUsername: string;
  displayName: string;
  optedIn: boolean;
  activityScore: number;
  chatMessages: number;
  watchTimeMinutes: number;
  subscriptionMonths: number;
  followAgedays: number;
  gold: number;
  energy: number;
  maxEnergy: number;
  essences: number;
  lastEnergyRefresh: Date;
  createdAt: Date;
}

export interface RosterEntry {
  userId: string;
  heroId: string;
  caughtAt: Date;
}

export interface Party {
  id: string;
  userId: string;
  name: string;
  heroIds: string[]; // max 4
  createdAt: Date;
}

// ============================================
// TWITCH AUTH
// ============================================

export interface TwitchToken {
  channel_id: string;
  user_id: string;
  opaque_user_id: string;
  role: 'broadcaster' | 'moderator' | 'viewer' | 'external';
  pubsub_perms?: { listen?: string[]; send?: string[] };
  is_unlinked?: boolean; // true se l'utente non ha condiviso l'identita
}

// ============================================
// COSTANTI DI GIOCO
// ============================================

export const RARITY_ORDER: Rarity[] = [
  Rarity.COMUNE,
  Rarity.NON_COMUNE,
  Rarity.RARO,
  Rarity.MOLTO_RARO,
  Rarity.EPICO,
  Rarity.LEGGENDARIO,
  Rarity.MITICO,
  Rarity.MASTER,
];

// Moltiplicatori stats per rarità
export const RARITY_MULTIPLIERS: Record<Rarity, number> = {
  [Rarity.COMUNE]: 1.0,
  [Rarity.NON_COMUNE]: 1.15,
  [Rarity.RARO]: 1.35,
  [Rarity.MOLTO_RARO]: 1.6,
  [Rarity.EPICO]: 1.9,
  [Rarity.LEGGENDARIO]: 2.3,
  [Rarity.MITICO]: 2.8,
  [Rarity.MASTER]: 3.5,
};

// Energia necessaria per catturare un eroe per rarità (il giocatore sceglie a che rarità catturare)
export const CAPTURE_ENERGY_COST: Record<Rarity, number> = {
  [Rarity.COMUNE]: 5,
  [Rarity.NON_COMUNE]: 15,
  [Rarity.RARO]: 30,
  [Rarity.MOLTO_RARO]: 50,
  [Rarity.EPICO]: 80,
  [Rarity.LEGGENDARIO]: 120,
  [Rarity.MITICO]: 160,
  [Rarity.MASTER]: 200,
};

// Costo upgrade rarità in Essenze Eroiche
export const UPGRADE_ESSENCE_COST: Record<Rarity, number> = {
  [Rarity.COMUNE]: 0,
  [Rarity.NON_COMUNE]: 5,
  [Rarity.RARO]: 12,
  [Rarity.MOLTO_RARO]: 25,
  [Rarity.EPICO]: 45,
  [Rarity.LEGGENDARIO]: 80,
  [Rarity.MITICO]: 130,
  [Rarity.MASTER]: 200,
};

// EXP necessaria per livello (formula: base * livello^1.5)
export const EXP_BASE = 100;
export const MAX_LEVEL = 50;

// Dimensione massima party
export const MAX_PARTY_SIZE = 4;

// Energia
export const BASE_MAX_ENERGY = 50;
export const ENERGY_PER_CHAT_MESSAGE = 1;
export const ENERGY_PER_WATCH_MINUTE = 0.1;
export const ENERGY_PER_SUB_MONTH = 10;
