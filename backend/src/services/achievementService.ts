import { query } from '../config/database';

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'combattimento' | 'collezione' | 'sociale' | 'progressione';
  rewardGold: number;
  rewardEssences: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Combattimento
  { id: 'first_dungeon', name: 'Prima Avventura', description: 'Completa il tuo primo dungeon', icon: '🏰', category: 'combattimento', rewardGold: 50, rewardEssences: 2 },
  { id: 'dungeon_master', name: 'Maestro dei Dungeon', description: 'Completa 25 dungeon', icon: '🏅', category: 'combattimento', rewardGold: 200, rewardEssences: 10 },
  { id: 'dungeon_legend', name: 'Leggenda dei Dungeon', description: 'Completa 100 dungeon', icon: '👑', category: 'combattimento', rewardGold: 500, rewardEssences: 25 },
  { id: 'first_pvp_win', name: 'Primo Sangue', description: 'Vinci il tuo primo PVP', icon: '⚔️', category: 'combattimento', rewardGold: 50, rewardEssences: 2 },
  { id: 'pvp_veteran', name: 'Veterano Arena', description: 'Vinci 50 PVP', icon: '🏟️', category: 'combattimento', rewardGold: 300, rewardEssences: 15 },
  { id: 'raid_slayer', name: 'Ammazza Boss', description: 'Dai il colpo finale a un Raid Boss', icon: '🐉', category: 'combattimento', rewardGold: 300, rewardEssences: 15 },
  { id: 'raid_contributor', name: 'Contributore', description: 'Partecipa a 10 raid', icon: '💪', category: 'combattimento', rewardGold: 150, rewardEssences: 8 },
  { id: 'flawless', name: 'Impeccabile', description: 'Completa un dungeon senza perdere eroi', icon: '✨', category: 'combattimento', rewardGold: 100, rewardEssences: 5 },

  // Collezione
  { id: 'first_capture', name: 'Primo Catturato', description: 'Cattura il tuo primo eroe', icon: '🎣', category: 'collezione', rewardGold: 30, rewardEssences: 1 },
  { id: 'collector', name: 'Collezionista', description: 'Cattura 10 eroi', icon: '📖', category: 'collezione', rewardGold: 100, rewardEssences: 5 },
  { id: 'master_collector', name: 'Gran Collezionista', description: 'Cattura 50 eroi', icon: '🗃️', category: 'collezione', rewardGold: 300, rewardEssences: 15 },
  { id: 'legendary_catch', name: 'Pesca Leggendaria', description: 'Cattura un eroe Leggendario o superiore', icon: '🌟', category: 'collezione', rewardGold: 200, rewardEssences: 10 },
  { id: 'full_party', name: 'Party Completo', description: 'Riempi un party con 4 eroi', icon: '👥', category: 'collezione', rewardGold: 50, rewardEssences: 3 },
  { id: 'all_classes', name: 'Conoscitore', description: 'Cattura almeno un eroe per ogni classe', icon: '🎭', category: 'collezione', rewardGold: 500, rewardEssences: 20 },

  // Progressione
  { id: 'level_10', name: 'In Crescita', description: 'Porta un eroe al livello 10', icon: '📈', category: 'progressione', rewardGold: 50, rewardEssences: 3 },
  { id: 'level_25', name: 'Esperto', description: 'Porta un eroe al livello 25', icon: '🎓', category: 'progressione', rewardGold: 150, rewardEssences: 8 },
  { id: 'level_50', name: 'Maestro', description: 'Porta un eroe al livello 50', icon: '🏆', category: 'progressione', rewardGold: 500, rewardEssences: 25 },
  { id: 'rich', name: 'Ricco Sfondato', description: 'Accumula 1000 gold', icon: '💰', category: 'progressione', rewardGold: 100, rewardEssences: 5 },
  { id: 'shopaholic', name: 'Compra Compra', description: 'Compra 20 oggetti dal negozio', icon: '🛒', category: 'progressione', rewardGold: 100, rewardEssences: 5 },
  { id: 'equipped', name: 'Armato Fino ai Denti', description: 'Equipaggia arma, armatura e accessorio su un eroe', icon: '🛡️', category: 'progressione', rewardGold: 50, rewardEssences: 3 },
];

export async function getAchievements(userId: string) {
  try {
    const result = await query(
      'SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id = $1',
      [userId]
    );

    const unlockedMap = new Map<string, string>();
    for (const row of result.rows) {
      unlockedMap.set(row.achievement_id, row.unlocked_at);
    }

    return ACHIEVEMENTS.map((a) => ({
      ...a,
      unlocked: unlockedMap.has(a.id),
      unlockedAt: unlockedMap.get(a.id) || null,
    }));
  } catch {
    return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: false, unlockedAt: null }));
  }
}

/**
 * Sblocca un achievement e assegna le ricompense (gold + essenze).
 * Ritorna la definizione se sbloccato per la prima volta, null se gia ottenuto.
 */
export async function checkAndUnlock(userId: string, achievementId: string): Promise<AchievementDef | null> {
  const def = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!def) return null;

  try {
    const existing = await query(
      'SELECT id FROM user_achievements WHERE user_id = $1 AND achievement_id = $2',
      [userId, achievementId]
    );

    if (existing.rows.length > 0) return null;

    await query(
      'INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2)',
      [userId, achievementId]
    );

    // Assegna ricompense
    if (def.rewardGold > 0) {
      await query('UPDATE users SET gold = gold + $1 WHERE twitch_user_id = $2', [def.rewardGold, userId]);
    }
    if (def.rewardEssences > 0) {
      await query('UPDATE users SET essences = COALESCE(essences, 0) + $1 WHERE twitch_user_id = $2', [def.rewardEssences, userId]);
    }

    return def;
  } catch {
    return null;
  }
}

/**
 * Controlla e sblocca tutti gli achievement basati sul progresso corrente.
 * Chiamata dopo azioni chiave (dungeon, PVP, cattura, raid, etc.)
 */
export async function checkProgressAchievements(userId: string): Promise<AchievementDef[]> {
  const unlocked: AchievementDef[] = [];

  try {
    // Dati utente
    const userResult = await query('SELECT gold FROM users WHERE twitch_user_id = $1', [userId]);
    const gold = userResult.rows[0]?.gold || 0;

    // Conteggi dungeon (battaglie PvE completate)
    const dungeonCount = await query(
      "SELECT COUNT(*) as count FROM battles WHERE attacker_user_id = $1 AND battle_type = 'pve' AND status = 'completed' AND winner_user_id = $1",
      [userId]
    );
    const dungeons = parseInt(dungeonCount.rows[0]?.count || '0', 10);

    // Conteggi PVP vinte
    const pvpCount = await query(
      "SELECT COUNT(*) as count FROM battles WHERE battle_type = 'pvp' AND status = 'completed' AND winner_user_id = $1",
      [userId]
    );
    const pvpWins = parseInt(pvpCount.rows[0]?.count || '0', 10);

    // Conteggi catture
    const captureCount = await query(
      'SELECT COUNT(*) as count FROM roster WHERE owner_user_id = $1',
      [userId]
    );
    const captures = parseInt(captureCount.rows[0]?.count || '0', 10);

    // Classi catturate
    const classCount = await query(
      'SELECT COUNT(DISTINCT h.hero_class) as count FROM roster r JOIN heroes h ON r.hero_id = h.id WHERE r.owner_user_id = $1',
      [userId]
    );
    const uniqueClasses = parseInt(classCount.rows[0]?.count || '0', 10);

    // Livello max eroe (del proprio o del roster)
    const levelResult = await query(
      'SELECT MAX(level) as max_level FROM heroes WHERE twitch_user_id = $1',
      [userId]
    );
    const maxLevel = parseInt(levelResult.rows[0]?.max_level || '0', 10);

    // Raid partecipazioni
    const raidCount = await query(
      'SELECT COALESCE(SUM(attempts), 0) as count FROM raid_contributions WHERE user_id = $1',
      [userId]
    );
    const raidAttempts = parseInt(raidCount.rows[0]?.count || '0', 10);

    // Acquisti shop
    const shopCount = await query(
      "SELECT COUNT(*) as count FROM activity_log WHERE twitch_user_id = $1 AND event_type = 'shop'",
      [userId]
    );
    const shopPurchases = parseInt(shopCount.rows[0]?.count || '0', 10);

    // Equipment completo su un eroe
    const equippedCheck = await query(
      `SELECT i.equipped_on, COUNT(DISTINCT d.slot) as slots
       FROM inventory i JOIN item_definitions d ON d.id = i.item_id
       WHERE i.user_id = $1 AND i.equipped_on IS NOT NULL
       GROUP BY i.equipped_on HAVING COUNT(DISTINCT d.slot) >= 3`,
      [userId]
    );
    const hasFullEquip = equippedCheck.rows.length > 0;

    // Party con 4 eroi
    const partyCheck = await query(
      'SELECT id FROM parties WHERE user_id = $1 AND array_length(hero_ids, 1) >= 4',
      [userId]
    );
    const hasFullParty = partyCheck.rows.length > 0;

    // Sblocca achievement in base ai conteggi
    const checks: [boolean, string][] = [
      [dungeons >= 1, 'first_dungeon'],
      [dungeons >= 25, 'dungeon_master'],
      [dungeons >= 100, 'dungeon_legend'],
      [pvpWins >= 1, 'first_pvp_win'],
      [pvpWins >= 50, 'pvp_veteran'],
      [raidAttempts >= 10, 'raid_contributor'],
      [captures >= 1, 'first_capture'],
      [captures >= 10, 'collector'],
      [captures >= 50, 'master_collector'],
      [uniqueClasses >= 12, 'all_classes'],
      [hasFullParty, 'full_party'],
      [maxLevel >= 10, 'level_10'],
      [maxLevel >= 25, 'level_25'],
      [maxLevel >= 50, 'level_50'],
      [gold >= 1000, 'rich'],
      [shopPurchases >= 20, 'shopaholic'],
      [hasFullEquip, 'equipped'],
    ];

    for (const [condition, achievementId] of checks) {
      if (condition) {
        const result = await checkAndUnlock(userId, achievementId);
        if (result) unlocked.push(result);
      }
    }
  } catch (err) {
    console.error('Errore check achievement:', err);
  }

  return unlocked;
}

export async function getUnlockedCount(userId: string): Promise<number> {
  try {
    const result = await query(
      'SELECT COUNT(*) as count FROM user_achievements WHERE user_id = $1',
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  } catch {
    return 0;
  }
}
