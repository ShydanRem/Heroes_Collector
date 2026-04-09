import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { TwitchToken } from '../types';

// Estende Request per includere i dati utente Twitch
declare global {
  namespace Express {
    interface Request {
      twitchUser?: TwitchToken;
    }
  }
}

export function twitchAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token mancante' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // In sviluppo, accetta un token di test semplice
    if (env.nodeEnv === 'development' && token.startsWith('dev:')) {
      const [, userId, role] = token.split(':');
      req.twitchUser = {
        channel_id: env.broadcasterId || 'dev-channel',
        user_id: userId || 'dev-user',
        opaque_user_id: `U${userId || 'dev-user'}`,
        role: (role as TwitchToken['role']) || 'viewer',
      };
      return next();
    }

    // In produzione, decodifica il JWT Twitch
    const secret = Buffer.from(env.twitch.extensionSecret, 'base64');
    const decoded = jwt.verify(token, secret) as TwitchToken;
    req.twitchUser = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token non valido' });
  }
}
