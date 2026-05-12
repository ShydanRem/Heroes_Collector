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

interface ShopProps {
  onGoToInventory?: () => void;
}

export function Shop({ onGoToInventory }: ShopProps) {
  const [listings, setListings] = useState<ShopListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error'; isEquipment?: boolean } | null>(null);
  const [gold, setGold] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadShop(); }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
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

  async function handleBuy(item: ShopListing) {
    setBuying(item.id);
    try {
      const result = await api.buyFromShop(item.id);
      setMessage({
        text: result.message,
        type: 'success',
        isEquipment: item.itemType === 'equipment',
      });
      await loadShop();
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
    <div className="shop-container">
      {/* Header con gold */}
      <div style={{
        background: 'linear-gradient(90deg, #18181b, #1a0a2e)',
        borderRadius: 12, padding: '12px 16px',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', border: '1px solid #333',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#9147ff' }}>NEGOZIO</div>
          <div style={{ fontSize: 9, color: '#adadb8', textTransform: 'uppercase', letterSpacing: 1 }}>Articoli Disponibili</div>
        </div>
        <div style={{ 
          fontSize: 18, fontWeight: 900, color: '#ffd700', 
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,215,0,0.1)', padding: '4px 12px', borderRadius: 20
        }}>
          {gold.toLocaleString()} <span style={{ fontSize: 14 }}>g</span>
        </div>
      </div>

      {/* Consumabili */}
      <section>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#adadb8', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase' }}>
          ✨ Consumabili
        </div>
        <div className="shop-grid">
          {consumables.map(item => (
            <div key={item.id} className={`shop-card ${gold < item.priceGold ? 'disabled' : ''}`}>
              <div className="shop-card-icon">{TYPE_ICONS[item.itemType] || '📦'}</div>
              <div className="shop-card-name">{item.name}</div>
              <div className="shop-card-price">
                {item.priceGold} <span>g</span>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => handleBuy(item)}
                disabled={buying === item.id || gold < item.priceGold}
                style={{ width: '100%', marginTop: 10, fontSize: 10, padding: '6px' }}
              >
                {buying === item.id ? '...' : 'Acquista'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Equipment */}
      {equipment.length > 0 && (
        <section>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#adadb8', marginTop: 8, marginBottom: 8, marginLeft: 4, textTransform: 'uppercase' }}>
            ⚔️ Equipaggiamento
          </div>
          <div className="shop-grid">
            {equipment.map(item => {
              const rarity = (item as any).rarity?.toLowerCase() || 'comune';
              const isLocked = gold < item.priceGold || item.stock === 0;

              return (
                <div key={item.id} className={`shop-card ${rarity} ${isLocked ? 'disabled' : ''}`}>
                  {item.stock > 0 && item.stock < 10 && (
                    <div className="shop-card-stock">-{item.stock}</div>
                  )}
                  <div className="shop-card-icon">⚔️</div>
                  <div className="shop-card-name">{item.name}</div>
                  <div className="shop-card-price">
                    {item.priceGold} <span>g</span>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleBuy(item)}
                    disabled={buying === item.id || isLocked}
                    style={{ width: '100%', marginTop: 10, fontSize: 10, padding: '6px' }}
                  >
                    {item.stock === 0 ? 'Esaurito' : buying === item.id ? '...' : 'Acquista'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Toast messaggio */}
      {message && (
        <div style={{
          position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          background: message.type === 'success' ? 'rgba(34, 197, 94, 0.98)' : 'rgba(239, 68, 68, 0.98)',
          color: '#fff', padding: '12px 20px', borderRadius: 12,
          fontSize: 12, fontWeight: 800, zIndex: 3000,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          width: '85%', maxWidth: '280px', textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
          animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}>
          <div style={{ fontSize: 24 }}>{message.type === 'success' ? '✅' : '❌'}</div>
          <span>{message.text}</span>
          {message.isEquipment && onGoToInventory && (
            <button
              onClick={() => { setMessage(null); onGoToInventory(); }}
              style={{
                background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', 
                color: '#fff', padding: '6px 16px', borderRadius: 6, cursor: 'pointer',
                fontSize: 11, fontWeight: 800, marginTop: 4, width: '100%'
              }}
            >
              🎒 VAI ALLO ZAINO
            </button>
          )}
        </div>
      )}
    </div>
  );
}
