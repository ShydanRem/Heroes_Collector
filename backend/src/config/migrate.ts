import fs from 'fs';
import path from 'path';
import pool from './database';

async function migrate() {
  console.log('Avvio migrazione database...');

  const migrationDir = path.join(__dirname, '../../../database');
  const files = fs.readdirSync(migrationDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const client = await pool.connect();
  try {
    for (const file of files) {
      console.log(`Eseguo migrazione: ${file}`);
      const sql = fs.readFileSync(path.join(migrationDir, file), 'utf-8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`  OK: ${file}`);
      } catch (err: any) {
        await client.query('ROLLBACK');
        // Ignora errori "already exists" per poter rieseguire le migrazioni
        if (err.message?.includes('already exists') || err.code === '42710' || err.code === '42P07') {
          console.log(`  SKIP (gia esistente): ${file}`);
        } else {
          throw err;
        }
      }
    }
    console.log('Migrazione completata con successo!');
  } catch (err) {
    console.error('Errore durante la migrazione:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
