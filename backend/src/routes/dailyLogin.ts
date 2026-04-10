import { Router, Request, Response } from 'express';
import { getDailyLoginStatus, claimDailyLogin } from '../services/dailyLoginService';

export const dailyLoginRoutes = Router();

// GET /api/daily-login — Stato streak e reward del giorno
dailyLoginRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    const status = await getDailyLoginStatus(userId);
    res.json(status);
  } catch (err: any) {
    console.error('Errore GET /daily-login:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

// POST /api/daily-login/claim — Riscuoti il premio giornaliero
dailyLoginRoutes.post('/claim', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    const result = await claimDailyLogin(userId);
    res.json(result);
  } catch (err: any) {
    console.error('Errore POST /daily-login/claim:', err);
    if (err.message && !err.message.includes('interno')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Errore interno' });
  }
});
