import { HeroClass, Rarity, RARITY_ORDER } from '../types';
import { calculateStats, selectAbilities } from './heroGenerator';
import { CLASS_INFO } from '../data/classes';

// ============================================
// AVVERSARIO BOT PER IL PVP
// ============================================
// Quando non c'e un avversario reale (poca popolazione o testing), il PVP
// genera un bot scalato sul party del giocatore: cosi l'arena non e mai vuota.
// Funzione PURA (nessuna dipendenza dal DB) → testabile in isolamento.

export interface BotHero {
  id: string;
  display_name: string;
  hero_class: HeroClass;
  rarity: Rarity;
  level: number;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  crit: number;
  crit_dmg: number;
  ability_ids: string[];
  tactics: any[];
}

export interface BotOpponent {
  name: string;
  elo: number;
  heroes: BotHero[];
  isBot: true;
}

const BOT_NAMES = [
  'Spettro Errante', 'Campione Ombra', 'Sfidante Anonimo', 'Eco del Vuoto',
  'Rivale Misterioso', 'Guardiano Decaduto', 'Mercenario Fantasma', 'Duellante Spettrale',
];

const MAX_PARTY = 5;

/**
 * Genera un avversario bot scalato sul party del giocatore.
 * - dimensione party = quella del giocatore (fino a 5)
 * - livello = livello medio del party del giocatore
 * - rarita = rarita media del party del giocatore
 * - elo = quello del giocatore (fight equilibrato, ELO change ~ +/-16)
 */
export function generateBotOpponent(myHeroes: any[], myElo: number, seed?: string): BotOpponent {
  const size = Math.max(1, Math.min(myHeroes.length || 1, MAX_PARTY));

  const avgLevel = myHeroes.length
    ? Math.round(myHeroes.reduce((s, h) => s + (h.level || h.capture_level || 1), 0) / myHeroes.length)
    : 1;
  const botLevel = Math.max(1, avgLevel);

  const avgRarityIdx = myHeroes.length
    ? Math.round(
        myHeroes.reduce((s, h) => {
          const idx = RARITY_ORDER.indexOf((h.rarity || Rarity.COMUNE) as Rarity);
          return s + (idx >= 0 ? idx : 0);
        }, 0) / myHeroes.length
      )
    : 0;
  const botRarity = RARITY_ORDER[Math.max(0, Math.min(avgRarityIdx, RARITY_ORDER.length - 1))];

  const classes = Object.values(HeroClass);
  const baseSeed = seed || `bot_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  const heroes: BotHero[] = [];

  for (let i = 0; i < size; i++) {
    const heroClass = classes[Math.floor(Math.random() * classes.length)];
    const stats = calculateStats(heroClass, botRarity, botLevel);
    const abilities = selectAbilities(heroClass, botRarity, botLevel, `${baseSeed}_${i}`);
    heroes.push({
      id: `bot_${i}`,
      display_name: `${CLASS_INFO[heroClass]?.name || 'Eroe'} Spettrale`,
      hero_class: heroClass,
      rarity: botRarity,
      level: botLevel,
      hp: stats.hp,
      atk: stats.atk,
      def: stats.def,
      spd: stats.spd,
      crit: stats.crit,
      crit_dmg: stats.critDmg,
      ability_ids: abilities,
      tactics: [],
    });
  }

  const name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
  return { name, elo: myElo, heroes, isBot: true };
}
