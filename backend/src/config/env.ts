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
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  broadcasterId: process.env.BROADCASTER_ID || '',
};
