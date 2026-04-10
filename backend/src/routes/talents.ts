import { Router, Request, Response } from 'express';
import { getTalentStatus, unlockTalent, resetTalents } from '../services/talentService';
import { getHeroByUserId } from '../services/heroService';

export const talentRoutes = Router();

// GET /api/talents — Stato albero talenti dell'utente
talentRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    const hero = await getHeroByUserId(userId);
    if (!hero) return res.status(404).json({ error: 'Eroe non trovato' });

    const status = await getTalentStatus(userId, hero.heroClass, hero.level);
    res.json(status);
  } catch (err) {
    console.error('Errore GET /talents:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

// POST /api/talents/unlock — Sblocca un talento
talentRoutes.post('/unlock', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    const { talentId } = req.body;
    if (!talentId) return res.status(400).json({ error: 'talentId richiesto' });

    const hero = await getHeroByUserId(userId);
    if (!hero) return res.status(404).json({ error: 'Eroe non trovato' });

    const result = await unlockTalent(userId, talentId, hero.heroClass, hero.level);
    if (!result.success) return res.status(400).json({ error: result.message });

    // Ritorna stato aggiornato
    const status = await getTalentStatus(userId, hero.heroClass, hero.level);
    res.json({ message: result.message, ...status });
  } catch (err) {
    console.error('Errore POST /talents/unlock:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

// POST /api/talents/reset — Resetta talenti (es. per reroll classe)
talentRoutes.post('/reset', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    await resetTalents(userId);
    res.json({ message: 'Talenti resettati!' });
  } catch (err) {
    console.error('Errore POST /talents/reset:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});
