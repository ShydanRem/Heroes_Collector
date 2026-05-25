import fs from 'fs';
import path from 'path';
import pool from './database';

/**
 * Migration storiche gia presenti prima dell'introduzione della tracking table.
 * Su un DB gia migrato (prod) queste vengono marcate come applicate SENZA
 * rieseguirle: molte non sono idempotenti (CREATE TYPE/TABLE senza guardia)
 * e 012_playtest_fixes conteneva un UPDATE distruttivo sull'energia.
 * NON aggiungere qui le migration nuove: quelle devono girare normalmente.
 */
const LEGACY_BASELINE = [
  '001_schema.sql',
  '002_raid_shop.sql',
  '003_missions_achievements.sql',
  '004_zones.sql',
  '005_essences_economy.sql',
  '006_roster_capture_rarity.sql',
  '007_daily_login.sql',
  '008_weekly_leaderboard.sql',
  '009_new_classes.sql',
  '010_roster_capture_level.sql',
  '011_talents.sql',
  '012_playtest_fixes.sql',
  '013_tactics.sql',
];

async function migrate() {
  console.log('Avvio migrazione database...');

  const migrationDir = path.join(__dirname, '../../../database');
  const files = fs
    .readdirSync(migrationDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const client = await pool.connect();
  try {
    // Tracking table: ogni file viene applicato una sola volta.
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename   TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Baseline: se la tracking table e vuota ma il DB esiste gia (tabella
    // `users` presente), assumiamo che le migration storiche siano gia state
    // applicate dal vecchio sistema e le marchiamo senza rieseguirle.
    const { rows: trackRows } = await client.query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM schema_migrations'
    );
    const trackingEmpty = trackRows[0].count === '0';

    const { rows: usersRows } = await client.query<{ t: string | null }>(
      "SELECT to_regclass('public.users') AS t"
    );
    const dbAlreadyExists = usersRows[0].t !== null;

    if (trackingEmpty && dbAlreadyExists) {
      console.log(
        'DB esistente rilevato: baseline delle migration storiche (nessuna riesecuzione).'
      );
      for (const filename of LEGACY_BASELINE) {
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING',
          [filename]
        );
      }
    }

    // Carica le migration gia applicate.
    const { rows: appliedRows } = await client.query<{ filename: string }>(
      'SELECT filename FROM schema_migrations'
    );
    const applied = new Set(appliedRows.map((r) => r.filename));

    let ran = 0;
    for (const file of files) {
      if (applied.has(file)) {
        continue;
      }
      console.log(`Eseguo migrazione: ${file}`);
      const sql = fs.readFileSync(path.join(migrationDir, file), 'utf-8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        console.log(`  OK: ${file}`);
        ran++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  FALLITA: ${file}`);
        throw err;
      }
    }

    console.log(
      ran === 0
        ? 'Nessuna nuova migrazione da applicare. DB aggiornato.'
        : `Migrazione completata: ${ran} file applicati.`
    );
  } catch (err) {
    console.error('Errore durante la migrazione:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
