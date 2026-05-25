// Validazione pura delle regole Gambit (nessuna dipendenza da Express/DB → testabile).
// Il vocabolario deve combaciare con il frontend TacticsEditor e con il motore di combattimento.

export const VALID_TARGETS = new Set(['self', 'ally_lowest_hp', 'enemy_lowest_hp', 'enemy_boss', 'any_enemy']);
export const VALID_CONDITIONS = new Set([
  'always', 'hp_lt_50', 'hp_lt_25', 'hp_gt_80', 'is_stunned', 'has_no_buff',
  'ultimate_ready', 'ally_dead', 'enemy_count_geq_3', 'turn_geq_3',
]);
export const VALID_ACTIONS = new Set(['attack', 'heal', 'defend', 'use_special']);
export const MAX_RULES = 10; // headroom oltre i 5 slot della UI, ma evita row bloat / DoS

export interface CleanRule {
  id: string;
  target: string;
  condition: string;
  action: string;
  enabled: boolean;
}

export type SanitizeResult =
  | { ok: true; rules: CleanRule[] }
  | { ok: false; error: string };

/**
 * Valida e normalizza un array di regole Gambit. Scarta JSON arbitrario:
 * accetta solo regole con target/condizione/azione note, cappa il numero di regole.
 */
export function sanitizeRules(rules: unknown): SanitizeResult {
  if (!Array.isArray(rules)) {
    return { ok: false, error: 'Le regole devono essere una lista' };
  }
  if (rules.length > MAX_RULES) {
    return { ok: false, error: `Troppe regole (max ${MAX_RULES})` };
  }
  const clean: CleanRule[] = [];
  for (let i = 0; i < rules.length; i++) {
    const r = rules[i] as Record<string, unknown>;
    if (!r || typeof r !== 'object') return { ok: false, error: `Regola ${i + 1} non valida` };
    if (!VALID_TARGETS.has(r.target as string)) return { ok: false, error: `Regola ${i + 1}: target non valido` };
    if (!VALID_CONDITIONS.has(r.condition as string)) return { ok: false, error: `Regola ${i + 1}: condizione non valida` };
    if (!VALID_ACTIONS.has(r.action as string)) return { ok: false, error: `Regola ${i + 1}: azione non valida` };
    clean.push({
      id: typeof r.id === 'string' ? r.id.slice(0, 32) : String(i),
      target: r.target as string,
      condition: r.condition as string,
      action: r.action as string,
      enabled: r.enabled !== false,
    });
  }
  return { ok: true, rules: clean };
}
