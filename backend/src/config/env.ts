import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  twitch: {
    clientId: process.env.TWITCH_CLIENT_ID || '',
    clientSecret: process.env.TWITCH_CLIENT_SECRET || '',
    extensionSecret: process.env.TWITCH_EXTENSION_SECRET || '',
  },
  // Backdoor di auth dev (token "dev:<id>:<role>"): richiede flag esplicita
  // e viene comunque rifiutata in produzione da validateEnv().
  allowDevAuth: process.env.ALLOW_DEV_AUTH === 'true',
  broadcasterId: process.env.BROADCASTER_ID || '',
};

/**
 * Validazione fail-fast all'avvio. In produzione i segreti critici DEVONO
 * essere presenti e la backdoor dev DEVE essere disattivata.
 */
export function validateEnv(): void {
  const isProd = env.nodeEnv === 'production';
  const errors: string[] = [];

  if (isProd) {
    if (!env.twitch.extensionSecret) errors.push('TWITCH_EXTENSION_SECRET mancante');
    if (!env.databaseUrl) errors.push('DATABASE_URL mancante');
    if (env.allowDevAuth) errors.push('ALLOW_DEV_AUTH non puo essere true in produzione');
  }

  if (errors.length > 0) {
    console.error('Config non valida:\n - ' + errors.join('\n - '));
    process.exit(1);
  }
}
