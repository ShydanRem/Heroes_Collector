const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function check() {
  try {
    const resUsers = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='users'");
    console.log('Columns in users:', resUsers.rows.map(r => r.column_name));

    const resRoster = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='roster'");
    console.log('Columns in roster:', resRoster.rows.map(r => r.column_name));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

check();
