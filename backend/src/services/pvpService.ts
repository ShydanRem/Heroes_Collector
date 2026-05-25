import { query } from '../config/database';
import { runBattle, createFighter, BattleLogEntry, applySynergies, applyTalentBonuses } from './battleEngine';
import { getActiveParty, getPartyHeroes } from './partyService';
import { addExpToHero, addExpToRosterHero } from './heroService';
import { addGold, addEssences } from './userService';
import { addWeeklyPoints, POINTS } from './weeklyService';
import { getTalentStatBonuses, getTalentSpecialEffects } from './talentService';
import { generateBotOpponent } from './pvpBot';

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
  isBot: boolean;
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

  // Carica i miei eroi (servono sia per combattere sia per scalare un eventuale bot)
  const myHeroes = await getPartyHeroes(myParty.id);
  if (myHeroes.length === 0) {
    throw new Error('Il tuo party e vuoto!');
  }

  // Trova un avversario REALE: qualunque utente con un party attivo non vuoto
  // (non serve che abbia gia giocato PVP). ELO simile preferito.
  const opponentResult = await query(
    `SELECT u.twitch_user_id AS user_id, COALESCE(l.elo_rating, $3) AS elo_rating, u.display_name
     FROM parties p
     JOIN users u ON u.twitch_user_id = p.user_id
     LEFT JOIN leaderboard l ON l.user_id = p.user_id
     WHERE p.is_active = TRUE
       AND array_length(p.hero_ids, 1) > 0
       AND p.user_id != $1
     ORDER BY ABS(COALESCE(l.elo_rating, $3) - $2), RANDOM()
     LIMIT 1`,
    [userId, myElo, BASE_ELO]
  );

  // Dati avversario: reale se trovato, altrimenti bot.
  let isBot = false;
  let opponentName = '';
  let opponentElo = myElo;
  let opponentUserId: string | null = null;
  let opponentPartyId: string | null = null;
  let opponentHeroes: any[] = [];

  if (opponentResult.rows.length > 0) {
    const candidate = opponentResult.rows[0];
    const candidateParty = await getActiveParty(candidate.user_id);
    const candidateHeroes = candidateParty ? await getPartyHeroes(candidateParty.id) : [];
    if (candidateParty && candidateHeroes.length > 0) {
      opponentHeroes = candidateHeroes;
      opponentName = candidate.display_name;
      opponentElo = candidate.elo_rating;
      opponentUserId = candidate.user_id;
      opponentPartyId = candidateParty.id;
    }
  }

  // Nessun avversario reale valido → genera un BOT scalato sul giocatore.
  // Cosi il PVP e SEMPRE giocabile (fix arena vuota + piu engagement).
  if (opponentHeroes.length === 0) {
    const bot = generateBotOpponent(myHeroes, myElo);
    opponentHeroes = bot.heroes;
    opponentName = bot.name;
    opponentElo = bot.elo;
    isBot = true;
  }

  // Crea fighter
  const myFighters = myHeroes.map((h: any) => createFighter(h, 'attacker'));
  const opponentFighters = opponentHeroes.map((h: any) => createFighter(h, 'defender'));

  // Applica talenti del giocatore (e dell'avversario, solo se reale)
  let talentEffects = new Set<string>();
  try {
    const talentBonuses = await getTalentStatBonuses(userId);
    talentEffects = await getTalentSpecialEffects(userId);
    for (const f of myFighters) applyTalentBonuses(f, talentBonuses);
    if (!isBot && opponentUserId) {
      const oppBonuses = await getTalentStatBonuses(opponentUserId);
      for (const f of opponentFighters) applyTalentBonuses(f, oppBonuses);
    }
  } catch { /* */ }

  // Applica sinergie a entrambi i party
  applySynergies(myFighters);
  applySynergies(opponentFighters);

  // Combatti!
  const outcome = runBattle(myFighters, opponentFighters, { talentEffects });

  // Calcola cambio ELO del giocatore
  const eloChange = calculateEloChange(myElo, opponentElo, outcome.won);
  const newElo = myElo + eloChange;

  // Aggiorna il MIO ELO + win/loss
  if (outcome.won) {
    await query(
      'UPDATE leaderboard SET elo_rating = $1, wins = wins + 1, updated_at = NOW() WHERE user_id = $2',
      [newElo, userId]
    );
  } else {
    await query(
      'UPDATE leaderboard SET elo_rating = $1, losses = losses + 1, updated_at = NOW() WHERE user_id = $2',
      [newElo, userId]
    );
  }

  // Aggiorna l'avversario SOLO se reale (i bot non hanno riga leaderboard)
  if (!isBot && opponentUserId) {
    await ensureLeaderboardEntry(opponentUserId);
    const opponentEloChange = calculateEloChange(opponentElo, myElo, !outcome.won);
    const newOpponentElo = opponentElo + opponentEloChange;
    if (outcome.won) {
      await query(
        'UPDATE leaderboard SET elo_rating = $1, losses = losses + 1, updated_at = NOW() WHERE user_id = $2',
        [newOpponentElo, opponentUserId]
      );
    } else {
      await query(
        'UPDATE leaderboard SET elo_rating = $1, wins = wins + 1, updated_at = NOW() WHERE user_id = $2',
        [newOpponentElo, opponentUserId]
      );
    }
  }

  // Rewards
  const expReward = outcome.won ? 40 : 8;
  const goldReward = outcome.won ? 50 : 10;

  for (const hero of myHeroes) {
    if (hero.roster_id) {
      await addExpToRosterHero(hero.roster_id, expReward);
    } else {
      await addExpToHero(hero.id, expReward);
    }
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
      opponentUserId,
      myParty.id,
      opponentPartyId,
      outcome.won ? userId : opponentUserId,
      JSON.stringify({ turns: outcome.totalTurns, logLength: outcome.log.length }),
      JSON.stringify({ exp: expReward, gold: goldReward }),
    ]
  );

  // Segna timestamp cooldown
  // Cooldown gestito dal DB (completed_at della battle salvata sotto)

  return {
    battleId: battleResult.rows[0].id,
    won: outcome.won,
    opponentName,
    isBot,
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
