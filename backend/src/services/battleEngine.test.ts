import { describe, it, expect } from 'vitest';
import {
  runBattle,
  createFighter,
  applyTalentBonuses,
  applySynergies,
  BattleFighter,
} from './battleEngine';

function makeFighter(
  team: 'attacker' | 'defender',
  overrides: Record<string, any> = {},
): BattleFighter {
  return createFighter(
    {
      id: overrides.id || `${team}-${Math.random()}`,
      display_name: overrides.name || 'Tester',
      hero_class: overrides.hero_class || 'lama',
      hp: overrides.hp ?? 200,
      atk: overrides.atk ?? 40,
      def: overrides.def ?? 10,
      spd: overrides.spd ?? 30,
      crit: overrides.crit ?? 5,
      crit_dmg: overrides.crit_dmg ?? 150,
      ability_ids: overrides.ability_ids || ['atk_colpo_base'],
    },
    team,
  );
}

describe('createFighter', () => {
  it('maps snake_case DB fields and starts at full HP and alive', () => {
    const f = createFighter(
      { id: 'x', display_name: 'Hero', hero_class: 'arcano', hp: 150, atk: 33 },
      'attacker',
    );
    expect(f.name).toBe('Hero');
    expect(f.heroClass).toBe('arcano');
    expect(f.maxHp).toBe(150);
    expect(f.currentHp).toBe(150);
    expect(f.stats.atk).toBe(33);
    expect(f.isAlive).toBe(true);
  });

  it('applies sane defaults for missing fields', () => {
    const f = createFighter({ id: 'y' }, 'defender');
    expect(f.maxHp).toBe(100);
    expect(f.abilities).toContain('atk_colpo_base');
    expect(f.isAlive).toBe(true);
  });
});

describe('runBattle', () => {
  it('declares the attacker the winner instantly when there are no defenders', () => {
    const outcome = runBattle([makeFighter('attacker')], []);
    expect(outcome.won).toBe(true);
    expect(outcome.totalTurns).toBe(0);
  });

  it('always terminates within MAX_TURNS', () => {
    for (let i = 0; i < 10; i++) {
      const outcome = runBattle(
        [makeFighter('attacker'), makeFighter('attacker')],
        [makeFighter('defender'), makeFighter('defender')],
      );
      expect(outcome.totalTurns).toBeGreaterThanOrEqual(0);
      expect(outcome.totalTurns).toBeLessThanOrEqual(30);
    }
  });

  it('returns a well-formed outcome', () => {
    const outcome = runBattle([makeFighter('attacker')], [makeFighter('defender')]);
    expect(Array.isArray(outcome.log)).toBe(true);
    expect(Array.isArray(outcome.survivingAttackers)).toBe(true);
    expect(Array.isArray(outcome.survivingDefenders)).toBe(true);
    expect(typeof outcome.totalDamageDealt).toBe('number');
    expect(outcome.totalDamageDealt).toBeGreaterThanOrEqual(0);
  });

  it('a vastly stronger party reliably wins (RNG-robust over many runs)', () => {
    const strong = () => makeFighter('attacker', { hp: 2000, atk: 300, def: 80, spd: 120 });
    const weak = () => makeFighter('defender', { hp: 40, atk: 3, def: 0, spd: 8 });
    for (let i = 0; i < 25; i++) {
      const outcome = runBattle([strong(), strong()], [weak()]);
      expect(outcome.won).toBe(true);
    }
  });

  it('does not mutate a fighter into negative HP', () => {
    const attackers = [makeFighter('attacker', { atk: 500 })];
    const defenders = [makeFighter('defender', { hp: 60 })];
    runBattle(attackers, defenders);
    for (const f of [...attackers, ...defenders]) {
      expect(f.currentHp).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('applyTalentBonuses', () => {
  it('raises HP (max and current) by a percentage', () => {
    const f = makeFighter('attacker', { hp: 100 });
    applyTalentBonuses(f, { hp: 50 });
    expect(f.maxHp).toBe(150);
    expect(f.currentHp).toBe(150);
  });

  it('raises a flat stat by a percentage', () => {
    const f = makeFighter('attacker', { atk: 100 });
    applyTalentBonuses(f, { atk: 25 });
    expect(f.stats.atk).toBe(125);
  });
});

describe('applySynergies', () => {
  it('returns the list of active synergies without throwing', () => {
    const party = [
      makeFighter('attacker', { hero_class: 'guardiano' }),
      makeFighter('attacker', { hero_class: 'arcano' }),
    ];
    const synergies = applySynergies(party);
    expect(Array.isArray(synergies)).toBe(true);
  });
});
