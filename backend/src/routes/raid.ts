import { Router, Request, Response } from 'express';
import { getRaidWithContribution, attackRaid, getRaidLeaderboard } from '../services/raidService';

export const raidRoutes = Router();

// GET /api/raid - Info raid boss corrente
raidRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    const raid = await getRaidWithContribution(userId);
    if (!raid) {
      return res.status(404).json({ error: 'Nessun raid attivo' });
    }
    res.json({ raid });
  } catch (err) {
    console.error('Errore GET /raid:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

// POST /api/raid/attack - Attacca il raid boss
raidRoutes.post('/attack', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    const result = await attackRaid(userId);
    res.json(result);
  } catch (err: any) {
    console.error('Errore POST /raid/attack:', err);
    res.status(400).json({ error: err.message });
  }
});

// GET /api/raid/:id/leaderboard - Classifica contributori
raidRoutes.get('/:id/leaderboard', async (req: Request, res: Response) => {
  try {
    const contributors = await getRaidLeaderboard(req.params.id);
    res.json({ contributors });
  } catch (err) {
    console.error('Errore GET /raid/leaderboard:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});
