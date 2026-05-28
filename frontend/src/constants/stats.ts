export const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  atk: 'ATK',
  def: 'DEF',
  spd: 'SPD',
  crit: 'CRIT',
  critDmg: 'C.DMG',
};

// Soft cap per normalizzare le barre stat (visual reference, non gameplay)
export const STAT_MAX: Record<string, number> = {
  atk: 600,
  def: 500,
  hp: 6000,
  spd: 350,
  crit: 100,
  critDmg: 300,
};

export const STAT_ICONS: Record<string, string> = {
  atk: '⚔️',
  def: '🛡️',
  hp: '❤️',
  spd: '⚡',
  crit: '🎯',
  critDmg: '💥',
};

export const STAT_KEYS = ['atk', 'def', 'hp', 'spd', 'crit', 'critDmg'] as const;
export type StatKey = typeof STAT_KEYS[number];
