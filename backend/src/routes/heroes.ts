import { Router, Request, Response } from 'express';
import * as heroService from '../services/heroService';
import { Rarity, HeroClass } from '../types';
import { ABILITY_MAP } from '../data/abilities';
import { CLASS_INFO } from '../data/classes';

export const heroRoutes = Router();

// GET /api/heroes - Lista eroi disponibili per cattura
heroRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const rarity = req.query.rarity as Rarity | undefined;
    const heroClass = req.query.class as HeroClass | undefined;

    const result = await heroService.listAvailableHeroes(page, limit, rarity, heroClass);

    res.json({
      heroes: result.heroes,
      total: result.total,
      page,
      totalPages: Math.ceil(result.total / limit),
    });
  } catch (err) {
    console.error('Errore GET /heroes:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

// GET /api/heroes/:id - Dettaglio eroe
heroRoutes.get('/:id', async (req: Request, res: Response) => {
  try {
    const hero = await heroService.getHeroById(req.params.id);
    if (!hero) {
      return res.status(404).json({ error: 'Eroe non trovato' });
    }

    // Arricchisci con info abilità e classe
    const abilities = hero.abilities
      .map(id => ABILITY_MAP.get(id))
      .filter(Boolean);
    const classInfo = CLASS_INFO[hero.heroClass];

    res.json({ hero, abilities, classInfo });
  } catch (err) {
    console.error('Errore GET /heroes/:id:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

// POST /api/heroes/:id/capture - Cattura un eroe
heroRoutes.post('/:id/capture', async (req: Request, res: Response) => {
  try {
    const twitchUser = req.twitchUser!;
    const result = await heroService.captureHero(twitchUser.user_id, req.params.id);

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json({ message: result.message });
  } catch (err) {
    console.error('Errore POST /capture:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

// GET /api/heroes/classes/info - Info su tutte le classi
heroRoutes.get('/classes/info', async (_req: Request, res: Response) => {
  res.json({ classes: CLASS_INFO });
});

// POST /api/heroes/reroll-class — Cambia classe dell'eroe (500 gold)
heroRoutes.post('/reroll-class', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    const { newClass } = req.body;

    if (!newClass) {
      return res.status(400).json({ error: 'Specifica la nuova classe (newClass)' });
    }

    const hero = await heroService.rerollHeroClass(userId, newClass as HeroClass);
    res.json({ message: 'Classe cambiata!', hero, cost: heroService.REROLL_COST });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
