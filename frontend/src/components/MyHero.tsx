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

  return (
    <div>
      {/* Hero Card compatta — sempre visibile */}
      <div style={{
        background: '#18181b', borderRadius: 8, padding: '8px 10px',
        border: `1px solid ${rarityColor}40`, marginBottom: 6,
        display: 'flex', gap: 10, alignItems: 'center',
      }}>
        <HeroSprite heroClass={hero.heroClass} rarity={hero.rarity} size={56} animate="idle" name={hero.displayName} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {hero.displayName}
          </div>
          <div style={{ fontSize: 10, color: '#adadb8' }}>
            {CLASS_EMOJIS[hero.heroClass]} {CLASS_LABELS[hero.heroClass]}
            <span style={{ color: rarityColor, marginLeft: 6, fontWeight: 700 }}>
              {RARITY_LABELS[hero.rarity]}
            </span>
          </div>
          {/* EXP bar compatta */}
          <div style={{ marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, marginBottom: 2 }}>
              <span style={{ fontWeight: 800 }}>Lv.{hero.level}</span>
              <span style={{ color: '#53535f' }}>{hero.exp}/{expNeeded}</span>
            </div>
            <div style={{ height: 4, background: '#0e0e10', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                width: `${expPercent}%`, height: '100%',
                background: 'linear-gradient(90deg, #9147ff, #c084fc)',
                borderRadius: 2,
              }} />
            </div>
          </div>
        </div>
        {/* Risorse compatte */}
        <div style={{ textAlign: 'right', fontSize: 10, flexShrink: 0 }}>
          <div style={{ color: '#ffd700', fontWeight: 800 }}>{profile.gold}g</div>
          <div style={{ color: '#22c55e', fontWeight: 700 }}>{Math.floor(profile.energy)}E</div>
          <div style={{ color: '#a855f7', fontWeight: 700 }}>{profile.essences || 0}Es</div>
        </div>
      </div>

      {/* Sub-tab navigation */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
        {SUB_TABS.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{
            flex: 1, padding: '4px 2px', fontSize: 9, fontWeight: 700,
            background: subTab === t.id ? 'rgba(145,71,255,0.15)' : '#18181b',
            border: `1px solid ${subTab === t.id ? '#9147ff' : '#2d2d35'}`,
            borderRadius: 5, cursor: 'pointer',
            color: subTab === t.id ? '#c084fc' : '#737380',
            transition: 'all 0.15s',
          }}>
            <div style={{ fontSize: 14 }}>{t.icon}</div>
            <div>{t.label}</div>
          </button>
        ))}
      </div>

      {/* === TAB: STATS + ABILITA === */}
      {subTab === 'stats' && (
        <div>
          {/* Stats grid */}
          <div className="stats-detail-grid">
            {(['hp', 'atk', 'def', 'spd', 'crit', 'critDmg'] as const).map(stat => {
              const base = hero.stats[stat];
              const bonus = equipBonuses[stat] || 0;
              const suffix = stat === 'crit' || stat === 'critDmg' ? '%' : '';
              return (
                <div key={stat} className="stat-detail-item">
                  <span className="stat-detail-label">{STAT_LABELS[stat]}</span>
                  <span>
                    {base}{suffix}
                    {bonus > 0 && <span style={{ color: '#22c55e', fontSize: 10 }}> +{bonus}</span>}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Abilita */}
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9147ff', marginBottom: 4 }}>
              Abilita ({abilities.length})
            </div>
            {abilities.length === 0 ? (
              <div style={{ fontSize: 10, color: '#555', textAlign: 'center' }}>Caricamento...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {abilities.map((ab) => (
                  <div key={ab.id} className="ability-item" style={{ padding: '5px 8px', marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="ability-name" style={{ fontSize: 11 }}>{ab.name}</span>
                      <span style={{ fontSize: 9, color: '#737380' }}>
                        {ab.type === 'attacco' ? 'ATK' : ab.type === 'supporto' ? 'SUP' : ab.type === 'difesa' ? 'DEF' : ab.type === 'debuff' ? 'DEB' : ab.type === 'ultimate' ? 'ULT' : ab.type}
                        {ab.cooldown > 0 && ` · ${ab.cooldown}t`}
                      </span>
                    </div>
                    <div className="ability-desc" style={{ fontSize: 9 }}>{ab.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* === TAB: EQUIP === */}
      {subTab === 'equip' && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9147ff', marginBottom: 6 }}>Equipaggiamento</div>
          {equipment.length === 0 ? (
            <div style={{
              fontSize: 11, color: '#adadb8', textAlign: 'center', padding: 16,
              background: '#18181b', borderRadius: 8, border: '1px solid #2d2d35',
            }}>
              Nessun oggetto equipaggiato.
              <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>Vai nello Zaino per equipaggiare!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {equipment.map((item: any) => (
                <div key={item.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: '#18181b', borderRadius: 6, padding: '6px 10px',
                  borderLeft: `3px solid ${RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS] || '#555'}`,
                }}>
                  <div>
                    <span style={{ marginRight: 4 }}>{item.slot === 'arma' ? '⚔️' : item.slot === 'armatura' ? '🛡️' : '💍'}</span>
                    <span style={{ fontWeight: 700, fontSize: 11 }}>{item.name}</span>
                    <div style={{ fontSize: 9, color: RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS] || '#555' }}>
                      {item.rarity}
                    </div>
                  </div>
                  <div style={{ fontSize: 9, color: '#22c55e', textAlign: 'right' }}>
                    {item.statBonuses && Object.entries(item.statBonuses).map(([s, v]) =>
                      `+${v}${STAT_LABELS[s] || s}`
                    ).join(' ')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bonus totali equip */}
          {Object.keys(equipBonuses).length > 0 && (
            <div style={{
              marginTop: 8, background: '#18181b', borderRadius: 6,
              padding: '6px 10px', border: '1px solid #2d2d35',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', marginBottom: 3 }}>Bonus Totali</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 10 }}>
                {Object.entries(equipBonuses).map(([stat, val]) => (
                  <span key={stat} style={{ color: '#22c55e', fontWeight: 700 }}>
                    +{val} {STAT_LABELS[stat] || stat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* === TAB: TALENTI === */}
      {subTab === 'talents' && <TalentTree />}

      {/* === TAB: MISSIONI === */}
      {subTab === 'missions' && (
        <div>
          <DailyLogin onClaim={() => onProfileRefresh?.()} />
          <Missions />
        </div>
      )}

      {/* === TAB: ALTRO (Achievements, Reroll, etc.) === */}
      {subTab === 'more' && (
        <div>
          {/* Risorse dettagliate */}
          <div style={{
            background: '#18181b', borderRadius: 8, padding: 10,
            marginBottom: 8, border: '1px solid #2d2d35',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, color: '#9147ff' }}>Risorse</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, fontSize: 11, textAlign: 'center' }}>
              <div style={{ background: '#0e0e10', borderRadius: 4, padding: 6 }}>
                <div style={{ fontWeight: 800, color: '#ffd700', fontSize: 14 }}>{profile.gold}</div>
                <div style={{ color: '#737380', fontSize: 9 }}>Gold</div>
              </div>
              <div style={{ background: '#0e0e10', borderRadius: 4, padding: 6 }}>
                <div style={{ fontWeight: 800, color: '#22c55e', fontSize: 14 }}>{Math.floor(profile.energy)}</div>
                <div style={{ color: '#737380', fontSize: 9 }}>Energia / {profile.maxEnergy}</div>
              </div>
              <div style={{ background: '#0e0e10', borderRadius: 4, padding: 6 }}>
                <div style={{ fontWeight: 800, color: '#a855f7', fontSize: 14 }}>{profile.essences || 0}</div>
                <div style={{ color: '#737380', fontSize: 9 }}>Essenze</div>
              </div>
            </div>
          </div>

          {/* Reroll Classe */}
          <div style={{ marginBottom: 8 }}>
            <button className="btn btn-secondary" onClick={() => setShowReroll(!showReroll)} style={{ width: '100%', fontSize: 11 }}>
              Cambia Classe ({REROLL_COST} gold)
            </button>
            {showReroll && (
              <div style={{ background: '#18181b', borderRadius: 8, padding: 10, marginTop: 6, border: '1px solid #333' }}>
                <div style={{ fontSize: 10, color: '#adadb8', marginBottom: 6 }}>Scegli la nuova classe:</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
                  {ALL_CLASSES.filter(c => c !== hero.heroClass).map(cls => (
                    <button key={cls} className="btn btn-secondary" disabled={rerolling || profile.gold < REROLL_COST}
                      onClick={async () => {
                        setRerolling(true); setRerollMsg(null);
                        try {
                          const result = await api.rerollHeroClass(cls);
                          setRerollMsg({ text: `Ora sei un ${CLASS_LABELS[cls]}!`, type: 'success' });
                          onHeroUpdate?.(result.hero);
                          setShowReroll(false);
                        } catch (err: any) { setRerollMsg({ text: err.message, type: 'error' }); }
                        finally { setRerolling(false); }
                      }}
                      style={{ fontSize: 9, padding: '5px 2px', display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}
                    >
                      {CLASS_EMOJIS[cls]} {CLASS_LABELS[cls]}
                    </button>
                  ))}
                </div>
                {profile.gold < REROLL_COST && (
                  <div style={{ fontSize: 10, color: '#f59e0b', marginTop: 6, textAlign: 'center' }}>
                    Servono {REROLL_COST} gold (hai {profile.gold})
                  </div>
                )}
                {rerollMsg && (
                  <div style={{ fontSize: 10, marginTop: 6, textAlign: 'center', color: rerollMsg.type === 'success' ? '#22c55e' : '#f44336' }}>
                    {rerollMsg.text}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Achievements */}
          <Achievements />
        </div>
      )}
    </div>
  );
}
