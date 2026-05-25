import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Un errore su un client idle del pool NON deve terminare il processo:
// pg riconnette da solo. Logghiamo e basta.
pool.on('error', (err) => {
  console.error('Errore inatteso su client idle del pool Postgres:', err);
});

/**
 * Esegue una query singola (auto-commit). Usare per le sole letture o per
 * scritture gia atomiche (UPDATE ... WHERE saldo >= costo RETURNING).
 */
export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

/**
 * Esegue `fn` dentro una transazione (BEGIN/COMMIT, ROLLBACK su errore).
 * Usare per qualsiasi flusso read-then-write che deve essere atomico
 * (spese, ricompense, scambi). Il client passato a `fn` e l'UNICO da usare
 * dentro la callback: tutte le query devono passare da li per restare
 * nella stessa transazione.
 */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      console.error('Errore durante il ROLLBACK:', rollbackErr);
    }
    throw err;
  } finally {
    client.release();
  }
}

export default pool;
