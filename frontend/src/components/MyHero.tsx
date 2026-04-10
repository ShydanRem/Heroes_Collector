import React, { useState, useEffect } from 'react';
import { Hero, HeroClass, UserProfile, Ability, RARITY_COLORS, RARITY_LABELS, CLASS_LABELS, CLASS_EMOJIS } from '../types';
import { HeroSprite } from './HeroSprite';
import { HintBanner } from './Tooltip';
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

function expForLevel(level: number): number {
  return Math.floor(EXP_BASE * Math.pow(level, 1.5));
}

export function MyHero({ profile, hero, onHeroUpdate, onProfileRefresh }: MyHeroProps) {
  const [showAchievements, setShowAchievements] = useState(false);
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

      // Filtra items equipaggiati su questo eroe
      const equipped = invData.inventory.filter((item: any) => item.equippedOn === hero.id);
      setEquipment(equipped);

      // Calcola bonus totali
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

  const STAT_LABELS: Record<string, string> = {
    hp: 'HP', atk: 'ATK', def: 'DEF', spd: 'SPD', crit: 'CRIT', critDmg: 'C.DMG',
  };

  return (
    <div>
      <HintBanner
        id="myhero"
        text="Questo e il TUO eroe! La tua rarita dipende dalla tua attivita sul canale."
        icon="🦸"
      />

      {/* Hero Card */}
      <div className="hero-detail-card" style={{ borderColor: rarityColor }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <HeroSprite heroClass={hero.heroClass} rarity={hero.rarity} size={80} animate="idle" name={hero.displayName} />
        </div>

        <div className="hero-detail-name">{hero.displayName}</div>
        <div className="hero-detail-class">{CLASS_EMOJIS[hero.heroClass]} {CLASS_LABELS[hero.heroClass]}</div>
        <div className="hero-detail-rarity" style={{ color: rarityColor }}>
          {RARITY_LABELS[hero.rarity]}
        </div>

        {/* Level + EXP bar */}
        <div style={{ margin: '8px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 3 }}>
            <span style={{ fontWeight: 800 }}>Lv. {hero.level}</span>
            <span style={{ color: '#737380' }}>{hero.exp} / {expNeeded} EXP</span>
          </div>
          <div style={{ height: 6, background: '#0e0e10', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              width: `${expPercent}%`, height: '100%',
              background: 'linear-gradient(90deg, #9147ff, #c084fc)',
              borderRadius: 3, transition: 'width 0.3s',
            }} />
          </div>
        </div>

        {/* Stats con bonus equip */}
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
      </div>

      {/* Equipaggiamento */}
      <div style={{ background: '#1f1f23', borderRadius: 8, padding: 10, marginTop: 6, border: '1px solid #2d2d35' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9147ff', marginBottom: 6 }}>Equipaggiamento</div>
        {equipment.length === 0 ? (
          <div style={{ fontSize: 10, color: '#555', textAlign: 'center', padding: 4 }}>
            Nessun oggetto equipaggiato — vai nello Zaino!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {equipment.map((item: any) => (
              <div key={item.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: '#0e0e10', borderRadius: 4, padding: '4px 8px', fontSize: 11,
                borderLeft: `3px solid ${RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS] || '#555'}`,
              }}>
                <div>
                  <span style={{ marginRight: 4 }}>{item.slot === 'arma' ? '⚔️' : item.slot === 'armatura' ? '🛡️' : '💍'}</span>
                  <span style={{ fontWeight: 700 }}>{item.name}</span>
                </div>
                <div style={{ fontSize: 9, color: '#22c55e' }}>
                  {item.statBonuses && Object.entries(item.statBonuses).map(([s, v]) =>
                    `+${v} ${STAT_LABELS[s] || s}`
                  ).join(' ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Abilita */}
      <div style={{ background: '#1f1f23', borderRadius: 8, padding: 10, marginTop: 6, border: '1px solid #2d2d35' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9147ff', marginBottom: 6 }}>
          Abilita ({abilities.length})
        </div>
        {abilities.length === 0 ? (
          <div style={{ fontSize: 10, color: '#555', textAlign: 'center' }}>Caricamento...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {abilities.map((ab) => (
              <div key={ab.id} className="ability-item" style={{ padding: '6px 8px', marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="ability-name" style={{ fontSize: 11 }}>{ab.name}</span>
                  <span style={{ fontSize: 9, color: '#737380' }}>
                    {ab.type === 'attacco' ? 'ATK' : ab.type === 'supporto' ? 'SUP' : ab.type === 'difesa' ? 'DEF' : ab.type === 'debuff' ? 'DEB' : ab.type === 'ultimate' ? 'ULT' : ab.type}
                    {ab.cooldown > 0 && ` · ${ab.cooldown}t`}
                  </span>
                </div>
                <div className="ability-desc" style={{ fontSize: 10 }}>{ab.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Risorse */}
      <div style={{ background: '#1f1f23', borderRadius: 8, padding: 10, marginTop: 6 }}>
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

      {/* Talenti */}
      <TalentTree />

      {/* Daily Login */}
      <DailyLogin onClaim={() => onProfileRefresh?.()} />

      {/* Reroll Classe */}
      <div style={{ marginTop: 6 }}>
        <button className="btn btn-secondary" onClick={() => setShowReroll(!showReroll)} style={{ width: '100%', fontSize: 11 }}>
          Cambia Classe ({REROLL_COST} gold)
        </button>

        {showReroll && (
          <div style={{ background: '#1f1f23', borderRadius: 8, padding: 10, marginTop: 6, border: '1px solid #333' }}>
            <div style={{ fontSize: 10, color: '#adadb8', marginBottom: 6 }}>Scegli la nuova classe:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}>
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
                  style={{ fontSize: 10, padding: '6px 4px', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}
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

      {/* Missioni */}
      <Missions />

      {/* Achievements */}
      <div style={{ marginTop: 8 }}>
        <button onClick={() => setShowAchievements(!showAchievements)} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
          padding: '8px 10px', cursor: 'pointer', color: 'var(--accent)', fontSize: 12, fontWeight: 700,
        }}>
          <span>Achievements</span>
          <span style={{ transition: 'transform 0.2s', transform: showAchievements ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: 10 }}>▼</span>
        </button>
        {showAchievements && <div style={{ marginTop: 6 }}><Achievements /></div>}
      </div>
    </div>
  );
}
