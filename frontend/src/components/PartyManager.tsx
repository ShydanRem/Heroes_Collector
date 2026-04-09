import React, { useState, useEffect } from 'react';
import { Hero, HeroClass, RARITY_COLORS, CLASS_EMOJIS, CLASS_LABELS, RARITY_LABELS } from '../types';
import { HintBanner } from './Tooltip';
import * as api from '../services/api';
import { PartyData } from '../services/api';

// Sinergie definite client-side per mostrare in UI
interface SynergyDef {
  name: string;
  emoji: string;
  description: string;
  requiredClasses: HeroClass[];
  minCount: number;
}

const SYNERGY_DEFS: SynergyDef[] = [
  { name: 'Muro di Ferro', emoji: '🛡️', description: '+20% DEF al party', requiredClasses: ['guardiano'], minCount: 2 },
  { name: 'Danza delle Lame', emoji: '⚔️', description: '+15% CRIT al party', requiredClasses: ['lama', 'ombra'], minCount: 2 },
  { name: 'Circolo Arcano', emoji: '🔮', description: '+25% ATK per Arcano', requiredClasses: ['arcano'], minCount: 2 },
  { name: 'Baluardo Sacro', emoji: '✨', description: '+30% HP al party', requiredClasses: ['custode', 'guardiano'], minCount: 2 },
  { name: 'Imboscata', emoji: '🏹', description: '+20% SPD al party', requiredClasses: ['ombra', 'ranger'], minCount: 2 },
  { name: 'Maledizione Ancestrale', emoji: '🌿', description: '+20% potenza debuff', requiredClasses: ['sciamano', 'arcano'], minCount: 2 },
  { name: 'Flusso Temporale', emoji: '⏳', description: '+25% SPD al party', requiredClasses: ['crono'], minCount: 2 },
  { name: 'Armata Completa', emoji: '👑', description: '+10% a tutte le stats', requiredClasses: ['guardiano', 'lama', 'arcano', 'custode', 'ombra', 'ranger', 'sciamano', 'crono'], minCount: 4 },
];

function getActiveSynergies(heroes: Hero[]): SynergyDef[] {
  const classes = heroes.map(h => h.heroClass);
  return SYNERGY_DEFS.filter(syn => {
    if (syn.name === 'Armata Completa') {
      return new Set(classes).size >= syn.minCount;
    }
    if (syn.requiredClasses.length === 1) {
      return classes.filter(c => c === syn.requiredClasses[0]).length >= syn.minCount;
    }
    return syn.requiredClasses.every(rc => classes.includes(rc));
  });
}

interface PartyManagerProps {
  onStartBattle?: (partyId: string) => void;
}

export function PartyManager({ onStartBattle }: PartyManagerProps) {
  const [parties, setParties] = useState<PartyData[]>([]);
  const [roster, setRoster] = useState<Hero[]>([]);
  const [myHero, setMyHero] = useState<Hero | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPartyName, setNewPartyName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [addingTo, setAddingTo] = useState<string | null>(null); // partyId per cui stiamo aggiungendo
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  async function loadData() {
    setError(null);
    try {
      const [partiesData, rosterData, profileData] = await Promise.all([
        api.getParties(),
        api.getMyRoster(),
        api.getMyProfile(),
      ]);
      setParties(partiesData.parties);
      setRoster(rosterData.roster);
      setMyHero(profileData.hero);
    } catch (err) {
      console.error('Errore caricamento dati party:', err);
      setError('Errore nel caricamento. Controlla la connessione.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateParty() {
    if (!newPartyName.trim()) return;
    try {
      await api.createParty(newPartyName.trim());
      setNewPartyName('');
      setShowCreate(false);
      await loadData();
      setMessage({ text: 'Party creato!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  }

  async function handleActivate(partyId: string) {
    try {
      await api.activateParty(partyId);
      await loadData();
      setMessage({ text: 'Party attivato!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  }

  async function handleAddHero(partyId: string, heroId: string) {
    try {
      await api.addHeroToParty(partyId, heroId);
      setAddingTo(null);
      await loadData();
      setMessage({ text: 'Eroe aggiunto!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  }

  async function handleRemoveHero(partyId: string, heroId: string) {
    try {
      await api.removeHeroFromParty(partyId, heroId);
      await loadData();
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  }

  async function handleDeleteParty(partyId: string) {
    try {
      await api.deleteParty(partyId);
      await loadData();
      setMessage({ text: 'Party eliminato', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  }

  // Tutti gli eroi disponibili: il proprio + roster catturati
  function getAvailableHeroes(party: PartyData): Hero[] {
    const allHeroes: Hero[] = [...roster];
    if (myHero && !allHeroes.find(h => h.id === myHero.id)) {
      allHeroes.unshift(myHero);
    }
    return allHeroes.filter(h => !party.heroIds.includes(h.id));
  }

  // Trova l'eroe per ID tra roster e myHero
  function findHero(heroId: string): Hero | undefined {
    if (myHero?.id === heroId) return myHero;
    return roster.find(h => h.id === heroId);
  }

  if (loading) {
    return <div className="loading"><div className="spinner" /> Caricamento...</div>;
  }

  if (error) {
    return (
      <div style={{
        textAlign: 'center', padding: '20px 16px',
        color: '#adadb8',
      }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
        <div style={{ fontSize: 12, marginBottom: 12 }}>{error}</div>
        <button className="btn btn-secondary" onClick={loadData} style={{ fontSize: 11 }}>
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div>
      <HintBanner
        id="party"
        text="Crea un party (max 4 eroi), attivalo e poi vai nel Dungeon o PVP per combattere! Mescola le classi per ottenere sinergie bonus."
        icon="⚔️"
      />
      {/* Header con bottone crea */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: '#adadb8' }}>
          {parties.length}/3 party
        </span>
        {parties.length < 3 && (
          <button className="btn btn-secondary" onClick={() => setShowCreate(!showCreate)} style={{ fontSize: 11, padding: '4px 8px' }}>
            + Nuovo Party
          </button>
        )}
      </div>

      {/* Form creazione */}
      {showCreate && (
        <div style={{ background: '#1f1f23', borderRadius: 6, padding: 8, marginBottom: 8 }}>
          <input
            type="text"
            placeholder="Nome party..."
            value={newPartyName}
            onChange={(e) => setNewPartyName(e.target.value)}
            maxLength={32}
            style={{
              width: '100%', padding: 6, marginBottom: 6,
              background: '#0e0e10', border: '1px solid #444',
              borderRadius: 4, color: '#efeff1', fontSize: 12,
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateParty()}
          />
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-primary" onClick={handleCreateParty} style={{ flex: 1, fontSize: 11, padding: '4px 8px' }}>
              Crea
            </button>
            <button className="btn btn-secondary" onClick={() => setShowCreate(false)} style={{ fontSize: 11, padding: '4px 8px' }}>
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* Lista party */}
      {parties.length === 0 ? (
        <div className="empty-state">
          <p>Non hai ancora nessun party!</p>
          <p>Crea un party e aggiungi eroi dal tuo roster per combattere.</p>
        </div>
      ) : (
        parties.map((party) => (
          <div key={party.id} style={{
            background: '#18181b',
            borderRadius: 8,
            border: (party as any).is_active ? '2px solid #9147ff' : '1px solid #333',
            padding: 10,
            marginBottom: 8,
          }}>
            {/* Party header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{party.name}</span>
                {(party as any).is_active && (
                  <span style={{ fontSize: 10, color: '#9147ff', marginLeft: 6 }}>ATTIVO</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {!(party as any).is_active && (
                  <button className="btn btn-secondary" onClick={() => handleActivate(party.id)} style={{ fontSize: 10, padding: '2px 6px' }}>
                    Attiva
                  </button>
                )}
                <button className="btn btn-secondary" onClick={() => handleDeleteParty(party.id)} style={{ fontSize: 10, padding: '2px 6px', color: '#f44336' }}>
                  Elimina
                </button>
              </div>
            </div>

            {/* Eroi nel party */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 6 }}>
              {[0, 1, 2, 3].map((slot) => {
                const heroId = party.heroIds[slot];
                const hero = heroId ? findHero(heroId) : null;

                if (!hero) {
                  return (
                    <div key={slot} style={{
                      background: '#0e0e10', borderRadius: 6, padding: 8,
                      textAlign: 'center', border: '1px dashed #444',
                      minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: '#555', cursor: 'pointer',
                    }}
                    onClick={() => setAddingTo(party.id)}
                    >
                      <div style={{ fontSize: 18, marginBottom: 2 }}>+</div>
                      <div>Slot vuoto</div>
                    </div>
                  );
                }

                return (
                  <div key={slot} style={{
                    background: '#0e0e10', borderRadius: 6, padding: 4,
                    textAlign: 'center', position: 'relative',
                    borderTop: `2px solid ${RARITY_COLORS[hero.rarity]}`,
                  }}>
                    <div style={{ fontSize: 16 }}>{CLASS_EMOJIS[hero.heroClass]}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {hero.displayName}
                    </div>
                    <div style={{ fontSize: 8, color: RARITY_COLORS[hero.rarity] }}>
                      Lv.{hero.level}
                    </div>
                    <button
                      onClick={() => handleRemoveHero(party.id, hero.id)}
                      style={{
                        position: 'absolute', top: 1, right: 1,
                        background: 'none', border: 'none', color: '#f44336',
                        fontSize: 10, cursor: 'pointer', padding: 2,
                      }}
                    >
                      x
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Sinergie attive */}
            {(() => {
              const partyHeroes = party.heroIds.map(id => findHero(id)).filter(Boolean) as Hero[];
              const synergies = getActiveSynergies(partyHeroes);
              if (synergies.length === 0) return null;
              return (
                <div style={{
                  display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 6,
                }}>
                  {synergies.map((s, i) => (
                    <span key={i} style={{
                      fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 10,
                      background: 'rgba(251,191,36,0.12)', color: '#fbbf24',
                      border: '1px solid rgba(251,191,36,0.2)',
                    }} title={s.description}>
                      {s.emoji} {s.name}
                    </span>
                  ))}
                </div>
              );
            })()}

            {/* Pulsanti azione */}
            <div style={{ display: 'flex', gap: 4 }}>
              {party.heroIds.length < 4 && (
                <button className="btn btn-secondary" onClick={() => setAddingTo(addingTo === party.id ? null : party.id)} style={{ flex: 1, fontSize: 10, padding: '4px 6px' }}>
                  + Aggiungi Eroe
                </button>
              )}
              {(party as any).is_active && party.heroIds.length > 0 && onStartBattle && (
                <button className="btn btn-primary" onClick={() => onStartBattle(party.id)} style={{ flex: 1, fontSize: 10, padding: '4px 6px' }}>
                  Dungeon!
                </button>
              )}
            </div>

            {/* Selettore eroe da aggiungere */}
            {addingTo === party.id && (
              <div style={{ marginTop: 6, background: '#0e0e10', borderRadius: 6, padding: 6, maxHeight: 150, overflowY: 'auto' }}>
                <div style={{ fontSize: 10, color: '#adadb8', marginBottom: 4 }}>Scegli un eroe:</div>
                {getAvailableHeroes(party).length === 0 ? (
                  <div style={{ fontSize: 10, color: '#555' }}>Nessun eroe disponibile. Cattura eroi nella tab Eroi!</div>
                ) : (
                  getAvailableHeroes(party).map((hero) => (
                    <div key={hero.id}
                      onClick={() => handleAddHero(party.id, hero.id)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '4px 6px', borderRadius: 4, cursor: 'pointer',
                        marginBottom: 2, background: '#18181b',
                      }}
                    >
                      <span style={{ fontSize: 11 }}>
                        {CLASS_EMOJIS[hero.heroClass]} {hero.displayName}
                      </span>
                      <span style={{ fontSize: 9, color: RARITY_COLORS[hero.rarity] }}>
                        {RARITY_LABELS[hero.rarity]} Lv.{hero.level}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))
      )}

      {message && (
        <div className={`toast ${message.type}`}>{message.text}</div>
      )}
    </div>
  );
}
