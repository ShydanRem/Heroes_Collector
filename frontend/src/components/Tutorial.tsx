import React, { useState, useCallback } from 'react';

interface TutorialProps {
  onComplete: () => void;
}

const TUTORIAL_STEPS = [
  {
    title: 'Il tuo Eroe',
    text: 'Questo sei tu! La tua rarita dipende dalla tua attivita sul canale: chatta, guarda lo stream e subba per diventare piu forte! Puoi cambiare classe spendendo 500 gold.',
    icon: '\u{1F9B8}',
  },
  {
    title: 'Cattura Eroi',
    text: 'Nel Catalogo trovi gli eroi di tutti i viewer. Scegli a che rarita catturarli: piu alta la rarita, piu costa energia. Un eroe forte vale l\'investimento!',
    icon: '\u{1F4D6}',
  },
  {
    title: 'Essenze & Upgrade',
    text: 'Guadagna Essenze Eroiche completando dungeon, raid e PVP. Usale per upgradare la rarita degli eroi catturati, fino alla rarita massima dell\'originale!',
    icon: '\u2728',
  },
  {
    title: 'Forma il Party',
    text: 'Crea una squadra di 4 eroi nel tab Party. Combina classi diverse per attivare bonus Sinergia — Berserker + Assassino, Sacerdote + Guardiano e tante altre!',
    icon: '\u2694\uFE0F',
  },
  {
    title: 'Campagna Dungeon',
    text: 'Esplora 6 zone con difficolta crescente: dalla Foresta Oscura al Vuoto. Ogni zona ha mostri unici, un boss finale e un modificatore casuale che rende ogni run diversa!',
    icon: '\u{1F3F0}',
  },
  {
    title: 'PVP & Raid',
    text: "Sfida altri viewer nell'Arena PVP per scalare la classifica ELO. Oppure unisciti al Raid contro il boss settimanale — tutta la community combatte insieme!",
    icon: '\u{1F3DF}\uFE0F',
  },
  {
    title: 'Missioni & Risorse',
    text: 'Completa 3 missioni giornaliere per bonus EXP e Gold. Hai 3 risorse: Energia (per catturare), Gold (per shop e reroll), Essenze (per upgrade rarita).',
    icon: '\u{1F6D2}',
  },
];

export function Tutorial({ onComplete }: TutorialProps) {
  const [step, setStep] = useState(0);
  const [slideDir, setSlideDir] = useState<'in' | 'out' | null>(null);
  const [displayStep, setDisplayStep] = useState(0);

  const finish = useCallback(() => {
    localStorage.setItem('heroesCollector_tutorialDone', 'true');
    onComplete();
  }, [onComplete]);

  const goNext = useCallback(() => {
    if (step >= TUTORIAL_STEPS.length - 1) {
      finish();
      return;
    }
    setSlideDir('out');
    setTimeout(() => {
      const next = step + 1;
      setDisplayStep(next);
      setStep(next);
      setSlideDir('in');
      setTimeout(() => setSlideDir(null), 300);
    }, 250);
  }, [step, finish]);

  const current = TUTORIAL_STEPS[displayStep];
  const isLast = step >= TUTORIAL_STEPS.length - 1;

  const contentClass =
    slideDir === 'out'
      ? 'tutorial-content tutorial-slide-out'
      : slideDir === 'in'
        ? 'tutorial-content tutorial-slide-in'
        : 'tutorial-content';

  return (
    <>
      <style>{`
        .tutorial-overlay {
          position: fixed;
          inset: 0;
          z-index: 90;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: inherit;
        }

        .tutorial-card {
          position: relative;
          width: 280px;
          background: #1a1a2e;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 24px 20px 20px;
          text-align: center;
          overflow: hidden;
        }

        .tutorial-skip {
          position: absolute;
          top: 8px;
          right: 12px;
          background: none;
          border: none;
          color: #666;
          font-size: 11px;
          cursor: pointer;
          text-decoration: underline;
          padding: 4px;
        }
        .tutorial-skip:hover {
          color: #999;
        }

        .tutorial-content {
          transition: transform 0.25s ease, opacity 0.25s ease;
        }

        .tutorial-slide-out {
          transform: translateX(-40px);
          opacity: 0;
        }

        .tutorial-slide-in {
          transform: translateX(40px);
          opacity: 0;
          animation: tutorial-enter 0.3s ease-out forwards;
        }

        @keyframes tutorial-enter {
          to { transform: translateX(0); opacity: 1; }
        }

        .tutorial-icon {
          font-size: 36px;
          margin-bottom: 10px;
        }

        .tutorial-title {
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
        }

        .tutorial-text {
          font-size: 12px;
          color: #aaa;
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .tutorial-dots {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-bottom: 14px;
        }

        .tutorial-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #333;
          transition: background 0.2s;
        }

        .tutorial-dot.active {
          background: #7c3aed;
        }

        .tutorial-next-btn {
          width: 100%;
          padding: 10px 0;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.15s;
        }

        .tutorial-next-btn:hover {
          transform: scale(1.03);
        }
      `}</style>

      <div className="tutorial-overlay">
        <div className="tutorial-card">
          <button className="tutorial-skip" onClick={finish}>
            Salta tutorial
          </button>

          <div className={contentClass}>
            <div className="tutorial-icon">{current.icon}</div>
            <div className="tutorial-title">{current.title}</div>
            <div className="tutorial-text">{current.text}</div>
          </div>

          <div className="tutorial-dots">
            {TUTORIAL_STEPS.map((_, i) => (
              <div key={i} className={`tutorial-dot ${i === step ? 'active' : ''}`} />
            ))}
          </div>

          <button className="tutorial-next-btn" onClick={goNext}>
            {isLast ? 'Inizia a giocare!' : 'Avanti'}
          </button>
        </div>
      </div>
    </>
  );
}
