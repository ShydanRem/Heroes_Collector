import { describe, it, expect } from 'vitest';
import { sanitizeRules, MAX_RULES } from './tacticsValidation';

const good = { id: 'a', target: 'any_enemy', condition: 'always', action: 'attack', enabled: true };

describe('sanitizeRules', () => {
  it('accetta una regola valida e la normalizza', () => {
    const r = sanitizeRules([good]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.rules).toHaveLength(1);
      expect(r.rules[0]).toEqual({ id: 'a', target: 'any_enemy', condition: 'always', action: 'attack', enabled: true });
    }
  });

  it('accetta una lista vuota', () => {
    const r = sanitizeRules([]);
    expect(r.ok).toBe(true);
  });

  it('rifiuta input non-array', () => {
    expect(sanitizeRules('nope' as unknown).ok).toBe(false);
    expect(sanitizeRules(null as unknown).ok).toBe(false);
  });

  it('rifiuta target/condizione/azione sconosciuti', () => {
    expect(sanitizeRules([{ ...good, target: 'hack' }]).ok).toBe(false);
    expect(sanitizeRules([{ ...good, condition: 'drop_table' }]).ok).toBe(false);
    expect(sanitizeRules([{ ...good, action: 'rm_rf' }]).ok).toBe(false);
  });

  it('rifiuta elementi non-oggetto', () => {
    expect(sanitizeRules([42]).ok).toBe(false);
    expect(sanitizeRules([null]).ok).toBe(false);
  });

  it('cappa il numero di regole', () => {
    const many = Array.from({ length: MAX_RULES + 1 }, () => ({ ...good }));
    expect(sanitizeRules(many).ok).toBe(false);
  });

  it('default enabled=true se assente, false rispettato', () => {
    const r1 = sanitizeRules([{ target: 'self', condition: 'always', action: 'heal' }]);
    const r2 = sanitizeRules([{ ...good, enabled: false }]);
    expect(r1.ok && r1.rules[0].enabled).toBe(true);
    expect(r2.ok && r2.rules[0].enabled).toBe(false);
  });

  it('tronca id troppo lunghi e scarta campi extra (no JSON arbitrario)', () => {
    const r = sanitizeRules([{ ...good, id: 'x'.repeat(100), evil: 'payload' } as Record<string, unknown>]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.rules[0].id.length).toBeLessThanOrEqual(32);
      expect('evil' in r.rules[0]).toBe(false);
    }
  });
});
