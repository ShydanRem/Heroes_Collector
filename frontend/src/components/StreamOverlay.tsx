import React, { useState, useEffect } from 'react';
import { ChannelProgress, Hero } from '../types';

interface StreamOverlayProps {
  progress: ChannelProgress | null;
}

export function StreamOverlay({ progress }: StreamOverlayProps) {
  const [activeModule, setActiveModule] = useState<'none' | 'progress' | 'spotlight'>('none');
  const [spotlightHero, setSpotlightHero] = useState<Partial<Hero>>({
    displayName: 'SuperViewer',
    level: 15,
    heroClass: 'lama'
  });
  const [showEvent, setShowEvent] = useState(false);
  const [eventMsg, setEventMsg] = useState('');

  useEffect(() => {
    // Ciclo di rotazione del widget
    const rotate = () => {
      // Mostra progresso per 10s
      setActiveModule('progress');
      setTimeout(() => {
        setActiveModule('none');
        // Dopo 20s di pausa, mostra Spotlight per 10s
        setTimeout(() => {
          setActiveModule('spotlight');
          setTimeout(() => setActiveModule('none'), 10000);
        }, 20000);
      }, 10000);
    };

    const interval = setInterval(rotate, 60000); // Ripeti ogni minuto
    rotate(); // Avvio immediato

    // Listener per eventi globali (testabili via console come prima)
    (window as any).triggerStreamEvent = (msg: string) => {
      setEventMsg(msg);
      setShowEvent(true);
      setTimeout(() => setShowEvent(false), 5000);
    };

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="stream-overlay-container">
      {/* 1. EVENT TOAST (Central) */}
      <div className={`overlay-event-toast ${showEvent ? 'visible' : ''}`}>
        <span style={{ fontSize: '30px' }}>💎</span>
        <span>{eventMsg}</span>
      </div>

      {/* 2. SPOTLIGHT (Top Right) */}
      <div className={`overlay-spotlight ${activeModule === 'spotlight' ? 'visible' : ''}`}>
        <div className="spotlight-avatar">👤</div>
        <div className="spotlight-info">
          <div className="spotlight-tag">Eroe in evidenza</div>
          <div className="spotlight-name">{spotlightHero.displayName}</div>
          <div className="spotlight-stat">Liv. {spotlightHero.level} • {spotlightHero.heroClass}</div>
        </div>
      </div>

      {/* 3. MINI PROGRESS (Bottom Center) */}
      {progress && (
        <div className={`overlay-mini-progress ${activeModule === 'progress' ? 'visible' : ''}`}>
          <div className="mini-progress-label">{progress.objectiveName}</div>
          <div className="progress-track" style={{ height: '4px' }}>
            <div 
              className="progress-fill" 
              style={{ width: `${(progress.currentExp / progress.maxExp) * 100}%` }}
            />
          </div>
          <div style={{ fontSize: '8px', textAlign: 'center', marginTop: '2px', color: '#9146ff' }}>
            Capitolo {progress.level} • {Math.floor((progress.currentExp / progress.maxExp) * 100)}%
          </div>
        </div>
      )}
    </div>
  );
}
