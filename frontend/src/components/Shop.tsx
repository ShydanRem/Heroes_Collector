import React, { useState, useEffect } from 'react';
import { RARITY_COLORS, RARITY_LABELS } from '../types';
import * as api from '../services/api';
import { ShopListing } from '../services/api';

const TYPE_ICONS: Record<string, string> = {
  energy: '⚡', energy_full: '⚡', exp_potion: '📜',
  reroll: '🔮', equipment: '⚔️',
};

const TYPE_COLORS: Record<string, string> = {
  energy: '#00c853', energy_full: '#00c853', exp_potion: '#64b5f6',
  reroll: '#9c27b0', equipment: '#ff9800',
};

export function Shop() {
  const [listings, setListings] = useState<ShopListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [gold, setGold] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadShop(); }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  async function loadShop() {
    setError(null);
    try {
      const [shopData, profileData] = await Promise.all([
        api.getShopListings(),
        api.getMyProfile(),
      ]);
      setListings(shopData.listings);
      setGold(profileData.profile.gold);
    } catch (err) {
      console.error('Errore caricamento shop:', err);
      setError('Errore nel caricamento. Controlla la connessione.');
    } finally {
      setLoading(false);
    }
  }

  async function handleBuy(itemId: string) {
    setBuying(itemId);
    try {
      const result = await api.buyFromShop(itemId);
      setMessage({ text: result.message, type: 'success' });
      await loadShop(); // Ricarica per aggiornare gold e stock
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setBuying(null);
    }
  }

  if (loading) {
    return <div className="loading"><div className="spinner" /> Caricamento negozio...</div>;
  }

  if (error) {
    return (
      <div style={{
        textAlign: 'center', padding: '20px 16px',
        color: '#adadb8',
      }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
        <div style={{ fontSize: 12, marginBottom: 12 }}>{error}</div>
        <button className="btn btn-secondary" onClick={loadShop} style={{ fontSize: 11 }}>
          Riprova
        </button>
      </div>
    );
  }

  // Separa consumabili da equipment
  const consumables = listings.filter(l => l.itemType !== 'equipment');
  const equipment = listings.filter(l => l.itemType === 'equipment');

  return (
    <div>
      {/* Header con gold */}
      <div style={{
        background: '#18181b', borderRadius: 8, padding: 10,
        marginBottom: 8, display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', border: '1px solid #333',
      }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#9147ff' }}>Negozio</div>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#ffd700' }}>{gold}g</div>
      </div>

      {/* Consumabili */}
      <div style={{ fontSize: 11, fontWeight: 700, color: '#adadb8', marginBottom: 4 }}>Consumabili</div>
      {consumables.map(item => (
        <div key={item.id} style={{
          background: '#18181b', borderRadius: 6, padding: '8px 10px',
          marginBottom: 4, border: '1px solid #333',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderLeft: `3px solid ${TYPE_COLORS[item.itemType] || '#555'}`,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>
              {TYPE_ICONS[item.itemType] || '📦'} {item.name}
            </div>
            <div style={{ fontSize: 10, color: '#adadb8', marginTop: 1 }}>{item.description}</div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => handleBuy(item.id)}
            disabled={buying === item.id || gold < item.priceGold}
            style={{
              fontSize: 10, padding: '4px 10px', marginLeft: 8,
              opacity: gold < item.priceGold ? 0.4 : 1,
            }}
          >
            {buying === item.id ? '...' : `${item.priceGold}g`}
          </button>
        </div>
      ))}

      {/* Equipment */}
      {equipment.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#adadb8', marginTop: 10, marginBottom: 4 }}>Equipment</div>
          {equipment.map(item => {
            const rarityColor = RARITY_COLORS[(item as any).rarity as keyof typeof RARITY_COLORS] || '#ff9800';

            return (
              <div key={item.id} style={{
                background: '#18181b', borderRadius: 6, padding: '8px 10px',
                marginBottom: 4, border: '1px solid #333',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderLeft: '3px solid #ff9800',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>⚔️ {item.name}</div>
                  <div style={{ fontSize: 10, color: '#adadb8', marginTop: 1 }}>{item.description}</div>
                  {item.stock > 0 && item.stock < 10 && (
                    <div style={{ fontSize: 9, color: '#f44336', marginTop: 1 }}>
                      Solo {item.stock} rimasti!
                    </div>
                  )}
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => handleBuy(item.id)}
                  disabled={buying === item.id || gold < item.priceGold || item.stock === 0}
                  style={{
                    fontSize: 10, padding: '4px 10px', marginLeft: 8,
                    opacity: (gold < item.priceGold || item.stock === 0) ? 0.4 : 1,
                  }}
                >
                  {item.stock === 0 ? 'Esaurito' : buying === item.id ? '...' : `${item.priceGold}g`}
                </button>
              </div>
            );
          })}
        </>
      )}

      {message && <div className={`toast ${message.type}`}>{message.text}</div>}
    </div>
  );
}
