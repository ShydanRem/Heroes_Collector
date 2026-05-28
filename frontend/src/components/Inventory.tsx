import React, { useState, useEffect } from 'react';
import { Hero, RARITY_COLORS, RARITY_LABELS, CLASS_EMOJIS, CLASS_LABELS, HeroClass } from '../types';
import * as api from '../services/api';
import { InventoryItem } from '../services/api';
import { STAT_LABELS } from '../constants/stats';
import { getItemIcon, SLOT_ICONS } from '../utils/itemIcon';
import { ItemCard } from './ItemCard';
import { itemSellValue } from '../utils/stats';
import { CoinFly } from './CoinFly';

const RARITY_ORDER: Record<string, number> = {
  master: 8, mitico: 7, leggendario: 6, epico: 5,
  molto_raro: 4, raro: 3, non_comune: 2, comune: 1,
};

const SEEN_KEY = 'heroes-collector:seen-items';
function loadSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch { return new Set(); }
}
function saveSeen(seen: Set<string>) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(seen)));
  } catch { /* ignore */ }
}

const SLOT_LABELS: Record<string, string> = {
  arma: 'Arma',
  armatura: 'Armatura',
  accessorio: 'Accessorio',
};

function canHeroEquip(hero: Hero, item: InventoryItem): boolean {
  if (!item.allowedClasses || item.allowedClasses.length === 0) return true;
  return item.allowedClasses.includes(hero.heroClass);
}

export function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [roster, setRoster] = useState<Hero[]>([]);
  const [myHero, setMyHero] = useState<Hero | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [equipTarget, setEquipTarget] = useState<string | null>(null); // heroId per equip
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [sort, setSort] = useState<'rarity' | 'value'>('rarity');
  const [error, setError] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [seenIds] = useState<Set<string>>(() => loadSeen());
  const [, forceRerender] = useState(0);
  const [coinBurst, setCoinBurst] = useState<{ x: number; y: number; key: number } | null>(null);

  function triggerCoinBurst(selector: string) {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCoinBurst({ x: rect.left + rect.width / 2, y: rect.top, key: Date.now() });
  }

  useEffect(() => {
    if (inventory.length === 0) return;
    const newOnes = inventory.filter(it => !seenIds.has(it.id));
    if (newOnes.length === 0) return;
    const t = setTimeout(() => {
      for (const it of newOnes) seenIds.add(it.id);
      saveSeen(seenIds);
      forceRerender(n => n + 1);
    }, 4000);
    return () => clearTimeout(t);
  }, [inventory, seenIds]);

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  async function handleQuickSellCommons() {
    const commonsUnequipped = inventory.filter(i => i.rarity === 'comune' && !i.equippedOn);
    if (commonsUnequipped.length === 0) {
      setMessage({ text: 'Nessun oggetto comune da vendere', type: 'success' });
      return;
    }
    const totalEstimate = commonsUnequipped.reduce((s, it) => s + itemSellValue(it), 0);
    if (!confirm(`Vendere ${commonsUnequipped.length} oggetti comuni per ~${totalEstimate}g?`)) return;
    setBulkBusy(true);
    try {
      const result = await api.sellBulk(commonsUnequipped.map(i => i.id));
      await loadData();
      setMessage({
        text: `Venduti ${result.soldCount} comuni per ${result.gold}g`,
        type: 'success',
      });
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setBulkBusy(false);
    }
  }

  async function handleBulkSell() {
    if (selectedIds.size === 0) return;
    setBulkBusy(true);
    try {
      const ids = Array.from(selectedIds);
      const result = await api.sellBulk(ids);
      triggerCoinBurst('.sticky-sell-bar');
      await loadData();
      setMessage({
        text: `Venduti ${result.soldCount} oggetti per ${result.gold}g${result.skipped.length ? ` (${result.skipped.length} saltati)` : ''}`,
        type: 'success',
      });
      exitSelectMode();
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setBulkBusy(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  async function loadData() {
    setError(null);
    try {
      const [invData, rosterData, profileData] = await Promise.all([
        api.getInventory(),
        api.getMyRoster(),
        api.getMyProfile(),
      ]);
      setInventory(invData.inventory);
      setRoster(rosterData.roster);
      setMyHero(profileData.hero);
    } catch (err) {
      console.error('Errore caricamento inventario:', err);
      setError('Errore nel caricamento. Controlla la connessione.');
    } finally {
      setLoading(false);
    }
  }

  async function handleEquip(inventoryId: string, heroId: string) {
    try {
      await api.equipItem(inventoryId, heroId);
      setEquipTarget(null);
      setSelectedItem(null);
      await loadData();
      setMessage({ text: 'Oggetto equipaggiato!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  }

  async function handleUnequip(inventoryId: string) {
    try {
      await api.unequipItem(inventoryId);
      setSelectedItem(null);
      await loadData();
      setMessage({ text: 'Oggetto rimosso', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  }

  async function handleSell(inventoryId: string) {
    try {
      const result = await api.sellItem(inventoryId);
      setSelectedItem(null);
      await loadData();
      setMessage({ text: result.message, type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  }

  const allHeroes: Hero[] = [...roster];
  if (myHero && !allHeroes.find(h => h.id === myHero.id)) {
    allHeroes.unshift(myHero);
  }

  const filteredInventory = (filter
    ? inventory.filter(i => i.slot === filter)
    : [...inventory]
  ).sort((a, b) => {
    if (sort === 'value') return (b.sellValue * b.quantity) - (a.sellValue * a.quantity);
    return (RARITY_ORDER[b.rarity] ?? 0) - (RARITY_ORDER[a.rarity] ?? 0);
  });

  const totalValue = filteredInventory.reduce((sum, it) => sum + itemSellValue(it), 0);

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

  // Dettaglio oggetto selezionato
  if (selectedItem) {
    const rarityColor = RARITY_COLORS[selectedItem.rarity as keyof typeof RARITY_COLORS] || '#9e9e9e';
    const equippedHero = selectedItem.equippedOn
      ? allHeroes.find(h => h.id === selectedItem.equippedOn)
      : null;
    const hasClassRestriction = selectedItem.allowedClasses && selectedItem.allowedClasses.length > 0;
    const compatibleHeroes = allHeroes.filter(h => canHeroEquip(h, selectedItem));
    const incompatibleHeroes = allHeroes.filter(h => !canHeroEquip(h, selectedItem));

    return (
      <div>
        <button className="btn btn-back" onClick={() => { setSelectedItem(null); setEquipTarget(null); }}>
          ← Indietro
        </button>

        <div style={{
          background: '#18181b', borderRadius: 8, padding: 14,
          border: `2px solid ${rarityColor}`, marginBottom: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 20 }}>{getItemIcon(selectedItem.name, selectedItem.slot)}</span>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{selectedItem.name}</div>
          </div>
          <div style={{ fontSize: 10, color: rarityColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
            {RARITY_LABELS[selectedItem.rarity as keyof typeof RARITY_LABELS]} — {SLOT_LABELS[selectedItem.slot] || selectedItem.slot}
          </div>
          <div style={{ fontSize: 11, color: '#adadb8', marginBottom: 8 }}>{selectedItem.description}</div>

          {/* Bonus stats */}
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9147ff', marginBottom: 4 }}>Bonus Stats</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}>
            {Object.entries(selectedItem.statBonuses).map(([stat, value]) => (
              <div key={stat} style={{
                background: '#0e0e10', borderRadius: 4, padding: '3px 6px',
                fontSize: 11, display: 'flex', justifyContent: 'space-between',
              }}>
                <span>{STAT_LABELS[stat] || stat}</span>
                <span style={{ color: (value as number) >= 0 ? '#00c853' : '#f44336', fontWeight: 700 }}>
                  {(value as number) >= 0 ? '+' : ''}{value as number}
                </span>
              </div>
            ))}
          </div>

          {/* Restrizioni classe */}
          {hasClassRestriction && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#ff9800', marginBottom: 3 }}>Classi permesse:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {selectedItem.allowedClasses!.map(cls => (
                  <span key={cls} style={{
                    background: '#0e0e10', borderRadius: 4, padding: '2px 6px',
                    fontSize: 10, color: '#efeff1', border: '1px solid #333',
                  }}>
                    {CLASS_EMOJIS[cls as HeroClass] || ''} {CLASS_LABELS[cls as HeroClass] || cls}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stato equip */}
          {equippedHero && (
            <div style={{ marginTop: 8, fontSize: 11, color: '#adadb8' }}>
              Equipaggiato su: <span style={{ color: '#efeff1', fontWeight: 700 }}>
                {CLASS_EMOJIS[equippedHero.heroClass]} {equippedHero.displayName}
              </span>
            </div>
          )}
        </div>

        {/* Azioni */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {selectedItem.equippedOn ? (
            <button className="btn btn-secondary" onClick={() => handleUnequip(selectedItem.id)} style={{ width: '100%' }}>
              Rimuovi equipaggiamento
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setEquipTarget(equipTarget ? null : 'choose')} style={{ width: '100%' }}>
              Equipaggia su...
            </button>
          )}

          {!selectedItem.equippedOn && (
            <button className="btn btn-secondary" onClick={() => handleSell(selectedItem.id)}
              style={{ width: '100%', color: '#f44336', fontSize: 11 }}>
              Vendi
            </button>
          )}
        </div>

        {/* Selettore eroe per equip */}
        {equipTarget === 'choose' && (
          <div style={{ marginTop: 6, background: '#0e0e10', borderRadius: 6, padding: 6 }}>
            <div style={{ fontSize: 10, color: '#adadb8', marginBottom: 4 }}>Scegli un eroe:</div>
            {compatibleHeroes.length === 0 && (
              <div style={{ fontSize: 10, color: '#f44336', padding: 8, textAlign: 'center' }}>
                Nessun eroe compatibile con questo oggetto!
              </div>
            )}
            {compatibleHeroes.map(hero => (
              <div key={hero.id}
                onClick={() => handleEquip(selectedItem.id, hero.id)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '5px 6px', borderRadius: 4, cursor: 'pointer',
                  marginBottom: 2, background: '#18181b',
                }}>
                <span style={{ fontSize: 11 }}>{CLASS_EMOJIS[hero.heroClass]} {hero.displayName}</span>
                <span style={{ fontSize: 9, color: RARITY_COLORS[hero.rarity] }}>Lv.{hero.level}</span>
              </div>
            ))}
            {incompatibleHeroes.length > 0 && (
              <>
                <div style={{ fontSize: 9, color: '#555', marginTop: 4, marginBottom: 2 }}>Classe incompatibile:</div>
                {incompatibleHeroes.map(hero => (
                  <div key={hero.id}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '5px 6px', borderRadius: 4,
                      marginBottom: 2, background: '#18181b', opacity: 0.35,
                    }}>
                    <span style={{ fontSize: 11 }}>{CLASS_EMOJIS[hero.heroClass]} {hero.displayName}</span>
                    <span style={{ fontSize: 9, color: '#f44336' }}>🚫</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {message && <div className={`toast ${message.type}`}>{message.text}</div>}
      </div>
    );
  }

  // Lista inventario premium
  return (
    <div>
      {/* Header riepilogo */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 8, padding: '8px 10px',
        background: 'linear-gradient(180deg, #2d2d35, #18181b)',
        borderRadius: 8, border: '1px solid #333',
      }}>
        <div>
          <div style={{ fontSize: 11, color: '#adadb8' }}>Zaino</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#efeff1' }}>
            {filteredInventory.length} oggetti
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9, color: '#adadb8', textTransform: 'uppercase', letterSpacing: 1 }}>Valore totale</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#ffd700' }}>{totalValue.toLocaleString()}g</div>
          <button
            className="btn btn-secondary"
            onClick={() => selectMode ? exitSelectMode() : setSelectMode(true)}
            style={{ fontSize: 9, padding: '3px 8px', marginTop: 4 }}
          >
            {selectMode ? 'Annulla' : 'Seleziona'}
          </button>
        </div>
      </div>

      {/* Filtri slot */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        <button className={`btn btn-secondary`} onClick={() => setFilter('')}
          style={{ flex: 1, fontSize: 10, padding: '3px 4px', background: filter === '' ? '#9147ff' : undefined, color: filter === '' ? '#fff' : undefined }}>
          Tutti
        </button>
        {['arma', 'armatura', 'accessorio'].map(slot => (
          <button key={slot} className="btn btn-secondary" onClick={() => setFilter(slot)}
            style={{ flex: 1, fontSize: 10, padding: '3px 4px', background: filter === slot ? '#9147ff' : undefined, color: filter === slot ? '#fff' : undefined }}>
            {SLOT_LABELS[slot]}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: '#adadb8', marginRight: 4 }}>Ordina:</span>
        <button
          className="btn btn-secondary"
          onClick={() => setSort('rarity')}
          style={{ fontSize: 9, padding: '3px 8px', background: sort === 'rarity' ? '#9147ff' : undefined, color: sort === 'rarity' ? '#fff' : undefined }}
        >Rarità</button>
        <button
          className="btn btn-secondary"
          onClick={() => setSort('value')}
          style={{ fontSize: 9, padding: '3px 8px', background: sort === 'value' ? '#9147ff' : undefined, color: sort === 'value' ? '#fff' : undefined }}
        >Valore</button>
      </div>

      {/* Quick-sell comuni (solo se ce ne sono) */}
      {(() => {
        const commons = inventory.filter(i => i.rarity === 'comune' && !i.equippedOn);
        if (commons.length === 0 || selectMode) return null;
        const total = commons.reduce((s, it) => s + itemSellValue(it), 0);
        return (
          <div style={{ marginBottom: 8 }}>
            <button
              onClick={handleQuickSellCommons}
              disabled={bulkBusy}
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: 10, padding: '6px', color: '#ffd700' }}
            >
              ⚡ Vendi {commons.length} comuni non equipaggiati (+{total}g)
            </button>
          </div>
        );
      })()}

      {filteredInventory.length === 0 ? (
        <div className="empty-state">
          <p>🎒 Il tuo zaino e vuoto!</p>
          <p>Completa dungeon o compra dallo shop per ottenere oggetti.</p>
        </div>
      ) : (
        filteredInventory.map(item => {
          const isSelected = selectedIds.has(item.id);
          const isSellable = !item.equippedOn;
          return (
            <div key={item.id} style={{ marginBottom: 4 }}>
              <ItemCard
                item={item}
                isNew={!seenIds.has(item.id)}
                showSellValue={isSellable && !selectMode}
                selected={selectMode && isSelected}
                onClick={() => {
                  if (selectMode) {
                    if (!isSellable) return; // equipaggiati protetti
                    toggleSelect(item.id);
                  } else {
                    setSelectedItem(item);
                  }
                }}
                right={selectMode ? (
                  <div style={{
                    width: 20, height: 20, borderRadius: 4,
                    background: isSelected ? '#22c55e' : '#0e0e10',
                    color: isSelected ? '#0a0a0a' : '#555',
                    border: '1px solid #444',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: 12,
                    opacity: isSellable ? 1 : 0.4,
                  }}>
                    {isSelected ? '✓' : ''}
                  </div>
                ) : (item.equippedOn ? (
                  <div style={{ color: '#9147ff', fontSize: 10 }}>
                    {(() => {
                      const h = allHeroes.find(h => h.id === item.equippedOn);
                      return h ? `${CLASS_EMOJIS[h.heroClass]} ${h.displayName}` : 'Equipaggiato';
                    })()}
                  </div>
                ) : undefined)}
              />
            </div>
          );
        })
      )}

      {selectMode && selectedIds.size > 0 && (
        <div className="sticky-sell-bar">
          <div>
            <div style={{ fontSize: 10, color: '#adadb8' }}>{selectedIds.size} selezionati</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#ffd700' }}>
              +{Array.from(selectedIds)
                .map(id => inventory.find(i => i.id === id))
                .filter((it): it is InventoryItem => !!it)
                .reduce((sum, it) => sum + itemSellValue(it), 0).toLocaleString()}g
            </div>
          </div>
          <button
            onClick={handleBulkSell}
            disabled={bulkBusy}
            className="btn btn-primary"
            style={{ fontSize: 12, padding: '8px 16px' }}
          >
            💰 Vendi
          </button>
        </div>
      )}

      {coinBurst && (
        <CoinFly
          key={coinBurst.key}
          origin={{ x: coinBurst.x, y: coinBurst.y }}
          onDone={() => setCoinBurst(null)}
        />
      )}

      {message && <div className={`toast ${message.type}`}>{message.text}</div>}
    </div>
  );
}
