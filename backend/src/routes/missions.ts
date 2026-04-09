import { Router, Request, Response } from 'express';
import { getDailyMissions, claimMission } from '../services/missionService';

export const missionRoutes = Router();

// GET /api/missions - Missioni giornaliere dell'utente
missionRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    const missions = await getDailyMissions(userId);
    res.json({ missions });
  } catch (err) {
    console.error('Errore GET /missions:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

// POST /api/missions/:id/claim - Riscuoti ricompensa missione
missionRoutes.post('/:id/claim', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    const missionId = req.params.id;

    const reward = await claimMission(userId, missionId);
    res.json(reward);
  } catch (err: any) {
    console.error('Errore POST /missions/:id/claim:', err);
    if (err.message && !err.message.includes('interno')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Errore interno' });
  }
});
