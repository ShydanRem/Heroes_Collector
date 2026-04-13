import { Router, Request, Response } from 'express';
import * as itemService from '../services/itemService';

export const itemRoutes = Router();

// GET /api/items/inventory - Il mio inventario
itemRoutes.get('/inventory', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    const inventory = await itemService.getInventory(userId);
    res.json({ inventory });
  } catch (err) {
    console.error('Errore GET /inventory:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

// POST /api/items/equip - Equipaggia un oggetto
itemRoutes.post('/equip', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    const { inventoryId, heroId } = req.body;

    if (!inventoryId || !heroId) {
      return res.status(400).json({ error: 'inventoryId e heroId richiesti' });
    }

    const result = await itemService.equipItem(userId, inventoryId, heroId);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    // Progresso missioni giornaliere + achievement
    try {
      const { progressMission } = await import('../services/missionService');
      await progressMission(userId, 'equip');
    } catch { /* */ }
    try {
      const { checkProgressAchievements } = await import('../services/achievementService');
      await checkProgressAchievements(userId);
    } catch { /* */ }
    res.json({ message: result.message });
  } catch (err) {
    console.error('Errore POST /equip:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

// POST /api/items/unequip - Rimuovi oggetto equipaggiato
itemRoutes.post('/unequip', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    const { inventoryId } = req.body;

    if (!inventoryId) {
      return res.status(400).json({ error: 'inventoryId richiesto' });
    }

    const result = await itemService.unequipItem(userId, inventoryId);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    res.json({ message: result.message });
  } catch (err) {
    console.error('Errore POST /unequip:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

// POST /api/items/sell - Vendi un oggetto
itemRoutes.post('/sell', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    const { inventoryId } = req.body;

    if (!inventoryId) {
      return res.status(400).json({ error: 'inventoryId richiesto' });
    }

    const result = await itemService.sellItem(userId, inventoryId);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    res.json({ message: result.message, gold: result.gold });
  } catch (err) {
    console.error('Errore POST /sell:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

// GET /api/items/equipped/:heroId - Oggetti equipaggiati su un eroe
itemRoutes.get('/equipped/:heroId', async (req: Request, res: Response) => {
  try {
    const bonuses = await itemService.getEquipmentBonuses(req.params.heroId);
    res.json({ bonuses });
  } catch (err) {
    console.error('Errore GET /equipped:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});
