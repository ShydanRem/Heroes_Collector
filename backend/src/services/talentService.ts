import { query } from '../config/database';
import { HeroClass } from '../types';
import { getTalentTree, getTalentNode, getTalentPointsForLevel, getAllTalentNodes, TalentNode } from '../data/talents';

// Ensure table exists
let tableEnsured = false;
async function ensureTable(): Promise<void> {
  if (tableEnsured) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS hero_talents (
        id BIGSERIAL PRIMARY KEY,
        twitch_user_id VARCHAR(64) NOT NULL REFERENCES users(twitch_user_id),
        talent_id VARCHAR(64) NOT NULL,
        unlocked_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(twitch_user_id, talent_id)
      )
    `);
    tableEnsured = true;
  } catch { /* */ }
}

/**
 * Ottieni i talenti sbloccati di un utente.
 */
export async function getUnlockedTalents(userId: string): Promise<string[]> {
  await ensureTable();
  const result = await query(
    'SELECT talent_id FROM hero_talents WHERE twitch_user_id = $1',
    [userId]
  );
  return result.rows.map((r: any) => r.talent_id);
}

/**
 * Ottieni stato completo talenti per un utente.
 */
export async function getTalentStatus(userId: string, heroClass: string, heroLevel: number) {
  await ensureTable();
  const tree = getTalentTree(heroClass as HeroClass);
  if (!tree) return { tree: null, unlocked: [], pointsTotal: 0, pointsSpent: 0, pointsAvailable: 0 };

  const unlocked = await getUnlockedTalents(userId);
  const pointsTotal = getTalentPointsForLevel(heroLevel);
  const pointsSpent = unlocked.length;

  return {
    tree,
    unlocked,
    pointsTotal,
    pointsSpent,
    pointsAvailable: Math.max(0, pointsTotal - pointsSpent),
  };
}

/**
 * Sblocca un talento per un utente.
 */
export async function unlockTalent(
  userId: string,
  talentId: string,
  heroClass: string,
  heroLevel: number
): Promise<{ success: boolean; message: string }> {
  await ensureTable();

  // Verifica che il talento esista e sia della classe giusta
  const node = getTalentNode(talentId);
  if (!node) return { success: false, message: 'Talento non trovato!' };

  const tree = getTalentTree(heroClass as HeroClass);
  if (!tree) return { success: false, message: 'Classe non trovata!' };

  const allNodes = getAllTalentNodes(heroClass as HeroClass);
  if (!allNodes.find(n => n.id === talentId)) {
    return { success: false, message: 'Questo talento non appartiene alla tua classe!' };
  }

  // Verifica punti disponibili
  const unlocked = await getUnlockedTalents(userId);
  const pointsTotal = getTalentPointsForLevel(heroLevel);
  const pointsSpent = unlocked.length;

  if (pointsSpent >= pointsTotal) {
    return { success: false, message: 'Non hai punti talento disponibili! Sali di livello.' };
  }

  // Verifica che non sia gia sbloccato
  if (unlocked.includes(talentId)) {
    return { success: false, message: 'Talento gia sbloccato!' };
  }

  // Verifica prerequisiti: tier precedente dello stesso ramo deve essere sbloccato
  if (node.tier > 1) {
    const branch = tree.branches.find(b => b.nodes.some(n => n.id === talentId));
    if (branch) {
      const prevTierNode = branch.nodes.find(n => n.tier === node.tier - 1);
      if (prevTierNode && !unlocked.includes(prevTierNode.id)) {
        return { success: false, message: `Devi prima sbloccare "${prevTierNode.name}"!` };
      }
    }
  }

  // Sblocca
  await query(
    'INSERT INTO hero_talents (twitch_user_id, talent_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [userId, talentId]
  );

  return { success: true, message: `Talento "${node.name}" sbloccato!` };
}

/**
 * Resetta tutti i talenti di un utente (es. per reroll classe).
 */
export async function resetTalents(userId: string): Promise<void> {
  await ensureTable();
  await query('DELETE FROM hero_talents WHERE twitch_user_id = $1', [userId]);
}

/**
 * Calcola i bonus stats totali dai talenti sbloccati.
 * Usato nel combattimento per applicare i bonus.
 */
export async function getTalentStatBonuses(userId: string): Promise<Record<string, number>> {
  const unlocked = await getUnlockedTalents(userId);
  const bonuses: Record<string, number> = {};

  for (const talentId of unlocked) {
    const node = getTalentNode(talentId);
    if (node?.statBonus) {
      for (const [stat, value] of Object.entries(node.statBonus)) {
        bonuses[stat] = (bonuses[stat] || 0) + (value as number);
      }
    }
  }

  return bonuses;
}
