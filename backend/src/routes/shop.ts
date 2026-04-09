import { Router, Request, Response } from 'express';
import { getShopListings, purchaseItem } from '../services/shopService';

export const shopRoutes = Router();

// GET /api/shop - Lista articoli shop
shopRoutes.get('/', async (_req: Request, res: Response) => {
  try {
    const listings = await getShopListings();
    res.json({ listings });
  } catch (err) {
    console.error('Errore GET /shop:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

// POST /api/shop/buy - Acquista articolo
shopRoutes.post('/buy', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;
    const { shopItemId } = req.body;

    if (!shopItemId) {
      return res.status(400).json({ error: 'shopItemId richiesto' });
    }

    const result = await purchaseItem(userId, shopItemId);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    res.json({ message: result.message });
  } catch (err) {
    console.error('Errore POST /shop/buy:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});
