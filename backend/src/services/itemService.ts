import { query } from '../config/database';
import { ITEM_MAP, ItemDefinition } from '../data/items';
import { HeroClass } from '../types';

// ============================================
// GESTIONE INVENTARIO E EQUIPMENT
// ============================================

export interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
  description: string;
  slot: string;
  rarity: string;
  statBonuses: Record<string, number>;
  quantity: number;
  equippedOn: string | null; // hero ID
  allowedClasses?: string[]; // classi che possono equipaggiare
}

/**
 * Dai un oggetto a un utente (da loot o shop).
 */
export async function giveItem(userId: string, itemId: string, quantity: number = 1): Promise<void> {
  const item = ITEM_MAP.get(itemId);
  if (!item) throw new Error(`Oggetto ${itemId} non trovato`);

  // Assicura che la definizione esista nel DB
  await query(
    `INSERT INTO item_definitions (id, name, description, slot, rarity, stat_bonuses)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (id) DO NOTHING`,
    [item.id, item.name, item.description, item.slot, item.rarity, JSON.stringify(item.statBonuses)]
  );

  // Aggiungi all'inventario (somma quantita se gia presente e non equipaggiato)
  const existing = await query(
    'SELECT id, quantity FROM inventory WHERE user_id = $1 AND item_id = $2 AND equipped_on IS NULL',
    [userId, itemId]
  );

  if (existing.rows.length > 0) {
    await query(
      'UPDATE inventory SET quantity = quantity + $1 WHERE id = $2',
      [quantity, existing.rows[0].id]
    );
  } else {
    await query(
      'INSERT INTO inventory (user_id, item_id, quantity) VALUES ($1, $2, $3)',
      [userId, itemId, quantity]
    );
  }
}

/**
 * Ottieni l'inventario completo di un utente.
 */
export async function getInventory(userId: string): Promise<InventoryItem[]> {
  const result = await query(
    `SELECT i.id, i.item_id, i.quantity, i.equipped_on,
            d.name, d.description, d.slot, d.rarity, d.stat_bonuses
     FROM inventory i
     JOIN item_definitions d ON d.id = i.item_id
     WHERE i.user_id = $1
     ORDER BY d.rarity DESC, d.slot, d.name`,
    [userId]
  );

  return result.rows.map(row => {
    const def = ITEM_MAP.get(row.item_id);
    return {
      id: row.id,
      itemId: row.item_id,
      name: row.name,
      description: row.description,
      slot: row.slot,
      rarity: row.rarity,
      statBonuses: row.stat_bonuses || {},
      quantity: row.quantity,
      equippedOn: row.equipped_on,
      allowedClasses: def?.allowedClasses || undefined,
    };
  });
}

/**
 * Equipaggia un oggetto su un eroe.
 */
export async function equipItem(
  userId: string,
  inventoryId: string,
  heroId: string
): Promise<{ success: boolean; message: string }> {
  // Verifica che l'oggetto appartenga all'utente
  const itemResult = await query(
    `SELECT i.id, i.item_id, i.quantity, i.equipped_on, d.slot
     FROM inventory i
     JOIN item_definitions d ON d.id = i.item_id
     WHERE i.id = $1 AND i.user_id = $2`,
    [inventoryId, userId]
  );

  if (itemResult.rows.length === 0) {
    return { success: false, message: 'Oggetto non trovato nel tuo inventario' };
  }

  const item = itemResult.rows[0];

  // Verifica che l'eroe sia nel roster o sia il proprio e ottieni la classe
  const heroCheck = await query(
    `SELECT h.hero_class FROM roster r
     JOIN heroes h ON h.id = r.hero_id
     WHERE r.owner_user_id = $1 AND r.hero_id = $2
     UNION
     SELECT h.hero_class FROM heroes h
     WHERE h.id = $2 AND h.twitch_user_id = $1`,
    [userId, heroId]
  );
  if (heroCheck.rows.length === 0) {
    return { success: false, message: 'Questo eroe non e nel tuo roster' };
  }

  // Verifica restrizioni di classe
  const heroClass = heroCheck.rows[0].hero_class as HeroClass;
  const itemDef = ITEM_MAP.get(item.item_id);
  if (itemDef?.allowedClasses && !itemDef.allowedClasses.includes(heroClass)) {
    const classNames: Record<string, string> = {
      guardiano: 'Guardiano', lama: 'Berserker', arcano: 'Stregone', custode: 'Sacerdote',
      ombra: 'Assassino', ranger: 'Ranger', sciamano: 'Sciamano', crono: 'Cronomante',
      dragoon: 'Dragoon', samurai: 'Samurai', necromante: 'Necromante', alchimista: 'Alchimista',
    };
    const allowedNames = itemDef.allowedClasses.map(c => classNames[c] || c).join(', ');
    return { success: false, message: `Questo oggetto puo essere usato solo da: ${allowedNames}` };
  }

  // Rimuovi oggetto gia equipaggiato nello stesso slot su questo eroe
  await query(
    `UPDATE inventory SET equipped_on = NULL
     WHERE user_id = $1 AND equipped_on = $2
     AND item_id IN (SELECT id FROM item_definitions WHERE slot = $3)`,
    [userId, heroId, item.slot]
  );

  // Se l'oggetto e gia equipaggiato su un altro eroe, crea una nuova entry
  if (item.equipped_on && item.equipped_on !== heroId) {
    // Deequippa dal vecchio eroe
    await query('UPDATE inventory SET equipped_on = NULL WHERE id = $1', [inventoryId]);
  }

  // Se ha quantita > 1, split: una copia equipaggiata, il resto rimane
  if (item.quantity > 1 && !item.equipped_on) {
    await query('UPDATE inventory SET quantity = quantity - 1 WHERE id = $1', [inventoryId]);
    await query(
      'INSERT INTO inventory (user_id, item_id, quantity, equipped_on) VALUES ($1, $2, 1, $3)',
      [userId, item.item_id, heroId]
    );
  } else {
    await query(
      'UPDATE inventory SET equipped_on = $1 WHERE id = $2',
      [heroId, inventoryId]
    );
  }

  return { success: true, message: 'Oggetto equipaggiato!' };
}

/**
 * Rimuovi un oggetto equipaggiato.
 */
export async function unequipItem(
  userId: string,
  inventoryId: string
): Promise<{ success: boolean; message: string }> {
  const result = await query(
    'UPDATE inventory SET equipped_on = NULL WHERE id = $1 AND user_id = $2 AND equipped_on IS NOT NULL RETURNING id',
    [inventoryId, userId]
  );

  if (result.rows.length === 0) {
    return { success: false, message: 'Oggetto non equipaggiato o non trovato' };
  }

  return { success: true, message: 'Oggetto rimosso' };
}

/**
 * Ottieni i bonus stats totali dagli oggetti equipaggiati su un eroe.
 */
export async function getEquipmentBonuses(heroId: string): Promise<Record<string, number>> {
  const result = await query(
    `SELECT d.stat_bonuses
     FROM inventory i
     JOIN item_definitions d ON d.id = i.item_id
     WHERE i.equipped_on = $1`,
    [heroId]
  );

  const bonuses: Record<string, number> = {};

  for (const row of result.rows) {
    const stats = row.stat_bonuses || {};
    for (const [stat, value] of Object.entries(stats)) {
      bonuses[stat] = (bonuses[stat] || 0) + (value as number);
    }
  }

  return bonuses;
}

/**
 * Vendi un oggetto per gold.
 */
export async function sellItem(
  userId: string,
  inventoryId: string
): Promise<{ success: boolean; gold: number; message: string }> {
  const itemResult = await query(
    `SELECT i.id, i.item_id, i.quantity, i.equipped_on, d.rarity
     FROM inventory i
     JOIN item_definitions d ON d.id = i.item_id
     WHERE i.id = $1 AND i.user_id = $2`,
    [inventoryId, userId]
  );

  if (itemResult.rows.length === 0) {
    return { success: false, gold: 0, message: 'Oggetto non trovato' };
  }

  const item = itemResult.rows[0];

  if (item.equipped_on) {
    return { success: false, gold: 0, message: 'Rimuovi l\'oggetto prima di venderlo' };
  }

  // Prezzo vendita per rarita
  const sellPrices: Record<string, number> = {
    comune: 5,
    non_comune: 15,
    raro: 40,
    molto_raro: 100,
    epico: 250,
    leggendario: 600,
    mitico: 1500,
    master: 3000,
  };

  const goldPerItem = sellPrices[item.rarity] || 5;
  const totalGold = goldPerItem * item.quantity;

  // Rimuovi oggetto
  await query('DELETE FROM inventory WHERE id = $1', [inventoryId]);

  // Aggiungi gold
  await query(
    'UPDATE users SET gold = gold + $1 WHERE twitch_user_id = $2',
    [totalGold, userId]
  );

  return { success: true, gold: totalGold, message: `Venduto per ${totalGold} gold!` };
}
