import { Router, Request, Response } from 'express';
import { getAchievements, getUnlockedCount, ACHIEVEMENTS } from '../services/achievementService';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    const [achievements, unlockedCount] = await Promise.all([
      getAchievements(userId),
      getUnlockedCount(userId),
    ]);

    res.json({
      achievements,
      unlockedCount,
      totalCount: ACHIEVEMENTS.length,
    });
  } catch (error) {
    console.error('Errore caricamento achievements:', error);
    res.status(500).json({ error: 'Errore caricamento achievements' });
  }
});

export { router as achievementRoutes };
