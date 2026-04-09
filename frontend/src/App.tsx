import React, { useState, useEffect } from 'react';
import { Hero, UserProfile } from './types';
import { HeroList } from './components/HeroList';
import { Roster } from './components/Roster';
import { MyHero } from './components/MyHero';
import { PartyManager } from './components/PartyManager';
import { BattleView } from './components/BattleView';
import { PvpArena } from './components/PvpArena';
import { Leaderboard } from './components/Leaderboard';
import { Inventory } from './components/Inventory';
import { RaidBoss } from './components/RaidBoss';
import { Shop } from './components/Shop';
import { HeroReveal } from './components/HeroReveal';
import { Tutorial } from './components/Tutorial';
import * as api from './services/api';

type Tab = 'myhero' | 'heroes' | 'roster' | 'items' | 'party' | 'dungeon' | 'pvp' | 'raid' | 'shop' | 'rank';

declare global {
  interface Window {
    Twitch?: {
      ext: {
        onAuthorized: (callback: (auth: { token: string; userId: string; channelId: string }) => void) => void;
        onContext: (callback: (context: any) => void) => void;
      };
    };
  }
}

export default function App() {
  const [tab, setTab] = useState<Tab>('myhero');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hero, setHero] = useState<Hero | null>(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [revealHero, setRevealHero] = useState<Hero | null>(null);

  useEffect(() => { initAuth(); }, []);

  function initAuth() {
    if (window.Twitch?.ext) {
      window.Twitch.ext.onAuthorized((auth) => {
        api.setAuthToken(auth.token);
        loadProfile();
      });
    } else {
      // Modalita sviluppo senza Twitch
      api.setAuthToken('dev:test-user:viewer');
      loadProfile();
    }
  }

  async function loadProfile() {
    try {
      const data = await api.getMyProfile();
      setProfile(data.profile);
      setHero(data.hero);
      setJoined(data.profile.optedIn);
    } catch (err: any) {
      // 404 = utente non registrato, mostra schermata join
      if (!err.message?.includes('404')) {
        console.error('Errore caricamento profilo:', err);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    setJoining(true);
    setJoinError(null);
    try {
      // Il backend usa il JWT per identificare l'utente
      // username e displayName sono fallback se non disponibili dal token
      const data = await api.joinGame('viewer', 'Viewer');
      setProfile(data.profile);
      setRevealHero(data.hero);
      setShowReveal(true);
    } catch (err: any) {
      console.error('Errore join:', err);
      setJoinError(err.message || 'Errore di connessione al server');
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading"><div className="spinner" /> Caricamento...</div>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="app">
        <div className="join-screen">
          <div className="join-logo">HC</div>
          <h2>Heroes Collector</h2>
          <p>
            Diventa un eroe collezionabile!<br />
            La tua attivita sul canale determina la tua rarita e forza.<br />
            Cattura altri viewer, forma un party e combatti!
          </p>
          <button className="btn btn-primary" onClick={handleJoin} disabled={joining}>
            {joining ? 'Creazione eroe...' : 'Unisciti al gioco!'}
          </button>
          {joinError && (
            <div style={{ color: '#f44336', fontSize: 11, marginTop: 10, maxWidth: 260 }}>
              {joinError}
            </div>
          )}
        </div>
        {showReveal && revealHero && (
          <HeroReveal hero={revealHero} onComplete={() => {
            setShowReveal(false);
            setHero(revealHero);
            setJoined(true);
            if (!localStorage.getItem('heroesCollector_tutorialDone')) {
              setShowTutorial(true);
            }
          }} />
        )}
      </div>
    );
  }

  const tabRows = [
    [
      { id: 'myhero' as Tab, label: 'Eroe', icon: '🦸' },
      { id: 'heroes' as Tab, label: 'Catalogo', icon: '📖' },
      { id: 'roster' as Tab, label: 'Roster', icon: '👥' },
      { id: 'items' as Tab, label: 'Zaino', icon: '🎒' },
      { id: 'shop' as Tab, label: 'Shop', icon: '🛒' },
    ],
    [
      { id: 'party' as Tab, label: 'Party', icon: '⚔️' },
      { id: 'dungeon' as Tab, label: 'Dungeon', icon: '🏰' },
      { id: 'pvp' as Tab, label: 'PVP', icon: '🏟️' },
      { id: 'raid' as Tab, label: 'Raid', icon: '🐉' },
      { id: 'rank' as Tab, label: 'Rank', icon: '🏆' },
    ],
  ];

  return (
    <div className="app">
      <div className="header">
        <h1>HEROES COLLECTOR</h1>
        {profile && (
          <div className="header-stats">
            <span className="gold">{profile.gold}g</span>
            <span className="energy">{Math.floor(profile.energy)}E</span>
          </div>
        )}
      </div>

      {tabRows.map((row, rowIdx) => (
        <div className="tabs" key={rowIdx} style={rowIdx > 0 ? { borderTop: 'none' } : undefined}>
          {row.map(t => (
            <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      ))}

      <div className="content" key={tab}>
        {tab === 'myhero' && profile && <MyHero profile={profile} hero={hero} onHeroUpdate={(h) => { setHero(h); loadProfile(); }} />}
        {tab === 'heroes' && <HeroList />}
        {tab === 'roster' && <Roster />}
        {tab === 'items' && <Inventory />}
        {tab === 'shop' && <Shop />}
        {tab === 'party' && <PartyManager onStartBattle={() => setTab('dungeon')} />}
        {tab === 'dungeon' && <BattleView />}
        {tab === 'pvp' && <PvpArena />}
        {tab === 'raid' && <RaidBoss />}
        {tab === 'rank' && <Leaderboard />}
      </div>

      {showTutorial && (
        <Tutorial onComplete={() => setShowTutorial(false)} />
      )}
    </div>
  );
}
