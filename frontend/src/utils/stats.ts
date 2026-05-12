import { Hero, HeroStats } from '../types';
import { CLASS_MODIFIERS } from '../constants/balance';

/**
 * Calcola le statistiche effettive di un eroe applicando i modificatori di classe.
 */
export function getEffectiveStats(hero: Hero): HeroStats {
  const mod = CLASS_MODIFIERS[hero.heroClass] || { hp: 1, atk: 1, def: 1, spd: 1, crit: 1 };
  
  return {
    hp: Math.floor(hero.stats.hp * mod.hp),
    atk: Math.floor(hero.stats.atk * mod.atk),
    def: Math.floor(hero.stats.def * mod.def),
    spd: Math.floor(hero.stats.spd * mod.spd),
    crit: Number((hero.stats.crit * mod.crit).toFixed(1)),
    critDmg: hero.stats.critDmg, // Generalmente non modificato dalla classe base
  };
}
