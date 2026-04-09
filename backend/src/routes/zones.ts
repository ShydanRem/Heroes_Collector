import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { ZONES, ZONE_MAP, isZoneUnlocked } from '../data/zones';

export const zoneRoutes = Router();

// GET /api/zones — Lista zone con progresso utente
zoneRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.twitchUser!.user_id;

    // Prendi zona massima sbloccata e progresso (tollerante se colonne/tabelle non esistono ancora)
    let maxUnlocked = 'forest';
    let progressRows: { rows: any[] } = { rows: [] };

    try {
      const userRow = await query('SELECT max_zone_unlocked FROM users WHERE twitch_user_id = $1', [userId]);
      maxUnlocked = userRow.rows[0]?.max_zone_unlocked || 'forest';
    } catch { /* colonna non esiste ancora */ }

    try {
      progressRows = await query('SELECT zone_id, cleared, best_waves, total_clears FROM zone_progress WHERE user_id = $1', [userId]);
    } catch { /* tabella non esiste ancora */ }
    const progressMap = new Map(
      progressRows.rows.map((r: any) => [r.zone_id, {
        cleared: r.cleared,
        bestWaves: r.best_waves,
        totalClears: r.total_clears,
      }])
    );

    const zones = ZONES.map(z => {
      const progress = progressMap.get(z.id);
      return {
        id: z.id,
        name: z.name,
        emoji: z.emoji,
        totalWaves: z.totalWaves,
        recommendedLevel: `${z.recommendedLevel[0]}-${z.recommendedLevel[1]}`,
        unlocked: isZoneUnlocked(maxUnlocked, z.id),
        cleared: progress?.cleared || false,
        bestWaves: progress?.bestWaves || 0,
        totalClears: progress?.totalClears || 0,
      };
    });

    res.json({ zones });
  } catch (err) {
    console.error('Errore GET /zones:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});
