import React, { useState, useEffect } from 'react';
import { Blessing, ActiveBuff } from '../types';
import * as api from '../services/api';


interface BitShopProps {
  onBuffActivated?: (buff: ActiveBuff) => void;
}

export function BitShop({ onBuffActivated }: BitShopProps) {
  const [blessings, setBlessings] = useState<Blessing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadBlessings();

    // Setup Twitch Bits listeners
    if (window.Twitch?.ext?.bits) {
      window.Twitch.ext.bits.onTransactionComplete((transaction) => {
        console.log('Transazione Bits completata:', transaction);
        handleTransactionSuccess(transaction.product.sku);
      });
      window.Twitch.ext.bits.onTransactionCancelled(() => {
        setProcessing(null);
      });
    }
  }, []);

  async function loadBlessings() {
    try {
      const data = await api.getBlessings();
      setBlessings(data.blessings);
    } catch (err) {
      setError('Impossibile caricare le benedizioni');
    } finally {
      setLoading(false);
    }
  }

  async function handleBuy(blessing: Blessing) {
    if (processing) return;
    setProcessing(blessing.id);

    if (window.Twitch?.ext?.bits) {
      // In produzione, usiamo l'API di Twitch
      // Il prodotto deve essere configurato nella Dashboard Twitch con SKU = blessing.id
      try {
        // Nota: Twitch richiede che l'ID del prodotto sia lo SKU
        // @ts-ignore
        window.Twitch.ext.bits.useNextEntitlement(); 
        // Oppure si può usare getProducts() per mostrare i prezzi reali di Twitch
      } catch (err) {
        console.error('Errore Bits API:', err);
        setProcessing(null);
      }
    } else {
      // Mock per sviluppo locale
      console.log('Dev Mode: Simulazione acquisto Bits per', blessing.name);
      setTimeout(() => handleTransactionSuccess(blessing.id), 1000);
    }
  }

  async function handleTransactionSuccess(sku: string) {
    try {
      const result = await api.useBitsForBlessing(sku);
      if (result.buff) {
        onBuffActivated?.(result.buff);
      }
      alert(`Benedizione attivata: ${result.message}`);
    } catch (err: any) {
      alert(`Errore: ${err.message}`);
    } finally {
      setProcessing(null);
    }
  }

  if (loading) return <div className="loading">Caricamento benedizioni...</div>;

  return (
    <div className="bit-shop">
      <div className="bit-shop-header">
        <h2>Tempio delle Benedizioni</h2>
        <p>Potenzia il tuo cammino con i Bits</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="blessings-grid">
        {blessings.map((b) => (
          <div key={b.id} className={`blessing-card ${processing === b.id ? 'processing' : ''}`}>
            <div className="blessing-emoji">{b.emoji}</div>
            <div className="blessing-info">
              <h3>{b.name}</h3>
              <p>{b.description}</p>
              {b.durationMinutes > 0 && (
                <span className="blessing-duration">Durata: {b.durationMinutes} min</span>
              )}
            </div>
            <button 
              className="btn btn-bits" 
              onClick={() => handleBuy(b)}
              disabled={!!processing}
            >
              {processing === b.id ? '...' : `${b.bitCost} Bits`}
            </button>
          </div>
        ))}
      </div>

      <div className="bit-shop-footer">
        <p>I Bits supportano direttamente lo streamer!</p>
      </div>
    </div>
  );
}
