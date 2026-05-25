import React, { useState } from 'react';
import { Hero, TacticalRule, TacticalTarget, TacticalCondition, TacticalAction } from '../types';

interface TacticsEditorProps {
  hero: Hero;
  initialRules?: TacticalRule[];
  onSave: (rules: TacticalRule[]) => void;
  onClose: () => void;
}

const TARGETS: { value: TacticalTarget; label: string }[] = [
  { value: 'self', label: '🛡️ Se Stesso' },
  { value: 'ally_lowest_hp', label: '💚 Alleato ferito' },
  { value: 'enemy_lowest_hp', label: '🎯 Nemico più debole' },
  { value: 'enemy_boss', label: '👑 Boss Nemico' },
  { value: 'any_enemy', label: '⚔️ Qualsiasi Nemico' },
];

const CONDITIONS: { value: TacticalCondition; label: string }[] = [
  { value: 'always', label: 'Sempre' },
  { value: 'hp_lt_50', label: 'HP < 50%' },
  { value: 'hp_lt_25', label: 'HP < 25%' },
  { value: 'hp_gt_80', label: 'HP > 80%' },
  { value: 'is_stunned', label: 'È Stordito' },
  { value: 'has_no_buff', label: 'Senza Potenziamenti' },
  { value: 'ultimate_ready', label: 'Suprema Pronta' },
  { value: 'ally_dead', label: 'Alleato Caduto' },
  { value: 'enemy_count_geq_3', label: '3+ Nemici in campo' },
  { value: 'turn_geq_3', label: 'Dal Turno 3' },
];

const ACTIONS: { value: TacticalAction; label: string }[] = [
  { value: 'attack', label: '⚔️ Attacca' },
  { value: 'heal', label: '💚 Cura' },
  { value: 'defend', label: '🛡️ Difendi' },
  { value: 'use_special', label: '✨ Usa Speciale' },
];

const MAX_RULES = 5;

export function TacticsEditor({ hero, initialRules = [], onSave, onClose }: TacticsEditorProps) {
  const [rules, setRules] = useState<TacticalRule[]>(
    initialRules.length > 0
      ? initialRules.slice(0, MAX_RULES)
      : [{ id: '1', target: 'any_enemy', condition: 'always', action: 'attack', enabled: true }]
  );

  const addRule = () => {
    if (rules.length >= MAX_RULES) return;
    const newRule: TacticalRule = {
      id: Math.random().toString(36).substr(2, 9),
      target: 'any_enemy',
      condition: 'always',
      action: 'attack',
      enabled: true,
    };
    setRules([...rules, newRule]);
  };

  const removeRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const updateRule = (id: string, updates: Partial<TacticalRule>) => {
    setRules(rules.map(r => (r.id === id ? { ...r, ...updates } : r)));
  };

  const moveRule = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= rules.length) return;
    const next = [...rules];
    [next[index], next[target]] = [next[target], next[index]];
    setRules(next);
  };

  return (
    <div className="tactics-editor">
      <div className="tactics-header">
        <div>
          <h3>🧠 Strategia: {hero.displayName}</h3>
          <div className="tactics-hint">
            Le regole si leggono dall'alto: scatta la <b>prima</b> che corrisponde. {rules.length}/{MAX_RULES} slot
          </div>
        </div>
        <button className="btn-close" onClick={onClose}>×</button>
      </div>

      <div className="rules-list">
        {rules.map((rule, index) => (
          <div key={rule.id} className={`tactic-rule-card ${rule.enabled === false ? 'rule-disabled' : ''}`}>
            <div className="rule-priority" title="Priorità (1 = massima)">{index + 1}</div>

            <div className="rule-body">
              <div className="rule-row">
                <span className="rule-label">SE</span>
                <select
                  className="rule-select"
                  value={rule.condition}
                  onChange={(e) => updateRule(rule.id, { condition: e.target.value as TacticalCondition })}
                >
                  {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              <div className="rule-row">
                <span className="rule-label">SU</span>
                <select
                  className="rule-select"
                  value={rule.target}
                  onChange={(e) => updateRule(rule.id, { target: e.target.value as TacticalTarget })}
                >
                  {TARGETS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div className="rule-row">
                <span className="rule-label">ALLORA</span>
                <select
                  className="rule-select"
                  value={rule.action}
                  onChange={(e) => updateRule(rule.id, { action: e.target.value as TacticalAction })}
                >
                  {ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
            </div>

            <div className="rule-controls">
              <button
                className={`rule-toggle ${rule.enabled === false ? 'off' : 'on'}`}
                title={rule.enabled === false ? 'Regola disattivata' : 'Regola attiva'}
                onClick={() => updateRule(rule.id, { enabled: rule.enabled === false })}
              >
                {rule.enabled === false ? '○' : '●'}
              </button>
              <button className="rule-move" disabled={index === 0} title="Su" onClick={() => moveRule(index, -1)}>▲</button>
              <button className="rule-move" disabled={index === rules.length - 1} title="Giù" onClick={() => moveRule(index, 1)}>▼</button>
              <button className="rule-del" title="Rimuovi" onClick={() => removeRule(rule.id)}>🗑</button>
            </div>
          </div>
        ))}
      </div>

      {rules.length < MAX_RULES && (
        <button className="btn-add-rule" onClick={addRule}>+ Aggiungi Regola</button>
      )}

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onSave(rules)}>Salva Tattiche</button>
        <button className="btn" style={{ flex: 1 }} onClick={onClose}>Annulla</button>
      </div>
    </div>
  );
}
