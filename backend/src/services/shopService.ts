import { query } from '../config/database';
import { giveItem } from './itemService';
import { spendGold } from './userService';
import { ITEMS, ITEM_MAP } from '../data/items';
import { Rarity } from '../types';

// ============================================
// SHOP SYSTEM
// ============================================

export interface ShopListing {
  id: string;
  itemId: string | null;
  itemType: string;
  name: string;
  description: string;
  priceGold: number;
  priceChannelPoints: number;
  stock: number; // -1 = infinito
  isActive: boolean;
}

// ============================================
// NEGOZIO PERMANENTE (sempre disponibile)
// ============================================

const PERMANENT_SHOP: Omit<ShopListing, 'id' | 'isActive'>[] = [
  // Consumabili
  {
    itemId: null, itemType: 'energy',
    name: 'Pozione di Energia', description: 'Recupera 40 energia. Max 5/giorno.',
    priceGold: 80, priceChannelPoints: 0, stock: -1,
  },
  {
    itemId: null, itemType: 'energy_full',
    name: 'Elisir di Energia', description: 'Recupera tutta l\'energia. Max 2/giorno.',
    priceGold: 350, priceChannelPoints: 0, stock: -1,
  },
  {
    itemId: null, itemType: 'exp_potion',
    name: 'Pergamena dell\'Esperienza', description: 'Dona 150 EXP a un eroe. Max 3/giorno.',
    priceGold: 250, priceChannelPoints: 0, stock: -1,
  },
  {
    itemId: null, itemType: 'reroll',
    name: 'Cristallo del Destino', description: 'Rirolla le 2 abilita secondarie di un eroe.',
    priceGold: 300, priceChannelPoints: 0, stock: -1,
  },
  // Equipment base sempre disponibile
  {
    itemId: 'w_spada_ferro', itemType: 'equipment',
    name: 'Spada di Ferro', description: 'Una spada solida. ATK +10',
    priceGold: 80, priceChannelPoints: 0, stock: -1,
  },
  {
    itemId: 'a_cotta_maglia', itemType: 'equipment',
    name: 'Cotta di Maglia', description: 'Buona protezione. DEF +10, HP +30',
    priceGold: 80, priceChannelPoints: 0, stock: -1,
  },
  {
    itemId: 'acc_collana_crit', itemType: 'equipment',
    name: 'Collana del Critico', description: 'Precisione letale. CRIT +8, CDMG +10',
    priceGold: 100, priceChannelPoints: 0, stock: -1,
  },
];

/**
 * Ottieni tutti gli articoli dello shop.
 */
export async function getShopListings(): Promise<ShopListing[]> {
  // Shop permanente + rotazione
  const permanent: ShopListing[] = PERMANENT_SHOP.map((item, i) => ({
    ...item,
    id: `perm_${i}`,
    isActive: true,
  }));

  // Rotazione giornaliera dal DB
  const dbListings = await query(
    'SELECT * FROM shop_listings WHERE is_active = TRUE ORDER BY created_at DESC'
  );

  const rotation: ShopListing[] = dbListings.rows.map(r => ({
    id: r.id,
    itemId: r.item_id,
    itemType: r.item_type,
    name: r.name,
    description: r.description || '',
    priceGold: r.price_gold,
    priceChannelPoints: r.price_channel_points,
    stock: r.stock,
    isActive: r.is_active,
  }));

  return [...permanent, ...rotation];
}

/**
 * Acquista un articolo dallo shop.
 */
export async function purchaseItem(
  userId: string,
  shopItemId: string
): Promise<{ success: boolean; message: string }> {
  // Trova l'articolo
  let listing: ShopListing | undefined;

  // Controlla se e un item permanente
  if (shopItemId.startsWith('perm_')) {
    const index = parseInt(shopItemId.replace('perm_', ''), 10);
    if (index >= 0 && index < PERMANENT_SHOP.length) {
      listing = { ...PERMANENT_SHOP[index], id: shopItemId, isActive: true };
    }
  } else {
    // Dal DB
    const result = await query(
      'SELECT * FROM shop_listings WHERE id = $1 AND is_active = TRUE',
      [shopItemId]
    );
    if (result.rows.length > 0) {
      const r = result.rows[0];
      listing = {
        id: r.id, itemId: r.item_id, itemType: r.item_type,
        name: r.name, description: r.description || '',
        priceGold: r.price_gold, priceChannelPoints: r.price_channel_points,
        stock: r.stock, isActive: true,
      };
    }
  }

  if (!listing) {
    return { success: false, message: 'Articolo non trovato nello shop' };
  }

  // Controlla stock
  if (listing.stock === 0) {
    return { success: false, message: 'Articolo esaurito!' };
  }

  // Cap acquisti giornalieri (rebalance Phase 2): conta in modo atomico PRIMA di
  // spendere gold; se oltre il limite si fa rollback del contatore e si rifiuta.
  const DAILY_CAPS: Record<string, number> = {
    energy: 5,
    energy_full: 2,
    exp_potion: 3,
  };
  const dailyCap = DAILY_CAPS[listing.itemType];
  const today = new Date().toISOString().slice(0, 10);
  if (dailyCap !== undefined) {
    const usage = await query(
      `INSERT INTO daily_purchases (user_id, item_type, date, count)
       VALUES ($1, $2, $3, 1)
       ON CONFLICT (user_id, item_type, date)
       DO UPDATE SET count = daily_purchases.count + 1
       RETURNING count`,
      [userId, listing.itemType, today]
    );
    if (usage.rows[0].count > dailyCap) {
      await query(
        `UPDATE daily_purchases SET count = count - 1
         WHERE user_id = $1 AND item_type = $2 AND date = $3`,
        [userId, listing.itemType, today]
      );
      return {
        success: false,
        message: `Limite giornaliero raggiunto: max ${dailyCap}/giorno per ${listing.name}.`,
      };
    }
  }

  // Deduci gold in modo atomico (no race / no saldo negativo).
  const paid = await spendGold(userId, listing.priceGold);
  if (!paid) {
    // Pagamento fallito: rollback del contatore cap appena incrementato.
    if (dailyCap !== undefined) {
      await query(
        `UPDATE daily_purchases SET count = count - 1
         WHERE user_id = $1 AND item_type = $2 AND date = $3`,
        [userId, listing.itemType, today]
      );
    }
    const userResult = await query(
      'SELECT gold FROM users WHERE twitch_user_id = $1',
      [userId]
    );
    if (userResult.rows.length === 0) {
      return { success: false, message: 'Utente non trovato' };
    }
    return { success: false, message: `Gold insufficiente! Servono ${listing.priceGold}g.` };
  }

  // Applica effetto in base al tipo e genera messaggio descrittivo
  let resultMessage = '';

  switch (listing.itemType) {
    case 'energy':
      await query(
        'UPDATE users SET energy = LEAST(max_energy, energy + 40) WHERE twitch_user_id = $1',
        [userId]
      );
      resultMessage = `+40 energia recuperata!`;
      break;

    case 'energy_full':
      await query(
        'UPDATE users SET energy = max_energy WHERE twitch_user_id = $1',
        [userId]
      );
      resultMessage = `Energia ripristinata al massimo!`;
      break;

    case 'exp_potion': {
      const heroResult = await query(
        'SELECT id, display_name FROM heroes WHERE twitch_user_id = $1 LIMIT 1',
        [userId]
      );
      if (heroResult.rows.length > 0) {
        const { addExpToHero } = await import('./heroService');
        await addExpToHero(heroResult.rows[0].id, 150);
        resultMessage = `+150 EXP a ${heroResult.rows[0].display_name}!`;
      } else {
        resultMessage = `Pergamena usata, ma nessun eroe trovato.`;
      }
      break;
    }

    case 'reroll': {
      const myHero = await query(
        'SELECT * FROM heroes WHERE twitch_user_id = $1',
        [userId]
      );
      if (myHero.rows.length > 0) {
        const hero = myHero.rows[0];
        const { selectAbilities } = await import('./heroGenerator');
        const newAbilities = selectAbilities(
          hero.hero_class, hero.rarity, hero.level,
          userId + Date.now().toString()
        );
        await query(
          'UPDATE heroes SET ability_ids = $1, updated_at = NOW() WHERE twitch_user_id = $2',
          [newAbilities, userId]
        );
        resultMessage = `Abilita di ${hero.display_name} rirollate! Controlla il tuo eroe.`;
      } else {
        resultMessage = `Cristallo usato, ma nessun eroe trovato.`;
      }
      break;
    }

    case 'equipment':
      if (listing.itemId) {
        await giveItem(userId, listing.itemId);
        resultMessage = `${listing.name} aggiunto allo Zaino! Vai nello Zaino per equipaggiarlo.`;
      }
      break;
  }

  // Aggiorna stock se non e infinito e non e permanente
  if (!shopItemId.startsWith('perm_') && listing.stock > 0) {
    await query(
      'UPDATE shop_listings SET stock = stock - 1 WHERE id = $1',
      [shopItemId]
    );
  }

  // Progresso missioni giornaliere + achievement
  try {
    const { progressMission } = await import('./missionService');
    await progressMission(userId, 'shop');
  } catch { /* */ }
  try {
    const { checkProgressAchievements } = await import('./achievementService');
    await checkProgressAchievements(userId);
  } catch { /* */ }

  return { success: true, message: resultMessage || `Acquistato: ${listing.name}!` };
}

/**
 * Rigenera lo shop rotante giornaliero.
 * Da chiamare una volta al giorno o al reset.
 */
export async function refreshDailyShop(): Promise<void> {
  // Disattiva i vecchi
  await query('UPDATE shop_listings SET is_active = FALSE WHERE refresh_date < NOW()');

  // Genera 3 item random di rarita mista
  const rarities = [Rarity.RARO, Rarity.MOLTO_RARO, Rarity.EPICO];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  for (const rarity of rarities) {
    const pool = ITEMS.filter(i => i.rarity === rarity);
    if (pool.length === 0) continue;

    const item = pool[Math.floor(Math.random() * pool.length)];
    const priceMap: Record<string, number> = {
      raro: 200,
      molto_raro: 450,
      epico: 800,
      leggendario: 1500,
    };

    // Inserisci definizione item se non esiste
    await query(
      `INSERT INTO item_definitions (id, name, description, slot, rarity, stat_bonuses)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [item.id, item.name, item.description, item.slot, item.rarity, JSON.stringify(item.statBonuses)]
    );

    await query(
      `INSERT INTO shop_listings (item_id, item_type, name, description, price_gold, stock, is_active, refresh_date)
       VALUES ($1, 'equipment', $2, $3, $4, 3, TRUE, $5)`,
      [item.id, item.name, item.description, priceMap[rarity] || 500, tomorrow]
    );
  }
}
