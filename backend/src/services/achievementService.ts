import { query } from '../config/database';

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'combattimento' | 'collezione' | 'sociale' | 'progressione';
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Combattimento
  { id: 'first_dungeon', name: 'Prima Avventura', description: 'Completa il tuo primo dungeon', icon: '🏰', category: 'combattimento' },
  { id: 'dungeon_master', name: 'Maestro dei Dungeon', description: 'Completa 25 dungeon', icon: '🏅', category: 'combattimento' },
  { id: 'dungeon_legend', name: 'Leggenda dei Dungeon', description: 'Completa 100 dungeon', icon: '👑', category: 'combattimento' },
  { id: 'first_pvp_win', name: 'Primo Sangue', description: 'Vinci il tuo primo PVP', icon: '⚔️', category: 'combattimento' },
  { id: 'pvp_veteran', name: 'Veterano Arena', description: 'Vinci 50 PVP', icon: '🏟️', category: 'combattimento' },
  { id: 'raid_slayer', name: 'Ammazza Boss', description: 'Dai il colpo finale a un Raid Boss', icon: '🐉', category: 'combattimento' },
  { id: 'raid_contributor', name: 'Contributore', description: 'Partecipa a 10 raid', icon: '💪', category: 'combattimento' },
  { id: 'flawless', name: 'Impeccabile', description: 'Completa un dungeon senza perdere eroi', icon: '✨', category: 'combattimento' },

  // Collezione
  { id: 'first_capture', name: 'Primo Catturato', description: 'Cattura il tuo primo eroe', icon: '🎣', category: 'collezione' },
  { id: 'collector', name: 'Collezionista', description: 'Cattura 10 eroi', icon: '📖', category: 'collezione' },
  { id: 'master_collector', name: 'Gran Collezionista', description: 'Cattura 50 eroi', icon: '🗃️', category: 'collezione' },
  { id: 'legendary_catch', name: 'Pesca Leggendaria', description: 'Cattura un eroe Leggendario o superiore', icon: '🌟', category: 'collezione' },
  { id: 'full_party', name: 'Party Completo', description: 'Riempi un party con 4 eroi', icon: '👥', category: 'collezione' },
  { id: 'all_classes', name: 'Conoscitore', description: 'Cattura almeno un eroe per ogni classe', icon: '🎭', category: 'collezione' },

  // Progressione
  { id: 'level_10', name: 'In Crescita', description: 'Porta un eroe al livello 10', icon: '📈', category: 'progressione' },
  { id: 'level_25', name: 'Esperto', description: 'Porta un eroe al livello 25', icon: '🎓', category: 'progressione' },
  { id: 'level_50', name: 'Maestro', description: 'Porta un eroe al livello 50', icon: '🏆', category: 'progressione' },
  { id: 'rich', name: 'Ricco Sfondato', description: 'Accumula 1000 gold', icon: '💰', category: 'progressione' },
  { id: 'shopaholic', name: 'Compra Compra', description: 'Compra 20 oggetti dal negozio', icon: '🛒', category: 'progressione' },
  { id: 'equipped', name: 'Armato Fino ai Denti', description: 'Equipaggia arma, armatura e accessorio su un eroe', icon: '🛡️', category: 'progressione' },
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
    // Tabella non esiste ancora
    return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: false, unlockedAt: null }));
  }
}

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

    return def;
  } catch {
    return null;
  }
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
