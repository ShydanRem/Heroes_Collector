import { query } from '../config/database';
import { runBattle, createFighter, BattleLogEntry, applySynergies } from './battleEngine';
import { getActiveParty, getPartyHeroes } from './partyService';
import { addExpToHero } from './heroService';
import { addGold, addEssences } from './userService';
import { addWeeklyPoints, POINTS } from './weeklyService';

// ============================================
// RISULTATO PVP
// ============================================

interface PartyHeroData {
  id: string;
  name: string;
  heroClass: string;
  rarity: string;
  maxHp: number;
}

export interface PvpResult {
  battleId: string;
  won: boolean;
  opponentName: string;
  log: BattleLogEntry[];
  totalTurns: number;
  eloChange: number;
  newElo: number;
  rewards: {
    exp: number;
    gold: number;
  };
  myPartyHeroes: PartyHeroData[];
  opponentPartyHeroes: PartyHeroData[];
}

// ============================================
// ELO SYSTEM
// ============================================

const K_FACTOR = 32; // Sensibilita rating
const BASE_ELO = 1000;

function calculateEloChange(playerElo: number, opponentElo: number, won: boolean): number {
  const expected = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  const score = won ? 1 : 0;
  return Math.round(K_FACTOR * (score - expected));
}

// ============================================
// PVP ARENA
// ============================================

/**
 * Trova un avversario con ELO simile e combatti.
 */
const PVP_COOLDOWN_MS = 3 * 60 * 1000; // 3 minuti tra fight

export async function findAndFight(userId: string): Promise<PvpResult> {
  // Cooldown anti-spam (persistente nel DB, non si resetta al restart)
  const lastFightResult = await query(
    "SELECT completed_at FROM battles WHERE attacker_user_id = $1 AND battle_type = 'pvp' ORDER BY completed_at DESC LIMIT 1",
    [userId]
  );
  if (lastFightResult.rows.length > 0 && lastFightResult.rows[0].completed_at) {
    const lastFightTime = new Date(lastFightResult.rows[0].completed_at).getTime();
    if (Date.now() - lastFightTime < PVP_COOLDOWN_MS) {
      const remaining = Math.ceil((PVP_COOLDOWN_MS - (Date.now() - lastFightTime)) / 1000);
      throw new Error(`Devi aspettare ${remaining} secondi prima del prossimo PVP!`);
    }
  }

  // Verifica party attivo
  const myParty = await getActiveParty(userId);
  if (!myParty || myParty.heroIds.length === 0) {
    throw new Error('Devi avere un party attivo con almeno un eroe!');
  }

  // Prendi/crea il record leaderboard dell'utente
  await ensureLeaderboardEntry(userId);
  const myEloRow = await query(
    'SELECT elo_rating FROM leaderboard WHERE user_id = $1',
    [userId]
  );
  const myElo = myEloRow.rows[0]?.elo_rating || BASE_ELO;

  // Trova avversario: ELO simile, non se stesso, con party attivo non vuoto
  const opponentResult = await query(
    `SELECT l.user_id, l.elo_rating, u.display_name
     FROM leaderboard l
     JOIN users u ON u.twitch_user_id = l.user_id
     WHERE l.user_id != $1
     AND EXISTS (
       SELECT 1 FROM parties p
       WHERE p.user_id = l.user_id AND p.is_active = TRUE AND array_length(p.hero_ids, 1) > 0
     )
     ORDER BY ABS(l.elo_rating - $2), RANDOM()
     LIMIT 1`,
    [userId, myElo]
  );

  if (opponentResult.rows.length === 0) {
    throw new Error('Nessun avversario disponibile! Servono piu giocatori con un party attivo.');
  }

  const opponent = opponentResult.rows[0];
  const opponentParty = await getActiveParty(opponent.user_id);
  if (!opponentParty) {
    throw new Error('Avversario senza party attivo. Riprova.');
  }

  // Carica eroi di entrambi i party
  const myHeroes = await getPartyHeroes(myParty.id);
  const opponentHeroes = await getPartyHeroes(opponentParty.id);

  if (myHeroes.length === 0 || opponentHeroes.length === 0) {
    throw new Error('Uno dei party e vuoto!');
  }

  // Crea fighter
  const myFighters = myHeroes.map((h: any) => createFighter(h, 'attacker'));
  const opponentFighters = opponentHeroes.map((h: any) => createFighter(h, 'defender'));

  // Applica sinergie a entrambi i party
  applySynergies(myFighters);
  applySynergies(opponentFighters);

  // Combatti!
  const outcome = runBattle(myFighters, opponentFighters);

  // Calcola cambio ELO
  const eloChange = calculateEloChange(myElo, opponent.elo_rating, outcome.won);
  const opponentEloChange = calculateEloChange(opponent.elo_rating, myElo, !outcome.won);

  const newElo = myElo + eloChange;
  const newOpponentElo = opponent.elo_rating + opponentEloChange;

  // Aggiorna ELO di entrambi
  if (outcome.won) {
    await query(
      'UPDATE leaderboard SET elo_rating = $1, wins = wins + 1, updated_at = NOW() WHERE user_id = $2',
      [newElo, userId]
    );
    await query(
      'UPDATE leaderboard SET elo_rating = $1, losses = losses + 1, updated_at = NOW() WHERE user_id = $2',
      [newOpponentElo, opponent.user_id]
    );
  } else {
    await query(
      'UPDATE leaderboard SET elo_rating = $1, losses = losses + 1, updated_at = NOW() WHERE user_id = $2',
      [newElo, userId]
    );
    await query(
      'UPDATE leaderboard SET elo_rating = $1, wins = wins + 1, updated_at = NOW() WHERE user_id = $2',
      [newOpponentElo, opponent.user_id]
    );
  }

  // Rewards
  const expReward = outcome.won ? 40 : 8;
  const goldReward = outcome.won ? 50 : 10;

  for (const hero of myHeroes) {
    await addExpToHero(hero.id, expReward);
  }
  await addGold(userId, goldReward);

  // Essenze: 2-3 per vittoria PVP
  const essenceReward = outcome.won ? Math.floor(2 + Math.random() * 2) : 0;
  if (essenceReward > 0) {
    await addEssences(userId, essenceReward);
  }

  // Punti classifica settimanale + missioni giornaliere
  try {
    await addWeeklyPoints(userId, outcome.won ? POINTS.PVP_WIN : POINTS.PVP_LOSS, 'pvp_wins');
  } catch { /* */ }
  if (outcome.won) {
    try { const { progressMission } = await import('./missionService'); await progressMission(userId, 'pvp'); } catch { /* */ }
    try { const { checkProgressAchievements } = await import('./achievementService'); await checkProgressAchievements(userId); } catch { /* */ }
  }

  // Salva battaglia
  const battleResult = await query(
    `INSERT INTO battles (battle_type, status, attacker_user_id, defender_user_id,
     attacker_party, defender_party, winner_user_id, battle_log, rewards, completed_at)
     VALUES ('pvp', 'completed', $1, $2, $3, $4, $5, $6, $7, NOW())
     RETURNING id`,
    [
      userId,
      opponent.user_id,
      myParty.id,
      opponentParty.id,
      outcome.won ? userId : opponent.user_id,
      JSON.stringify({ turns: outcome.totalTurns, logLength: outcome.log.length }),
      JSON.stringify({ exp: expReward, gold: goldReward }),
    ]
  );

  // Segna timestamp cooldown
  // Cooldown gestito dal DB (completed_at della battle salvata sotto)

  return {
    battleId: battleResult.rows[0].id,
    won: outcome.won,
    opponentName: opponent.display_name,
    log: outcome.log,
    totalTurns: outcome.totalTurns,
    eloChange,
    newElo,
    rewards: { exp: expReward, gold: goldReward },
    myPartyHeroes: myFighters.map(f => ({
      id: f.id, name: f.name, heroClass: f.heroClass,
      rarity: (myHeroes.find((h: any) => h.id === f.id) as any)?.rarity || 'comune',
      maxHp: f.maxHp,
    })),
    opponentPartyHeroes: opponentFighters.map(f => ({
      id: f.id, name: f.name, heroClass: f.heroClass,
      rarity: (opponentHeroes.find((h: any) => h.id === f.id) as any)?.rarity || 'comune',
      maxHp: f.maxHp,
    })),
  };
}

// ============================================
// LEADERBOARD
// ============================================

/**
 * Crea entry leaderboard se non esiste.
 */
async function ensureLeaderboardEntry(userId: string): Promise<void> {
  await query(
    `INSERT INTO leaderboard (user_id, elo_rating, wins, losses, season)
     VALUES ($1, $2, 0, 0, 1)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId, BASE_ELO]
  );
}

/**
 * Top N classifica.
 */
export async function getLeaderboard(limit: number = 20): Promise<any[]> {
  const result = await query(
    `SELECT l.user_id, l.elo_rating, l.wins, l.losses, l.season,
            u.display_name, u.twitch_username
     FROM leaderboard l
     JOIN users u ON u.twitch_user_id = l.user_id
     WHERE (l.wins + l.losses) > 0
     ORDER BY l.elo_rating DESC
     LIMIT $1`,
    [limit]
  );

  return result.rows.map((row, index) => ({
    rank: index + 1,
    userId: row.user_id,
    displayName: row.display_name,
    username: row.twitch_username,
    elo: row.elo_rating,
    wins: row.wins,
    losses: row.losses,
    winRate: row.wins + row.losses > 0
      ? Math.round((row.wins / (row.wins + row.losses)) * 100)
      : 0,
    season: row.season,
  }));
}

/**
 * Posizione dell'utente in classifica.
 */
export async function getPlayerRank(userId: string): Promise<{
  rank: number;
  elo: number;
  wins: number;
  losses: number;
  totalPlayers: number;
} | null> {
  await ensureLeaderboardEntry(userId);

  const rankResult = await query(
    `SELECT
       (SELECT COUNT(*) + 1 FROM leaderboard WHERE elo_rating > l.elo_rating) as rank,
       l.elo_rating, l.wins, l.losses,
       (SELECT COUNT(*) FROM leaderboard WHERE (wins + losses) > 0) as total_players
     FROM leaderboard l
     WHERE l.user_id = $1`,
    [userId]
  );

  if (rankResult.rows.length === 0) return null;

  const row = rankResult.rows[0];
  return {
    rank: parseInt(row.rank, 10),
    elo: row.elo_rating,
    wins: row.wins,
    losses: row.losses,
    totalPlayers: parseInt(row.total_players, 10),
  };
}

/**
 * Reset stagionale: tutti tornano a 1000 ELO base (con decay soft).
 */
export async function resetSeason(): Promise<void> {
  // Soft reset: ELO = (ELO + 1000) / 2
  await query(
    `UPDATE leaderboard SET
       elo_rating = FLOOR((elo_rating + $1) / 2),
       wins = 0, losses = 0,
       season = season + 1,
       updated_at = NOW()`,
    [BASE_ELO]
  );
}
