import { Router, Request, Response } from 'express';
import * as partyService from '../services/partyService';

export const partyRoutes = Router();

// GET /api/parties - Lista party dell'utente
partyRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    const parties = await partyService.getParties(userId);
    res.json({ parties });
  } catch (err) {
    console.error('Errore GET /parties:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

// POST /api/parties - Crea nuovo party
partyRoutes.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    const { name } = req.body;

    if (!name || name.length > 32) {
      return res.status(400).json({ error: 'Nome party richiesto (max 32 caratteri)' });
    }

    const party = await partyService.createParty(userId, name);
    res.json({ party });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/parties/:id/activate - Imposta party attivo
partyRoutes.put('/:id/activate', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    await partyService.setActiveParty(userId, req.params.id);
    res.json({ message: 'Party attivato!' });
  } catch (err) {
    console.error('Errore PUT /parties/activate:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

// POST /api/parties/:id/heroes - Aggiungi eroe al party
partyRoutes.post('/:id/heroes', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    const { heroId } = req.body;

    if (!heroId) {
      return res.status(400).json({ error: 'heroId richiesto' });
    }

    const result = await partyService.addHeroToParty(userId, req.params.id, heroId);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    res.json({ message: result.message });
  } catch (err) {
    console.error('Errore POST /parties/heroes:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

// DELETE /api/parties/:id/heroes/:heroId - Rimuovi eroe dal party
partyRoutes.delete('/:id/heroes/:heroId', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    const result = await partyService.removeHeroFromParty(userId, req.params.id, req.params.heroId);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    res.json({ message: result.message });
  } catch (err) {
    console.error('Errore DELETE /parties/heroes:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

// DELETE /api/parties/:id - Elimina party
partyRoutes.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    const deleted = await partyService.deleteParty(userId, req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Party non trovato' });
    }
    res.json({ message: 'Party eliminato' });
  } catch (err) {
    console.error('Errore DELETE /parties:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});
