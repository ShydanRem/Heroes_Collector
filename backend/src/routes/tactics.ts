import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { sanitizeRules } from '../services/tacticsValidation';

export const tacticsRoutes = Router();

// GET /api/tactics/:heroId - Ottieni tattiche
tacticsRoutes.get('/:heroId', async (req: Request, res: Response) => {
  try {
    const { heroId } = req.params;
    const userId = req.twitchUser!.user_id;

    // Verifica che heroId sia un UUID valido per evitare errori di Postgres
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(heroId)) {
      return res.json({ rules: [] });
    }

    // Cerca l'eroe: potrebbe essere il main hero (users) o uno nel roster
    // Controlliamo prima se è l'eroe principale dell'utente
    let result = await query(
      `SELECT u.tactics_json 
       FROM users u 
       JOIN heroes h ON h.twitch_user_id = u.twitch_user_id 
       WHERE u.twitch_user_id = $1 AND h.id = $2`,
      [userId, heroId]
    );
    
    if (result.rowCount === 0) {
      // Se non è l'eroe principale, cerca nel roster
      result = await query('SELECT tactics_json FROM roster WHERE owner_user_id = $1 AND hero_id = $2', [userId, heroId]);
    }

    if (result.rowCount === 0) {
      // Se l'utente non possiede questo eroe, ritorna un array vuoto
      return res.json({ rules: [] });
    }

    res.json({ rules: result.rows[0].tactics_json || [] });
  } catch (err: any) {
    console.error('Errore GET /tactics/:heroId:', err);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// POST /api/tactics - Salva tattiche
tacticsRoutes.post('/', async (req: Request, res: Response) => {
  try {
    const { heroId, rules } = req.body;
    const userId = req.twitchUser!.user_id;

    if (!heroId || !Array.isArray(rules)) {
      return res.status(400).json({ error: 'Parametri mancanti o non validi' });
    }

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(heroId)) {
      return res.status(400).json({ error: 'ID Eroe non valido' });
    }

    // Valida la shape delle regole prima di toccare il DB (no JSON arbitrario)
    const sanitized = sanitizeRules(rules);
    if (!sanitized.ok) {
      return res.status(400).json({ error: sanitized.error });
    }
    const cleanRules = sanitized.rules;

    // Prova ad aggiornare l'eroe principale
    let updateResult = await query(
      `UPDATE users SET tactics_json = $1
       WHERE twitch_user_id = $2 AND twitch_user_id = (SELECT twitch_user_id FROM heroes WHERE id = $3)
       RETURNING twitch_user_id`,
      [JSON.stringify(cleanRules), userId, heroId]
    );

    if (updateResult.rowCount === 0) {
      // Se non era l'eroe principale, aggiorna nel roster
      updateResult = await query(
        'UPDATE roster SET tactics_json = $1 WHERE owner_user_id = $2 AND hero_id = $3 RETURNING hero_id',
        [JSON.stringify(cleanRules), userId, heroId]
      );
    }

    if (updateResult.rowCount === 0) {
      return res.status(403).json({ error: 'Non possiedi questo eroe' });
    }

    res.json({ message: 'Tattiche salvate con successo' });
  } catch (err: any) {
    console.error('Errore POST /tactics:', err);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});
