import React, { useState, useEffect } from 'react';
import { Hero, RARITY_COLORS, RARITY_LABELS, CLASS_EMOJIS } from '../types';
import * as api from '../services/api';
import { InventoryItem } from '../services/api';

const SLOT_LABELS: Record<string, string> = {
  arma: 'Arma',
  armatura: 'Armatura',
  accessorio: 'Accessorio',
};

const STAT_LABELS: Record<string, string> = {
  hp: 'HP', atk: 'ATK', def: 'DEF', spd: 'SPD', crit: 'CRIT', critDmg: 'C.DMG',
};

export function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [roster, setRoster] = useState<Hero[]>([]);
  const [myHero, setMyHero] = useState<Hero | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [equipTarget, setEquipTarget] = useState<string | null>(null); // heroId per equip
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

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

  const filteredInventory = filter
    ? inventory.filter(i => i.slot === filter)
    : inventory;

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

    return (
      <div>
        <button className="btn btn-back" onClick={() => { setSelectedItem(null); setEquipTarget(null); }}>
          ← Indietro
        </button>

        <div style={{
          background: '#18181b', borderRadius: 8, padding: 14,
          border: `2px solid ${rarityColor}`, marginBottom: 8,
        }}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 2 }}>{selectedItem.name}</div>
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
            {allHeroes.map(hero => (
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
          </div>
        )}

        {message && <div className={`toast ${message.type}`}>{message.text}</div>}
      </div>
    );
  }

  // Lista inventario
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: '#adadb8' }}>{inventory.length} oggetti</span>
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

      {filteredInventory.length === 0 ? (
        <div className="empty-state">
          <p>🎒 Il tuo zaino è vuoto!</p>
          <p>Completa dungeon per ottenere oggetti.</p>
        </div>
      ) : (
        filteredInventory.map(item => {
          const rarityColor = RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS] || '#9e9e9e';
          const equippedHero = item.equippedOn ? allHeroes.find(h => h.id === item.equippedOn) : null;

          return (
            <div key={item.id}
              onClick={() => setSelectedItem(item)}
              style={{
                background: '#18181b', borderRadius: 6, padding: '8px 10px',
                marginBottom: 4, cursor: 'pointer', border: '1px solid #333',
                borderLeft: `3px solid ${rarityColor}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{item.name}</div>
                <div style={{ fontSize: 9, display: 'flex', gap: 6, color: '#adadb8', marginTop: 1 }}>
                  <span style={{ color: rarityColor }}>{RARITY_LABELS[item.rarity as keyof typeof RARITY_LABELS]}</span>
                  <span>{SLOT_LABELS[item.slot]}</span>
                  {item.quantity > 1 && <span>x{item.quantity}</span>}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 10 }}>
                {equippedHero && (
                  <div style={{ color: '#9147ff' }}>
                    {CLASS_EMOJIS[equippedHero.heroClass]} {equippedHero.displayName}
                  </div>
                )}
                <div style={{ color: '#555' }}>
                  {Object.entries(item.statBonuses).map(([s, v]) =>
                    `${(v as number) >= 0 ? '+' : ''}${v}${STAT_LABELS[s] || s}`
                  ).join(' ')}
                </div>
              </div>
            </div>
          );
        })
      )}

      {message && <div className={`toast ${message.type}`}>{message.text}</div>}
    </div>
  );
}
