import { Router, Request, Response } from 'express';
import { query } from '../config/database';

export const overlayRoutes = Router();

// GET /api/overlay — Dati pubblici per l'overlay OBS (no auth)
overlayRoutes.get('/', async (_req: Request, res: Response) => {
  try {
    // Top 5 eroi per livello
    const topHeroes = await query(
      `SELECT h.display_name, h.hero_class, h.rarity, h.level
       FROM heroes h
       JOIN users u ON u.twitch_user_id = h.twitch_user_id
       WHERE u.opted_in = TRUE
       ORDER BY h.level DESC, h.exp DESC
       LIMIT 5`
    );

    // Top 3 PVP
    const topPvp = await query(
      `SELECT u.display_name, l.elo_rating, l.wins, l.losses
       FROM leaderboard l
       JOIN users u ON u.twitch_user_id = l.user_id
       WHERE (l.wins + l.losses) > 0
       ORDER BY l.elo_rating DESC
       LIMIT 3`
    );

    // Raid boss status
    let raidBoss = null;
    try {
      const raid = await query(
        `SELECT name, emoji, current_hp, max_hp, defeated
         FROM raid_boss
         ORDER BY created_at DESC LIMIT 1`
      );
      if (raid.rows.length > 0) {
        const r = raid.rows[0];
        raidBoss = {
          name: r.name,
          emoji: r.emoji,
          hpPercent: Math.max(0, Math.round((parseInt(r.current_hp) / parseInt(r.max_hp)) * 100)),
          defeated: r.defeated,
        };
      }
    } catch { /* tabella potrebbe non esistere */ }

    // Campione settimanale
    let weeklyChampion = null;
    try {
      const { getLastChampion } = await import('../services/weeklyService');
      weeklyChampion = await getLastChampion();
    } catch { /* */ }

    // Stats generali
    const stats = await query(
      `SELECT
         (SELECT COUNT(*) FROM users WHERE opted_in = TRUE) as total_players,
         (SELECT COUNT(*) FROM heroes) as total_heroes,
         (SELECT COUNT(*) FROM battles WHERE battle_type = 'pve') as total_dungeons,
         (SELECT COUNT(*) FROM battles WHERE battle_type = 'pvp') as total_pvp`
    );

    // Ultime 3 catture con timestamp
    let lastCapture = null;
    let recentCaptures: any[] = [];
    try {
      const capture = await query(
        `SELECT h.display_name, h.hero_class, h.rarity, u.display_name as captor_name, r.captured_at
         FROM roster r
         JOIN heroes h ON h.id = r.hero_id
         JOIN users u ON u.twitch_user_id = r.user_id
         ORDER BY r.captured_at DESC LIMIT 3`
      );
      recentCaptures = capture.rows.map(c => ({
        heroName: c.display_name,
        heroClass: c.hero_class,
        rarity: c.rarity,
        captorName: c.captor_name,
        capturedAt: c.captured_at,
      }));
      if (recentCaptures.length > 0) {
        lastCapture = recentCaptures[0];
      }
    } catch { /* */ }

    res.json({
      topHeroes: topHeroes.rows.map(r => ({
        name: r.display_name,
        heroClass: r.hero_class,
        rarity: r.rarity,
        level: r.level,
      })),
      topPvp: topPvp.rows.map(r => ({
        name: r.display_name,
        elo: r.elo_rating,
        wins: r.wins,
        losses: r.losses,
      })),
      raidBoss,
      weeklyChampion,
      lastCapture,
      recentCaptures,
      // Drop rari: catture leggendario+ negli ultimi 5 minuti
      rareDrops: recentCaptures.filter((c: any) =>
        ['leggendario', 'mitico', 'master'].includes(c.rarity) &&
        c.capturedAt && (Date.now() - new Date(c.capturedAt).getTime()) < 5 * 60 * 1000
      ),
      stats: {
        totalPlayers: parseInt(stats.rows[0].total_players),
        totalHeroes: parseInt(stats.rows[0].total_heroes),
        totalDungeons: parseInt(stats.rows[0].total_dungeons),
        totalPvp: parseInt(stats.rows[0].total_pvp),
      },
    });
  } catch (err) {
    console.error('Errore overlay:', err);
    res.json({
      topHeroes: [], topPvp: [], raidBoss: null, lastCapture: null,
      stats: { totalPlayers: 0, totalHeroes: 0, totalDungeons: 0, totalPvp: 0 },
    });
  }
});
