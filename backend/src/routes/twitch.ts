import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { env } from '../config/env';
import { handleEventSubEvent } from '../services/twitchService';

export const twitchRoutes = Router();

// Anti-replay: ricordiamo i messageId già visti entro una finestra temporale.
const REPLAY_WINDOW_MS = 10 * 60 * 1000; // 10 minuti
const seenMessages = new Map<string, number>();

function isReplay(messageId: string, timestamp: string): boolean {
  const ts = Date.parse(timestamp);
  // Timestamp assente, illeggibile o fuori finestra → tratta come replay.
  if (Number.isNaN(ts) || Math.abs(Date.now() - ts) > REPLAY_WINDOW_MS) return true;
  if (seenMessages.has(messageId)) return true;

  seenMessages.set(messageId, Date.now());
  // Pulizia periodica per evitare crescita illimitata della mappa.
  if (seenMessages.size > 1000) {
    const cutoff = Date.now() - REPLAY_WINDOW_MS;
    for (const [id, t] of seenMessages) {
      if (t < cutoff) seenMessages.delete(id);
    }
  }
  return false;
}

// POST /api/twitch/eventsub - Webhook EventSub di Twitch
twitchRoutes.post('/eventsub', async (req: Request, res: Response) => {
  const messageType = req.headers['twitch-eventsub-message-type'] as string;
  const messageId = req.headers['twitch-eventsub-message-id'] as string;
  const timestamp = req.headers['twitch-eventsub-message-timestamp'] as string;
  const signature = req.headers['twitch-eventsub-message-signature'] as string;

  if (!messageId || !timestamp || !signature) {
    return res.status(403).json({ error: 'Header firma mancanti' });
  }

  // Verifica HMAC sui BYTE RAW del body (non sul JSON ri-serializzato).
  const rawBody = (req as unknown as { rawBody?: Buffer }).rawBody;
  if (!rawBody) {
    return res.status(403).json({ error: 'Body non disponibile per la verifica' });
  }

  const hmac = crypto.createHmac('sha256', env.twitch.extensionSecret);
  hmac.update(Buffer.concat([Buffer.from(messageId + timestamp), rawBody]));
  const expectedSignature = 'sha256=' + hmac.digest('hex');

  // Confronto constant-time per evitare timing attack.
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return res.status(403).json({ error: 'Firma non valida' });
  }

  // Anti-replay: rifiuta messaggi vecchi o già processati.
  if (isReplay(messageId, timestamp)) {
    return res.status(403).json({ error: 'Messaggio scaduto o duplicato' });
  }

  // Gestisci i diversi tipi di messaggio
  switch (messageType) {
    case 'webhook_callback_verification':
      // Twitch chiede di confermare l'URL
      return res.status(200).type('text/plain').send(req.body.challenge);

    case 'notification': {
      // Evento reale
      const eventType = req.body.subscription.type;
      const event = req.body.event;

      try {
        await handleEventSubEvent(eventType, event);
      } catch (err) {
        console.error('Errore gestione evento:', err);
      }
      return res.status(200).json({ ok: true });
    }

    case 'revocation':
      console.log('EventSub revocato:', req.body.subscription.type);
      return res.status(200).json({ ok: true });

    default:
      return res.status(200).json({ ok: true });
  }
});
