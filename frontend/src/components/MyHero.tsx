import React, { useState, useEffect } from 'react';
import { Hero, HeroClass, UserProfile, Ability, RARITY_COLORS, RARITY_LABELS, CLASS_LABELS, CLASS_EMOJIS } from '../types';
import { HeroSprite } from './HeroSprite';
import { Missions } from './Missions';
import { Achievements } from './Achievements';
import { DailyLogin } from './DailyLogin';
import { TalentTree } from './TalentTree';
import * as api from '../services/api';

interface MyHeroProps {
  profile: UserProfile;
  hero: Hero | null;
  onHeroUpdate?: (hero: Hero) => void;
  onProfileRefresh?: () => void;
}

const ALL_CLASSES: HeroClass[] = ['guardiano', 'lama', 'arcano', 'custode', 'ombra', 'ranger', 'sciamano', 'crono', 'dragoon', 'samurai', 'necromante', 'alchimista'];
const REROLL_COST = 500;
const EXP_BASE = 150;

type SubTab = 'stats' | 'equip' | 'talents' | 'missions' | 'more';

const SUB_TABS: { id: SubTab; label: string; icon: string }[] = [
  { id: 'stats', label: 'Stats', icon: '📊' },
  { id: 'equip', label: 'Equip', icon: '⚔️' },
  { id: 'talents', label: 'Talenti', icon: '🌟' },
  { id: 'missions', label: 'Missioni', icon: '📋' },
  { id: 'more', label: 'Altro', icon: '⚙️' },
];

function expForLevel(level: number): number {
  return Math.floor(EXP_BASE * Math.pow(level, 1.5));
}

const STAT_LABELS: Record<string, string> = {
  hp: 'HP', atk: 'ATK', def: 'DEF', spd: 'SPD', crit: 'CRIT', critDmg: 'C.DMG',
};

export function MyHero({ profile, hero, onHeroUpdate, onProfileRefresh }: MyHeroProps) {
  const [subTab, setSubTab] = useState<SubTab>('stats');
  const [showReroll, setShowReroll] = useState(false);
  const [rerolling, setRerolling] = useState(false);
  const [rerollMsg, setRerollMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [equipBonuses, setEquipBonuses] = useState<Record<string, number>>({});

  useEffect(() => {
    if (hero) loadHeroDetails();
  }, [hero?.id, hero?.heroClass]);

  async function loadHeroDetails() {
    if (!hero) return;
    try {
      const [detailData, invData] = await Promise.all([
        api.getHeroDetail(hero.id),
        api.getInventory(),
      ]);
      setAbilities(detailData.abilities || []);
      const equipped = invData.inventory.filter((item: any) => item.equippedOn === hero.id);
      setEquipment(equipped);
      const bonuses: Record<string, number> = {};
      for (const item of equipped) {
        if (item.statBonuses) {
          for (const [stat, val] of Object.entries(item.statBonuses)) {
            bonuses[stat] = (bonuses[stat] || 0) + (val as number);
          }
        }
      }
      setEquipBonuses(bonuses);
    } catch { /* ignore */ }
  }

  if (!hero) {
    return (
      <div className="empty-state">
        <p>Il tuo eroe non e ancora stato generato.</p>
      </div>
    );
  }

  const rarityColor = RARITY_COLORS[hero.rarity];
  const expNeeded = expForLevel(hero.level);
  const expPercent = Math.min(100, Math.floor((hero.exp / expNeeded) * 100));

  // Calcolo Combat Power (CP) approssimativo
  const calculateCP = () => {
    if (!hero) return 0;
    const { atk, def, hp, spd, crit, critDmg } = hero.stats;
    const bonusAtk = equipBonuses.atk || 0;
    const bonusDef = equipBonuses.def || 0;
    const bonusHp = equipBonuses.hp || 0;
    
    const baseCP = (atk + bonusAtk) * 2 + (def + bonusDef) * 1.5 + (hp + bonusHp) * 0.5 + spd * 5;
    const critMult = 1 + (crit / 100) * (critDmg / 100);
    return Math.floor(baseCP * critMult);
  };

  const rarityColor = RARITY_COLORS[hero.rarity];
  const expNeeded = expForLevel(hero.level);
  const expPercent = Math.min(100, Math.floor((hero.exp / expNeeded) * 100));
  const combatPower = calculateCP();

  return (
    <div className="profile-container">
      {/* Profile Header Premium */}
      <div className="profile-header">
        <div className="profile-banner" style={{ background: `linear-gradient(135deg, ${rarityColor}, #18181b)` }} />
        <div className="profile-avatar-wrapper">
          <HeroSprite heroClass={hero.heroClass} rarity={hero.rarity} size={80} animate="idle" name={hero.displayName} />
        </div>
        <div className="profile-info-main">
          <div className="profile-name-section">
            <span className="profile-rank-tag">{RARITY_LABELS[hero.rarity]}</span>
            <h2>{hero.displayName}</h2>
            <div style={{ fontSize: 11, color: '#adadb8', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              {CLASS_EMOJIS[hero.heroClass]} {CLASS_LABELS[hero.heroClass]} 
              <span style={{ color: '#555' }}>•</span>
              <span style={{ color: '#ffd700', fontWeight: 800 }}>CP {combatPower.toLocaleString()}</span>
            </div>
          </div>
          <div className="xp-ring-container">
            <svg className="xp-ring-svg" width="44" height="44">
              <circle className="xp-ring-bg" cx="22" cy="22" r="18" />
              <circle 
                className="xp-ring-fill" 
                cx="22" cy="22" r="18" 
                style={{ 
                  strokeDasharray: 113, 
                  strokeDashoffset: 113 - (113 * expPercent) / 100,
                  stroke: rarityColor
                }} 
              />
            </svg>
            <div style={{ 
              position: 'absolute', inset: 0, display: 'flex', 
              alignItems: 'center', justifyContent: 'center', 
              fontSize: 10, fontWeight: 900 
            }}>
              {hero.level}
            </div>
          </div>
        </div>
      </div>

      {/* Resource Quick Bar */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <div className="profile-resource-pill">
          <span style={{ color: '#ffd700' }}>💰</span> {profile.gold.toLocaleString()}
        </div>
        <div className="profile-resource-pill">
          <span style={{ color: '#22c55e' }}>⚡</span> {Math.floor(profile.energy)}/{profile.maxEnergy}
        </div>
        <div className="profile-resource-pill">
          <span style={{ color: '#a855f7' }}>🔮</span> {profile.essences || 0}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ 
        display: 'flex', background: '#18181b', padding: 4, 
        borderRadius: 12, border: '1px solid #333', gap: 4 
      }}>
        {SUB_TABS.map(t => (
          <button 
            key={t.id} 
            onClick={() => setSubTab(t.id)} 
            style={{
              flex: 1, padding: '8px 4px', fontSize: 10, fontWeight: 800,
              background: subTab === t.id ? '#2d2d35' : 'transparent',
              border: 'none', borderRadius: 8, cursor: 'pointer',
              color: subTab === t.id ? '#fff' : '#737380',
              transition: 'all 0.2s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2
            }}
          >
            <span style={{ fontSize: 16 }}>{t.icon}</span>
            <span style={{ fontSize: 8, textTransform: 'uppercase' }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* === TAB CONTENT === */}
      <div className="profile-content-area" style={{ minHeight: 200 }}>
        
        {subTab === 'stats' && (
          <div className="animate-fadeIn">
            <div className="stat-grid-premium">
              {(['atk', 'def', 'hp', 'spd', 'crit', 'critDmg'] as const).map(stat => {
                const base = hero.stats[stat];
                const bonus = equipBonuses[stat] || 0;
                const suffix = stat === 'crit' || stat === 'critDmg' ? '%' : '';
                return (
                  <div key={stat} className="stat-card-premium">
                    <span className="stat-label-premium">{STAT_LABELS[stat]}</span>
                    <span className="stat-value-premium">
                      {base}{suffix}
                      {bonus > 0 && <span style={{ color: '#22c55e', fontSize: 9, marginLeft: 2 }}>+{bonus}</span>}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: 12, fontWeight: 900, color: '#adadb8', marginBottom: 10, textTransform: 'uppercase' }}>Abilità</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {abilities.map((ab) => (
                  <div key={ab.id} className="ability-card-premium" style={{ borderLeftColor: ab.type === 'ultimate' ? '#ffd700' : rarityColor }}>
                    <div style={{ fontSize: 24 }}>{ab.type === 'attacco' ? '⚔️' : ab.type === 'supporto' ? '🛡️' : '✨'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: 12 }}>{ab.name}</span>
                        <span style={{ fontSize: 8, background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>
                          {ab.cooldown > 0 ? `${ab.cooldown}T CD` : 'PASSIVA'}
                        </span>
                      </div>
                      <p style={{ fontSize: 10, color: '#adadb8', margin: '2px 0 0' }}>{ab.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {subTab === 'equip' && (
          <div className="animate-fadeIn">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['arma', 'armatura', 'accessorio'].map(slot => {
                const item = equipment.find(e => e.slot === slot);
                return (
                  <div key={slot} style={{ 
                    background: '#18181b', borderRadius: 12, padding: 12, 
                    border: '1px solid #333', display: 'flex', gap: 12, alignItems: 'center'
                  }}>
                    <div style={{ 
                      width: 40, height: 40, background: '#0e0e10', borderRadius: 8, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                      border: item ? `1px solid ${RARITY_COLORS[item.rarity]}` : '1px dashed #444'
                    }}>
                      {item ? (slot === 'arma' ? '⚔️' : slot === 'armatura' ? '🛡️' : '💍') : '＋'}
                    </div>
                    <div style={{ flex: 1 }}>
                      {item ? (
                        <>
                          <div style={{ fontWeight: 800, fontSize: 13 }}>{item.name}</div>
                          <div style={{ fontSize: 9, color: RARITY_COLORS[item.rarity], textTransform: 'uppercase' }}>{item.rarity}</div>
                        </>
                      ) : (
                        <div style={{ fontSize: 11, color: '#555' }}>Slot {slot} vuoto</div>
                      )}
                    </div>
                    {item?.statBonuses && (
                      <div style={{ textAlign: 'right' }}>
                        {Object.entries(item.statBonuses).map(([s, v]) => (
                          <div key={s} style={{ color: '#22c55e', fontSize: 10, fontWeight: 800 }}>+{v} {STAT_LABELS[s]}</div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {subTab === 'talents' && <TalentTree />}

        {subTab === 'missions' && (
          <div className="animate-fadeIn">
            <DailyLogin onClaim={() => onProfileRefresh?.()} />
            <Missions />
          </div>
        )}

        {subTab === 'more' && (
          <div className="animate-fadeIn">
             {/* Reroll Classe */}
            <div style={{ 
              background: '#18181b', borderRadius: 12, padding: 16, 
              border: '1px solid #333', marginBottom: 12 
            }}>
              <h3 style={{ fontSize: 13, fontWeight: 900, color: '#fff', marginBottom: 12 }}>GESTIONE EROE</h3>
              <button className="btn btn-secondary" onClick={() => setShowReroll(!showReroll)} style={{ width: '100%', fontSize: 11, padding: '10px' }}>
                Cambia Classe ({REROLL_COST} gold)
              </button>
              
              {showReroll && (
                <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {ALL_CLASSES.filter(c => c !== hero.heroClass).map(cls => (
                    <button 
                      key={cls} 
                      className="btn btn-secondary" 
                      disabled={rerolling || profile.gold < REROLL_COST}
                      onClick={async () => {
                        setRerolling(true); setRerollMsg(null);
                        try {
                          const result = await api.rerollHeroClass(cls);
                          setRerollMsg({ text: `Classe cambiata!`, type: 'success' });
                          onHeroUpdate?.(result.hero);
                          setShowReroll(false);
                        } catch (err: any) { setRerollMsg({ text: err.message, type: 'error' }); }
                        finally { setRerolling(false); }
                      }}
                      style={{ fontSize: 9, padding: '8px 2px', display: 'flex', flexDirection: 'column', gap: 4 }}
                    >
                      <span style={{ fontSize: 16 }}>{CLASS_EMOJIS[cls]}</span>
                      <span>{CLASS_LABELS[cls]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Achievements />
          </div>
        )}
      </div>
    </div>
  );
}
