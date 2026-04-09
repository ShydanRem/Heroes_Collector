import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { env } from '../config/env';
import { handleEventSubEvent } from '../services/twitchService';

export const twitchRoutes = Router();

// POST /api/twitch/eventsub - Webhook EventSub di Twitch
twitchRoutes.post('/eventsub', async (req: Request, res: Response) => {
  const messageType = req.headers['twitch-eventsub-message-type'] as string;
  const messageId = req.headers['twitch-eventsub-message-id'] as string;
  const timestamp = req.headers['twitch-eventsub-message-timestamp'] as string;
  const signature = req.headers['twitch-eventsub-message-signature'] as string;

  // Verifica la firma del messaggio
  const body = JSON.stringify(req.body);
  const hmac = crypto.createHmac('sha256', env.twitch.extensionSecret);
  hmac.update(messageId + timestamp + body);
  const expectedSignature = 'sha256=' + hmac.digest('hex');

  if (signature !== expectedSignature) {
    return res.status(403).json({ error: 'Firma non valida' });
  }

  // Gestisci i diversi tipi di messaggio
  switch (messageType) {
    case 'webhook_callback_verification':
      // Twitch chiede di confermare l'URL
      return res.status(200).type('text/plain').send(req.body.challenge);

    case 'notification':
      // Evento reale
      const eventType = req.body.subscription.type;
      const event = req.body.event;

      try {
        await handleEventSubEvent(eventType, event);
      } catch (err) {
        console.error('Errore gestione evento:', err);
      }
      return res.status(200).json({ ok: true });

    case 'revocation':
      console.log('EventSub revocato:', req.body.subscription.type);
      return res.status(200).json({ ok: true });

    default:
      return res.status(200).json({ ok: true });
  }
});
