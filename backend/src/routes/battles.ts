import { Router, Request, Response } from 'express';
import { runDungeon, getBattleHistory } from '../services/dungeonService';
import { findAndFight, getLeaderboard, getPlayerRank } from '../services/pvpService';

export const battleRoutes = Router();

// POST /api/battles/dungeon - Avvia un dungeon PVE
battleRoutes.post('/dungeon', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    const zoneId = req.body?.zoneId || 'forest';
    const result = await runDungeon(userId, zoneId);

    res.json({
      battleId: result.battleId,
      won: result.won,
      wavesCompleted: result.wavesCompleted,
      totalWaves: result.totalWaves,
      rewards: result.rewards,
      partyHeroes: result.partyHeroes,
      modifier: result.modifier,
      synergies: result.synergies,
      zoneId: result.zoneId,
      zoneName: result.zoneName,
      zoneEmoji: result.zoneEmoji,
      isReplay: result.isReplay,
      zoneCleared: result.zoneCleared,
      nextZoneUnlocked: result.nextZoneUnlocked,
      waves: result.waveResults.map(w => ({
        wave: w.wave,
        won: w.won,
        enemies: w.enemies,
        totalTurns: w.totalTurns,
        log: w.log,
        heroHpStart: w.heroHpStart,
      })),
    });
  } catch (err: any) {
    console.error('Errore POST /dungeon:', err);
    res.status(400).json({ error: err.message });
  }
});

// POST /api/battles/pvp - Combattimento PVP arena
battleRoutes.post('/pvp', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    const result = await findAndFight(userId);

    res.json({
      battleId: result.battleId,
      won: result.won,
      opponentName: result.opponentName,
      log: result.log,
      totalTurns: result.totalTurns,
      eloChange: result.eloChange,
      newElo: result.newElo,
      rewards: result.rewards,
    });
  } catch (err: any) {
    console.error('Errore POST /pvp:', err);
    res.status(400).json({ error: err.message });
  }
});

// GET /api/battles/leaderboard - Classifica PVP
battleRoutes.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const leaderboard = await getLeaderboard(limit);
    res.json({ leaderboard });
  } catch (err) {
    console.error('Errore GET /leaderboard:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

// GET /api/battles/rank - La mia posizione in classifica
battleRoutes.get('/rank', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    const rank = await getPlayerRank(userId);
    res.json({ rank });
  } catch (err) {
    console.error('Errore GET /rank:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

// GET /api/battles/history - Storico battaglie
battleRoutes.get('/history', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const battles = await getBattleHistory(userId, limit);
    res.json({ battles });
  } catch (err) {
    console.error('Errore GET /history:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});
