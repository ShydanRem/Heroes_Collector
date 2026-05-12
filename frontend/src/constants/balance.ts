import { HeroClass } from '../types';

export interface ClassModifier {
  hp: number;
  atk: number;
  def: number;
  spd: number;
  crit: number;
}

export const CLASS_MODIFIERS: Record<HeroClass, ClassModifier> = {
  guardiano: { hp: 1.4, atk: 0.8, def: 1.3, spd: 0.7, crit: 0.8 },
  lama:      { hp: 1.1, atk: 1.3, def: 0.7, spd: 0.9, crit: 1.2 },
  arcano:    { hp: 0.7, atk: 1.4, def: 0.6, spd: 0.8, crit: 1.1 },
  custode:   { hp: 0.9, atk: 0.7, def: 1.0, spd: 1.0, crit: 0.7 },
  ombra:     { hp: 0.7, atk: 1.2, def: 0.6, spd: 1.4, crit: 1.5 },
  ranger:    { hp: 0.9, atk: 1.1, def: 0.8, spd: 1.2, crit: 1.1 },
  sciamano:  { hp: 1.0, atk: 0.9, def: 1.0, spd: 0.9, crit: 0.8 },
  crono:     { hp: 0.8, atk: 0.9, def: 0.7, spd: 1.5, crit: 0.9 },
  dragoon:   { hp: 1.2, atk: 1.2, def: 1.0, spd: 0.8, crit: 1.0 },
  samurai:   { hp: 1.0, atk: 1.1, def: 1.1, spd: 1.1, crit: 1.2 },
  necromante:{ hp: 1.1, atk: 1.0, def: 0.9, spd: 0.7, crit: 0.9 },
  alchimista:{ hp: 1.0, atk: 1.0, def: 1.0, spd: 1.0, crit: 1.0 },
};
