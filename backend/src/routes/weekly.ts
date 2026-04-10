import { Router, Request, Response } from 'express';
import { getWeeklyLeaderboard, getMyWeeklyScore, getLastChampion } from '../services/weeklyService';

export const weeklyRoutes = Router();

// GET /api/weekly — Classifica settimanale
weeklyRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const leaderboard = await getWeeklyLeaderboard(10);
    const champion = await getLastChampion();
    res.json({ leaderboard, champion });
  } catch (err) {
    console.error('Errore GET /weekly:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

// GET /api/weekly/me — Il mio punteggio settimanale
weeklyRoutes.get('/me', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    const score = await getMyWeeklyScore(userId);
    res.json({ score });
  } catch (err) {
    console.error('Errore GET /weekly/me:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});
