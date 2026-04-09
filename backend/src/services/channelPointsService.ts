import { query } from '../config/database';
import { giveItem } from './itemService';
import { addExpToHero } from './heroService';
import { ITEMS } from '../data/items';
import { Rarity } from '../types';

// ============================================
// CHANNEL POINTS REWARDS
// ============================================

export interface ChannelPointReward {
  id: string;
  type: string;
  name: string;
  description: string;
  cost: number; // channel points
}

/**
 * Lista dei reward riscattabili con channel points.
 * Questi vanno creati manualmente nella dashboard Twitch del broadcaster.
 */
export const CHANNEL_POINT_REWARDS: ChannelPointReward[] = [
  {
    id: 'cp_energy_boost',
    type: 'energy_boost',
    name: 'Boost Energia (+30)',
    description: 'Recupera 30 energia per catturare o combattere.',
    cost: 500,
  },
  {
    id: 'cp_energy_full',
    type: 'energy_full',
    name: 'Ricarica Energia Completa',
    description: 'Riporta l\'energia al massimo.',
    cost: 1500,
  },
  {
    id: 'cp_exp_boost',
    type: 'exp_boost',
    name: 'Boost EXP (+500)',
    description: 'Dona 500 EXP al tuo eroe principale.',
    cost: 2000,
  },
  {
    id: 'cp_gold_pack',
    type: 'gold_pack',
    name: 'Sacchetto d\'Oro (+200)',
    description: 'Ricevi 200 gold.',
    cost: 1000,
  },
  {
    id: 'cp_mystery_box',
    type: 'mystery_box',
    name: 'Cassa Misteriosa',
    description: 'Contiene un oggetto random da Raro a Leggendario!',
    cost: 5000,
  },
  {
    id: 'cp_reroll',
    type: 'reroll',
    name: 'Reroll Abilita',
    description: 'Cambia le abilita secondarie del tuo eroe.',
    cost: 3000,
  },
];

/**
 * Gestisci un riscatto channel points.
 * Chiamato quando Twitch manda l'evento via EventSub.
 */
export async function handleChannelPointRedemption(
  userId: string,
  rewardType: string,
  twitchRewardId?: string
): Promise<{ success: boolean; message: string }> {
  // Log del riscatto
  await query(
    `INSERT INTO channel_point_redemptions (user_id, reward_type, twitch_reward_id)
     VALUES ($1, $2, $3)`,
    [userId, rewardType, twitchRewardId || null]
  );

  switch (rewardType) {
    case 'energy_boost':
      await query(
        'UPDATE users SET energy = LEAST(max_energy, energy + 30) WHERE twitch_user_id = $1',
        [userId]
      );
      return { success: true, message: '+30 energia!' };

    case 'energy_full':
      await query(
        'UPDATE users SET energy = max_energy WHERE twitch_user_id = $1',
        [userId]
      );
      return { success: true, message: 'Energia al massimo!' };

    case 'exp_boost':
      const heroResult = await query(
        'SELECT id FROM heroes WHERE twitch_user_id = $1 LIMIT 1',
        [userId]
      );
      if (heroResult.rows.length > 0) {
        await addExpToHero(heroResult.rows[0].id, 500);
      }
      return { success: true, message: '+500 EXP al tuo eroe!' };

    case 'gold_pack':
      await query(
        'UPDATE users SET gold = gold + 200 WHERE twitch_user_id = $1',
        [userId]
      );
      return { success: true, message: '+200 gold!' };

    case 'mystery_box':
      return await openMysteryBox(userId);

    case 'reroll':
      return await rerollAbilities(userId);

    default:
      return { success: false, message: 'Reward sconosciuto' };
  }
}

/**
 * Apri cassa misteriosa: oggetto random da Raro a Leggendario.
 */
async function openMysteryBox(userId: string): Promise<{ success: boolean; message: string }> {
  // Probabilita: 50% Raro, 30% Molto Raro, 15% Epico, 5% Leggendario
  const roll = Math.random() * 100;
  let targetRarity: Rarity;

  if (roll < 50) targetRarity = Rarity.RARO;
  else if (roll < 80) targetRarity = Rarity.MOLTO_RARO;
  else if (roll < 95) targetRarity = Rarity.EPICO;
  else targetRarity = Rarity.LEGGENDARIO;

  const pool = ITEMS.filter(i => i.rarity === targetRarity);
  if (pool.length === 0) {
    return { success: false, message: 'Nessun oggetto disponibile' };
  }

  const item = pool[Math.floor(Math.random() * pool.length)];
  await giveItem(userId, item.id);

  return {
    success: true,
    message: `Dalla cassa e uscito: ${item.name} (${targetRarity})!`,
  };
}

/**
 * Rirolla le abilita del proprio eroe.
 */
async function rerollAbilities(userId: string): Promise<{ success: boolean; message: string }> {
  const heroResult = await query(
    'SELECT * FROM heroes WHERE twitch_user_id = $1',
    [userId]
  );

  if (heroResult.rows.length === 0) {
    return { success: false, message: 'Non hai un eroe!' };
  }

  const hero = heroResult.rows[0];
  const { selectAbilities } = await import('./heroGenerator');
  const newAbilities = selectAbilities(
    hero.hero_class, hero.rarity, hero.level,
    userId + Date.now().toString()
  );

  await query(
    'UPDATE heroes SET ability_ids = $1, updated_at = NOW() WHERE twitch_user_id = $2',
    [newAbilities, userId]
  );

  return { success: true, message: 'Abilita rirollate!' };
}
