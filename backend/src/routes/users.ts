import { Router, Request, Response } from 'express';
import * as userService from '../services/userService';
import * as heroService from '../services/heroService';

export const userRoutes = Router();

// GET /api/users/me - Profilo utente corrente
userRoutes.get('/me', async (req: Request, res: Response) => {
  try {
    const twitchUser = req.twitchUser!;
    const profile = await userService.getUserProfile(twitchUser.user_id);

    if (!profile) {
      return res.status(404).json({ error: 'Utente non trovato. Usa POST /join per registrarti.' });
    }

    // Prendi anche il suo eroe
    const hero = await heroService.getHeroByUserId(twitchUser.user_id);

    res.json({ profile, hero });
  } catch (err) {
    console.error('Errore GET /me:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

// POST /api/users/join - Opt-in al gioco
userRoutes.post('/join', async (req: Request, res: Response) => {
  try {
    const twitchUser = req.twitchUser!;
    const { username, displayName } = req.body;

    // Crea o trova l'utente
    const profile = await userService.findOrCreateUser(
      twitchUser.user_id,
      username || twitchUser.opaque_user_id,
      displayName || username || twitchUser.opaque_user_id
    );

    // Opt-in
    await userService.optIn(twitchUser.user_id);

    // Genera il suo eroe
    const hero = await heroService.createHeroForUser(twitchUser.user_id);

    res.json({
      message: 'Benvenuto nel gioco! Il tuo eroe è stato creato.',
      profile: { ...profile, optedIn: true },
      hero,
    });
  } catch (err) {
    console.error('Errore POST /join:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

// GET /api/users/roster - Il roster di eroi catturati
userRoutes.get('/roster', async (req: Request, res: Response) => {
  try {
    const twitchUser = req.twitchUser!;
    const roster = await heroService.getRoster(twitchUser.user_id);
    res.json({ roster });
  } catch (err) {
    console.error('Errore GET /roster:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});
