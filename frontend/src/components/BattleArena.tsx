import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HeroSprite, MonsterSprite } from './HeroSprite';
import { BattleLogEntry } from '../services/api';
import { HeroClass, Rarity, RARITY_COLORS } from '../types';

// REPRO bug velocità (pre-fix, ora corretto): set speed=150 (3x) e gira un
// dungeon con 8+ eroi. Prima del fix: 10+ floating text sovrapposti,
// bubbles che restano per secondi, shake/flash che persiste tra turni,
// ultimate che dura 10× più del normale. Vedi commits del 13/05/2026.

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

interface BattleBubble {
  id: number;
  fighterId: string;
  text: string;
}

const BATTLE_QUOTES: Record<string, string[]> = {
  lama: ["Per l'onore!", "Senti il mio acciaio!", "Troppo lento!", "Colpo letale!"],
  arcano: ["Potere ancestrale!", "Brucia!", "Dissolviti!", "Magia pura!"],
  ombra: ["Dalle tenebre...", "Non mi vedi nemmeno.", "Pugnalata alle spalle!", "Shh..."],
  guardiano: ["Non passerai!", "Scudo alzato!", "Per i miei compagni!", "Infrangiti su di me!"],
  default: ["Prendi questo!", "Hah!", "Aaaargh!", "Muori!", "Per Shydan!"]
};

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
  const [actionType, setActionType] = useState<'melee' | 'magic' | 'heal' | 'buff' | 'ultimate' | null>(null);
  const [isUltimateActive, setIsUltimateActive] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [bubbles, setBubbles] = useState<BattleBubble[]>([]);
  const [comboCount, setComboCount] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isImpactActive, setIsImpactActive] = useState(false);
  const [isCelebration, setIsCelebration] = useState(false);
  const [finished, setFinished] = useState(false);
  const floatCounter = useRef(0);
  const bubbleCounter = useRef(0);
  const timerRef = useRef<number | null>(null);
  // Refs per i timer dei reset FX — evitano che fire-and-forget di un turno
  // resetti lo stato di un turno successivo alle velocità alte.
  const ultimateTimerRef = useRef<number | null>(null);
  const critTimerRef = useRef<number | null>(null);
  const animResetTimerRef = useRef<number | null>(null);

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
      
      // Se abbiamo vinto l'ondata, celebra!
      const lastEntry = log[log.length - 1];
      if (lastEntry && !lastEntry.message.toLowerCase().includes('sconfitta')) {
        setIsCelebration(true);
        setTimeout(onComplete, 1500);
      } else {
        setTimeout(onComplete, 600);
      }
      return;
    }

    const entry = log[currentStep];
    processEntry(entry);
    
    // Calcola tempo prossimo turno: più lungo se c'è un critico o evento importante
    let nextDelay = speed;
    if (entry.isCrit) nextDelay = speed * 1.5;
    if (entry.killed) nextDelay = speed * 1.2;
    if (entry.message.includes('Status') || entry.message.includes('subito')) nextDelay = speed * 0.7; // Veloci per i DoT
    
    const ultimateNames = [
      'Bastione Immortale', 'Danza della Morte', 'Apocalisse Arcana', 'Resurrezione',
      'Eclissi Totale', 'Pioggia Infernale', 'Spiriti Ancestrali', 'Rottura Dimensionale',
      'Pioggia di Lance', 'Mille Lame', 'Eclissi dell\'Anima', 'Bomba Alchemica'
    ];
    if (entry.action && ultimateNames.some(name => entry.action!.includes(name))) {
      // Ultimate ha sempre durata extra ma scalata sulla velocità (min 700ms)
      nextDelay = Math.max(nextDelay, Math.max(700, speed * 2.5));
    }

    timerRef.current = window.setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, nextDelay);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentStep, finished, log, speed]);

  // Cleanup floating text — vita scalata sulla velocità così alla 3x
  // non si accumulano. Minimo 250ms per restare leggibili.
  useEffect(() => {
    if (floatingTexts.length === 0) return;
    const lifeMs = Math.max(250, speed * 1.5);
    const timer = setTimeout(() => {
      setFloatingTexts(prev => prev.slice(1));
    }, lifeMs);
    return () => clearTimeout(timer);
  }, [floatingTexts, speed]);

  // Cleanup bubbles (chatter) — vita più lunga per leggibilità ma scalata.
  useEffect(() => {
    if (bubbles.length === 0) return;
    const lifeMs = Math.max(400, speed * 2);
    const timer = setTimeout(() => {
      setBubbles(prev => prev.slice(1));
    }, lifeMs);
    return () => clearTimeout(timer);
  }, [bubbles, speed]);

  // Audio Hook Placeholder per le Supreme
  useEffect(() => {
    if (isUltimateActive) {
      console.log('[AUDIO] Riproduzione suono Suprema: BWOOOSH!');
      // window.playBattleSound?.('ultimate_cast'); // Futura integrazione audio
    }
  }, [isUltimateActive]);

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

    // Gestione Combo e Battle Chatter
    if (actorId) {
      const actor = fightersRef.current.get(actorId);
      if (actor && actor.team === 'left' && entry.damage) {
        setComboCount(prev => prev + 1);
      } else if (actor && actor.team === 'right' && entry.damage) {
        setComboCount(0); // Combo interrotta se il nemico colpisce
      }

      // Battle Chatter (30% chance)
      if (Math.random() < 0.3 && actor && actor.isAlive) {
        const quotes = BATTLE_QUOTES[actor.heroClass || 'default'] || BATTLE_QUOTES.default;
        const text = quotes[Math.floor(Math.random() * quotes.length)];
        bubbleCounter.current++;
        setBubbles(prev => [...prev, { id: bubbleCounter.current, fighterId: actorId, text }]);
      }
    }

    const ultimateNames = [
      'Bastione Immortale', 'Danza della Morte', 'Apocalisse Arcana', 'Resurrezione',
      'Eclissi Totale', 'Pioggia Infernale', 'Spiriti Ancestrali', 'Rottura Dimensionale',
      'Pioggia di Lance', 'Mille Lame', 'Eclissi dell\'Anima', 'Bomba Alchemica'
    ];

    if (entry.action && ultimateNames.some(name => entry.action.includes(name))) {
      setActionType('ultimate');
      setIsUltimateActive(true);
      setIsShaking(true);
      setIsFlashing(true);
      if (ultimateTimerRef.current) clearTimeout(ultimateTimerRef.current);
      ultimateTimerRef.current = window.setTimeout(() => {
        setIsUltimateActive(false);
        setIsShaking(false);
        setIsFlashing(false);
      }, Math.max(600, speed * 1.5)); // freeze ultimate scalato sulla velocità
    } else if (entry.heal) {
      setActionType('heal');
    } else if (entry.statusApplied && !entry.damage) {
      setActionType('buff');
    } else if (entry.action && (
      entry.action.toLowerCase().includes('arcano') ||
      entry.action.toLowerCase().includes('magia') ||
      entry.action.toLowerCase().includes('fuoco') ||
      entry.action.toLowerCase().includes('tuono') ||
      entry.action.toLowerCase().includes('oscur') ||
      entry.action.toLowerCase().includes('dardo') ||
      entry.action.toLowerCase().includes('tempesta') ||
      entry.action.toLowerCase().includes('nube') ||
      entry.action.toLowerCase().includes('piaga') ||
      entry.action.toLowerCase().includes('eclissi') ||
      entry.action.toLowerCase().includes('bomba') ||
      entry.action.toLowerCase().includes('fiala') ||
      entry.action.toLowerCase().includes('tocco della morte') ||
      entry.action.toLowerCase().includes('maledizione') ||
      entry.action.toLowerCase().includes('pioggia')
    )) {
      setActionType('magic');
    } else {
      setActionType('melee');
    }

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

        if (entry.isCrit) {
          setIsShaking(true);
          setIsFlashing(true);
          setIsImpactActive(true);
          if (critTimerRef.current) clearTimeout(critTimerRef.current);
          critTimerRef.current = window.setTimeout(() => {
            setIsShaking(false);
            setIsFlashing(false);
            setIsImpactActive(false);
          }, Math.max(200, speed * 0.5));
        }
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

    // Reset animazioni — tracciato in ref per evitare reset di stati di turni successivi
    if (animResetTimerRef.current) clearTimeout(animResetTimerRef.current);
    animResetTimerRef.current = window.setTimeout(() => {
      setActiveActorId(null);
      setActiveTargetId(null);
      setActionType(null);
    }, Math.max(80, speed * 0.6));
  }

  function addFloat(fighterId: string, text: string, color: string, type: FloatingText['type']) {
    floatCounter.current++;
    setFloatingTexts(prev => [...prev, {
      id: floatCounter.current, fighterId, text, color, type,
    }]);
  }

  // Cleanup di TUTTI i timer su unmount — evita aggiornamenti su componente smontato
  useEffect(() => {
    return () => {
      [timerRef, ultimateTimerRef, critTimerRef, animResetTimerRef].forEach(ref => {
        if (ref.current) clearTimeout(ref.current);
      });
    };
  }, []);

  function handleSkip() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFinished(true);
    onSkip();
  }

  // ============ RENDER ============

  // Ruoli per determinare front/back row
  const FRONT_ROLES = new Set(['guardiano', 'dragoon', 'lama', 'samurai', 'ombra']);
  // Tutto il resto (arcano, custode, ranger, sciamano, crono, necromante, alchimista) = back

  function isFrontRow(fighter: ArenaFighter): boolean {
    if (fighter.isMonster) return true; // i mostri non hanno classe, gestiamo con stagger
    return FRONT_ROLES.has(fighter.heroClass || '');
  }

  // Posiziona il party (left): front row davanti, back row dietro
  // Posiziona i nemici (right): sfalsati fronte/retro alternati
  function getFormation(team: ArenaFighter[], side: 'left' | 'right'): { fighter: ArenaFighter; x: number; y: number; row: 'front' | 'back' }[] {
    if (side === 'left') {
      // Party: dividi in front e back per ruolo
      const front = team.filter(f => isFrontRow(f));
      const back = team.filter(f => !isFrontRow(f));
      const positions: { fighter: ArenaFighter; x: number; y: number; row: 'front' | 'back' }[] = [];

      // Front row: X piu' avanti (verso il centro), distribuiti verticalmente
      front.forEach((f, i) => {
        const totalFront = front.length;
        const spacing = Math.min(40, 120 / Math.max(totalFront, 1));
        const startY = 110 - ((totalFront - 1) * spacing) / 2;
        positions.push({ fighter: f, x: 28, y: startY + i * spacing, row: 'front' });
      });

      // Back row: X piu' indietro (verso il bordo sinistro)
      back.forEach((f, i) => {
        const totalBack = back.length;
        const spacing = Math.min(40, 120 / Math.max(totalBack, 1));
        const startY = 110 - ((totalBack - 1) * spacing) / 2;
        positions.push({ fighter: f, x: 10, y: startY + i * spacing, row: 'back' });
      });

      return positions;
    } else {
      // Right team: controlla se sono eroi (PVP) o mostri (dungeon)
      const hasHeroes = team.some(f => !f.isMonster);

      if (hasHeroes) {
        // PVP: stessa logica del party ma specchiata
        const front = team.filter(f => isFrontRow(f));
        const back = team.filter(f => !isFrontRow(f));
        const positions: { fighter: ArenaFighter; x: number; y: number; row: 'front' | 'back' }[] = [];

        front.forEach((f, i) => {
          const totalFront = front.length;
          const spacing = Math.min(40, 120 / Math.max(totalFront, 1));
          const startY = 110 - ((totalFront - 1) * spacing) / 2;
          positions.push({ fighter: f, x: 70, y: startY + i * spacing, row: 'front' });
        });

        back.forEach((f, i) => {
          const totalBack = back.length;
          const spacing = Math.min(40, 120 / Math.max(totalBack, 1));
          const startY = 110 - ((totalBack - 1) * spacing) / 2;
          positions.push({ fighter: f, x: 88, y: startY + i * spacing, row: 'back' });
        });

        return positions;
      } else {
        // Dungeon: mostri sfalsati fronte/retro alternati
        const positions: { fighter: ArenaFighter; x: number; y: number; row: 'front' | 'back' }[] = [];
        const total = team.length;
        const spacing = Math.min(38, 120 / Math.max(total, 1));
        const startY = 110 - ((total - 1) * spacing) / 2;

        team.forEach((f, i) => {
          const isFront = i % 2 === 0;
          positions.push({
            fighter: f,
            x: isFront ? 68 : 86,
            y: startY + i * spacing,
            row: isFront ? 'front' : 'back',
          });
        });

        return positions;
      }
    }
  }

  const renderFighter = (fighter: ArenaFighter, x: number, y: number, row: 'front' | 'back', side: 'left' | 'right') => {
    const isActing = activeActorId === fighter.id;
    const isTargeted = activeTargetId === fighter.id;
    const hpPercent = Math.max(0, (fighter.currentHp / fighter.maxHp) * 100);
    const hpColor = hpPercent > 50 ? '#22c55e' : hpPercent > 20 ? '#f59e0b' : '#ef4444';

    let animClass = '';
    if (!fighter.isAlive) animClass = 'dead';
    else if (isCelebration && fighter.team === 'left') animClass = 'celebrate';
    else if (isActing) animClass = `acting action-${actionType || 'melee'}`;
    else if (isTargeted) animClass = 'hit';

    const myFloats = floatingTexts.filter(ft => ft.fighterId === fighter.id);
    const myBubble = bubbles.find(b => b.fighterId === fighter.id);

    // Front row sprite leggermente piu' grande
    const spriteSize = row === 'front' ? 42 : 36;
    const shadowWidth = spriteSize * 0.7;

    return (
      <div key={fighter.id} className={`arena-fighter ${animClass} arena-fighter-${side}`}
        style={{
          position: 'absolute',
          left: `${x}%`,
          top: `${y}px`,
          transform: 'translate(-50%, -50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          opacity: fighter.isAlive ? 1 : 0.2,
          transition: 'opacity 0.5s ease',
          zIndex: row === 'front' ? 6 : 4,
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

        {/* Battle Bubble */}
        {myBubble && (
          <div className="battle-bubble" style={{ position: 'absolute', top: -35, left: side === 'left' ? 20 : -20 }}>
            {myBubble.text}
          </div>
        )}

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
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.35) 0%, transparent 70%)',
          marginTop: -1,
        }} />

        {/* HP bar */}
        <div style={{ width: 44, marginTop: 1 }}>
          <div style={{ height: 3, background: 'rgba(0,0,0,0.5)', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{
              width: `${hpPercent}%`, height: '100%', background: hpColor,
              borderRadius: 2, transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Nome */}
        <div style={{
          fontSize: 7, color: fighter.isAlive ? '#bbb' : '#444',
          marginTop: 1, maxWidth: 50, overflow: 'hidden',
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
    <div className={`battle-arena ${isShaking ? 'screen-shake' : ''} ${isUltimateActive ? 'ultimate-active' : ''}`}>
      <div className={`arena-field ${isFlashing ? 'impact-flash' : ''} ${(isShaking || activeTargetId) ? 'zoom-focus' : ''} ${isUltimateActive ? 'ultimate-dark-bg' : ''}`}>
        <div className="arena-bg" />
        {/* Linea orizzonte / terreno */}
        <div className="arena-ground" />

        {/* Effects Layer */}
        <div className={`screen-impact ${isImpactActive ? 'impact-active' : ''}`} />
        <div className={`ultimate-flash ${isUltimateActive ? 'active' : ''}`} />

        {/* Combo Display */}
        {comboCount >= 2 && (
          <div className="combo-display">
            <div className="combo-count">{comboCount}</div>
            <div className="combo-label">COMBO</div>
          </div>
        )}

        {/* Party a sinistra: melee davanti, caster/healer dietro */}
        {getFormation(leftFighters, 'left').map(({ fighter, x, y, row }) =>
          renderFighter(fighter, x, y, row, 'left')
        )}
        {/* Nemici a destra: sfalsati fronte/retro */}
        {getFormation(rightFighters, 'right').map(({ fighter, x, y, row }) =>
          renderFighter(fighter, x, y, row, 'right')
        )}

        {/* VS al centro, molto tenue */}
        <div className="arena-vs">VS</div>
      </div>

      {/* Messaggio */}
      <div className="arena-message">
        <div className={`arena-message-text ${isUltimateActive ? 'ultimate-message-text' : ''}`}>{currentMessage || 'Preparazione...'}</div>
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
