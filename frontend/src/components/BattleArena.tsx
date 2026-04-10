import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HeroSprite, MonsterSprite } from './HeroSprite';
import { BattleLogEntry } from '../services/api';
import { HeroClass, Rarity, RARITY_COLORS } from '../types';

// ============================================
// TIPI
// ============================================

export interface ArenaFighter {
  id: string;
  name: string;
  monsterName?: string; // Nome base per sprite lookup (senza emoji)
  heroClass?: HeroClass;
  rarity?: Rarity;
  emoji?: string;
  tier?: string;
  isMonster: boolean;
  maxHp: number;
  currentHp: number;
  team: 'left' | 'right';
  isAlive: boolean;
}

interface FloatingText {
  id: number;
  fighterId: string;
  text: string;
  color: string;
  type: 'damage' | 'heal' | 'status' | 'crit' | 'miss';
}

interface BattleArenaProps {
  leftTeam: ArenaFighter[];
  rightTeam: ArenaFighter[];
  log: BattleLogEntry[];
  speed?: number;
  onComplete: () => void;
  onSkip: () => void;
}

// ============================================
// COMPONENTE ARENA
// ============================================

export function BattleArena({ leftTeam, rightTeam, log, speed = 800, onComplete, onSkip }: BattleArenaProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [fighters, setFighters] = useState<Map<string, ArenaFighter>>(new Map());
  const [activeActorId, setActiveActorId] = useState<string | null>(null);
  const [activeTargetId, setActiveTargetId] = useState<string | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [finished, setFinished] = useState(false);
  const floatCounter = useRef(0);
  const timerRef = useRef<number | null>(null);

  // Ref per lo stato corrente dei fighter — evita problemi di closure stale
  const fightersRef = useRef<Map<string, ArenaFighter>>(new Map());

  // Inizializza i fighter quando i team cambiano
  useEffect(() => {
    const map = new Map<string, ArenaFighter>();
    [...leftTeam, ...rightTeam].forEach(f => {
      map.set(f.id, { ...f }); // Rispetta isAlive dal prop (eroi morti da wave precedenti)
    });
    setFighters(map);
    fightersRef.current = map;
    setCurrentStep(0);
    setFinished(false);
    setCurrentMessage('');
    setFloatingTexts([]);
  }, [leftTeam, rightTeam]);

  // Avanza nel log
  useEffect(() => {
    if (finished) return;
    if (currentStep >= log.length) {
      setFinished(true);
      setTimeout(onComplete, 600);
      return;
    }

    timerRef.current = window.setTimeout(() => {
      processEntry(log[currentStep]);
      setCurrentStep(prev => prev + 1);
    }, speed);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentStep, finished, log, speed]);

  // Cleanup floating text
  useEffect(() => {
    if (floatingTexts.length === 0) return;
    const timer = setTimeout(() => {
      setFloatingTexts(prev => prev.slice(1));
    }, 1200);
    return () => clearTimeout(timer);
  }, [floatingTexts]);

  // Risolve l'ID di actor o target dall'entry del log.
  // Usa SOLO actorId/targetId (gli ID reali dal backend).
  function resolveId(entry: BattleLogEntry, field: 'actor' | 'target'): string | null {
    const id = field === 'actor' ? entry.actorId : entry.targetId;
    if (id && fightersRef.current.has(id)) return id;

    // L'attore 'status' non e un fighter
    const name = entry[field];
    if (!name || name === 'status') return null;

    // Fallback: cerca per ID diretto (gia tentato sopra) — non cerchiamo per nome
    // perche nomi duplicati (es. due Slime) causerebbero mismatch
    return null;
  }

  function processEntry(entry: BattleLogEntry) {
    setCurrentMessage(entry.message);

    const actorId = resolveId(entry, 'actor');
    const targetId = resolveId(entry, 'target');

    setActiveActorId(actorId);
    setActiveTargetId(targetId);

    if (targetId) {
      // Danno
      if (entry.damage) {
        setFighters(prev => {
          const next = new Map(prev);
          const f = next.get(targetId);
          if (f) {
            const updated = { ...f };
            updated.currentHp = Math.max(0, updated.currentHp - entry.damage!);
            if (updated.currentHp <= 0 || entry.killed) updated.isAlive = false;
            next.set(targetId, updated);
            fightersRef.current = next;
          }
          return next;
        });

        addFloat(targetId, `-${entry.damage}`, entry.isCrit ? '#f59e0b' : '#ef4444', entry.isCrit ? 'crit' : 'damage');
      }

      // Heal
      if (entry.heal) {
        setFighters(prev => {
          const next = new Map(prev);
          const f = next.get(targetId);
          if (f) {
            const updated = { ...f };
            updated.currentHp = Math.min(updated.maxHp, updated.currentHp + entry.heal!);
            next.set(targetId, updated);
            fightersRef.current = next;
          }
          return next;
        });

        addFloat(targetId, `+${entry.heal}`, '#22c55e', 'heal');
      }

      // Status
      if (entry.statusApplied) {
        addFloat(targetId, entry.statusApplied, '#a855f7', 'status');
      }

      // Morte senza danno (DoT kill)
      if (entry.killed && !entry.damage) {
        setFighters(prev => {
          const next = new Map(prev);
          const f = next.get(targetId);
          if (f) {
            const updated = { ...f, isAlive: false, currentHp: 0 };
            next.set(targetId, updated);
            fightersRef.current = next;
          }
          return next;
        });
      }
    }

    // Reset animazioni
    setTimeout(() => {
      setActiveActorId(null);
      setActiveTargetId(null);
    }, speed * 0.6);
  }

  function addFloat(fighterId: string, text: string, color: string, type: FloatingText['type']) {
    floatCounter.current++;
    setFloatingTexts(prev => [...prev, {
      id: floatCounter.current, fighterId, text, color, type,
    }]);
  }

  function handleSkip() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFinished(true);
    onSkip();
  }

  // ============ RENDER ============

  // Posizioni diagonali stile FF (sfalsati, non in fila)
  // left team: in basso a sinistra, formazione a V verso destra
  // right team: in basso a destra, formazione a V verso sinistra
  const getPosition = (index: number, total: number, side: 'left' | 'right') => {
    const baseX = side === 'left' ? 8 : 52;
    const dirX = side === 'left' ? 1 : -1;
    // Sfalsamento diagonale: ogni fighter successivo sale e si sposta
    const offsetX = index * 8 * dirX;
    const offsetY = index * 22;
    // Il primo e' in basso-davanti, l'ultimo in alto-dietro
    const bottom = 16 + offsetY;
    const left = baseX + offsetX;
    return { bottom: `${bottom}px`, left: `${left}%` };
  };

  const renderFighter = (fighter: ArenaFighter, index: number, total: number, side: 'left' | 'right') => {
    const isActing = activeActorId === fighter.id;
    const isTargeted = activeTargetId === fighter.id;
    const hpPercent = Math.max(0, (fighter.currentHp / fighter.maxHp) * 100);
    const hpColor = hpPercent > 50 ? '#22c55e' : hpPercent > 20 ? '#f59e0b' : '#ef4444';

    let animClass = '';
    if (!fighter.isAlive) animClass = 'dead';
    else if (isActing) animClass = 'acting';
    else if (isTargeted) animClass = 'hit';

    const myFloats = floatingTexts.filter(ft => ft.fighterId === fighter.id);
    const pos = getPosition(index, total, side);

    // Sprite piu' grande per chi e' davanti (prospettiva)
    const spriteSize = 44 - index * 2;
    // Ombra a terra sotto lo sprite
    const shadowWidth = spriteSize * 0.8;

    return (
      <div key={fighter.id} className={`arena-fighter ${animClass} arena-fighter-${side}`}
        style={{
          position: 'absolute',
          bottom: pos.bottom,
          left: pos.left,
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          opacity: fighter.isAlive ? 1 : 0.2,
          transition: 'opacity 0.5s ease',
          zIndex: 10 - index, // chi e' davanti ha z-index piu' alto
        }}
      >
        {/* Floating texts */}
        {myFloats.map(ft => (
          <div key={ft.id} className={`floating-text floating-${ft.type}`}
            style={{
              position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
              color: ft.color, zIndex: 20,
            }}>
            {ft.text}
          </div>
        ))}

        {/* Sprite */}
        <div className={`fighter-sprite-wrapper ${isActing ? 'sprite-acting' : ''} ${isTargeted ? 'sprite-hit' : ''}`}>
          {fighter.isMonster ? (
            <MonsterSprite name={fighter.monsterName || fighter.name} emoji={fighter.emoji || '👹'} tier={fighter.tier || 'minion'} size={spriteSize} />
          ) : (
            <HeroSprite heroClass={fighter.heroClass || 'lama'} rarity={fighter.rarity || 'comune'} size={spriteSize} flip={side === 'right'} name={fighter.name} />
          )}
        </div>

        {/* Ombra a terra */}
        <div style={{
          width: shadowWidth, height: 4, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%)',
          marginTop: -2,
        }} />

        {/* HP bar */}
        <div style={{ width: 46, marginTop: 2 }}>
          <div style={{ height: 4, background: 'rgba(0,0,0,0.5)', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{
              width: `${hpPercent}%`, height: '100%', background: hpColor,
              borderRadius: 2, transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Nome */}
        <div style={{
          fontSize: 7, color: fighter.isAlive ? '#ccc' : '#444',
          marginTop: 1, maxWidth: 52, overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center',
          textShadow: '0 1px 2px rgba(0,0,0,0.8)',
        }}>
          {fighter.name.length > 10 ? fighter.name.split(' ').pop() : fighter.name}
        </div>
      </div>
    );
  };

  // Ottieni lo stato corrente dei fighter
  const leftFighters = leftTeam.map(f => fighters.get(f.id) || f);
  const rightFighters = rightTeam.map(f => fighters.get(f.id) || f);

  return (
    <div className="battle-arena">
      <div className="arena-field">
        <div className="arena-bg" />
        {/* Linea orizzonte / terreno */}
        <div className="arena-ground" />

        {/* Fighter posizionati in diagonale stile FF */}
        {leftFighters.map((f, i) => renderFighter(f, i, leftFighters.length, 'left'))}
        {rightFighters.map((f, i) => renderFighter(f, i, rightFighters.length, 'right'))}

        {/* VS al centro, molto tenue */}
        <div className="arena-vs">VS</div>
      </div>

      {/* Messaggio */}
      <div className="arena-message">
        <div className="arena-message-text">{currentMessage || 'Preparazione...'}</div>
        <div className="arena-progress">
          <div style={{
            width: `${(currentStep / Math.max(1, log.length)) * 100}%`,
            height: '100%', background: '#9147ff', borderRadius: 2,
            transition: 'width 0.2s',
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
        <button className="btn btn-secondary" onClick={handleSkip} style={{ flex: 1, fontSize: 10, padding: '4px' }}>
          Salta
        </button>
      </div>
    </div>
  );
}
