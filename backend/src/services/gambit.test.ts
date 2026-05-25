import { describe, it, expect } from 'vitest';
import { evaluateGambit, createFighter, BattleFighter } from './battleEngine';
import { StatusEffect } from '../types';

function fighter(team: 'attacker' | 'defender', o: Record<string, any> = {}): BattleFighter {
  const f = createFighter(
    {
      id: o.id || `${team}-${Math.random().toString(36).slice(2)}`,
      display_name: o.name || 'F',
      hero_class: o.hero_class || 'lama',
      hp: o.hp ?? 200,
      atk: o.atk ?? 40,
      def: o.def ?? 10,
      spd: o.spd ?? 30,
      ability_ids: o.ability_ids || ['atk_colpo_base'],
      tier: o.tier,
      isBoss: o.isBoss,
      tactics: o.tactics || [],
    },
    team,
  );
  if (typeof o.currentHp === 'number') f.currentHp = o.currentHp;
  if (o.statusEffects) f.statusEffects = o.statusEffects;
  return f;
}

const rule = (over: Record<string, any> = {}) => ({
  id: 'r', target: 'any_enemy', condition: 'always', action: 'attack', enabled: true, ...over,
});

describe('createFighter — isBoss', () => {
  it('flags a fighter built from a boss-tier monster', () => {
    expect(fighter('defender', { tier: 'boss' }).isBoss).toBe(true);
  });
  it('does not flag normal fighters', () => {
    expect(fighter('defender', { tier: 'minion' }).isBoss).toBe(false);
    expect(fighter('attacker').isBoss).toBe(false);
  });
  it('respects an explicit isBoss flag', () => {
    expect(fighter('defender', { isBoss: true }).isBoss).toBe(true);
  });
});

describe('evaluateGambit — basics', () => {
  it('returns null when there are no tactics', () => {
    const self = fighter('attacker');
    expect(evaluateGambit(self, [self], [fighter('defender')], ['atk_colpo_base'])).toBeNull();
  });

  it('always+any_enemy+attack picks an attack ability with no forced target', () => {
    const self = fighter('attacker', { tactics: [rule()] });
    const dec = evaluateGambit(self, [self], [fighter('defender')], ['atk_colpo_base']);
    expect(dec).not.toBeNull();
    expect(dec!.ability).toBe('atk_colpo_base');
    expect(dec!.targetId).toBeUndefined(); // any_enemy + always → targeting normale
  });

  it('skips a rule whose action has no matching ability, falls to next', () => {
    const self = fighter('attacker', {
      ability_ids: ['atk_colpo_base'],
      tactics: [rule({ action: 'heal' }), rule({ action: 'attack' })],
    });
    const dec = evaluateGambit(self, [self], [fighter('defender')], ['atk_colpo_base']);
    expect(dec!.ability).toBe('atk_colpo_base');
  });

  it('honours rule order (first matching wins)', () => {
    const self = fighter('attacker', {
      ability_ids: ['atk_colpo_base', 'sup_cura'],
      tactics: [rule({ target: 'self', condition: 'always', action: 'heal' }), rule({ action: 'attack' })],
    });
    const dec = evaluateGambit(self, [self], [fighter('defender')], ['atk_colpo_base', 'sup_cura']);
    expect(dec!.ability).toBe('sup_cura');
  });

  it('ignores disabled rules', () => {
    const self = fighter('attacker', {
      ability_ids: ['atk_colpo_base', 'sup_cura'],
      tactics: [rule({ target: 'self', action: 'heal', enabled: false }), rule({ action: 'attack' })],
    });
    const dec = evaluateGambit(self, [self], [fighter('defender')], ['atk_colpo_base', 'sup_cura']);
    expect(dec!.ability).toBe('atk_colpo_base');
  });
});

describe('Bug #2 — il target della regola guida l\'azione', () => {
  it('forza il target sul boss anche se non e\' la scelta di threat', () => {
    const self = fighter('attacker', { tactics: [rule({ target: 'enemy_boss', condition: 'always', action: 'attack' })] });
    const tank = fighter('defender', { id: 'tank', hero_class: 'guardiano', hp: 500 });
    const boss = fighter('defender', { id: 'boss', tier: 'boss', hp: 300 });
    const dec = evaluateGambit(self, [self], [tank, boss], ['atk_colpo_base']);
    expect(dec!.targetId).toBe('boss');
  });

  it('enemy_lowest_hp punta il nemico piu\' debole', () => {
    const self = fighter('attacker', { tactics: [rule({ target: 'enemy_lowest_hp', action: 'attack' })] });
    const full = fighter('defender', { id: 'full', hp: 200, currentHp: 200 });
    const weak = fighter('defender', { id: 'weak', hp: 200, currentHp: 20 });
    const dec = evaluateGambit(self, [self], [full, weak], ['atk_colpo_base']);
    expect(dec!.targetId).toBe('weak');
  });
});

describe('Bug #3 — has_no_buff ignora i debuff', () => {
  it('scatta su un nemico che ha SOLO un debuff (veleno)', () => {
    const self = fighter('attacker', { tactics: [rule({ target: 'any_enemy', condition: 'has_no_buff', action: 'attack' })] });
    const poisoned = fighter('defender', {
      id: 'poison',
      statusEffects: [{ effect: StatusEffect.VELENO, duration: 3, power: 5, source: 'x' }],
    });
    const dec = evaluateGambit(self, [self], [poisoned], ['atk_colpo_base']);
    expect(dec).not.toBeNull();
    expect(dec!.targetId).toBe('poison'); // condizione specifica → target forzato
  });

  it('NON scatta su un nemico che ha un buff vero (scudo)', () => {
    const self = fighter('attacker', { tactics: [rule({ target: 'enemy_boss', condition: 'has_no_buff', action: 'attack' })] });
    const shielded = fighter('defender', {
      id: 'boss', tier: 'boss',
      statusEffects: [{ effect: StatusEffect.SCUDO, duration: 2, power: 1, source: 'x' }],
    });
    const dec = evaluateGambit(self, [self], [shielded], ['atk_colpo_base']);
    expect(dec).toBeNull();
  });
});

describe('Bug #4 — hp_lt_X valutato sul target specifico, non sul gruppo', () => {
  it('hp_lt_25 SU enemy_boss NON scatta se solo un minion e\' basso', () => {
    const self = fighter('attacker', { tactics: [rule({ target: 'enemy_boss', condition: 'hp_lt_25', action: 'use_special' })] });
    const minion = fighter('defender', { id: 'min', hp: 100, currentHp: 5 });   // basso
    const boss = fighter('defender', { id: 'boss', tier: 'boss', hp: 300, currentHp: 300 }); // pieno
    const dec = evaluateGambit(self, [self], [minion, boss], ['ult_mille_lame']);
    expect(dec).toBeNull(); // il boss e' pieno → la regola non deve scattare
  });

  it('hp_lt_25 SU enemy_boss scatta quando il boss e\' davvero basso', () => {
    const self = fighter('attacker', { tactics: [rule({ target: 'enemy_boss', condition: 'hp_lt_25', action: 'use_special' })] });
    const minion = fighter('defender', { id: 'min', hp: 100, currentHp: 100 });
    const boss = fighter('defender', { id: 'boss', tier: 'boss', hp: 300, currentHp: 30 });
    const dec = evaluateGambit(self, [self], [minion, boss], ['ult_mille_lame']);
    expect(dec).not.toBeNull();
    expect(dec!.targetId).toBe('boss');
  });

  it('hp_lt_50 SU self guarda solo il proprio HP', () => {
    const self = fighter('attacker', {
      hp: 200, currentHp: 60, // 30%
      ability_ids: ['sup_cura'],
      tactics: [rule({ target: 'self', condition: 'hp_lt_50', action: 'heal' })],
    });
    const dec = evaluateGambit(self, [self], [fighter('defender')], ['sup_cura']);
    expect(dec).not.toBeNull();
    expect(dec!.targetId).toBe(self.id);
  });
});

describe('Bug #5 — enemy_boss ripiega correttamente senza boss flaggato', () => {
  it('senza boss, enemy_boss prende il nemico con piu\' HP max', () => {
    const self = fighter('attacker', { tactics: [rule({ target: 'enemy_boss', condition: 'always', action: 'attack' })] });
    const small = fighter('defender', { id: 'small', hp: 100 });
    const big = fighter('defender', { id: 'big', hp: 800 });
    const dec = evaluateGambit(self, [self], [small, big], ['atk_colpo_base']);
    expect(dec!.targetId).toBe('big');
  });
});
