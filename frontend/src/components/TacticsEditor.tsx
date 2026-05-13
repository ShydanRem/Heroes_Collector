import React, { useState } from 'react';
import { Hero, TacticalRule, TacticalTarget, TacticalCondition, TacticalAction } from '../types';

interface TacticsEditorProps {
  hero: Hero;
  initialRules?: TacticalRule[];
  onSave: (rules: TacticalRule[]) => void;
  onClose: () => void;
}

const TARGETS: { value: TacticalTarget; label: string }[] = [
  { value: 'self', label: 'Se Stesso' },
  { value: 'ally_lowest_hp', label: 'Alleato con meno HP' },
  { value: 'enemy_lowest_hp', label: 'Nemico con meno HP' },
  { value: 'enemy_boss', label: 'Boss Nemico' },
  { value: 'any_enemy', label: 'Qualsiasi Nemico' },
];

const CONDITIONS: { value: TacticalCondition; label: string }[] = [
  { value: 'always', label: 'Sempre' },
  { value: 'hp_lt_50', label: 'HP < 50%' },
  { value: 'hp_lt_25', label: 'HP < 25%' },
  { value: 'is_stunned', label: 'È Stordito' },
  { value: 'has_no_buff', label: 'Senza Potenziamenti' },
];

const ACTIONS: { value: TacticalAction; label: string }[] = [
  { value: 'attack', label: 'Attacca' },
  { value: 'heal', label: 'Cura' },
  { value: 'defend', label: 'Difendi' },
  { value: 'use_special', label: 'Usa Speciale' },
];

export function TacticsEditor({ hero, initialRules = [], onSave, onClose }: TacticsEditorProps) {
  // bondLevel non è implementato nel backend — permettiamo 5 slot sempre
  const maxRules = 5;

  const [rules, setRules] = useState<TacticalRule[]>(
    initialRules.length > 0 ? initialRules.slice(0, maxRules) : [{ id: '1', target: 'any_enemy', condition: 'always', action: 'attack', enabled: true }]
  );

  const addRule = () => {
    if (rules.length >= maxRules) return; // Limite regole
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
    setRules(rules.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  return (
    <div className="tactics-editor">
      <div className="tactics-header">
        <div>
          <h3>🧠 Strategia: {hero.displayName}</h3>
          <div style={{ fontSize: 10, color: '#ff4081', marginTop: 2 }}>
            🧠 ({rules.length}/{maxRules} Slot)
          </div>
        </div>
        <button className="btn-close" onClick={onClose}>×</button>
      </div>

      <div className="rules-list">
        {rules.map((rule, index) => (
          <div key={rule.id} className="tactic-rule-card">
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

            <div className="rule-actions">
              <button className="btn-remove-rule" onClick={() => removeRule(rule.id)}>Rimuovi</button>
            </div>
          </div>
        ))}
      </div>

      {rules.length < maxRules && (
        <button className="btn-add-rule" onClick={addRule}>+ Aggiungi Regola</button>
      )}



      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onSave(rules)}>Salva Tattiche</button>
        <button className="btn" style={{ flex: 1 }} onClick={onClose}>Annulla</button>
      </div>
    </div>
  );
}
